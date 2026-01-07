import { geminiModel } from '@/lib/gemini'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const { command } = await req.json()
        if (!command) return Response.json({ error: 'No command provided' }, { status: 400 })

        const schema = z.object({
            action: z.enum(['UPDATE', 'SELECT', 'INSERT', 'DELETE']),
            table: z.enum(['products', 'orders', 'users']),
            filter: z.string().describe("SQL-like filter condition, e.g., \"color = 'red'\""),
            update_field: z.string().optional(),
            update_value: z.string().optional(),
            response_speech: z.string()
        })

        const { object: intent } = await generateObject({
            model: geminiModel,
            schema,
            prompt: `You are a database admin AI. Translate this natural language command into a strictly formatted JSON action.
      Command: "${command}"
      
      Valid Tables: products, orders, users.
      
      Example: "Discount all red shoes by 10%" 
      -> { 
         "action": "UPDATE", 
         "table": "products", 
         "filter": "tags @> '[\"red\"]' OR description ILIKE '%red%'", 
         "update_field": "price", 
         "update_value": "price * 0.9", 
         "response_speech": "Applying 10% discount to all red items." 
      }
      `
        })

        // IN A REAL APP: Verify user is ADMIN here before executing.
        // Executing via Supabase (Dry run mainly for safety in this demo)

        // For demo, we just return the plan. 
        // To actually execute, we would need 'supabase-admin' client or rpc.

        return Response.json({ success: true, intent })

    } catch (error) {
        console.error("Commander Error:", error)
        return Response.json({ error: 'AI Processing Error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
    }
}
