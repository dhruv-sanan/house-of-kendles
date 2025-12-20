"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All Materials" },
  { id: "candles", label: "Candles" },
  { id: "bath-salt", label: "Bath Salt" },
  { id: "home-decor", label: "Home Decor" },
  { id: "other", label: "Other / Uncategorized" },
]

export function CategoryTabs() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {categories.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/materials?category=${tab.id}`}
            className={cn(
              "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium",
              currentCategory === tab.id
                ? "border-brand-900 text-brand-900"
                : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}