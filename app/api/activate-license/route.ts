import { NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { hashLicenseKey } from "@/lib/licensing/licenses";
import { activationSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!checkRateLimit(request.headers.get("x-forwarded-for") ?? "unknown")) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await request.json().catch(async () => {
    const form = await request.formData().catch(() => null);
    return form ? Object.fromEntries(form.entries()) : null;
  });
  const parsed = activationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, reason: "INVALID_REQUEST" }, { status: 400 });
  const keyHash = hashLicenseKey(parsed.data.licenseKey);
  const license = await db.license.findUnique({ where: { keyHash } });
  if (!license) return NextResponse.json({ success: false, reason: "INVALID_LICENSE" }, { status: 404 });
  if (license.status === "REVOKED") return NextResponse.json({ success: false, premium: false, reason: "LICENSE_REVOKED" }, { status: 403 });
  if (license.status === "ACTIVATED" && license.deviceId !== parsed.data.deviceId) return NextResponse.json({ success: false, premium: false, reason: "LICENSE_ALREADY_ACTIVATED" }, { status: 409 });
  const updated = await db.license.update({ where: { id: license.id }, data: { status: "ACTIVATED", deviceId: parsed.data.deviceId, activatedAt: license.activatedAt ?? new Date(), lastSeenAt: new Date() } });
  return NextResponse.json({ success: true, premium: updated.status === "ACTIVATED", status: updated.status });
}
