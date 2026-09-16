import { createPublicClient, formatUnits, http, parseAbi, parseUnits } from "viem";
import { getConfig } from "@/lib/config";

const erc20Abi = parseAbi([
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
]);
const transferAbi = parseAbi(["event Transfer(address indexed from, address indexed to, uint256 value)"]);

export type VerificationResult = {
  valid: boolean;
  confirmed: boolean;
  recipient: string;
  asset: string;
  amount: string;
  network: string;
  hash: string;
  blockNumber?: number;
  reason?: string;
};

export async function verifyTransaction(hash: string): Promise<VerificationResult> {
  const config = getConfig();
  const client = createPublicClient({ transport: http(config.BLOCKCHAIN_RPC_URL) });
  if (await client.getChainId() !== 1) return invalid(hash, config.PAYMENT_NETWORK, "WRONG_NETWORK");
  const receipt = await client.getTransactionReceipt({ hash: hash as `0x${string}` }).catch(() => null);
  if (!receipt) return invalid(hash, config.PAYMENT_NETWORK, "TRANSACTION_NOT_FOUND");
  if (receipt.status !== "success") return invalid(hash, config.PAYMENT_NETWORK, "TRANSACTION_FAILED");
  const latest = await client.getBlockNumber();
  const confirmations = latest - receipt.blockNumber + 1n;
  if (confirmations < BigInt(config.MIN_CONFIRMATIONS)) return invalid(hash, config.PAYMENT_NETWORK, "NOT_CONFIRMED");
  if (!receipt.to || receipt.to.toLowerCase() !== config.PAYMENT_TOKEN_CONTRACT.toLowerCase()) {
    return invalid(hash, config.PAYMENT_NETWORK, "WRONG_TOKEN");
  }

  const transferLogs = await client.getLogs({ address: config.PAYMENT_TOKEN_CONTRACT as `0x${string}`, event: transferAbi[0], fromBlock: receipt.blockNumber, toBlock: receipt.blockNumber });
  const transfer = transferLogs.find((log) => log.transactionHash === hash && log.args.to != null && log.args.to.toLowerCase() === config.PAYMENT_RECIPIENT_ADDRESS.toLowerCase());
  if (!transfer?.args.value) return invalid(hash, config.PAYMENT_NETWORK, "WRONG_RECIPIENT");
  const decimals = await client.readContract({ address: config.PAYMENT_TOKEN_CONTRACT as `0x${string}`, abi: erc20Abi, functionName: "decimals" });
  const symbol = await client.readContract({ address: config.PAYMENT_TOKEN_CONTRACT as `0x${string}`, abi: erc20Abi, functionName: "symbol" });
  if (decimals !== config.PAYMENT_DECIMALS || symbol !== config.PAYMENT_TOKEN) return invalid(hash, config.PAYMENT_NETWORK, "WRONG_TOKEN");
  const requiredBaseUnits = BigInt(config.PAYMENT_AMOUNT_BASE_UNITS);
  if (transfer.args.value < requiredBaseUnits) return invalid(hash, config.PAYMENT_NETWORK, "INSUFFICIENT_AMOUNT");
  const actual = formatUnits(transfer.args.value, config.PAYMENT_DECIMALS);

  return { valid: true, confirmed: true, recipient: config.PAYMENT_RECIPIENT_ADDRESS, asset: config.PAYMENT_TOKEN, amount: actual, network: config.PAYMENT_NETWORK, hash, blockNumber: Number(receipt.blockNumber) };
}

function invalid(hash: string, network: string, reason: string): VerificationResult {
  return { valid: false, confirmed: false, recipient: "", asset: "", amount: "0", network, hash, reason };
}
