import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    /** Icon to display */
    icon?: ReactNode
    /** Title text */
    title: string
    /** Description text */
    description: string
    /** Action button label */
    actionLabel?: string
    /** Action button callback */
    onAction?: () => void
    /** Additional class names */
    className?: string
}

/**
 * Empty state component for when no data is available
 * Displays an icon, title, description, and optional action button
 */
export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            {/* Icon */}
            {icon && (
                <div className="mb-4 text-gray-300">
                    {icon}
                </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

            {/* Description */}
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-brand-900 text-white hover:bg-brand"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
