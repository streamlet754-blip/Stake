import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ETHEREUM_MAINNET_USDT_CONTRACT,
  getConfigValidationIssues
} from "@/lib/config";

function getContractMetadata(value: string | undefined) {
  return {
    exists: value !== undefined,
    length: value?.length ?? 0,
    first4: value?.slice(0, 4) ?? null,
    last4: value?.slice(-4) ?? null,
    sha256: value === undefined
      ? null
      : createHash("sha256").update(value, "utf8").digest("hex"),
    exactMatch: value === ETHEREUM_MAINNET_USDT_CONTRACT
  };
}

export async function GET() {
  const env = process.env as Record<string, string | undefined>;
  const issues = getConfigValidationIssues(env);

  if (issues.length === 0) {
    return NextResponse.json({
      ok: true,
      invalid: [],
      paymentTokenContract: getContractMetadata(env.PAYMENT_TOKEN_CONTRACT)
    });
  }

  return NextResponse.json({
    ok: false,
    invalid: issues.map((issue) => issue.field === "PAYMENT_TOKEN_CONTRACT"
      ? {
          field: issue.field,
          metadata: getContractMetadata(env.PAYMENT_TOKEN_CONTRACT)
        }
      : {
          field: issue.field,
          reason: issue.reason
        })
  });
}
