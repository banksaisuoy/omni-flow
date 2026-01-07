import { createClient } from '@/lib/supabase'
import { geminiModel } from '@/lib/gemini'
import { generateObject } from 'ai'
import { z } from 'zod'

// Shared logic to be used in Order Creation API
export async function fraudCheck(userId: string, slipImageBase64?: string) {
    const supabase = createClient() as any

    // A. Velocity Check
    // Count orders in last minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('created_at', oneMinuteAgo)

    if (count && count > 3) {
        await (supabase.from('blacklists') as any).insert({
            user_id: userId,
            reason: 'High Velocity (Spam)',
            shadow_banned: true
        })
        return { isShadowBanned: true }
    }

    // B. Slip Analysis (if provided)
    if (slipImageBase64) {
        // Simulate Gemini Vision check for "photoshop patterns"
        // In real world we'd pass image to Gemini.
        // For demo, we just randomly flag if it contains "fake" in base64 (not real) or purely random
        // Let's implement actual call
        try {
            const { object: result } = await generateObject({
                model: geminiModel,
                schema: z.object({
                    isFake: z.boolean(),
                    reason: z.string()
                }),
                messages: [
                    {
                        role: 'user', content: [
                            { type: 'text', text: 'Does this payment slip look edited or fake? Mismatched fonts? Pixels?' },
                            { type: 'image', image: slipImageBase64 }
                        ]
                    }
                ]
            })

            if (result.isFake) {
                await (supabase.from('blacklists') as any).insert({
                    user_id: userId,
                    reason: 'Fake Slip Detected: ' + result.reason,
                    shadow_banned: true
                })
                return { isShadowBanned: true }
            }
        } catch (e) {
            console.error("Fraud Check Error", e)
            // Default allow on error
        }
    }

    // C. Check Existing Status
    const { data: banned } = await supabase.from('blacklists').select('shadow_banned').eq('user_id', userId).single()
    if (banned && banned.shadow_banned) return { isShadowBanned: true }

    return { isShadowBanned: false }
}
