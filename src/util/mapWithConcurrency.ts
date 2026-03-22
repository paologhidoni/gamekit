/**
 * Map items with at most `limit` concurrent async operations. Preserves order.
 *
 * Why not `Promise.all` on every item: firing one network request per favourite at the
 * same time spikes load on the API, hits browser per-host connection limits, and makes
 * rate limits or timeouts more likely on long lists. This paces work while still beating
 * strict one-by-one latency.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const cap = Math.max(1, Math.min(limit, items.length));
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: cap }, () => worker()));
  return results;
}
