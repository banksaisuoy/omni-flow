'use server'

import { createClient } from '@/lib/supabase'
import { geminiModel } from '@/lib/gemini'
import { generateObject } from 'ai'
import { z } from 'zod'

export async function analyzeTrendsAction() {
    const supabase = createClient() as any

    // 1. Fetch Zero-Result Logs
    const { data: logs } = await supabase.from('search_logs').select('query').eq('results_count', 0).limit(50)

    if (!logs || logs.length === 0) return { message: "No search gaps found yet." }

    const queries = logs.map((l: any) => l.query).join(', ')

    // 2. AI Clustering
    try {
        const { object: trends } = await generateObject({
            model: geminiModel,
            schema: z.object({
                clusters: z.array(z.object({
                    name: z.string(),
                    search_volume: z.string(),
                    opportunity_score: z.number(),
                    recommendation: z.string()
                }))
            }),
            prompt: `Analyze these zero-result search queries from our e-commerce store: [${queries}]
          
          Identify cluster patterns (e.g. "iPhone 16 cases", "Winter jackets").
          Estimate opportunity score (1-10).
          Recommend what product to stock.`
        })

        return { success: true, trends }
    } catch (e) {
        console.error(e)
        return { success: false, error: 'Trend Analysis Failed' }
    }
}
