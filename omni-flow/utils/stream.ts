export const handleStreamingResponse = async (
    stream: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => void
): Promise<string> => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
            onChunk(chunk);
        }
    } finally {
        reader.releaseLock();
    }

    return fullResponse;
};