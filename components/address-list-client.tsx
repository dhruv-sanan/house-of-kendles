'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AddressCard } from '@/components/address-card'
import { AddressForm } from '@/components/address-form'
import { Modal } from '@/components/ui/modal'
import type { Address } from '@/types/address.types'

interface AddressListClientProps {
    /** List of addresses to display */
    addresses: Address[]
}

/**
 * Client wrapper for address list with edit modal functionality
 */
export function AddressListClient({ addresses }: AddressListClientProps) {
    const router = useRouter()
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    const handleEditSuccess = () => {
        setEditingAddress(null)
        router.refresh()
    }

    const handleDelete = () => {
        router.refresh()
    }

    const handleSetDefault = () => {
        router.refresh()
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {addresses.map((address) => (
                    <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={setEditingAddress}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                    />
                ))}
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingAddress}
                onClose={() => setEditingAddress(null)}
                title="Edit Address"
                size="md"
            >
                {editingAddress && (
                    <AddressForm
                        mode="edit"
                        initialData={editingAddress}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingAddress(null)}
                    />
                )}
            </Modal>
        </>
    )
}
