'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart'
import { useSession } from '@/hooks/use-session'
import { trackRecommendationClick, trackRecommendationAddToCart } from '@/lib/recommendation-tracking'
import type { RecommendedProduct, ClickLocation } from '@/types/recommendation.types'
import { Loader2, Check, Star, Sparkles, BadgePercent } from 'lucide-react'

interface RecommendationCardProps {
    product: RecommendedProduct
    size?: 'small' | 'large'
    clickLocation: ClickLocation
    sourceProductId?: number
    sourcePageUrl?: string
    className?: string
}

const BADGE_CONFIG = {
    bestseller: {
        label: 'Bestseller',
        icon: Star,
        className: 'bg-gold/20 text-gold border-gold/30',
    },
    popular: {
        label: 'Popular',
        icon: Sparkles,
        className: 'bg-brand/10 text-brand-900 border-brand/20',
    },
    great_deal: {
        label: 'Great Deal',
        icon: BadgePercent,
        className: 'bg-green-100 text-green-700 border-green-200',
    },
}

/**
 * Shared recommendation card component
 * Displays product image, name, price, and quick-add button
 */
export function RecommendationCard({
    product,
    size = 'small',
    clickLocation,
    sourceProductId,
    sourcePageUrl,
    className,
}: RecommendationCardProps) {
    const { addItem } = useCart()
    const { sessionId } = useSession()
    const [isAdding, setIsAdding] = useState(false)
    const [justAdded, setJustAdded] = useState(false)

    const isSmall = size === 'small'
    const badgeConfig = product.socialProofBadge ? BADGE_CONFIG[product.socialProofBadge] : null

    const handleCardClick = async () => {
        if (!sessionId) return

        // Track click asynchronously
        trackRecommendationClick({
            sessionId,
            recommendedProductId: product.id,
            recommendedVariantId: product.variantId,
            clickLocation,
            sourceProductId,
            sourcePageUrl,
        }).catch(console.error)
    }

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isAdding || !sessionId) return

        setIsAdding(true)

        // Track click
        const clickId = await trackRecommendationClick({
            sessionId,
            recommendedProductId: product.id,
            recommendedVariantId: product.variantId,
            clickLocation,
            sourceProductId,
            sourcePageUrl,
        })

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 400))

        // Add to cart
        addItem({
            variant_id: product.variantId,
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            size: product.size || product.flavor || 'Standard',
            price: product.price,
            image_url: product.image,
        })

        // Track add to cart
        if (clickId) {
            await trackRecommendationAddToCart(clickId)
        }

        setIsAdding(false)
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 3000)
    }

    // Format price with INR symbol
    const formattedPrice = `₹${product.price.toLocaleString('en-IN')}`

    return (
        <div
            className={cn(
                'group relative flex flex-col rounded-xl border border-brand/10 bg-white overflow-hidden transition-all duration-300',
                'hover:shadow-lg hover:border-brand/20',
                isSmall ? 'min-w-[160px] max-w-[180px]' : 'min-w-[220px] max-w-[260px]',
                className
            )}
        >
            {/* Image */}
            <Link
                href={`/product/${product.slug}`}
                onClick={handleCardClick}
                className="relative aspect-square overflow-hidden bg-muted"
            >
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={isSmall ? '180px' : '260px'}
                />

                {/* Badge */}
                {badgeConfig && (
                    <span className={cn(
                        'absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                        badgeConfig.className
                    )}>
                        <badgeConfig.icon className="w-3 h-3" />
                        {badgeConfig.label}
                    </span>
                )}
            </Link>

            {/* Content */}
            <div className={cn('flex flex-col flex-1 p-3', !isSmall && 'p-4')}>
                <Link href={`/product/${product.slug}`} onClick={handleCardClick}>
                    <h3 className={cn(
                        'font-heading text-brand-900 line-clamp-2 hover:text-gold transition-colors',
                        isSmall ? 'text-sm' : 'text-base'
                    )}>
                        {product.name}
                    </h3>
                </Link>

                {/* Size/Flavor */}
                {(product.size || product.flavor) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {product.size || product.flavor}
                    </p>
                )}

                {/* Price */}
                <p className={cn(
                    'font-medium text-brand-900 mt-2',
                    isSmall ? 'text-sm' : 'text-lg'
                )}>
                    {formattedPrice}
                </p>

                {/* Add to Cart Button */}
                <Button
                    size={isSmall ? 'sm' : 'default'}
                    onClick={handleAddToCart}
                    disabled={isAdding || product.stockQuantity === 0}
                    className={cn(
                        'mt-3 w-full transition-all duration-300',
                        justAdded
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-brand-900 text-white hover:bg-brand-900/90'
                    )}
                >
                    {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : justAdded ? (
                        <>
                            <Check className="mr-1.5 h-4 w-4" />
                            Added!
                        </>
                    ) : product.stockQuantity === 0 ? (
                        'Out of Stock'
                    ) : (
                        'Quick Add +'
                    )}
                </Button>
            </div>
        </div>
    )
}
