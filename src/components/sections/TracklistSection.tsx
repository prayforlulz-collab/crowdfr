"use client"

interface TrackItem {
    title: string
    duration?: string
    appleMusicTrackId?: string
    spotifyTrackId?: string
    soundCloudUrl?: string
    youtubeUrl?: string
}

interface TracklistSectionProps {
    data: {
        tracks: TrackItem[]
        variant?: 'list' | 'compact'
        embedMode?: 'floating' | 'inline'
    }
    onPlay?: (platform: 'spotify' | 'apple-music' | 'soundcloud' | 'youtube', url: string) => void
}

import { getEmbedUrl } from "@/lib/utils/embed"
import { formatDuration } from "@/lib/utils/format"
import { useState } from "react"

export default function TracklistSection({ data, onPlay }: TracklistSectionProps) {
    const variant = data.variant || 'list'
    const [activeInline, setActiveInline] = useState<{ platform: any, url: any, index: number } | null>(null)

    const handleTrackPlay = (platform: any, url: any, index: number) => {
        if (data.embedMode === 'inline') {
            setActiveInline({ platform, url, index })
        } else if (onPlay) {
            onPlay(platform, url)
        }
    }

    return (
        <section className="w-full py-12 px-6 bg-black text-white">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Tracklist</h3>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{data.tracks.length} Tracks</span>
                </div>
                <div className={`${variant === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8' : 'space-y-1'}`}>
                    {data.tracks.map((track, index) => (
                        <div key={index} className="flex flex-col">
                            <div
                                className={`flex items-center justify-between p-3 hover:bg-zinc-900 rounded-xl transition-all duration-200 group cursor-default border border-transparent hover:border-white/5 hover:border-l-2 hover:border-l-purple-500/60 ${variant === 'compact' ? 'border-b border-zinc-900' : ''}`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <span className="text-xs font-mono text-zinc-600 w-6 text-right flex-shrink-0 group-hover:text-zinc-400 transition-colors">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-base sm:text-lg font-medium tracking-tight truncate">{track.title}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                                    {track.duration && (
                                        <span className="text-sm font-mono text-zinc-600 group-hover:text-zinc-400 hidden sm:inline">{formatDuration(track.duration)}</span>
                                    )}
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        {track.spotifyTrackId && (
                                            <button
                                                onClick={() => handleTrackPlay('spotify', `https://open.spotify.com/track/${track.spotifyTrackId}`, index)}
                                                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center hover:bg-[#1DB954] hover:text-white hover:shadow-[0_0_12px_rgba(29,185,84,0.4)] transition-all active:scale-90"
                                                title="Play on Spotify"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.213.344-.663.456-1.006.244-2.825-1.725-6.381-2.112-10.575-1.156-.394.088-.794-.156-.881-.55-.088-.394.156-.794.55-.881 4.581-1.044 8.506-.594 11.669 1.338.337.213.45.663.243 1.005zm1.469-3.262c-.269.438-.844.575-1.281.306-3.238-1.988-8.175-2.569-12.006-1.406-.494.15-.988-.131-1.138-.613-.15-.494.131-.988.613-1.138 4.381-1.325 9.831-.681 13.525 1.588.438.269.575.838.306 1.281zm.131-3.419c-3.881-2.306-10.281-2.519-14-1.394-.594.181-1.231-.156-1.413-.75-.181-.594.156-1.231.75-1.413 4.281-1.294 11.338-1.031 15.819 1.625.538.319.713 1.013.394 1.55-.319.531-1.019.712-1.55.392V10.618z" />
                                                </svg>
                                            </button>
                                        )}
                                        {track.appleMusicTrackId && (
                                            <button
                                                onClick={() => handleTrackPlay('apple-music', track.appleMusicTrackId, index)}
                                                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#FA243C]/10 text-[#FA243C] flex items-center justify-center hover:bg-[#FA243C] hover:text-white hover:shadow-[0_0_12px_rgba(250,36,60,0.4)] transition-all active:scale-90"
                                                title="Play on Apple Music"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </button>
                                        )}
                                        {track.soundCloudUrl && (
                                            <button
                                                onClick={() => handleTrackPlay('soundcloud', track.soundCloudUrl!, index)}
                                                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center hover:bg-[#FF5500] hover:text-white hover:shadow-[0_0_12px_rgba(255,85,0,0.4)] transition-all active:scale-90"
                                                title="Play on SoundCloud"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c.321 0 .636-.013.947-.039a7.1 7.1 0 01-.137-1.401v-.01c0-2.327 1.886-4.213 4.213-4.213.344 0 .676.042.993.12.784-3.793 4.144-6.643 8.169-6.643.149 0 .296.004.443.012A11.97 11.97 0 0012 0z" />
                                                </svg>
                                            </button>
                                        )}
                                        {track.youtubeUrl && (
                                            <button
                                                onClick={() => handleTrackPlay('youtube', track.youtubeUrl!, index)}
                                                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center hover:bg-[#FF0000] hover:text-white hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] transition-all active:scale-90"
                                                title="Play on YouTube"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {activeInline?.index === index && (
                                <div className="mt-2 mb-4 animate-in fade-in slide-in-from-top-2">
                                    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 ${activeInline.platform === 'apple-music' ? 'h-[175px]' : activeInline.platform === 'spotify' ? 'h-[152px]' : 'aspect-video'}`}>
                                        <iframe
                                            src={getEmbedUrl(activeInline.platform, activeInline.url)}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                        />
                                        <button
                                            onClick={() => setActiveInline(null)}
                                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black rounded-full text-white transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
