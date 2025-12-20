'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Star, Home, Briefcase, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAddress, setDefaultAddress } from '@/app/actions/addresses'
import type { Address } from '@/types/address.types'
import { cn } from '@/lib/utils'

interface AddressCardProps {
    /** The address to display */
    address: Address
    /** Whether to show action buttons */
    showActions?: boolean
    /** Callback when edit button is clicked */
    onEdit?: (address: Address) => void
    /** Callback after address is deleted */
    onDelete?: (id: string) => void
    /** Callback after address is set as default */
    onSetDefault?: (id: string) => void
}

/**
 * Get the icon for the address label
 */
function getLabelIcon(label: string) {
    switch (label) {
        case 'home':
            return <Home className="h-3 w-3" />
        case 'work':
            return <Briefcase className="h-3 w-3" />
        default:
            return <MapPin className="h-3 w-3" />
    }
}

/**
 * Get the color classes for the address label badge
 */
function getLabelColors(label: string) {
    switch (label) {
        case 'home':
            return 'bg-blue-100 text-blue-700'
        case 'work':
            return 'bg-purple-100 text-purple-700'
        default:
            return 'bg-gray-100 text-gray-700'
    }
}

/**
 * Address card component displaying address details with action buttons
 */
export function AddressCard({
    address,
    showActions = true,
    onEdit,
    onDelete,
    onSetDefault,
}: AddressCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSettingDefault, setIsSettingDefault] = useState(false)

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this address?')) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteAddress(address.id)
            if (result.success) {
                toast.success('Address deleted')
                onDelete?.(address.id)
            } else {
                toast.error(result.error ?? 'Failed to delete address')
            }
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('An error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSetDefault = async () => {
        setIsSettingDefault(true)
        try {
            const result = await setDefaultAddress(address.id)
            if (result.success) {
                toast.success('Default address updated')
                onSetDefault?.(address.id)
            } else {
                toast.error(result.error ?? 'Failed to set default address')
            }
        } catch (error) {
            console.error('Set default error:', error)
            toast.error('An error occurred')
        } finally {
            setIsSettingDefault(false)
        }
    }

    return (
        <div
            className={cn(
                'relative rounded-lg border p-4 transition-all hover:shadow-md',
                address.is_default
                    ? 'border-brand-900 ring-2 ring-brand-900/20 bg-brand-50/30'
                    : 'border-gray-200 bg-white'
            )}
        >
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
                {/* Label Badge */}
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize',
                        getLabelColors(address.label)
                    )}
                >
                    {getLabelIcon(address.label)}
                    {address.label}
                </span>

                {/* Default Badge */}
                {address.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-1 text-xs font-medium text-gold">
                        <Star className="h-3 w-3 fill-current" />
                        Default
                    </span>
                )}
            </div>

            {/* Address Details */}
            <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">{address.street}</p>
                <p className="text-gray-600">
                    {address.city}, {address.state} {address.zip_code}
                </p>
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                    {/* Edit Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(address)}
                        className="h-8 px-2 text-gray-600 hover:text-brand-900"
                        aria-label="Edit address"
                    >
                        <Pencil className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Edit</span>
                    </Button>

                    {/* Set Default Button */}
                    {!address.is_default && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSetDefault}
                            disabled={isSettingDefault}
                            className="h-8 px-2 text-gray-600 hover:text-gold"
                            aria-label="Set as default address"
                        >
                            {isSettingDefault ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Star className="h-4 w-4" />
                            )}
                            <span className="ml-1 hidden sm:inline">Set Default</span>
                        </Button>
                    )}

                    {/* Delete Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-8 px-2 text-gray-600 hover:text-red-600 ml-auto"
                        aria-label="Delete address"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Delete</span>
                    </Button>
                </div>
            )}
        </div>
    )
}
