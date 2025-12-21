'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StickyBottomBarProps {
    triggerRef: React.RefObject<HTMLElement>
    total: number
    actionLabel: string
    onAction?: () => void
    disabled?: boolean
    isPending?: boolean
    formId?: string
    shippingText?: string
}

export function StickyBottomBar({
    triggerRef,
    total,
    actionLabel,
    onAction,
    disabled,
    isPending,
    formId,
    shippingText
}: StickyBottomBarProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        if (!triggerRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                // If trigger is NOT intersecting and its bounding rect top is below window height (scrolled up past it) -> Show it? 
                // No, we want to show sticky bar when the original button is BELOW the viewport (user hasn't scrolled down far enough).
                // If original button is visible (intersecting), hide sticky bar.
                // If original button is NOT visible:
                //    - If it's below viewport -> Show sticky bar
                //    - If it's above viewport -> Hide sticky bar (user scrolled past it)

                if (entry.isIntersecting) {
                    setIsVisible(false)
                } else {
                    // Check if it's below the viewport
                    if (entry.boundingClientRect.top > window.innerHeight) {
                        setIsVisible(true)
                    } else {
                        setIsVisible(false)
                    }
                }
            },
            {
                root: null,
                threshold: 0,
            }
        )

        observer.observe(triggerRef.current)

        // Initial check
        const rect = triggerRef.current.getBoundingClientRect()
        if (rect.top > window.innerHeight) {
            setIsVisible(true)
        }

        return () => observer.disconnect()
    }, [triggerRef])

    if (!mounted || !isVisible) return null

    // Use portal to render outside normal flow to avoid z-index issues
    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="max-w-4xl mx-auto">
                <Button
                    size="lg"
                    className="w-full bg-brand-900 text-white hover:bg-brand h-12 text-base shadow-none"
                    onClick={onAction}
                    disabled={disabled}
                    type={formId ? "submit" : "button"}
                    form={formId}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <span className="flex items-center gap-2">
                            {actionLabel}
                            <span className="opacity-80">•</span>
                            <span>₹{total}</span>
                        </span>
                    )}
                </Button>
            </div>
        </div>,
        document.body
    )
}
