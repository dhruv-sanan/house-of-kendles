import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCloudinaryUrl(url: string) {
  if (!url || !url.includes('cloudinary.com')) return url

  // 1. Inject transformations (f_auto, q_auto) for optimization and format conversion
  // This ensures HEIC is served as WebP/JPEG to the browser
  let formatted = url
  if (!formatted.includes('/f_auto,q_auto/')) {
    formatted = formatted.replace('/upload/', '/upload/f_auto,q_auto/')
  }

  // 2. Replace .heic extension with .jpg to ensure widely compatible file extension in URL
  // (Cloudinary will deliver optimal format via f_auto regardless, but extension helps some parsers)
  if (formatted.endsWith('.heic')) {
    formatted = formatted.replace('.heic', '.jpg')
  }

  return formatted
}
