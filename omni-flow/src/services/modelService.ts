const MAX_CACHE_SIZE = 100;
const cache = new Map<string, any>();

export async function runModel(modelId: string, input: any): Promise<any> {
  const cacheKey = JSON.stringify({ modelId, input });

  if (cache.has(cacheKey)) {
    const value = cache.get(cacheKey);
    cache.delete(cacheKey);
    cache.set(cacheKey, value);
    return value;
  }

  // Stub implementation returning a mock prediction
  const result = {
    mock: true,
    echo: input,
    modelId: modelId,
  };

  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }

  cache.set(cacheKey, result);
  return result;
}
