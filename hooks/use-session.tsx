'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const SESSION_STORAGE_KEY = 'ecom_session_id'
const SESSION_EXPIRY_DAYS = 7

interface SessionContextValue {
  sessionId: string | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextValue>({
  sessionId: null,
  isLoading: true,
})

/**
 * Generate a UUID for session identification
 */
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Check if session is expired
 */
function isSessionExpired(storedData: { id: string; createdAt: number }): boolean {
  const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - storedData.createdAt > expiryMs
}

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)

      if (stored) {
        const parsed = JSON.parse(stored) as { id: string; createdAt: number }

        if (!isSessionExpired(parsed)) {
          setSessionId(parsed.id)
          setIsLoading(false)
          return
        }
      }

      // Generate new session
      const newId = generateSessionId()
      const data = { id: newId, createdAt: Date.now() }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
      setSessionId(newId)
    } catch (error) {
      // localStorage not available, generate temporary session
      console.warn('localStorage not available, using temporary session')
      setSessionId(generateSessionId())
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <SessionContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * Hook to access the current session ID
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

/**
 * Clear the session (e.g., after order completion)
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
}
