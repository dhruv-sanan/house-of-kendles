'use client'

import { CheckCircle, Circle, Truck, Package, CreditCard, XCircle } from 'lucide-react'
import { ORDER_STATUS_INFO, type OrderStatus } from '@/types/order.types'
import { cn } from '@/lib/utils'

interface OrderStatusTrackerProps {
    /** Current order status */
    status: OrderStatus
    /** Optional class name */
    className?: string
}

/**
 * Status steps for tracking (excluding cancelled)
 */
const STATUS_STEPS: OrderStatus[] = ['pending_payment', 'processing', 'shipped', 'delivered']

/**
 * Get icon for each status
 */
function getStatusIcon(status: OrderStatus, isActive: boolean, isCompleted: boolean) {
    const iconClass = cn(
        'h-6 w-6',
        isCompleted ? 'text-green-600' : isActive ? 'text-brand-900' : 'text-gray-300'
    )

    switch (status) {
        case 'pending_payment':
            return isCompleted ? (
                <CheckCircle className={iconClass} />
            ) : (
                <CreditCard className={iconClass} />
            )
        case 'processing':
            return isCompleted ? (
                <CheckCircle className={iconClass} />
            ) : (
                <Package className={iconClass} />
            )
        case 'shipped':
            return isCompleted ? (
                <CheckCircle className={iconClass} />
            ) : (
                <Truck className={iconClass} />
            )
        case 'delivered':
            return isCompleted ? (
                <CheckCircle className={iconClass} />
            ) : (
                <Circle className={iconClass} />
            )
        default:
            return <Circle className={iconClass} />
    }
}

/**
 * Order status tracker component
 * Shows visual progress of order through different stages
 */
export function OrderStatusTracker({ status, className }: OrderStatusTrackerProps) {
    // Handle cancelled orders separately
    if (status === 'cancelled') {
        return (
            <div className={cn('text-center py-6', className)}>
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
                <p className="font-medium text-red-600">Order Cancelled</p>
                <p className="text-sm text-gray-500 mt-1">This order has been cancelled</p>
            </div>
        )
    }

    const currentIndex = STATUS_STEPS.indexOf(status)

    return (
        <div className={cn('py-4', className)}>
            <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, index) => {
                    // Mark as completed if: before current step, OR current step is delivered
                    const isCompleted = index < currentIndex || (status === 'delivered' && index === currentIndex)
                    const isActive = index === currentIndex && status !== 'delivered'
                    const statusInfo = ORDER_STATUS_INFO[step]

                    return (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                            {/* Connector line */}
                            {index > 0 && (
                                <div
                                    className={cn(
                                        'absolute top-3 right-1/2 w-full h-0.5 -z-10',
                                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    )}
                                />
                            )}

                            {/* Icon */}
                            <div
                                className={cn(
                                    'relative z-10 rounded-full p-2',
                                    isCompleted
                                        ? 'bg-green-100'
                                        : isActive
                                            ? 'bg-brand-100'
                                            : 'bg-gray-100'
                                )}
                            >
                                {getStatusIcon(step, isActive, isCompleted)}
                            </div>

                            {/* Label */}
                            <p
                                className={cn(
                                    'mt-2 text-xs font-medium text-center',
                                    isCompleted
                                        ? 'text-green-600'
                                        : isActive
                                            ? 'text-brand-900'
                                            : 'text-gray-400'
                                )}
                            >
                                {statusInfo.label}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Current status description */}
            <p className="text-center text-sm text-gray-600 mt-4">
                {ORDER_STATUS_INFO[status]?.description}
            </p>
        </div>
    )
}
