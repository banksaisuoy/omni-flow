import { motion } from 'framer-motion'
import { ShoppingCart, User, Shield, Zap, Search, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import GlobalSearch from './GlobalSearch'

import { useStore } from '@/lib/store'

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        const handleOpenSearch = () => setIsSearchOpen(true)
        window.addEventListener('open-global-search', handleOpenSearch)
        return () => window.removeEventListener('open-global-search', handleOpenSearch)
    }, [])

    // Check if user is admin
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    if (pathname.startsWith('/admin') || isLoginPage) return null

    return (
        <>
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
                </div>
            </div>
        </motion.nav>
        </>
    )
}