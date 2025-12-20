'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { AddressSelector } from '@/components/address-selector'
import { AddressForm } from '@/components/address-form'
import { getAddresses } from '@/app/actions/addresses'
import type { Address } from '@/types/address.types'

interface AddressSelectionModalProps {
    /** Whether the modal is open */
    isOpen: boolean
    /** Callback to close the modal */
    onClose: () => void
    /** Callback when an address is selected */
    onSelect: (addressId: string) => void
    /** Currently selected address ID */
    selectedAddressId?: string
}

/**
 * Modal for selecting or adding a delivery address
 * Uses server action to fetch addresses
 */
export function AddressSelectionModal({
    isOpen,
    onClose,
    onSelect,
    selectedAddressId,
}: AddressSelectionModalProps) {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [selectedId, setSelectedId] = useState<string | undefined>(selectedAddressId)

    /**
     * Fetch addresses using server action
     */
    const fetchAddresses = useCallback(async () => {
        setIsLoading(true)
        try {
            console.log('[AddressModal] Fetching addresses via server action')
            const addressList = await getAddresses()
            console.log('[AddressModal] Got addresses:', addressList.length)
            setAddresses(addressList)
        } catch (error) {
            console.error('[AddressModal] Fetch addresses error:', error)
            setAddresses([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch addresses when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAddresses()
            setShowAddForm(false)
        }
    }, [isOpen, fetchAddresses])

    // Update selected ID when prop changes
    useEffect(() => {
        if (selectedAddressId) {
            setSelectedId(selectedAddressId)
        }
    }, [selectedAddressId])

    const handleAddressSelect = (addressId: string) => {
        setSelectedId(addressId)
    }

    const handleConfirmSelection = () => {
        if (selectedId) {
            onSelect(selectedId)
            onClose()
        }
    }

    const handleAddNewSuccess = () => {
        // Refresh addresses and auto-select the new one
        fetchAddresses().then(() => {
            setShowAddForm(false)
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={showAddForm ? 'Add New Address' : 'Select Delivery Address'}
            size="lg"
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-900" />
                </div>
            ) : showAddForm ? (
                <AddressForm
                    mode="create"
                    onSuccess={handleAddNewSuccess}
                    onCancel={() => setShowAddForm(false)}
                />
            ) : (
                <div className="space-y-4">
                    <AddressSelector
                        addresses={addresses}
                        selectedId={selectedId}
                        onSelect={handleAddressSelect}
                        onAddNew={() => setShowAddForm(true)}
                    />

                    {/* Confirm Button */}
                    {addresses.length > 0 && (
                        <div className="pt-4 border-t">
                            <button
                                onClick={handleConfirmSelection}
                                disabled={!selectedId}
                                className="w-full rounded-lg bg-brand-900 py-3 text-white font-medium hover:bg-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Address
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    )
}
