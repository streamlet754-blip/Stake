import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/database/client";
import { isAdminRequest } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { generateLicenseKey, hashLicenseKey } from "@/lib/licensing/licenses";
import { couponSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let licenseKey = "";
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error: unknown) {
    console.error("Admin configuration error", error);
    return NextResponse.json({ error: "Admin configuration is missing or invalid. Check ADMIN_AUTH_SECRET and redeploy." }, { status: 503 });
  }
  const parsed = couponSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid owner code" }, { status: 400 });
  let config;
  try {
    config = getConfig();
  } catch (error: unknown) {
    console.error("Owner license configuration error", error);
    return NextResponse.json({ error: "Owner license configuration is missing or invalid. Check OWNER_COUPON_CODE and redeploy." }, { status: 503 });
  }
  if (!config.OWNER_COUPON_CODE || parsed.data.code !== config.OWNER_COUPON_CODE) {
    return NextResponse.json({ error: "Invalid owner code" }, { status: 403 });
  }

  try {
    licenseKey = generateLicenseKey();
    const transactionHash = `owner:${randomUUID()}`;
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.upsert({
        where: { transactionHash },
        create: { transactionHash, network: "OWNER_MANUAL", token: "OWNER", recipientAddress: "OWNER", requiredAmount: "0", actualAmount: "0", status: "VERIFIED", verifiedAt: new Date() },
        update: {}
      });
      await tx.license.create({ data: { keyHash: hashLicenseKey(licenseKey), paymentId: payment.id } });
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Owner code already redeemed" }, { status: 409 });
    }
    console.error("Owner license database error", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json({ error: "The live database schema is missing. Run Prisma db push against the production database, then redeploy." }, { status: 503 });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: "The live database could not be reached. Check the production DATABASE_URL and redeploy." }, { status: 503 });
    }
    return NextResponse.json({ error: "License storage is unavailable. Check DATABASE_URL and apply the Prisma schema, then try again." }, { status: 503 });
  }
  return NextResponse.json({ status: "VERIFIED", licenseKey });
}