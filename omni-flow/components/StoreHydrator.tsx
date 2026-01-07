'use client'

import { useEffect, useRef } from 'react'
import { useStore, Product } from '@/lib/store'

export default function StoreHydrator({ products }: { products: Product[] }) {
    const { setProducts } = useStore()
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            // Map Prisma products to Store products if needed, strictly matching types
            const formattedProducts = products.map(p => ({
                ...p,
                // Ensure default values for missing optional fields if any
                image: p.image || '/placeholder.jpg'
            }))

            setProducts(formattedProducts)
            initialized.current = true
        }
    }, [products, setProducts])

    return null
}
