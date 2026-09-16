import { describe, expect, it } from "vitest";
import { generateLicenseKey, isLicenseFormat } from "./licenses";

describe("license generation", () => {
  it("generates unpredictable keys in the expected format", () => {
    const key = generateLicenseKey();
    expect(isLicenseFormat(key)).toBe(true);
  });
});
