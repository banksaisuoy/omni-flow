'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateObject } from 'ai'
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

// --- Authorization ---

async function requireAdmin() {
    const session = await auth()
    return session?.user?.role === 'ADMIN'
}

// --- AI Actions ---

export async function generateProductDetails(prompt: string, imageBase64?: string) {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' }
    if (!prompt.trim() || prompt.length > 2000) return { success: false, error: 'Invalid prompt' }
    if (imageBase64 && imageBase64.length > 5_000_000) return { success: false, error: 'Image is too large' }
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
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' }

    const title = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const price = Number(formData.get('price'))
    const category = String(formData.get('category') || '').trim()
    const image = String(formData.get('image') || '')
    const tagsString = String(formData.get('tags') || '')
    const seoTitle = String(formData.get('seoTitle') || '').trim()
    const seoDesc = String(formData.get('seoDesc') || '').trim()
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean).slice(0, 50) : []

    if (!title || title.length > 200 || !description || description.length > 10_000 ||
        !category || category.length > 100 || !Number.isFinite(price) || price < 0 || price > 10_000_000 ||
        image.length > 5_000_000) {
        return { success: false, error: 'Invalid product data' }
    }

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
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' }
    if (!id) return { success: false, error: 'Invalid product id' }
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
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' }
    if (!id || (price !== undefined && (!Number.isFinite(price) || price < 0))) {
        return { success: false, error: 'Invalid flash sale data' }
    }
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
