import { google } from '@ai-sdk/google'

// switching to 2.0 flash as requested for speed
export const geminiModel = google('models/gemini-2.0-flash-exp')
// Keep embedding model specific for reliability, or use text-embedding-004
export const embeddingModel = google.textEmbeddingModel('models/text-embedding-004')
