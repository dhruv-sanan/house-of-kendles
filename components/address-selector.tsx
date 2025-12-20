'use client'

import { useEffect } from 'react'
import { Check, Plus, Home, Briefcase, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Address } from '@/types/address.types'
import { cn } from '@/lib/utils'

interface AddressSelectorProps {
    /** List of addresses to select from */
    addresses: Address[]
    /** Currently selected address ID */
    selectedId?: string
    /** Callback when an address is selected */
    onSelect: (addressId: string) => void
    /** Callback when "Add New" is clicked */
    onAddNew?: () => void
}

/**
 * Get the icon for the address label
 */
function getLabelIcon(label: string) {
    switch (label) {
        case 'home':
            return <Home className="h-4 w-4" />
        case 'work':
            return <Briefcase className="h-4 w-4" />
        default:
            return <MapPin className="h-4 w-4" />
    }
}

/**
 * Address selector component for checkout flow
 * Displays addresses as selectable radio cards
 */
export function AddressSelector({
    addresses,
    selectedId,
    onSelect,
    onAddNew,
}: AddressSelectorProps) {
    // Auto-select default address on mount if nothing selected
    useEffect(() => {
        if (!selectedId && addresses.length > 0) {
            const defaultAddress = addresses.find((a) => a.is_default)
            if (defaultAddress) {
                onSelect(defaultAddress.id)
            } else {
                onSelect(addresses[0].id)
            }
        }
    }, [addresses, selectedId, onSelect])

    if (addresses.length === 0) {
        return (
            <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">No saved addresses</p>
                {onAddNew && (
                    <Button onClick={onAddNew} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {addresses.map((address) => {
                const isSelected = selectedId === address.id

                return (
                    <label
                        key={address.id}
                        className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                            isSelected
                                ? 'border-brand-900 bg-brand-50/50 ring-1 ring-brand-900'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                    >
                        {/* Radio Button */}
                        <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={isSelected}
                            onChange={() => onSelect(address.id)}
                            className="mt-1 h-4 w-4 text-brand-900 focus:ring-brand-900"
                        />

                        {/* Address Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-500">{getLabelIcon(address.label)}</span>
                                <span className="font-medium text-gray-900 capitalize">
                                    {address.label}
                                </span>
                                {address.is_default && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold">
                                        <Star className="h-3 w-3 fill-current" />
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-700 truncate">{address.street}</p>
                            <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.zip_code}
                            </p>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                            <div className="flex-shrink-0">
                                <Check className="h-5 w-5 text-brand-900" />
                            </div>
                        )}
                    </label>
                )
            })}

            {/* Add New Address Button */}
            {onAddNew && (
                <button
                    type="button"
                    onClick={onAddNew}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:border-brand-900 hover:text-brand-900"
                >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add New Address</span>
                </button>
            )}
        </div>
    )
}
