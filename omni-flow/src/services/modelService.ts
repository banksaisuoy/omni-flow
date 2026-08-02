const MAX_CACHE_SIZE = 100;
const cache = new Map<string, any>();

export async function runModel(modelId: string, input: any) {
  const cacheKey = `${modelId}-${JSON.stringify(input)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await externalModelCall(modelId, input);

  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }

  cache.set(cacheKey, result);
  return result;
}