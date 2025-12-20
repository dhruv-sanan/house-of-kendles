'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { addressSchema, type AddressFormData } from '@/lib/validations/address'
import type { Address, AddressActionResult } from '@/types/address.types'

/**
 * Add a new address for the current user
 * 
 * @param formData - The address data to add
 * @returns Result object with success status and address or error
 */
export async function addAddress(
    formData: AddressFormData
): Promise<AddressActionResult> {
    try {
        // Validate input
        const validatedData = addressSchema.parse(formData)

        // Get current user
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: 'You must be signed in to add an address' }
        }

        const supabase = await createClient()

        // If this is set as default, we'll let the database trigger handle it
        // or we can explicitly set other addresses to non-default
        if (validatedData.is_default) {
            // Set all existing addresses to non-default first
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
        }

        // Insert the new address
        const { data: address, error } = await supabase
            .from('addresses')
            .insert({
                street: validatedData.street,
                city: validatedData.city,
                state: validatedData.state,
                zip_code: validatedData.zip_code,
                label: validatedData.label,
                is_default: validatedData.is_default,
                user_id: user.id,
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding address:', error)
            return { success: false, error: 'Failed to add address. Please try again.' }
        }

        // Revalidate relevant pages
        revalidatePath('/profile')
        revalidatePath('/checkout')

        return { success: true, address }
    } catch (error) {
        console.error('Add address error:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Update an existing address
 * 
 * @param id - The address ID to update
 * @param formData - The updated address data
 * @returns Result object with success status or error
 */
export async function updateAddress(
    id: string,
    formData: AddressFormData
): Promise<AddressActionResult> {
    try {
        // Validate input
        const validatedData = addressSchema.parse(formData)

        // Get current user
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: 'You must be signed in to update an address' }
        }

        const supabase = await createClient()

        // Verify user owns this address
        const { data: existingAddress, error: fetchError } = await supabase
            .from('addresses')
            .select('id, user_id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existingAddress) {
            return { success: false, error: 'Address not found or you do not have permission to edit it' }
        }

        // If setting as default, unset other defaults first
        if (validatedData.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .neq('id', id)
        }

        // Update the address
        const { data: address, error } = await supabase
            .from('addresses')
            .update({
                street: validatedData.street,
                city: validatedData.city,
                state: validatedData.state,
                zip_code: validatedData.zip_code,
                label: validatedData.label,
                is_default: validatedData.is_default,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating address:', error)
            return { success: false, error: 'Failed to update address. Please try again.' }
        }

        // Revalidate relevant pages
        revalidatePath('/profile')
        revalidatePath('/checkout')

        return { success: true, address }
    } catch (error) {
        console.error('Update address error:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Delete an address
 * 
 * @param id - The address ID to delete
 * @returns Result object with success status or error
 */
export async function deleteAddress(id: string): Promise<AddressActionResult> {
    try {
        // Get current user
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: 'You must be signed in to delete an address' }
        }

        const supabase = await createClient()

        // Get user's address count
        const { count, error: countError } = await supabase
            .from('addresses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (countError) {
            console.error('Error counting addresses:', countError)
            return { success: false, error: 'Failed to verify addresses' }
        }

        // Don't allow deleting the only address
        if (count !== null && count <= 1) {
            return { success: false, error: 'You cannot delete your only address' }
        }

        // Verify user owns this address
        const { data: existingAddress, error: fetchError } = await supabase
            .from('addresses')
            .select('id, user_id, is_default')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existingAddress) {
            return { success: false, error: 'Address not found or you do not have permission to delete it' }
        }

        // Delete the address
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting address:', error)
            return { success: false, error: 'Failed to delete address. Please try again.' }
        }

        // If we deleted the default address, set another one as default
        if (existingAddress.is_default) {
            const { data: firstAddress } = await supabase
                .from('addresses')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .single()

            if (firstAddress) {
                await supabase
                    .from('addresses')
                    .update({ is_default: true })
                    .eq('id', firstAddress.id)
            }
        }

        // Revalidate relevant pages
        revalidatePath('/profile')
        revalidatePath('/checkout')

        return { success: true }
    } catch (error) {
        console.error('Delete address error:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Set an address as the default
 * 
 * @param id - The address ID to set as default
 * @returns Result object with success status or error
 */
export async function setDefaultAddress(id: string): Promise<AddressActionResult> {
    try {
        // Get current user
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: 'You must be signed in to update an address' }
        }

        const supabase = await createClient()

        // Verify user owns this address
        const { data: existingAddress, error: fetchError } = await supabase
            .from('addresses')
            .select('id, user_id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existingAddress) {
            return { success: false, error: 'Address not found or you do not have permission to update it' }
        }

        // Unset all other defaults
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)

        // Set this address as default
        const { data: address, error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error setting default address:', error)
            return { success: false, error: 'Failed to set default address. Please try again.' }
        }

        // Revalidate relevant pages
        revalidatePath('/profile')
        revalidatePath('/checkout')

        return { success: true, address }
    } catch (error) {
        console.error('Set default address error:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Get all addresses for the current user
 * 
 * @returns Array of addresses ordered by default status and creation date
 */
export async function getAddresses(): Promise<Address[]> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return []
        }

        const supabase = await createClient()

        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching addresses:', error)
            return []
        }

        return addresses || []
    } catch (error) {
        console.error('Get addresses error:', error)
        return []
    }
}

/**
 * Get current user's customer data (for phone prefill, etc.)
 */
export async function getCustomerData(): Promise<{ phone: string | null; name: string; email: string } | null> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return null
        }

        const supabase = await createClient()

        const { data: customer, error } = await supabase
            .from('customers')
            .select('phone, name, email')
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching customer:', error)
            return null
        }

        return customer
    } catch (error) {
        console.error('Get customer error:', error)
        return null
    }
}

/**
 * Get the default address for the current user
 * 
 * @returns The default address or null
 */
export async function getDefaultAddress(): Promise<Address | null> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return null
        }

        const supabase = await createClient()

        const { data: address, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single()

        if (error) {
            // No default address found, try to get the first one
            const { data: firstAddress } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .limit(1)
                .single()

            return firstAddress || null
        }

        return address
    } catch (error) {
        console.error('Get default address error:', error)
        return null
    }
}
