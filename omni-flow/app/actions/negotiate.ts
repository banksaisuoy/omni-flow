'use server'

import { generateText } from 'ai'
import { geminiModel } from '@/lib/gemini'
import { createClient } from '@/lib/supabase'

export async function negotiatePrice(history: { role: 'user' | 'model', parts: string }[], currentMessage: string, productPrice: number, productId?: number) {
    const supabase = createClient() as any

    // 1. Fetch Cost Price for strict margin check
    // (In real app, fetch from DB using productId. Demo: assume productPrice is valid, calculate fake cost)
    const { data: product } = await supabase.from('products').select('cost_price').eq('id', productId).single()
    const costPrice = product?.cost_price || (productPrice * 0.6) // Default 60% if missing (QA Fallback)

    const minPrice = costPrice * 1.15 // 15% Margin Rule

    const systemPrompt = `
    You are NeuroMarket's AI Negotiator.
    Product Price: $${productPrice}
    Floor Price: $${minPrice.toFixed(2)} (Hidden from user).
    
    Logic:
    - If user offer >= Floor Price: ACCEPT. Say "DEAL!".
    - If user offer < Floor Price: REJECT. Counter-offer slightly above floor.
    - Be humorous but firm.
  `

    const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts })),
        { role: 'user', content: currentMessage }
    ]

    try {
        const { text } = await generateText({
            model: geminiModel,
            messages: messages as any,
        })

        // Check for Deal
        if (text.toUpperCase().includes('DEAL')) {
            // Generate Coupon
            const code = `NEURO-${Math.random().toString(36).substring(7).toUpperCase()}`
            const discountAmount = productPrice - minPrice // Simplified logic, just giving them the floor price for now or specific
            // Ideally parse the agreed price, but for V2 demo we just give a "Success" coupon

            await supabase.from('coupons').insert({
                code,
                discount_percent: 15, // Mock
                is_hidden: true,
                generated_for_user: (await supabase.auth.getUser()).data.user?.id
            })

            return { text: text + `\n\n🎟️ Coupon Code generated: ${code}` }
        }

        return { text }
    } catch (e) {
        console.error("Negotiator Error", e)
        return { text: "I'm having trouble calculating numbers right now. Let's stick to the list price." }
    }
}
