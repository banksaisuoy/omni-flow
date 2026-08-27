'use server'

import { generateText } from 'ai'
import { google } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

const MAX_QUESTION_LENGTH = 1000
const MAX_PRODUCTS_IN_CONTEXT = 50

export async function askShoppingAssistant(question: string) {
    const normalizedQuestion = question.trim()
    if (!normalizedQuestion || normalizedQuestion.length > MAX_QUESTION_LENGTH) {
        return { success: false, error: 'Please enter a shorter question.' }
    }

    try {
        const products = await prisma.product.findMany({
            where: { stock: { gt: 0 } },
            orderBy: { updatedAt: 'desc' },
            take: MAX_PRODUCTS_IN_CONTEXT,
            select: {
                title: true,
                category: true,
                price: true,
                flashPrice: true,
                isFlashSale: true,
                description: true,
            },
        })

        const productContext = products.map((product) => {
            const sale = product.isFlashSale && product.flashPrice !== null
                ? ` on sale for $${product.flashPrice}`
                : ''
            return `- ${product.title} (${product.category}): $${product.price}${sale} — ${product.description.slice(0, 500)}`
        }).join('\n') || 'No products are currently available.'

        const { text } = await generateText({
            model: google('models/gemini-1.5-flash-latest'),
            system: `You are OmniAuth, a helpful shopping assistant for OmniFlow.
Recommend only products present in the catalog below. Do not invent products, prices,
stock, discounts, delivery promises, or policies. If the catalog does not answer the
question, say so clearly. Keep the answer concise and friendly.

Current catalog:
${productContext}`,
            prompt: normalizedQuestion,
        })

        return { success: true, answer: text.slice(0, 4000) }
    } catch (error) {
        console.error('Shopping assistant error:', error)
        return { success: false, error: 'The shopping assistant is temporarily unavailable.' }
    }
}
