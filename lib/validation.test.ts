import { describe, expect, it } from "vitest";
import { activationSchema, transactionSchema } from "./validation";

describe("request validation", () => {
  it("accepts valid transaction hashes", () => {
    expect(transactionSchema.safeParse({ transactionHash: `0x${"a".repeat(64)}` }).success).toBe(true);
  });

  it("rejects malformed transaction hashes", () => {
    expect(transactionSchema.safeParse({ transactionHash: "not-a-hash" }).success).toBe(false);
  });

  it("accepts valid activation payloads", () => {
    expect(activationSchema.safeParse({ licenseKey: "BLT-ABCD-2345-EFGH-JKLM", deviceId: "install-123456" }).success).toBe(true);
  });

  it("rejects invalid license formats", () => {
    expect(activationSchema.safeParse({ licenseKey: "BLT-INVALID", deviceId: "install-123456" }).success).toBe(false);
  });
});
