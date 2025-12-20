import type { Tables, TablesInsert, TablesUpdate } from './database.types'

/**
 * Address type from database
 */
export type Address = Tables<'addresses'>

/**
 * Address insert type (without auto-generated fields)
 */
export type AddressInsert = TablesInsert<'addresses'>

/**
 * Address update type (all fields optional)
 */
export type AddressUpdate = TablesUpdate<'addresses'>

/**
 * Valid address label options
 */
export type AddressLabel = 'home' | 'work' | 'other'

/**
 * Form data structure for address creation/editing
 */
export type AddressFormData = {
    street: string
    city: string
    state: string
    zip_code: string
    label: AddressLabel
    is_default: boolean
}

/**
 * Address with selection state (for checkout flow)
 */
export type AddressWithSelection = Address & {
    selected?: boolean
}

/**
 * Result type for address server actions
 */
export type AddressActionResult = {
    success: boolean
    address?: Address
    error?: string
}
