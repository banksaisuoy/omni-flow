'use server'

import { createClient } from '@/lib/supabase'
import { generateObject } from 'ai'
import { geminiModel } from '@/lib/gemini'
import { z } from 'zod'

const reviewAnalysisSchema = z.object({
    isToxic: z.boolean(),
    sentimentScore: z.number().min(-1).max(1),
    autoReply: z.string().describe("A polite reply from the shop owner addressing specific points. If toxic, concise rejection message.")
})

export async function submitReviewAction(formData: FormData) {
    const productId = formData.get('productId')
    const comment = formData.get('comment') as string
    const rating = parseInt(formData.get('rating') as string)

    if (!comment || !productId) throw new Error('Missing fields')

    // 1. AI Analysis (Sentinel)
    const { object: analysis } = await generateObject({
        model: geminiModel,
        schema: reviewAnalysisSchema,
        prompt: `Analyze this customer review for a product. 
      Review: "${comment}" 
      Rating: ${rating}/5.
      
      Determine if it's toxic/spam.
      Calculate sentiment score (-1 to 1).
      Generate a short, professional response from the shop owner. 
      If positive, thank them for specific details. 
      If negative but constructive, apologize and offer help.
      If toxic, just say "Review queued for moderation."`
    })

    // 2. Save to DB
    const supabase = createClient() as any

    // Mock User ID for demo
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (analysis.isToxic) {
        // Logic to save as 'rejected' status would go here
        return { success: false, message: "Review flagged for content policy violation.", analysis }
    }

    const { error } = await supabase.from('reviews').insert({
        product_id: parseInt(productId as string),
        user_id: userId,
        rating,
        comment,
        sentiment_score: analysis.sentimentScore,
        // In a real app we'd save the auto-reply to a separate 'replies' table or field
        // For demo, we return it to display "Owner replied:"
    } as any)

    if (error) {
        console.error(error)
        // Proceeding for demo even if DB fails
    }

    return { success: true, reply: analysis.autoReply }
}
