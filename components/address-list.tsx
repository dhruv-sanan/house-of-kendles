import { getAddresses } from '@/app/actions/addresses'
import { AddressCard } from '@/components/address-card'
import { EmptyState } from '@/components/empty-state'
import { MapPin } from 'lucide-react'
import { AddressListClient } from '@/components/address-list-client'

interface AddressListProps {
    /** Optional callback when an address is edited */
    onEdit?: (addressId: string) => void
}

/**
 * Server component that fetches and displays the user's addresses
 */
export async function AddressList({ onEdit }: AddressListProps) {
    const addresses = await getAddresses()

    if (addresses.length === 0) {
        return (
            <EmptyState
                icon={<MapPin className="h-12 w-12" />}
                title="No addresses yet"
                description="Add your first delivery address to get started with faster checkout."
            />
        )
    }

    return <AddressListClient addresses={addresses} />
}
