export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: number
                    title: string
                    description: string | null
                    price: number
                    cost_price: number // New
                    competitor_url: string | null // New
                    competitor_price: number | null // New
                    auto_pricing_enabled: boolean // New
                    flash_sale_price: number | null
                    stock: number
                    images: string[] | null
                    tags: Json | null
                    vector_embedding: string | null
                    seller_id: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    title: string
                    description?: string | null
                    price: number
                    cost_price?: number
                    competitor_url?: string | null
                    competitor_price?: number | null
                    auto_pricing_enabled?: boolean
                    flash_sale_price?: number | null
                    stock?: number
                    images?: string[] | null
                    tags?: Json | null
                    vector_embedding?: string | null
                    seller_id: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    description?: string | null
                    price?: number
                    cost_price?: number
                    competitor_url?: string | null
                    competitor_price?: number | null
                    auto_pricing_enabled?: boolean
                    flash_sale_price?: number | null
                    stock?: number
                    images?: string[] | null
                    tags?: Json | null
                    vector_embedding?: string | null
                    seller_id?: string
                    created_at?: string
                }
            }
            coupons: {
                Row: {
                    id: number
                    code: string
                    discount_percent: number
                    is_hidden: boolean
                    generated_for_user: string | null
                    valid_until: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    code: string
                    discount_percent: number
                    is_hidden?: boolean
                    generated_for_user?: string | null
                    valid_until?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    code?: string
                    discount_percent?: number
                    is_hidden?: boolean
                    generated_for_user?: string | null
                    valid_until?: string | null
                    created_at?: string
                }
            }
            blacklists: {
                Row: {
                    id: number
                    user_id: string | null
                    ip_address: string | null
                    reason: string | null
                    shadow_banned: boolean
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string | null
                    ip_address?: string | null
                    reason?: string | null
                    shadow_banned?: boolean
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string | null
                    ip_address?: string | null
                    reason?: string | null
                    shadow_banned?: boolean
                    created_at?: string
                }
            }
            search_logs: {
                Row: {
                    id: number
                    query: string
                    user_id: string | null
                    results_count: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    query: string
                    user_id?: string | null
                    results_count?: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    query?: string
                    user_id?: string | null
                    results_count?: number
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: number
                    user_id: string
                    total: number
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    total: number
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    total?: number
                    status?: string
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: number
                    product_id: number
                    user_id: string
                    rating: number
                    comment: string | null
                    sentiment_score: number | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    product_id: number
                    user_id: string
                    rating: number
                    comment?: string | null
                    sentiment_score?: number | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    product_id?: number
                    user_id?: string
                    rating?: number
                    comment?: string | null
                    sentiment_score?: number | null
                    created_at?: string
                }
            }
        }
    }
}
