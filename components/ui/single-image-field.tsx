"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Image as ImageIcon } from "lucide-react"
import { ImageUploadWidget } from "./image-upload-widget"
import { useState } from "react"
import type { StaticImport } from "next/dist/shared/lib/get-img-props"

interface SingleImageFieldProps {
    value?: string | null
    onChange: (url: string) => void
    label?: string
    disabled?: boolean
}

export function SingleImageField({
    value,
    onChange,
    disabled
}: SingleImageFieldProps) {
    // If we have a value, show the preview. Otherwise show the widget
    const [error, setError] = useState<string | null>(null)

    if (value) {
        return (
            <div className="relative aspect-video w-full max-w-sm rounded-lg border overflow-hidden bg-muted group">
                <Image
                    src={value}
                    alt="Image preview"
                    fill
                    className="object-cover"
                />
                <div className="absolute top-2 right-2">
                    {!disabled && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onChange("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {/* Optional: could show dimensions here if we preloaded the image */}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm">
            <ImageUploadWidget
                onUploadSuccess={(url) => {
                    setError(null)
                    onChange(url)
                }}
                onUploadError={(err) => setError(err)}
                disabled={disabled}
                multiple={false}
            />
        </div>
    )
}
