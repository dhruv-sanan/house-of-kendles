'use client'

import { useEffect, useState } from 'react'
import { RecommendationCard } from '@/components/shared/RecommendationCard'
import { getImpulseRecommendations } from '@/lib/recommendations'
import type { RecommendedProduct } from '@/types/recommendation.types'
import { Loader2, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImpulseRecommendationsProps {
    cartProductIds: number[]
    className?: string
}

/**
 * Impulse recommendations for cart page
 * Horizontal scrollable carousel of low-ticket items
 */
export function ImpulseRecommendations({ cartProductIds, className }: ImpulseRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchRecommendations() {
            setIsLoading(true)
            setError(null)

            try {
                const recs = await getImpulseRecommendations(cartProductIds, 8)
                setRecommendations(recs)
            } catch (err) {
                console.error('Error fetching impulse recommendations:', err)
                setError('Could not load recommendations')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecommendations()
    }, [cartProductIds])

    // Don't render if no recommendations
    if (!isLoading && recommendations.length === 0) return null

    return (
        <div className={cn('mt-6 border-t border-brand/10 pt-6', className)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h3 className="font-heading text-lg text-brand-900">Complete Your Set</h3>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-900/50" />
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <p className="text-sm text-muted-foreground py-4">{error}</p>
            )}

            {/* Carousel */}
            {!isLoading && recommendations.length > 0 && (
                <div className="relative">
                    <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                        {recommendations.map((product) => (
                            <div key={product.variantId} className="snap-start shrink-0">
                                <RecommendationCard
                                    product={product}
                                    size="small"
                                    clickLocation="cart_impulse"
                                    sourcePageUrl="/cart"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Fade edges for scroll indication */}
                    <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>
            )}
        </div>
    )
}
