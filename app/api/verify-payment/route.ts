import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/database/client";
import { verifyTransaction } from "@/lib/blockchain/evm";
import { generateLicenseKey, hashLicenseKey } from "@/lib/licensing/licenses";
import { transactionSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getConfig } from "@/lib/config";

export async function POST(request: Request) {
  if (!await checkRateLimit(`verify:${request.headers.get("x-forwarded-for") ?? "unknown"}`)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = transactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
  const config = getConfig();
  const hash = parsed.data.transactionHash.toLowerCase();
  const existing = await db.payment.findUnique({ where: { transactionHash: hash }, include: { license: true } });
  if (existing?.status === "VERIFIED" && existing.license) return NextResponse.json({ status: "ALREADY_CLAIMED" }, { status: 409 });

  const result = await verifyTransaction(hash);
  if (!result.valid) {
    await db.payment.upsert({ where: { transactionHash: hash }, create: { transactionHash: hash, network: config.PAYMENT_NETWORK, token: config.PAYMENT_TOKEN, recipientAddress: config.PAYMENT_RECIPIENT_ADDRESS, requiredAmount: config.PAYMENT_AMOUNT, status: "REJECTED" }, update: { status: "REJECTED" } });
    return NextResponse.json({ status: "REJECTED", reason: result.reason }, { status: 400 });
  }

  const payment = await db.payment.upsert({ where: { transactionHash: hash }, create: { transactionHash: hash, network: result.network, token: result.asset, recipientAddress: result.recipient, requiredAmount: config.PAYMENT_AMOUNT, actualAmount: result.amount, status: "PENDING" }, update: {} });
  const licenseKey = generateLicenseKey();
  const license = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const claimed = await tx.payment.findUnique({ where: { transactionHash: hash }, include: { license: true } });
    if (claimed?.license || claimed?.status === "VERIFIED") throw new Error("ALREADY_CLAIMED");
    const created = await tx.license.create({ data: { keyHash: hashLicenseKey(licenseKey), paymentId: payment.id } });
    await tx.payment.update({ where: { id: payment.id }, data: { status: "VERIFIED", verifiedAt: new Date(), actualAmount: result.amount } });
    return created;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "ALREADY_CLAIMED") return null;
    throw error;
  });
  if (!license) return NextResponse.json({ status: "ALREADY_CLAIMED" }, { status: 409 });
  return NextResponse.json({ status: "VERIFIED", licenseKey });
}
