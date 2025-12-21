"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadWidgetProps {
    onUploadSuccess: (url: string) => void
    onUploadError?: (error: string) => void
    disabled?: boolean
    multiple?: boolean
}

interface UploadState {
    isUploading: boolean
    progress: number
    error?: string
}

export function ImageUploadWidget({
    onUploadSuccess,
    onUploadError,
    disabled,
    multiple = false,
}: ImageUploadWidgetProps) {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
    })
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // If multiple allowed, handle all, else just first
            const files = Array.from(e.dataTransfer.files)
            handleFiles(files)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const files = Array.from(e.target.files)
            handleFiles(files)
        }
    }

    const validateFile = (file: File): string | null => {
        // 10MB limit
        if (file.size > 10 * 1024 * 1024) return "File size too large (max 10MB)"
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return "Invalid file format (only jpg, png, webp)"
        return null
    }

    const handleFiles = async (files: File[]) => {
        if (disabled) return

        // If not multiple, just take the first one
        const filesToUpload = multiple ? files : [files[0]]

        // For now, let's process sequentially to show progress for each or just aggregate
        // The requirement implies handling multiple.
        // If multiple is true, we should probably emit one by one or all at once?
        // The prop `onUploadSuccess` takes a SINGLE url. So we must fire it multiple times if multiple files.

        for (const file of filesToUpload) {
            const error = validateFile(file)
            if (error) {
                setUploadState(prev => ({ ...prev, error }))
                onUploadError?.(error)
                continue
            }

            await uploadSingleFile(file)
        }
    }

    const uploadSingleFile = async (file: File) => {
        setUploadState({ isUploading: true, progress: 0 })
        try {
            const formData = new FormData()
            formData.append('file', file)
            // Assuming these env vars are available
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
            // Optional: add folder if passed in or hardcode
            // formData.append('folder', 'ecommerce/products') 

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
            if (!cloudName) throw new Error("Cloudinary Cloud Name not found")

            const xhr = new XMLHttpRequest()

            const promise = new Promise<string>((resolve, reject) => {
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100)
                        setUploadState(prev => ({ ...prev, progress: percent }))
                    }
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const data = JSON.parse(xhr.responseText)
                        resolve(data.secure_url)
                    } else {
                        reject(new Error("Upload failed"))
                    }
                }

                xhr.onerror = () => reject(new Error("Upload network error"))

                xhr.send(formData)
            })

            const url = await promise
            onUploadSuccess(url)
            setUploadState({ isUploading: false, progress: 100 })

        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Upload failed"
            setUploadState({ isUploading: false, progress: 0, error: errMsg })
            onUploadError?.(errMsg)
        }
    }

    return (
        <div className="w-full">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full min-h-[160px] p-6 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/5",
                    disabled && "opacity-60 cursor-not-allowed",
                    (uploadState.isUploading) && "pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    multiple={multiple}
                    onChange={handleChange}
                    disabled={disabled || uploadState.isUploading}
                />

                {uploadState.isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <div className="text-sm font-medium text-muted-foreground">
                            Uploading... {uploadState.progress}%
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG or WEBP (MAX. 10MB)
                            </p>
                        </div>
                    </div>
                )}

                {uploadState.error && (
                    <div className="absolute bottom-2 left-0 w-full text-center">
                        <p className="text-xs text-destructive font-medium">{uploadState.error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
