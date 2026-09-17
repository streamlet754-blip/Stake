export const PUBLIC_COUPONS = {
  LIC30: 30,
  GOF10: 10
} as const;

export type PublicCouponCode = keyof typeof PUBLIC_COUPONS;

export function getPublicCoupon(code: string | undefined) {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  if (!(normalized in PUBLIC_COUPONS)) return null;
  return {
    code: normalized as PublicCouponCode,
    discountPercent: PUBLIC_COUPONS[normalized as PublicCouponCode]
  };
}

export function getDiscountedAmount(baseUnits: string, discountPercent: number) {
  const amount = BigInt(baseUnits);
  return ((amount * BigInt(100 - discountPercent)) + 99n) / 100n;
}