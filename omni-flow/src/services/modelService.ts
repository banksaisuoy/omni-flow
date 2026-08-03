import { externalModelCall } from './externalClient';

const MAX_CACHE_SIZE = 100;
const cache = new Map<string, any>();

  const cacheKey = `${modelId}-${JSON.stringify(input)}`;

  if (cache.has(cacheKey)) {
    const result = cache.get(cacheKey);
    cache.delete(cacheKey);
    cache.set(cacheKey, result);
    return result;
  }

  const result = await externalModelCall(modelId, input);
