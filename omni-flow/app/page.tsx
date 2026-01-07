import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ShoppingCart, Sparkles, Zap, Star } from 'lucide-react'
import StoreHydrator from '@/components/StoreHydrator'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch products from DB
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Transform for store matching
  const products = rawProducts.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.images[0] || '/placeholder.jpg',
    views: p.views,
    isFlashSale: p.isFlashSale,
    flashPrice: p.flashPrice,
    isPinned: p.isPinned
  }))

  const pinnedProducts = products.filter(p => p.isPinned)
  const flashSaleProducts = products.filter(p => p.isFlashSale)
  const regularProducts = products.filter(p => !p.isPinned && !p.isFlashSale)

  return (
    <main className="min-h-screen pt-24 pb-12">
      <StoreHydrator products={products} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>AI-Powered Shopping Experience</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">OmniShop</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mx-auto mb-8">
              Discover the future of commerce. AI-curated products, intelligent pricing, and seamless experience.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="#products" className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105">
                Shop Now
              </Link>
              <Link href="/cart" className="px-8 py-3 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 transition-all">
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Flash Sales Section */}
        {flashSaleProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-yellow-500/10 rounded-xl">
                <Zap className="text-yellow-400" size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Flash Sales</h2>
                <p className="text-slate-500 text-sm">Limited time offers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} isFlashSale />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {pinnedProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-pink-500/10 rounded-xl">
                <Star className="text-pink-400" size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Featured Products</h2>
                <p className="text-slate-500 text-sm">Handpicked by our team</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pinnedProducts.map((product) => (
                <ProductCard key={product.id} product={product} isFeatured />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section id="products" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">All Products</h2>
              <p className="text-slate-500 text-sm">{products.length} items available</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-20 glass-panel rounded-3xl">
                <p className="text-slate-500">No products found. Check back soon!</p>
              </div>
            ) : (
              regularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function ProductCard({ product, isFlashSale, isFeatured }: { product: any, isFlashSale?: boolean, isFeatured?: boolean }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`group block glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${isFlashSale ? 'hover:shadow-yellow-500/10 border-yellow-500/20' : isFeatured ? 'hover:shadow-pink-500/10 border-pink-500/20' : 'hover:shadow-indigo-500/10'}`}
    >
      {/* Image */}
      <div className="aspect-square bg-slate-800 relative overflow-hidden">
        <img
          src={product.image || "/placeholder.jpg"}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        {isFlashSale && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Zap size={12} fill="currentColor" />
            Flash Sale
          </div>
        )}
        {isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Star size={12} fill="currentColor" />
            Featured
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h3>
        </div>

        <span className="inline-block bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md font-medium mb-3">
          {product.category}
        </span>

        <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            {isFlashSale && product.flashPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-yellow-400">${product.flashPrice.toFixed(2)}</span>
                <span className="text-sm text-slate-500 line-through">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  )
}
