import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/database/client";
import { generateLicenseKey, hashLicenseKey } from "@/lib/licensing/licenses";
import { couponSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getConfig } from "@/lib/config";

function couponPaymentHash(code: string, secret: string) {
  return `coupon:${createHash("sha256").update(`${secret}:${code}`).digest("hex")}`;
}

export async function POST(request: Request) {
  if (!await checkRateLimit(`coupon:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 5)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = couponSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });

  const config = getConfig();
  if (!config.OWNER_COUPON_CODE || parsed.data.code !== config.OWNER_COUPON_CODE) {
    return NextResponse.json({ error: "Coupon not valid" }, { status: 400 });
  }

  const transactionHash = couponPaymentHash(parsed.data.code, config.LICENSE_SECRET);
  const existing = await db.payment.findUnique({ where: { transactionHash }, include: { license: true } });
  if (existing?.license) return NextResponse.json({ error: "Coupon already redeemed" }, { status: 409 });

  const licenseKey = generateLicenseKey();
  try {
    const license = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.upsert({
        where: { transactionHash },
        create: {
          transactionHash,
          network: "OWNER_TEST",
          token: "COUPON",
          recipientAddress: "OWNER_TEST",
          requiredAmount: "0",
          actualAmount: "0",
          status: "VERIFIED",
          verifiedAt: new Date()
        },
        update: {}
      });
      return tx.license.create({ data: { keyHash: hashLicenseKey(licenseKey), paymentId: payment.id } });
    });
    return NextResponse.json({ status: "VERIFIED", licenseKey, ownerCoupon: true });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Coupon already redeemed" }, { status: 409 });
    }
    throw error;
  }
}