import { z } from "zod";

export const transactionSchema = z.object({
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  couponCode: z.string().trim().max(32).optional()
});

export const couponSchema = z.object({
  code: z.string().min(8).max(128)
});

export const activationSchema = z.object({
  licenseKey: z.string().regex(/^(?:\d{4}[a-z]{4}|BLT-[A-Z2-9]{4}(?:-[A-Z2-9]{4}){3})$/),
  deviceId: z.string().min(8).max(256)
});

export const statusSchema = z.object({
  licenseKey: z.string().regex(/^(?:\d{4}[a-z]{4}|BLT-[A-Z2-9]{4}(?:-[A-Z2-9]{4}){3})$/),
  deviceId: z.string().min(8).max(256)
});
