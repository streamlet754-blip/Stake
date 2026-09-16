import { NextResponse } from "next/server";
import { getConfigValidationIssues } from "@/lib/config";

export async function GET() {
  const issues = getConfigValidationIssues(process.env as Record<string, string | undefined>);

  if (issues.length === 0) {
    return NextResponse.json({ ok: true, invalid: [] });
  }

  return NextResponse.json({
    ok: false,
    invalid: issues.map((issue) => ({
      field: issue.field,
      reason: issue.reason
    }))
  });
}
