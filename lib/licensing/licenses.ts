import { createHash, randomBytes } from "node:crypto";
import { getConfig } from "@/lib/config";

const LICENSE_PATTERN = /^BLT-[A-Z2-9]{4}(?:-[A-Z2-9]{4}){3}$/;
const SHORT_LICENSE_PATTERN = /^\d{4}[a-z]{4}$/;

export function generateLicenseKey() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(8);
  const digits = Array.from({ length: 4 }, (_, index) => bytes[index] % 10).join("");
  const suffix = Array.from({ length: 4 }, (_, index) => letters[bytes[index + 4] % letters.length]).join("");
  return `${digits}${suffix}`;
}

export function hashLicenseKey(key: string) {
  if (!isLicenseFormat(key)) {
    throw new Error("Invalid license format");
  }
  return createHash("sha256").update(`${getConfig().LICENSE_SECRET}:${key}`).digest("hex");
}

export function isLicenseFormat(value: string) {
  return SHORT_LICENSE_PATTERN.test(value) || LICENSE_PATTERN.test(value);
}
