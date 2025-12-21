"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ChevronUp, ChevronDown } from "lucide-react"
import { ImageUploadWidget } from "./image-upload-widget"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface MultipleImageFieldProps {
    value: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
}

export function MultipleImageField({
    value = [],
    onChange,
    disabled
}: MultipleImageFieldProps) {
    const [error, setError] = useState<string | null>(null)

    const handleAddImage = (url: string) => {
        onChange([...value, url])
    }

    const handleRemoveImage = (index: number) => {
        const newUrls = [...value]
        newUrls.splice(index, 1)
        onChange(newUrls)
    }

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newUrls = [...value]
        if (direction === 'up' && index > 0) {
            [newUrls[index], newUrls[index - 1]] = [newUrls[index - 1], newUrls[index]]
        } else if (direction === 'down' && index < newUrls.length - 1) {
            [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]]
        }
        onChange(newUrls)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {value.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group aspect-square rounded-lg border overflow-hidden bg-secondary">
                        <Image
                            src={url}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                        />

                        {!disabled && (
                            <>
                                <div className="absolute top-2 right-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="absolute bottom-2 right-2 flex gap-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="h-6 w-6 bg-background/80 hover:bg-background"
                                        disabled={index === 0}
                                        onClick={() => handleMove(index, 'up')}
                                    >
                                        <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="h-6 w-6 bg-background/80 hover:bg-background"
                                        disabled={index === value.length - 1}
                                        onClick={() => handleMove(index, 'down')}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            </>
                        )}

                        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            #{index + 1}
                        </div>
                    </div>
                ))}

                {/* Upload Widget Slot */}
                {!disabled && (
                    <div className="aspect-square">
                        <ImageUploadWidget
                            onUploadSuccess={handleAddImage}
                            onUploadError={setError}
                            disabled={disabled}
                            multiple={true}
                        />
                    </div>
                )}
            </div>

            {value.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No gallery images added yet.</p>
            )}
        </div>
    )
}
