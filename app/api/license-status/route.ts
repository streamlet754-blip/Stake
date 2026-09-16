import { NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { hashLicenseKey } from "@/lib/licensing/licenses";
import { statusSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(async () => {
    const form = await request.formData().catch(() => null);
    return form ? Object.fromEntries(form.entries()) : null;
  });
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ premium: false, status: "INVALID" }, { status: 400 });
  const license = await db.license.findUnique({ where: { keyHash: hashLicenseKey(parsed.data.licenseKey) } });
  if (!license || (license.deviceId && license.deviceId !== parsed.data.deviceId)) return NextResponse.json({ premium: false, status: "INVALID" }, { status: 404 });
  if (license.status === "ACTIVATED") await db.license.update({ where: { id: license.id }, data: { lastSeenAt: new Date() } });
  return NextResponse.json({ premium: license.status === "ACTIVATED", status: license.status });
}
