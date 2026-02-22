"use client"

import { Play } from 'lucide-react'
import { useState } from 'react'

interface VideoSectionProps {
    data: {
        videoUrl: string
        title?: string
        variant?: 'full-width' | 'contained' | 'background'
        autoplay?: boolean
        muted?: boolean
    }
}

export default function VideoSection({ data }: VideoSectionProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const variant = data.variant || 'contained'
    const autoplay = data.autoplay ?? false
    const muted = data.muted ?? false

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop()
            // Background variant always autoplays muted
            if (variant === 'background') {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1`
            }
            return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? '1' : '0'}&mute=${muted ? '1' : '0'}&controls=1&loop=0`
        }
        return url
    }

    const embedUrl = getEmbedUrl(data.videoUrl)

    if (variant === 'background') {
        return (
            <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
                <iframe
                    src={embedUrl}
                    className="absolute top-1/2 left-1/2 w-[177.77%] h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                    allow="autoplay; encrypted-media"
                />
                <div className="relative z-10 text-center px-4">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                        {data.title || 'Watch Now'}
                    </h2>
                </div>
            </section>
        )
    }

    return (
        <section className={`w-full py-12 px-6 bg-black text-white ${variant === 'full-width' ? 'p-0' : ''}`}>
            <div className={`${variant === 'full-width' ? 'max-w-none' : 'max-w-4xl'} mx-auto`}>
                {data.title && variant !== 'full-width' && (
                    <h3 className="text-2xl font-bold mb-8 text-center uppercase tracking-wider">{data.title}</h3>
                )}
                <div className="relative aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </section>
    )
}
