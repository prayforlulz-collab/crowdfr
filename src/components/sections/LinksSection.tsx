"use client"

interface LinkItem {
    label: string
    url: string
}

interface LinksSectionProps {
    data: {
        spotify?: string
        appleMusic?: string
        soundCloud?: string
        youtube?: string
        instagram?: string
        twitter?: string
        tiktok?: string
        facebook?: string
        otherLinks?: LinkItem[]
        variant?: 'list' | 'grid' | 'minimal'
        embedMode?: 'floating' | 'inline'
        links?: any[]
        showLogos?: boolean
    }
    typeFilter?: 'streaming' | 'social'
    onLinkClick?: (options: { linkUrl: string; linkType: 'streaming' | 'social' | 'custom'; linkLabel?: string }) => void
    onPlay?: (platform: 'spotify' | 'apple-music' | 'soundcloud' | 'youtube', url: string) => void
}

import { getEmbedUrl } from "@/lib/utils/embed"
import { useState } from "react"

export default function LinksSection({ data, typeFilter, onLinkClick, onPlay }: LinksSectionProps) {
    const variant = data.variant || 'list'
    const [activeInline, setActiveInline] = useState<{ platform: any, url: any } | null>(null)

    const getLegacyUrl = (platformId: string) => {
        if (!data.links || !Array.isArray(data.links)) return null
        const legacy = (data.links as any[]).find(l =>
            l.platform?.toLowerCase().replace(' ', '') === platformId.toLowerCase().replace('-', '') ||
            l.platform?.toLowerCase().replace('_', '') === platformId.toLowerCase().replace('-', '')
        )
        return legacy?.url
    }

    const showLogos = data.showLogos !== false

    const platformDefinitions: Record<string, any> = {
        spotify: {
            id: 'spotify',
            name: 'Spotify',
            url: data.spotify || getLegacyUrl('spotify'),
            color: '#1DB954',
            glowColor: 'rgba(29,185,84,0.4)',
            textColor: 'text-white',
            type: 'streaming',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.306c-.215.354-.675.465-1.028.249-2.815-1.72-6.358-2.108-10.531-1.153-.404.092-.81-.157-.902-.562-.093-.404.157-.81.562-.902 4.567-1.045 8.483-.604 11.649 1.33.353.216.464.675.25 1.028zm1.469-3.26c-.272.443-.847.584-1.29.312-3.22-1.979-8.127-2.553-11.933-1.398-.5.152-1.026-.131-1.178-.632-.153-.501.131-1.028.632-1.18 4.356-1.321 9.771-.676 13.458 1.584.444.271.585.847.311 1.29zm.126-3.415c-3.86-2.293-10.237-2.503-13.935-1.38-.593.18-1.22.158-1.4-.751-.18-.594.158-1.22.751-1.4 4.25-1.29 11.294-1.033 15.726 1.6 0.533.316.708 1.006.392 1.538-.316.533-1.006.708-1.534.393z" />
                </svg>
            )
        },
        appleMusic: {
            id: 'apple-music',
            name: 'Apple Music',
            url: data.appleMusic || getLegacyUrl('apple-music'),
            color: '#FA243C',
            glowColor: 'rgba(250,36,60,0.4)',
            textColor: 'text-white',
            type: 'streaming',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M21 3.29v13.3c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5c.54 0 1.05.12 1.5.34V7.53l-9 2.1v9.42c0 1.93-1.57 3.5-3.5 3.5S3 21.05 3 19.12s1.57-3.5 3.5-3.5c.54 0 1.05.12 1.5.34V6.03c0-.85.59-1.58 1.42-1.74l10.38-2.12A1.75 1.75 0 0 1 21 3.29z" />
                </svg>
            )
        },
        soundCloud: {
            id: 'soundcloud',
            name: 'SoundCloud',
            url: data.soundCloud || getLegacyUrl('soundcloud'),
            color: '#FF5500',
            glowColor: 'rgba(255,85,0,0.4)',
            textColor: 'text-white',
            type: 'streaming',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M1.42 13.911c-.015.006-.024.02-.024.032l-.062 1.536s-.008.024.016.024l.872.001c.015 0 .025-.01.025-.024l.111-2.903c0-.013-.009-.025-.023-.027l-.915-.175c-.01 0-.019.006-.023.016h.023zm1.192-.72c-.014.004-.023.018-.023.03l-.062 1.537s-.01.025.016.025l.81.001c.016 0 .026-.012.026-.025l.135-3.56c0-.015-.01-.027-.024-.029l-.856-.102c-.01-.001-.02.005-.022.015v.108zm1.31-1.36c-.014.002-.023.015-.023.027l-.062 1.537s-.009.025.016.025l1.033.001c.016 0 .025-.011.025-.025l.169-4.246c0-.015-.012-.027-.026-.027l-1.134.021a.023.023 0 0 0-.02.015l-.014.116-.014 1-.023 1zm1.53-2.022c-.015 0-.024.01-.024.023l-.062 1.537s-.007.025.018.025l1.321.001c.017 0 .027-.012.027-.025l.215-5.326c0-.016-.013-.028-.028-.028-.152 0-.28-.008-.415-.008-.344 0-.671.047-.98.136-.012.004-.02.015-.02.027l-.052 3.64zm1.903-2.518c-.011 0-.023.007-.023.019l-.173 4.25s-.01.025.018.025l1.83.001c.017 0 .028-.013.028-.027l.078-1.536s.013-.1.14-.1-.58 0-.915-1.132-.915-1.132s-.08-.1-1-.1c-.134 0-.256.009-.371.024-.012.002-.02.013-.021.026l-.048.989.02c-.01.001-.019.008-.023.019l-.02.062s0 .003.001.004h-.54zm2.145-.203c-.017 0-.03.013-.03.029l-.203 8.35s.013.03.03.03l2.872-.001c.017 0 .03-.014.03-.03l.119-1.487c.002-.014-.007-.026-.02-.028 2.05-.04 2.503-1.601 2.503-3.618 0-2.446-1.155-2.618-2.58-2.618-.46 0-.895.123-1.272.339-.014.009-.03.001-.035-.014-.424-2.142-2.316-3.746-4.587-3.746-.575 0-1.121.103-1.626.291-.015.006-.024.02-.024.036l-.04 3.125c.016 0 .028.01.028.023l.033 1.537s-.01.024-.023.024h.79z" />
                </svg>
            )
        },
        instagram: {
            id: 'instagram',
            name: 'Instagram',
            url: data.instagram,
            color: '#E4405F',
            glowColor: 'rgba(228,64,95,0.4)',
            textColor: 'text-white',
            type: 'social',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            )
        },
        twitter: {
            id: 'twitter',
            name: 'X (Twitter)',
            url: data.twitter,
            color: '#000000',
            glowColor: 'rgba(255,255,255,0.2)',
            textColor: 'text-white',
            type: 'social',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        tiktok: {
            id: 'tiktok',
            name: 'TikTok',
            url: data.tiktok,
            color: '#000000',
            glowColor: 'rgba(255,0,80,0.3)',
            textColor: 'text-white',
            type: 'social',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.49-3.35-3.98-5.6-1.11-5.09 3.14-10.05 8.16-9.9m-2.18 5.92c-2.45-.19-4.78 1.4-5.46 3.73-.78 2.67 1.14 5.99 3.94 6.09 1.34 0 2.62-.57 3.49-1.57.87-.99 1.33-2.29 1.3-3.6.01-1.55.01-3.1.02-4.65z" />
                </svg>
            )
        },
        facebook: {
            id: 'facebook',
            name: 'Facebook',
            url: data.facebook,
            color: '#1877F2',
            glowColor: 'rgba(24,119,242,0.4)',
            textColor: 'text-white',
            type: 'social',
            logo: (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 2.898v1.072h4.156l-1.002 3.667h-3.154v7.981H9.101z" />
                </svg>
            )
        }
    }

    const legacyOrder: (keyof typeof data)[] = ['spotify', 'appleMusic', 'soundCloud', 'youtube', 'instagram', 'twitter', 'tiktok', 'facebook']

    const getActiveLinks = () => {
        // If the new unified links array exists, use it
        if (data.links && Array.isArray(data.links) && data.links.length > 0) {
            return data.links.map(link => {
                const def = platformDefinitions[link.platform]
                return {
                    id: link.id || link.platform,
                    platform: def?.id || link.platform,
                    name: link.label || (def ? def.name : link.platform),
                    url: link.url,
                    color: def ? def.color : '#333',
                    glowColor: def ? def.glowColor : 'rgba(255,255,255,0.15)',
                    textColor: def ? def.textColor : 'text-white',
                    logo: def ? def.logo : null,
                    behavior: link.behavior || (def?.type === 'streaming' ? 'embed' : 'redirect'),
                    type: def ? def.type : 'custom'
                }
            })
        }

        // Fallback: Construct list from legacy standalone fields
        const links: any[] = []

        // 1. Known Platforms in fixed order
        legacyOrder.forEach(key => {
            const url = data[key as keyof typeof data] as string
            if (url) {
                const def = platformDefinitions[key as string]
                if (def) {
                    links.push({
                        id: key,
                        platform: def.id || key,
                        name: def.name,
                        url: url,
                        color: def.color,
                        glowColor: def.glowColor,
                        textColor: def.textColor,
                        logo: def.logo,
                        behavior: def.type === 'streaming' ? 'embed' : 'redirect',
                        type: def.type
                    })
                }
            }
        })

        // 2. Custom "Other Links"
        if (data.otherLinks && Array.isArray(data.otherLinks)) {
            data.otherLinks.forEach((link, i) => {
                links.push({
                    id: `custom-${i}`,
                    platform: 'custom',
                    name: link.label,
                    url: link.url,
                    color: '#333',
                    glowColor: 'rgba(255,255,255,0.15)',
                    textColor: 'text-white',
                    logo: null,
                    behavior: 'redirect',
                    type: 'custom'
                })
            })
        }

        return links
    }

    const activeLinks = getActiveLinks()
    const streamingLinks = activeLinks.filter(l => l.type === 'streaming' && (!typeFilter || typeFilter === 'streaming'))
    const socialLinks = activeLinks.filter(l => l.type !== 'streaming' && (!typeFilter || typeFilter === 'social'))

    if (typeFilter === 'streaming' && streamingLinks.length === 0) return null
    if (typeFilter === 'social' && socialLinks.length === 0) return null

    const handleAction = (link: any) => {
        if (!link.url) return

        const isStreaming = link.type === 'streaming'

        if (link.behavior === 'embed' && isStreaming) {
            if (activeInline?.url === link.url) {
                setActiveInline(null)
            } else {
                setActiveInline({ platform: link.platform, url: link.url })
            }
            if (onLinkClick) {
                onLinkClick({
                    linkUrl: link.url,
                    linkType: 'streaming',
                    linkLabel: `Stream on ${link.name}`
                })
            }
        } else if (link.behavior === 'embed-floating' && isStreaming) {
            if (onPlay) {
                onPlay(link.platform, link.url)
            }
            if (onLinkClick) {
                onLinkClick({
                    linkUrl: link.url,
                    linkType: 'streaming',
                    linkLabel: `Stream on ${link.name}`
                })
            }
        } else {
            window.open(link.url, '_blank')
            if (onLinkClick) {
                onLinkClick({
                    linkUrl: link.url,
                    linkType: link.type === 'streaming' ? 'streaming' : (link.type === 'social' ? 'social' : 'custom'),
                    linkLabel: link.name
                })
            }
        }
    }

    const renderLink = (link: any, index: number) => {
        const isStreaming = link.type === 'streaming'
        const labelText = isStreaming ? (link.behavior === 'embed' ? 'Play' : 'Listen') : 'Visit'

        return (
            <div
                key={link.id}
                className="flex flex-col gap-2"
                style={{ animationDelay: `${index * 60}ms` }}
            >
                <button
                    onClick={() => handleAction(link)}
                    className={`flex items-center justify-between w-full p-4 sm:p-5 ${variant === 'minimal' ? 'bg-transparent border-b border-zinc-800 rounded-none' : 'bg-zinc-900 border border-white/5 rounded-2xl shadow-xl'} transition-all duration-300 group`}
                    style={{
                        ['--glow-color' as any]: link.glowColor,
                    }}
                    onMouseEnter={(e) => {
                        if (variant !== 'minimal') {
                            e.currentTarget.style.boxShadow = `0 0 30px ${link.glowColor}, inset 0 0 30px ${link.glowColor.replace(/[\d.]+\)$/, '0.05)')}`
                            e.currentTarget.style.borderColor = link.color + '40'
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = ''
                        e.currentTarget.style.borderColor = ''
                    }}
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                        {showLogos && link.logo ? (
                            <div className="w-8 h-8 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors duration-500">
                                {link.logo}
                            </div>
                        ) : (
                            <div className="w-1.5 h-6 rounded-full transition-shadow duration-300" style={{ backgroundColor: link.color }} />
                        )}
                        <span className="text-base sm:text-lg font-black tracking-tight uppercase italic">{link.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors hidden sm:inline">
                            {labelText}
                        </span>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            {isStreaming ? (
                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                </button>

                {activeInline && activeInline.platform === link.platform && activeInline.url === link.url && isStreaming && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                        <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl ${activeInline.platform === 'apple-music' ? 'h-[175px]' : activeInline.platform === 'spotify' ? 'h-[152px]' : 'aspect-video'}`}>
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
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black rounded-full text-white transition-all scale-90 hover:scale-100"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (variant === 'grid') {
        return (
            <section className="w-full py-10 px-6 bg-black text-white">
                <div className="max-w-4xl mx-auto space-y-12">
                    {streamingLinks.length > 0 && (
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Streaming Services</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {streamingLinks.map(link => (
                                    <button
                                        key={link.id}
                                        onClick={() => handleAction(link)}
                                        className="group relative flex items-center justify-between p-5 sm:p-6 bg-zinc-900 hover:bg-zinc-800 rounded-3xl transition-all duration-300 border border-white/5 overflow-hidden"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = `0 0 30px ${link.glowColor}`
                                            e.currentTarget.style.borderColor = link.color + '40'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = ''
                                            e.currentTarget.style.borderColor = ''
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: showLogos ? 'transparent' : link.color }}>
                                                {showLogos && link.logo ? (
                                                    <div className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                                        {link.logo}
                                                    </div>
                                                ) : (
                                                    <span className="text-xl font-bold">▶</span>
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">{link.name}</span>
                                                <span className="block text-lg font-bold">Listen Now</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {socialLinks.length > 0 && (
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Social & Web</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {socialLinks.map(link => (
                                    <button
                                        key={link.id}
                                        onClick={() => handleAction(link)}
                                        className="group flex flex-col items-center gap-3 p-5 sm:p-6 bg-zinc-900/50 hover:bg-zinc-800 rounded-[32px] transition-all duration-300 border border-white/5 hover:border-white/10"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all group-hover:scale-110">
                                            {link.logo ? link.logo : <span className="text-xl">🌐</span>}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">{link.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        )
    }

    return (
        <section className="w-full py-10 px-6 bg-black text-white">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                {activeLinks.filter(l => (!typeFilter || l.type === typeFilter || (typeFilter === 'social' && l.type === 'custom'))).map((link, index) => renderLink(link, index))}
            </div>
        </section>
    )
}
