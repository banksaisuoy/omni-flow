export async function externalModelCall(modelId: string, input: any): Promise<any> {
  return {
    mock: true,
    echo: input,
    modelId: modelId,
  };
}