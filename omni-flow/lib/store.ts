
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// --- Types ---

export interface Product {
    id: string
    title: string
    description: string
    price: number
    category: string
    image: string // base64 or url
    isFlashSale?: boolean
    flashPrice?: number
    views: number
}

export interface CartItem extends Product {
    quantity: number
}

export interface Order {
    id: string
    items: CartItem[]
    total: number
    date: string
    status: 'processing' | 'shipped' | 'delivered'
    customerEmail: string
}

export interface User {
    id: string
    email: string
    role: 'admin' | 'user' | 'seller'
    name: string
    status: 'active' | 'suspended'
}

interface AppState {
    // Products
    products: Product[]
    setProducts: (products: Product[]) => void
    addProduct: (product: Product) => void
    updateProduct: (id: string, product: Partial<Product>) => void
    deleteProduct: (id: string) => void
    incrementView: (id: string) => void

    // Cart
    cart: CartItem[]
    addToCart: (product: Product) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    getCartTotal: () => number

    // Orders (Sales)
    orders: Order[]
    createOrder: (order: Order) => void

    // Users
    users: User[]
    currentUser: User | null
    login: (user: User) => void
    logout: () => void
    addUser: (user: User) => void
    deleteUser: (id: string) => void
}

// --- Initial Data for Demo ---
const INITIAL_PRODUCTS: Product[] = [
    {
        id: '1',
        title: 'Neon Cyber-Deck 2077',
        description: 'High-performance holographic terminal for netrunners.',
        price: 2499,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        views: 1204
    },
    {
        id: '2',
        title: 'Quantum Neural Chip',
        description: 'Boost your processing power by 500% with AI integration.',
        price: 899,
        category: 'Components',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
        views: 856
    },
    {
        id: '3',
        title: 'Void-Black Hoodie',
        description: 'Stealth fabric that absorbs 99.9% of light.',
        price: 120,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
        views: 2300,
        isFlashSale: true,
        flashPrice: 89
    }
]

const INITIAL_USERS: User[] = [
    { id: 'u1', email: 'admin@omniflow.com', name: 'God Admin', role: 'admin', status: 'active' },
    { id: 'u2', email: 'demo@user.com', name: 'Demo User', role: 'user', status: 'active' }
]

// --- Store ---

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Products
            products: INITIAL_PRODUCTS,
            addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
            setProducts: (products) => set({ products }),
            updateProduct: (id, updates) => set((state) => ({
                products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
            })),
            deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
            incrementView: (id) => set((state) => ({
                products: state.products.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p))
            })),

            // Cart
            cart: [],
            addToCart: (product) => set((state) => {
                const existing = state.cart.find((item) => item.id === product.id)
                if (existing) {
                    return {
                        cart: state.cart.map((item) =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        )
                    }
                }
                return { cart: [...state.cart, { ...product, quantity: 1 }] }
            }),
            removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
            updateQuantity: (id, qty) => set((state) => ({
                cart: state.cart.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
            })),
            clearCart: () => set({ cart: [] }),
            getCartTotal: () => {
                const { cart } = get()
                return cart.reduce((total, item) => total + (item.flashPrice || item.price) * item.quantity, 0)
            },

            // Orders
            orders: [],
            createOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

            // Users
            users: INITIAL_USERS,
            currentUser: null,
            login: (user) => set({ currentUser: user }),
            logout: () => set({ currentUser: null }),
            addUser: (user) => set((state) => ({ users: [...state.users, user] })),
            deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
        }),
        {
            name: 'omniflow-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            skipHydration: true, // We will hydrate manually or handle hydration mismatch issues in components using useEffect
        }
    )
)
