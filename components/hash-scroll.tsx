"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function HashScroll() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // We wrap this in a timeout to ensure the DOM is ready
    const timeoutId = setTimeout(() => {
      const hash = window.location.hash
      if (hash) {
        const id = hash.replace("#", "")
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }
    }, 100) // A small delay is usually enough

    return () => clearTimeout(timeoutId)
  }, [pathname, searchParams]) // Re-run when path or params change

  return null
}