'use server'

import { prisma } from '@/lib/prisma'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { google } from '@/lib/ai'
import { revalidatePath } from 'next/cache'

// --- Schemas ---

const ProductSchema = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    tags: z.array(z.string()),
    seoTitle: z.string(),
    seoDesc: z.string(),
})

// --- AI Actions ---

export async function generateProductDetails(prompt: string, imageBase64?: string) {
    try {
        const messages: any[] = [
            {
                role: 'user', content: [
                    {
                        type: 'text', text: `Generate a creative, SEO-optimized product listing based on this input: "${prompt}". 
            It is for a futuristic sci-fi e-commerce store called OmniFlow. 
            Price should be in USD. 
            Return a JSON object.` }
                ]
            }
        ]

        if (imageBase64) {
            messages[0].content.push({ type: 'image', image: imageBase64 })
        }

        const { object } = await generateObject({
            model: google('models/gemini-1.5-flash-latest'),
            schema: ProductSchema,
            messages: messages,
        })

        return { success: true, data: object }
    } catch (error) {
        console.error("AI Generation Error:", error)
        return { success: false, error: 'Failed to generate product details' }
    }
}

// --- DB Actions ---

export async function createProduct(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const image = formData.get('image') as string // In reality, upload to blob storage and get URL. For now, assuming URL or Base64 is passed.
    const tagsString = formData.get('tags') as string
    const seoTitle = formData.get('seoTitle') as string
    const seoDesc = formData.get('seoDesc') as string

    const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []

    try {
        await prisma.product.create({
            data: {
                title,
                description,
                price,
                category,
                images: [image],
                tags,
                seoTitle,
                seoDesc,
                stock: 100, // Default stock
                aiTags: tags, // Reuse tags for now
            }
        })


        revalidatePath('/admin/products')
        revalidatePath('/shop')
        return { success: true }
    } catch (error) {
        console.error("DB Create Error:", error)
        return { success: false, error: 'Failed to save product' }
    }
}

export async function toggleProductPin(id: string, isPinned: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isPinned }
        })
        revalidatePath('/admin/products')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update pin' }
    }
}

export async function toggleProductFlashSale(id: string, isFlashSale: boolean, price?: number) {
    try {
        await prisma.product.update({
            where: { id },
            data: {
                isFlashSale,
                flashPrice: price
            }
        })
        revalidatePath('/admin/products')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update flash sale' }
    }
}
