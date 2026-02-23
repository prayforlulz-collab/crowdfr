"use client"

import { useEffect, useRef } from 'react'

export function BlogViewTracker({ slug }: { slug: string }) {
    const hasFired = useRef(false)

    useEffect(() => {
        if (!hasFired.current) {
            hasFired.current = true
            fetch(`/api/blog/${slug}/view`, { method: 'POST' }).catch(console.error)
        }
    }, [slug])

    return null
}
