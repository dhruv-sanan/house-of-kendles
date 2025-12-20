"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface MarqueeProps {
    children: ReactNode
    direction?: "left" | "right"
    pauseOnHover?: boolean
    className?: string
    speed?: number // Duration in seconds for full loop
}

export function Marquee({
    children,
    direction = "left",
    pauseOnHover = false,
    className,
    speed = 20,
}: MarqueeProps) {
    return (
        <div className={cn("overflow-hidden flex w-full", className)}>
            <div
                className={cn(
                    "flex min-w-full shrink-0 gap-8 items-center justify-around py-4",
                    direction === "left" ? "animate-marquee" : "animate-marquee-reverse",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
                style={{ animationDuration: `${speed}s` }}
            >
                {children}
            </div>
            <div
                className={cn(
                    "flex min-w-full shrink-0 gap-8 items-center justify-around py-4 ml-8",
                    direction === "left" ? "animate-marquee" : "animate-marquee-reverse",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
                style={{ animationDuration: `${speed}s` }}
            >
                {children}
            </div>
        </div>
    )
}
