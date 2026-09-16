import { z } from "zod";

const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PAYMENT_NETWORK: z.string().min(1),
  PAYMENT_TOKEN: z.string().min(1),
  PAYMENT_TOKEN_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  PAYMENT_RECIPIENT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  PAYMENT_AMOUNT: z.string().regex(/^\d+(\.\d+)?$/),
  PAYMENT_CURRENCY: z.string().min(1),
  BLOCKCHAIN_RPC_URL: z.string().url(),
  LICENSE_SECRET: z.string().min(32),
  ADMIN_AUTH_SECRET: z.string().min(32),
  MIN_CONFIRMATIONS: z.coerce.number().int().positive().default(12)
});

export function getConfig() {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error("Blitle server configuration is incomplete or invalid");
  }
  return result.data;
}

export function getPublicPaymentConfig() {
  const config = getConfig();
  return {
    network: config.PAYMENT_NETWORK,
    token: config.PAYMENT_TOKEN,
    amount: config.PAYMENT_AMOUNT,
    currency: config.PAYMENT_CURRENCY,
    recipientAddress: config.PAYMENT_RECIPIENT_ADDRESS
  };
}
