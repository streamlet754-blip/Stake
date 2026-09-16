import { z } from "zod";

export const ETHEREUM_MAINNET_USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PAYMENT_NETWORK: z.literal("Ethereum mainnet"),
  PAYMENT_TOKEN: z.literal("USDT"),
  PAYMENT_TOKEN_CONTRACT: z.literal(ETHEREUM_MAINNET_USDT_CONTRACT),
  PAYMENT_RECIPIENT_ADDRESS: z.literal("0xE022c3369DDdd4BBeB57A7f8C491f9d318e2013a"),
  PAYMENT_AMOUNT: z.literal("2.34"),
  PAYMENT_AMOUNT_BASE_UNITS: z.literal("2340000"),
  PAYMENT_DECIMALS: z.coerce.number().int().min(0).max(18),
  PAYMENT_CURRENCY: z.literal("USDT"),
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
    recipientAddress: config.PAYMENT_RECIPIENT_ADDRESS,
    contract: config.PAYMENT_TOKEN_CONTRACT
  };
}
