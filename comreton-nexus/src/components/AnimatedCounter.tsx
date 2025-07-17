// src/components/AnimatedCounter.tsx
'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface AnimatedCounterProps {
    end: number
    duration?: number
    prefix?: string
    suffix?: string
}

export function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

    useEffect(() => {
        if (inView) {
            let startTime: number
            const startValue = 0

            const animate = (currentTime: number) => {
                if (!startTime) startTime = currentTime
                const progress = Math.min((currentTime - startTime) / duration, 1)

                const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                setCount(Math.floor(easeOutQuart * (end - startValue) + startValue))

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }

            requestAnimationFrame(animate)
        }
    }, [inView, end, duration])

    return (
        <span ref={ref} className="neural-text text-4xl font-black">
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}