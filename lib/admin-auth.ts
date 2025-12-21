/**
 * List of user IDs authorized to access the admin dashboard.
 */
export const ADMIN_USER_IDS = [
    "fa71f5fe-0f1a-41bd-ad55-228b07afbef6",
    // Add other team members here later
]

/**
 * Checks if a user is an admin based on their ID.
 * @param userId - The user's unique identifier
 * @returns true if the user is an admin
 */
export function isAdmin(userId: string): boolean {
    if (!userId) return false
    return ADMIN_USER_IDS.includes(userId)
}
