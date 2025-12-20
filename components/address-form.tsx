'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { addressSchema, INDIAN_STATES, type AddressFormData } from '@/lib/validations/address'
import { addAddress, updateAddress } from '@/app/actions/addresses'
import type { Address, AddressLabel } from '@/types/address.types'

interface AddressFormProps {
    /** Form mode - create new or edit existing */
    mode: 'create' | 'edit'
    /** Initial data for edit mode */
    initialData?: Address
    /** Callback on successful submission */
    onSuccess?: () => void
    /** Callback when user cancels */
    onCancel?: () => void
}

/**
 * Address form component for creating and editing addresses
 * Supports Indian addresses with 6-digit pincode
 */
export function AddressForm({
    mode,
    initialData,
    onSuccess,
    onCancel,
}: AddressFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            street: initialData?.street ?? '',
            city: initialData?.city ?? '',
            state: initialData?.state ?? '',
            zip_code: initialData?.zip_code ?? '',
            label: (initialData?.label as AddressLabel) ?? 'home',
            is_default: initialData?.is_default ?? false,
        },
    })

    const selectedLabel = watch('label')
    const selectedState = watch('state')

    const onSubmit = async (data: AddressFormData) => {
        setIsSubmitting(true)
        setFormError(null)

        try {
            const result =
                mode === 'create'
                    ? await addAddress(data)
                    : await updateAddress(initialData!.id, data)

            if (result.success) {
                toast.success(
                    mode === 'create' ? 'Address added successfully' : 'Address updated successfully'
                )
                onSuccess?.()
            } else {
                setFormError(result.error ?? 'An error occurred')
            }
        } catch (error) {
            console.error('Form submission error:', error)
            setFormError('An unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Error */}
            {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {formError}
                </div>
            )}

            {/* Street Address */}
            <div>
                <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                    Street Address
                </Label>
                <Input
                    id="street"
                    {...register('street')}
                    placeholder="123, MG Road, Sector 5"
                    className="mt-1"
                    aria-describedby={errors.street ? 'street-error' : undefined}
                />
                {errors.street && (
                    <p id="street-error" className="mt-1 text-sm text-red-600">
                        {errors.street.message}
                    </p>
                )}
            </div>

            {/* City, State, Pincode Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* City */}
                <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City
                    </Label>
                    <Input
                        id="city"
                        {...register('city')}
                        placeholder="New Delhi"
                        className="mt-1"
                        aria-describedby={errors.city ? 'city-error' : undefined}
                    />
                    {errors.city && (
                        <p id="city-error" className="mt-1 text-sm text-red-600">
                            {errors.city.message}
                        </p>
                    )}
                </div>

                {/* State */}
                <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State
                    </Label>
                    <Select
                        value={selectedState}
                        onValueChange={(value) => setValue('state', value, { shouldValidate: true })}
                    >
                        <SelectTrigger
                            id="state"
                            className="mt-1"
                            aria-describedby={errors.state ? 'state-error' : undefined}
                        >
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            {INDIAN_STATES.map((state) => (
                                <SelectItem key={state.code} value={state.name}>
                                    {state.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.state && (
                        <p id="state-error" className="mt-1 text-sm text-red-600">
                            {errors.state.message}
                        </p>
                    )}
                </div>

                {/* Pincode */}
                <div>
                    <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700">
                        Pincode
                    </Label>
                    <Input
                        id="zip_code"
                        {...register('zip_code')}
                        placeholder="110001"
                        maxLength={6}
                        inputMode="numeric"
                        className="mt-1"
                        aria-describedby={errors.zip_code ? 'zip-error' : undefined}
                    />
                    {errors.zip_code && (
                        <p id="zip-error" className="mt-1 text-sm text-red-600">
                            {errors.zip_code.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Address Label */}
            <div>
                <Label className="text-sm font-medium text-gray-700">Address Label</Label>
                <div className="mt-2 flex gap-4">
                    {(['home', 'work', 'other'] as const).map((label) => (
                        <label
                            key={label}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <input
                                type="radio"
                                value={label}
                                checked={selectedLabel === label}
                                onChange={() => setValue('label', label, { shouldValidate: true })}
                                className="h-4 w-4 text-brand-900 focus:ring-brand-900"
                            />
                            <span className="text-sm capitalize text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
                {errors.label && (
                    <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
                )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center gap-3">
                <input
                    id="is_default"
                    type="checkbox"
                    {...register('is_default')}
                    className="h-4 w-4 rounded text-brand-900 focus:ring-brand-900"
                />
                <Label htmlFor="is_default" className="text-sm text-gray-700 cursor-pointer">
                    Set as default address
                </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-900 hover:bg-brand text-white"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {mode === 'create' ? 'Adding...' : 'Saving...'}
                        </>
                    ) : mode === 'create' ? (
                        'Add Address'
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </form>
    )
}
