'use server'

import { prisma } from '@/lib/prisma'
import { generateObject } from 'ai'
import { z } from 'zod'
import { google } from '@/lib/ai'

const SearchQuerySchema = z.object({
    keywords: z.array(z.string()).describe("List of essential keywords to search for in title/description"),
    minPrice: z.number().optional().describe("Minimum price filter"),
    maxPrice: z.number().optional().describe("Maximum price filter"),
    category: z.string().optional().describe("Category filter if explicitly mentioned"),
    aiReasoning: z.string().describe("Explanation of how the AI interpreted the query")
})

export async function smartSearchProducts(userQuery: string) {
    if (!userQuery.trim()) {
        return { success: true, results: await prisma.product.findMany({ take: 20 }) }
    }

    try {
        // 1. Semantic Understanding via Gemini
        // We ask Gemini to convert "something for gaming under 500" -> { keywords: ["gaming"], maxPrice: 500 }
        const { object } = await generateObject({
            model: google('models/gemini-1.5-flash-latest'),
            schema: SearchQuerySchema,
            prompt: `Analyze this shopping search query: "${userQuery}". Extract keywords and filters.`,
        })

        console.log("AI Search Intepretation:", object)

        // 2. Build Dynamic Prisma Query
        const whereClause: any = {
            AND: [] // Start with empty AND array
        }

        if (object.keywords.length > 0) {
            // OR condition for keywords: Title OR Description OR Tags contains ANY of the keywords
            whereClause.AND.push({
                OR: object.keywords.map(kw => ({
                    OR: [
                        { title: { contains: kw, mode: 'insensitive' } },
                        { description: { contains: kw, mode: 'insensitive' } },
                        { tags: { has: kw } } // Postgres array check
                    ]
                }))
            })
        }

        if (object.minPrice !== undefined) {
            whereClause.AND.push({ price: { gte: object.minPrice } })
        }

        if (object.maxPrice !== undefined) {
            whereClause.AND.push({ price: { lte: object.maxPrice } })
        }

        if (object.category) {
            whereClause.AND.push({ category: { contains: object.category, mode: 'insensitive' } })
        }

        // 3. Execute Search
        const results = await prisma.product.findMany({
            where: whereClause,
            take: 20,
            orderBy: {
                views: 'desc' // Default sort by popularity
            }
        })

        return {
            success: true,
            results,
            aiContext: object
        }

    } catch (error) {
        console.error("Smart Search Error:", error)
        // Fallback to basic text search if AI fails
        const fallbackResults = await prisma.product.findMany({
            where: {
                OR: [
                    { title: { contains: userQuery, mode: 'insensitive' } },
                    { description: { contains: userQuery, mode: 'insensitive' } }
                ]
            },
            take: 20
        })
        return { success: true, results: fallbackResults, isFallback: true }
    }
}
