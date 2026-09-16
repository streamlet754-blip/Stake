import { createHash, randomBytes } from "node:crypto";
import { getConfig } from "@/lib/config";

const LICENSE_PATTERN = /^BLT-[A-Z2-9]{4}(?:-[A-Z2-9]{4}){3}$/;

export function generateLicenseKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  const groups = Array.from({ length: 4 }, (_, groupIndex) =>
    Array.from({ length: 4 }, (_, charIndex) => alphabet[bytes[groupIndex * 4 + charIndex] % alphabet.length]).join("")
  );
  return `BLT-${groups.join("-")}`;
}

export function hashLicenseKey(key: string) {
  if (!LICENSE_PATTERN.test(key)) {
    throw new Error("Invalid license format");
  }
  return createHash("sha256").update(`${getConfig().LICENSE_SECRET}:${key}`).digest("hex");
}

export function isLicenseFormat(value: string) {
  return LICENSE_PATTERN.test(value);
}
