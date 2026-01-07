'use server'

import { geminiModel, embeddingModel } from '@/lib/gemini'
import { createClient } from '@/lib/supabase'
import { generateText } from 'ai'

export async function visualSearchAction(formData: FormData) {
    const file = formData.get('image') as File
    if (!file) throw new Error('No image provided')

    // 1. Convert File to Base64 for Gemini
    const arrayBuffer = await file.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    // 2. Analyze Image with Gemini Vision
    const { text: description } = await generateText({
        model: geminiModel,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Describe the main fashion product in this image in detail. Focus on color, material, style, and category. Output a single paragraph description.' },
                    { type: 'image', image: base64Image }
                ]
            }
        ]
    })

    // 3. Generate Vector Embedding from Description
    const { embedding } = await embed({
        model: embeddingModel,
        value: description,
    })

    // 4. Query Supabase Vector DB
    const supabase = createClient() as any
    // Use any cast to bypass strict RPC arguments check during build
    const { data: products, error } = await supabase.rpc('match_products', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: 0.7,
        match_count: 10
    } as any)

    if (error) {
        console.error('Vector search error:', error)
        throw new Error('Failed to search products')
    }

    return { description, products }
}

// Helper to handle single embedding
async function embed({ model, value }: { model: any, value: string }) {
    const { embedding } = await import('ai').then(mod => mod.embed({ model, value }))
    return { embedding }
}
