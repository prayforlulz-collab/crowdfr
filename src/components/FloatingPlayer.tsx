"use client"

import { useState, useEffect } from "react"

interface FloatingPlayerProps {
    platform: 'spotify' | 'apple-music' | 'soundcloud' | 'youtube' | null
    url: string | null
    onClose: () => void
}

import { getEmbedUrl } from "@/lib/utils/embed"

export default function FloatingPlayer({ platform, url, onClose }: FloatingPlayerProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (platform && url) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }, [platform, url])

    if (!platform || !url || !isVisible) return null

    const getTargetHeight = () => {
        if (platform === 'spotify') {
            return url.includes('/track/') ? 152 : 352
        }
        if (platform === 'apple-music') return 175
        if (platform === 'soundcloud') return 166
        if (platform === 'youtube') return 225
        return 152
    }

    const height = getTargetHeight()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4 md:p-6 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-10 duration-500 pb-[env(safe-area-inset-bottom,12px)]">
            <div className="w-full max-w-4xl bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transition-all duration-500 ease-out">
                {/* Mobile: close button on top */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 sm:hidden">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Now Playing</span>
                    <button
                        onClick={() => {
                            setIsVisible(false)
                            setTimeout(onClose, 500)
                        }}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch">
                    <div className="flex-1 overflow-hidden" style={{ height: `${height}px` }}>
                        <iframe
                            src={getEmbedUrl(platform, url)}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="w-full h-full"
                        />
                    </div>
                    {/* Desktop: close button beside */}
                    <button
                        onClick={() => {
                            setIsVisible(false)
                            setTimeout(onClose, 500)
                        }}
                        className="hidden sm:flex w-12 bg-white/5 hover:bg-white/10 items-center justify-center text-zinc-400 hover:text-white transition-colors border-l border-white/5"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
