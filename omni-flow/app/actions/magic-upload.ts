'use server'

import { createClient } from '@/lib/supabase'
import { geminiModel, embeddingModel } from '@/lib/gemini'
import { generateObject } from 'ai'
import { z } from 'zod'

// Define the schema calls for Gemini
const productSchema = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    tags: z.array(z.string()),
    color: z.string(),
    category: z.string()
})

export async function magicUploadAction(formData: FormData) {
    const file = formData.get('image') as File
    if (!file) throw new Error('No image provided')

    const supabase = createClient() as any

    // 1. Upload Image to Supabase Storage
    const filename = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filename, file)

    let imageUrl = ''
    if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(uploadData.path)
        imageUrl = publicUrl
    } else {
        console.warn("Storage upload failed (bucket might be missing), using placeholder.", uploadError)
    }

    // 2. Gemini Vision Analysis
    const arrayBuffer = await file.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    const { object: metadata } = await generateObject({
        model: geminiModel,
        schema: productSchema,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analyze this product image. Generate a catchy Title, SEO-friendly HTML Description, estimated Market Price (number only), 5 relevant tags, main color, and category.' },
                    { type: 'image', image: base64Image }
                ]
            }
        ]
    })

    // 3. Generate Vector Embedding from Description
    // fix: embed returns object with 'embedding' property which is the array.
    const { embedding } = await import('ai').then(mod => mod.embed({
        model: embeddingModel,
        value: metadata.description
    }))

    // 4. Insert into Database
    const { data: { user } } = await supabase.auth.getUser()
    const seller_id = user?.id


    const { data: product, error: dbError } = await supabase
        .from('products')
        .insert({
            title: metadata.title,
            description: metadata.description,
            price: metadata.price,
            stock: 100, // Default stock
            images: imageUrl ? [imageUrl] : [],
            tags: metadata.tags,
            vector_embedding: JSON.stringify(embedding) as any, // FIXED: removed .embedding
            seller_id: seller_id || '00000000-0000-0000-0000-000000000000'
        } as any)
        .select()
        .single()

    if (dbError) {
        console.error("DB Insert Error:", dbError)
        return { success: false, metadata, error: dbError.message }
    }

    return { success: true, product }
}
