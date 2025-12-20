'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { ORDER_STATUS_INFO, type OrderSummary, type OrderStatus } from '@/types/order.types'
import { cn } from '@/lib/utils'

interface OrderCardProps {
    /** Order summary data to display */
    order: OrderSummary
}

/**
 * Order card component for order history list
 * Shows order ID, status, date, items preview, and total
 */
export function OrderCard({ order }: OrderCardProps) {
    const statusInfo = ORDER_STATUS_INFO[order.status as OrderStatus]
    const formattedDate = order.order_date
        ? format(new Date(order.order_date), 'MMM d, yyyy')
        : 'Unknown date'

    return (
        <Link
            href={`/order/${order.order_uid}`}
            className={cn(
                'block rounded-xl border bg-white p-4 transition-all',
                'hover:shadow-lg hover:border-brand/30 hover:scale-[1.01]',
                'focus:outline-none focus:ring-2 focus:ring-brand-900 focus:ring-offset-2'
            )}
        >
            {/* Header: Order ID and Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand-900" />
                    <span className="font-medium text-brand-900">
                        {order.order_uid || `#${order.id}`}
                    </span>
                </div>
                <span
                    className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full border',
                        statusInfo?.bgColor,
                        statusInfo?.color
                    )}
                >
                    {statusInfo?.label || order.status}
                </span>
            </div>

            {/* Content: Image and Details */}
            <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {order.first_item_image ? (
                        <Image
                            src={order.first_item_image}
                            alt={order.first_item_name || 'Product'}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                        </div>
                    )}
                    {order.item_count > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            +{order.item_count - 1}
                        </div>
                    )}
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                        {order.first_item_name || 'Order Items'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>

                {/* Price and Arrow */}
                <div className="flex flex-col items-end justify-between">
                    <span className="font-bold text-brand-900">₹{order.total_amount}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Status Description */}
            {statusInfo?.description && (
                <p className="mt-3 text-xs text-gray-500 border-t pt-3">
                    {statusInfo.description}
                </p>
            )}
        </Link>
    )
}
