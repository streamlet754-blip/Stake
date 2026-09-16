import { NextResponse } from "next/server";
import { db } from "@/lib/database/client";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
  const payment = await db.payment.findUnique({ where: { id }, select: { id: true, status: true, verifiedAt: true, license: { select: { status: true } } } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  return NextResponse.json(payment);
}
