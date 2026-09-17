import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/database/client";
import { isAdminRequest } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { generateLicenseKey, hashLicenseKey } from "@/lib/licensing/licenses";
import { couponSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = couponSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid owner code" }, { status: 400 });
  const config = getConfig();
  if (!config.OWNER_COUPON_CODE || parsed.data.code !== config.OWNER_COUPON_CODE) {
    return NextResponse.json({ error: "Invalid owner code" }, { status: 403 });
  }

  const transactionHash = `owner:${createHash("sha256").update(`${config.LICENSE_SECRET}:${parsed.data.code}`).digest("hex")}`;
  const existing = await db.payment.findUnique({ where: { transactionHash }, include: { license: true } });
  if (existing?.license) return NextResponse.json({ error: "Owner code already redeemed" }, { status: 409 });

  const licenseKey = generateLicenseKey();
  try {
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
    throw error;
  }
  return NextResponse.json({ status: "VERIFIED", licenseKey });
}