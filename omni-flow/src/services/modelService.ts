import { externalModelCall } from './externalClient';

const MAX_CACHE_SIZE = 100;
const cache = new Map<string, any>();

    return value;
  }

  const result = await externalModelCall(modelId, input);

  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
