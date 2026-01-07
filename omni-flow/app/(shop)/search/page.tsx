'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

import { Suspense } from 'react'

function SearchContent() {
    const searchParams = useSearchParams()
    const isVisual = searchParams.get('source') === 'visual'
    const [results, setResults] = useState<any[]>([])
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (isVisual) {
            const storedResults = sessionStorage.getItem('visualSearchResults')
            const storedDesc = sessionStorage.getItem('visualSearchQuery')
            if (storedResults) setResults(JSON.parse(storedResults))
            if (storedDesc) setDescription(storedDesc)
        }
    }, [isVisual])

    return (
        <div className="container mx-auto px-4 py-8">
            {isVisual && (
                <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h1 className="text-lg font-bold text-indigo-900 mb-1">Visual Search Results</h1>
                    <p className="text-sm text-indigo-700">Gemini identified: "{description}"</p>
                </div>
            )}

            {results.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No matches found. Try snapping another photo!
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.map((product) => (
                        <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                            <div className="aspect-square relative bg-gray-100">
                                {/* Placeholder for Product Image handling */}
                                {product.images && product.images[0] ? (
                                    <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.title}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-indigo-600 font-bold">${product.price}</span>
                                    {product.similarity && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                            {Math.round(product.similarity * 100)}% Match
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    )
}
