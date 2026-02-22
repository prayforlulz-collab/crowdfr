"use client"

import HeroSection from "./HeroSection"
import LinksSection from "./LinksSection"
import TracklistSection from "./TracklistSection"
import EmailCaptureSection from "./EmailCaptureSection"
import VideoSection from "./VideoSection"
import TourDatesSection from "./TourDatesSection"
import MerchSection from "./MerchSection"
import BioSection from "./BioSection"
import ContactSection from "./ContactSection"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useState, useRef, useEffect } from "react"
import FloatingPlayer from "../FloatingPlayer"
import {
    User,
    Link as LinkIcon,
    Music2,
    Mail,
    Video,
    Calendar,
    ShoppingBag,
    Info,
    Contact2,
    ChevronDown
} from 'lucide-react'

interface Section {
    id: string
    type: "hero" | "links" | "tracklist" | "email_capture" | "video" | "tour_dates" | "merch" | "bio" | "contact"
    data: any
}

interface SectionRendererProps {
    sections: Section[]
    context?: {
        organizationId: string
        releaseId: string
        artistName?: string
        artistLayout?: Section[]
    }
}

// Hook for IntersectionObserver-based reveal
function useRevealOnScroll() {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(el)
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return { ref, isVisible }
}

function AnimatedSection({ children, isHero }: { children: React.ReactNode, isHero?: boolean }) {
    const { ref, isVisible } = useRevealOnScroll()

    // Hero renders immediately — no scroll-triggered delay
    if (isHero) {
        return <div>{children}</div>
    }

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
            {children}
        </div>
    )
}

function CollapsibleSection({
    section,
    context,
    trackClick,
    handlePlay,
    renderSectionContent,
    getSectionConfig
}: {
    section: Section,
    context?: any,
    trackClick: any,
    handlePlay: any,
    renderSectionContent: (section: Section) => React.ReactNode,
    getSectionConfig: (section: Section) => any
}) {
    const [isOpen, setIsOpen] = useState(false)
    const { Icon, defaultDescription } = getSectionConfig(section)
    const showIcon = section.data.showIcon !== false
    const showDescription = section.data.showDescription !== false
    const description = section.data.customDescription || defaultDescription
    const label = section.data.buttonLabel || section.type.replace('_', ' ')
    const spacingClass = {
        'compact': 'py-2',
        'default': 'py-6',
        'wide': 'py-12'
    }[section.data.spacing as 'compact' | 'default' | 'wide'] || 'py-2'

    return (
        <div className={`w-full px-6 bg-black ${spacingClass}`}>
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 rounded-2xl p-5 sm:p-6 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                        {showIcon && (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                        )}
                        <div className="text-left">
                            <span className="block font-black uppercase tracking-tight text-base sm:text-lg text-white group-hover:text-purple-400 transition-colors">
                                {label}
                            </span>
                            {showDescription && description && (
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 group-hover:text-white" />
                    </div>
                </button>
                {isOpen && (
                    <div className="mt-2 animate-in slide-in-from-top-4 duration-300">
                        {section.data.showTitleExpanded && (
                            <div className="mb-6 mt-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                                    {label}
                                </h2>
                                <div className="w-12 h-1 bg-purple-500 mt-2" />
                            </div>
                        )}
                        {renderSectionContent(section)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SectionRenderer({ sections, context }: SectionRendererProps) {
    const { trackClick } = useAnalytics({
        organizationId: context?.organizationId || '',
        releaseId: context?.releaseId
    })

    const [activeEmbed, setActiveEmbed] = useState<{
        platform: 'spotify' | 'apple-music' | 'soundcloud' | 'youtube' | null
        url: string | null
    }>({ platform: null, url: null })

    const handlePlay = (platform: any, url: any) => {
        setActiveEmbed({ platform, url })
        if (context) {
            trackClick({
                linkUrl: url,
                linkType: 'streaming',
                linkLabel: `Stream on ${platform}`
            })
        }
    }

    const getSectionConfig = (section: Section) => {
        switch (section.type) {
            case "hero":
                return {
                    Icon: User,
                    defaultDescription: "Artist Spotlight"
                }
            case "links":
                const linkCount = (section.data.links?.length || 0) +
                    (section.data.spotify ? 1 : 0) +
                    (section.data.appleMusic ? 1 : 0) +
                    (section.data.soundCloud ? 1 : 0) +
                    (section.data.youtube ? 1 : 0) +
                    (section.data.instagram ? 1 : 0) +
                    (section.data.twitter ? 1 : 0) +
                    (section.data.tiktok ? 1 : 0) +
                    (section.data.facebook ? 1 : 0) +
                    (section.data.otherLinks?.length || 0)
                return {
                    Icon: LinkIcon,
                    defaultDescription: `${linkCount} ${linkCount === 1 ? 'Link' : 'Links'} Available`
                }
            case "tracklist":
                const trackCount = section.data.tracks?.length || 0
                return {
                    Icon: Music2,
                    defaultDescription: `${trackCount} ${trackCount === 1 ? 'Track' : 'Tracks'} Included`
                }
            case "email_capture":
                return {
                    Icon: Mail,
                    defaultDescription: "Join the mailing list"
                }
            case "video":
                return {
                    Icon: Video,
                    defaultDescription: "Watch Latest Video"
                }
            case "tour_dates":
                const dateCount = section.data.dates?.length || 0
                return {
                    Icon: Calendar,
                    defaultDescription: `${dateCount} ${dateCount === 1 ? 'Date' : 'Dates'} Announced`
                }
            case "merch":
                const itemCount = section.data.items?.length || 0
                return {
                    Icon: ShoppingBag,
                    defaultDescription: `${itemCount} ${itemCount === 1 ? 'Product' : 'Products'} Available`
                }
            case "bio":
                return {
                    Icon: Info,
                    defaultDescription: "Read the Biography"
                }
            case "contact":
                return {
                    Icon: Contact2,
                    defaultDescription: "Get in touch"
                }
            default:
                return {
                    Icon: Info,
                    defaultDescription: ""
                }
        }
    }

    const renderSectionContent = (section: Section) => {
        switch (section.type) {
            case "hero":
                return <HeroSection key={section.id} data={section.data} />
            case "links":
                return (
                    <LinksSection
                        key={section.id}
                        data={section.data}
                        context={context}
                        onLinkClick={trackClick}
                        onPlay={section.data.embedMode === 'inline' ? undefined : handlePlay}
                    />
                )

            case "tracklist":
                return (
                    <TracklistSection
                        key={section.id}
                        data={section.data}
                        onPlay={section.data.embedMode === 'inline' ? undefined : handlePlay}
                    />
                )
            case "email_capture":
                return (
                    <EmailCaptureSection
                        key={section.id}
                        data={section.data}
                        context={context}
                    />
                )
            case "video":
                return <VideoSection key={section.id} data={section.data} />
            case "tour_dates":
                return <TourDatesSection key={section.id} data={section.data} />
            case "merch":
                return <MerchSection key={section.id} data={section.data} />
            case "bio":
                return <BioSection key={section.id} data={section.data} />
            case "contact":
                return <ContactSection key={section.id} data={section.data} />
            default:
                return null
        }
    }

    return (
        <div className="w-full flex flex-col relative">
            {sections.map((section, index) => {
                let sectionData = section.data

                // Inheritance Logic
                if (section.data.inheritFromArtist && context?.artistLayout) {
                    const artistSection = context.artistLayout.find(as => as.type === section.type)
                    if (artistSection) {
                        sectionData = { ...artistSection.data, inheritFromArtist: true }
                    }
                }

                const processedSection = { ...section, data: sectionData }

                const content = processedSection.data.useButton ? (
                    <CollapsibleSection
                        key={processedSection.id}
                        section={processedSection}
                        context={context}
                        trackClick={trackClick}
                        handlePlay={handlePlay}
                        renderSectionContent={renderSectionContent}
                        getSectionConfig={getSectionConfig}
                    />
                ) : (
                    renderSectionContent(processedSection)
                )

                return (
                    <AnimatedSection key={processedSection.id} isHero={processedSection.type === 'hero'}>
                        {content}
                        {/* Subtle divider between sections (not after the last one) */}
                        {index < sections.length - 1 && processedSection.type !== 'hero' && (
                            <div className="max-w-2xl mx-auto px-6">
                                <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
                            </div>
                        )}
                    </AnimatedSection>
                )
            })}

            <FloatingPlayer
                platform={activeEmbed.platform}
                url={activeEmbed.url}
                onClose={() => setActiveEmbed({ platform: null, url: null })}
            />
        </div>
    )
}
