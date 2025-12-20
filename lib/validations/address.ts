import { z } from 'zod'

/**
 * Indian pincode validation - exactly 6 digits
 */
const pincodeRegex = /^\d{6}$/

/**
 * Zod schema for address validation (India)
 */
export const addressSchema = z.object({
    street: z
        .string()
        .min(5, 'Street address must be at least 5 characters')
        .max(200, 'Street address is too long'),
    city: z
        .string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City name is too long'),
    state: z
        .string()
        .min(2, 'State must be at least 2 characters')
        .max(50, 'State name is too long'),
    zip_code: z
        .string()
        .regex(pincodeRegex, 'Pincode must be exactly 6 digits'),
    label: z.enum(['home', 'work', 'other'], {
        errorMap: () => ({ message: 'Please select a valid address label' }),
    }),
    is_default: z.boolean().default(false),
})

/**
 * Type inferred from the address schema
 */
export type AddressFormData = z.infer<typeof addressSchema>

/**
 * List of Indian states and union territories
 */
export const INDIAN_STATES = [
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'CT', name: 'Chhattisgarh' },
    { code: 'DN', name: 'Dadra and Nagar Haveli' },
    { code: 'DD', name: 'Daman and Diu' },
    { code: 'DL', name: 'Delhi' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'LA', name: 'Ladakh' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PY', name: 'Puducherry' },
    { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UK', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
] as const
