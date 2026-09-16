import { describe, expect, it } from "vitest";
import { activationSchema, transactionSchema } from "./validation";
import { getConfigValidationIssues, parseConfig } from "./config";

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

describe("server config validation", () => {
  it("accepts the expected production payment config", () => {
    const env = {
      DATABASE_URL: "postgres://user:pass@host:5432/db",
      PAYMENT_NETWORK: "Ethereum mainnet",
      PAYMENT_TOKEN: "USDT",
      PAYMENT_TOKEN_CONTRACT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      PAYMENT_RECIPIENT_ADDRESS: "0xE022c3369DDdd4BBeB57A7f8C491f9d318e2013a",
      PAYMENT_AMOUNT: "2.34",
      PAYMENT_AMOUNT_BASE_UNITS: "2340000",
      PAYMENT_DECIMALS: "6",
      PAYMENT_CURRENCY: "USDT",
      BLOCKCHAIN_RPC_URL: "https://eth.llamarpc.com",
      LICENSE_SECRET: "12345678901234567890123456789012",
      ADMIN_AUTH_SECRET: "abcdefghijklmnopqrstuvwxzy123456",
      MIN_CONFIRMATIONS: "12"
    };

    expect(parseConfig(env)).toMatchObject({
      PAYMENT_NETWORK: "Ethereum mainnet",
      PAYMENT_TOKEN: "USDT",
      PAYMENT_CURRENCY: "USDT",
      PAYMENT_DECIMALS: 6,
      MIN_CONFIRMATIONS: 12
    });
  });

  it("reports only missing or invalid field names instead of values", () => {
    const env = {
      DATABASE_URL: "postgres://user:pass@host:5432/db",
      PAYMENT_NETWORK: "Ethereum Mainnet",
      PAYMENT_TOKEN: "USDT",
      PAYMENT_TOKEN_CONTRACT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      PAYMENT_RECIPIENT_ADDRESS: "0xE022c3369DDdd4BBeB57A7f8C491f9d318e2013a",
      PAYMENT_AMOUNT: "2.34",
      PAYMENT_AMOUNT_BASE_UNITS: "2340000",
      PAYMENT_DECIMALS: "6",
      PAYMENT_CURRENCY: "USDT",
      BLOCKCHAIN_RPC_URL: "not-a-url",
      LICENSE_SECRET: "super-secret-value-that-is-long-enough",
      ADMIN_AUTH_SECRET: "another-super-secret-value-that-is-long-enough",
      MIN_CONFIRMATIONS: "12"
    };

    const issues = getConfigValidationIssues(env);
    expect(issues.some((issue) => issue.field === "PAYMENT_NETWORK")).toBe(true);
    expect(issues.some((issue) => issue.field === "BLOCKCHAIN_RPC_URL")).toBe(true);
    expect(JSON.stringify(issues)).not.toContain("super-secret-value");
    expect(JSON.stringify(issues)).not.toContain("another-super-secret-value");
  });
});
