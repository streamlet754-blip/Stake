import { NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { isAdminRequest } from "@/lib/admin";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [payments, licenses] = await Promise.all([
    db.payment.findMany({ orderBy: { createdAt: "desc" }, include: { license: true }, take: 100 }),
    db.license.findMany({ orderBy: { createdAt: "desc" }, include: { payment: true }, take: 100 })
  ]);
  return NextResponse.json({ payments, licenses });
}
