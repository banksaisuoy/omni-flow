import { externalModelCall } from './externalClient';

const MAX_CACHE_SIZE = 100;
const cache = new Map<string, any>();

/**
 * Run an external model with a small in-process LRU cache. The cache is kept
 * bounded so a server cannot grow memory without limit when inputs vary.
 */
export async function runModel(modelId: string, input: unknown): Promise<any> {
  if (!modelId || typeof modelId !== 'string') {
    throw new Error('modelId is required');
  }

  const cacheKey = `${modelId}-${JSON.stringify(input)}`;
  if (cache.has(cacheKey)) {
    const result = cache.get(cacheKey);
    cache.delete(cacheKey);
    cache.set(cacheKey, result);
    return result;
  }

  const result = await externalModelCall(modelId, input);
  cache.set(cacheKey, result);
  while (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
  return result;
}

/** Test/support hook to clear process-local cache between runs. */
export function clearModelCache(): void {
  cache.clear();
}
