import { db } from "@/lib/database/client";

export async function checkRateLimit(key: string, limit = 20) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + 60_000);
  const bucket = await db.rateLimitBucket.upsert({
    where: { key },
    create: { key, count: 1, resetAt },
    update: { count: { increment: 1 } }
  });
  if (bucket.resetAt <= now) {
    await db.rateLimitBucket.update({ where: { key }, data: { count: 1, resetAt } });
    return true;
  }
  return bucket.count <= limit;
}
