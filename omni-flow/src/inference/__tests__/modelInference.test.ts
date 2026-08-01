import { runModel } from '../../services/modelService';
import * as externalClient from '../../services/externalClient';

jest.mock('../../services/externalClient');

describe('modelInference', () => {
  const mockedExternalModelCall = externalClient.externalModelCall as jest.Mock;

  beforeEach(() => {
    mockedExternalModelCall.mockClear();
  });

  it('generates cache key based on input parameters', async () => {
    mockedExternalModelCall.mockResolvedValueOnce({
      mock: true,
      echo: 'key-test',
      modelId: 'model-a',
    });
    
    await runModel('model-a', { key: 'value' });
    
    // Calling with same args should hit cache (mock not called)
    await runModel('model-a', { key: 'value' });
    
    // Calling with different args should miss cache (mock called)
    mockedExternalModelCall.mockResolvedValueOnce({
      mock: true,
      echo: 'key-test-2',
      modelId: 'model-a',
    });
    await runModel('model-a', { key: 'value2' });
    
    expect(mockedExternalModelCall).toHaveBeenCalledTimes(2);
  });

  it('performs successful model inference when cache miss occurs', async () => {
    mockedExternalModelCall.mockResolvedValueOnce({
      mock: true,
      echo: 'miss',
      modelId: 'test-model-miss',
    });
    const uniqueInput = { unique: 'miss' };
    const result = await runModel('test-model-miss', uniqueInput);
    
    expect(result).toBeDefined();
    expect(mockedExternalModelCall).toHaveBeenCalledTimes(1);
    expect(mockedExternalModelCall).toHaveBeenCalledWith('test-model-miss', uniqueInput);
  });

  it('returns previous result on cache hit without calling the model service', async () => {
    mockedExternalModelCall.mockResolvedValue({ result: 'cached' });
    
    const uniqueInput = { unique: 'hit' };
    
    // First call - cache miss
    const result1 = await runModel('test-model-hit', uniqueInput);
    expect(mockedExternalModelCall).toHaveBeenCalledTimes(1);
    
    // Second call - cache hit
    const result2 = await runModel('test-model-hit', uniqueInput);
    expect(mockedExternalModelCall).toHaveBeenCalledTimes(1); // Still 1
    
    expect(result1).toEqual(result2);
  });

  it('handles errors when the model service throws', async () => {
    mockedExternalModelCall.mockRejectedValueOnce(new Error('Model service failed'));
    
    const uniqueInput = { unique: 'error' };
    
    await expect(runModel('test-model-error', uniqueInput))
      .rejects.toThrow('Model service failed');
  });

  it('evicts LRU item when cache exceeds its limit', async () => {
    mockedExternalModelCall.mockImplementation(async (id: string, input: any) => ({ id }));
    
    // Fill the cache (limit is 100)
    for (let i = 0; i < 101; i++) {
      await runModel('lru-model', { i });
    }
    
    // Cache is size 100 now. 
    // The very first item { i: 0 } should have been evicted.
    
    // Clear spy count to cleanly check if { i: 0 } is a cache miss
    mockedExternalModelCall.mockClear();
    
    // Call the first item again
    await runModel('lru-model', { i: 0 });
    
    // Should be a miss and call the service again
    expect(mockedExternalModelCall).toHaveBeenCalledTimes(1);
    
    // Check if the 100th item is still in cache
    mockedExternalModelCall.mockClear();
    await runModel('lru-model', { i: 100 });
    // Should be a hit, no call
    expect(mockedExternalModelCall).toHaveBeenCalledTimes(0);
  });
});