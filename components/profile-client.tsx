'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { AddressForm } from '@/components/address-form'

/**
 * Client component for profile page interactions
 * Handles the "Add New Address" button and modal
 */
export function ProfileClient() {
    const router = useRouter()
    const [showAddModal, setShowAddModal] = useState(false)

    const handleAddSuccess = () => {
        setShowAddModal(false)
        router.refresh()
    }

    return (
        <>
            <Button
                onClick={() => setShowAddModal(true)}
                className="bg-brand-900 text-white hover:bg-brand"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
            </Button>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Address"
                size="md"
            >
                <AddressForm
                    mode="create"
                    onSuccess={handleAddSuccess}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>
        </>
    )
}
