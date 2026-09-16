import { timingSafeEqual } from "node:crypto";
import { getConfig } from "@/lib/config";

export function isAdminRequest(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = getConfig().ADMIN_AUTH_SECRET;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
