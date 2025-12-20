'use client'

import { useEffect, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean
    /** Callback to close the modal */
    onClose: () => void
    /** Modal title */
    title: string
    /** Modal content */
    children: ReactNode
    /** Modal size */
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Get the width class based on size
 */
function getSizeClass(size: ModalProps['size']) {
    switch (size) {
        case 'sm':
            return 'max-w-sm'
        case 'md':
            return 'max-w-md'
        case 'lg':
            return 'max-w-lg'
        case 'xl':
            return 'max-w-xl'
        default:
            return 'max-w-md'
    }
}

/**
 * Reusable modal component with animations, backdrop, and keyboard support
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) {
    /**
     * Handle escape key press
     */
    const handleEscapeKey = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        },
        [onClose]
    )

    /**
     * Prevent body scroll when modal is open
     */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleEscapeKey)
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isOpen, handleEscapeKey])

    if (!isOpen) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full rounded-xl bg-white shadow-2xl',
                    'animate-in fade-in zoom-in-95 duration-200',
                    'max-h-[90vh] overflow-hidden flex flex-col',
                    getSizeClass(size)
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            </div>
        </div>
    )
}
