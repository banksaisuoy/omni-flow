export async function runModel(modelId: string, input: any): Promise<any> {
  // Stub implementation returning a mock prediction
  return {
    mock: true,
    echo: input,
    modelId: modelId,
  };
}