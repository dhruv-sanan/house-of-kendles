"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimationProps {
    children: ReactNode
    className?: string
    delay?: number
    duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.5 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SlideIn({ children, className, delay = 0, duration = 0.5 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay, type: "spring", stiffness: 100 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function BlurIn({ children, className, delay = 0, duration = 0.8 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function ScaleIn({ children, className, delay = 0, duration = 0.5 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration, delay, type: "spring" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
