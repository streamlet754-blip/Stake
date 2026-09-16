import { NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { isAdminRequest } from "@/lib/admin";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Missing license id" }, { status: 400 });
  await db.license.update({ where: { id: body.id }, data: { status: "REVOKED" } });
  return NextResponse.json({ success: true });
}
