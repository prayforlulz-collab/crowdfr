"use client"

import { useState } from "react"
import SectionRenderer from "../sections/SectionRenderer"

interface Section {
    id: string
    type: "hero" | "links" | "tracklist" | "merch" | "tour_dates" | "video" | "email_capture"
    data: any
}

interface ArtistEditorProps {
    artistId: string
    organizationId: string
    initialData: {
        name: string
        bio?: string
        imageUrl?: string
        layout: any
        facebookPixelId?: string
        tiktokPixelId?: string
        googleAnalyticsId?: string
    }
}

export default function ArtistEditor({ artistId, organizationId, initialData }: ArtistEditorProps) {
    const [sections, setSections] = useState<Section[]>(() => {
        let layout = initialData.layout
        if (typeof layout === 'string') {
            try {
                layout = JSON.parse(layout)
            } catch (e) {
                layout = []
            }
        }
        if (Array.isArray(layout) && layout.length > 0) return layout

        // Initial default layout
        return [
            {
                id: "1",
                type: "hero",
                data: {
                    title: initialData.name,
                    subtitle: initialData.bio || 'Artist Profile',
                    variant: 'centered',
                    coverImage: initialData.imageUrl
                }
            },
            { id: "2", type: "links", data: { links: [], showLogos: true, useButton: false } }
        ] as Section[]
    })
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [showMobilePreview, setShowMobilePreview] = useState(false)

    // Tracking Pixels
    const [facebookPixelId, setFacebookPixelId] = useState(initialData.facebookPixelId || "")
    const [tiktokPixelId, setTiktokPixelId] = useState(initialData.tiktokPixelId || "")
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState(initialData.googleAnalyticsId || "")

    const selectedSection = sections.find(s => s.id === selectedSectionId)

    const handleSave = async () => {
        setIsSaving(true)
        setMessage("")
        try {
            const heroSection = sections.find(s => s.type === 'hero')
            const payload: any = { layout: sections }

            if (heroSection) {
                payload.name = heroSection.data.title
                payload.imageUrl = heroSection.data.coverImage
                payload.bio = heroSection.data.subtitle
            }

            payload.facebookPixelId = facebookPixelId
            payload.tiktokPixelId = tiktokPixelId
            payload.googleAnalyticsId = googleAnalyticsId

            const res = await fetch(`/api/artists/${artistId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setMessage("Artist page saved!")
            } else {
                setMessage("Failed to save.")
            }
        } catch (error) {
            setMessage("An error occurred.")
        } finally {
            setIsSaving(false)
        }
    }

    const updateSectionData = (id: string, newData: any) => {
        setSections(sections.map(s => s.id === id ? { ...s, data: { ...s.data, ...newData } } : s))
    }

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newSections.length) return

        const [moved] = newSections.splice(index, 1)
        newSections.splice(targetIndex, 0, moved)
        setSections(newSections)
    }

    const removeSection = (index: number) => {
        const idToRemove = sections[index].id
        if (selectedSectionId === idToRemove) setSelectedSectionId(null)
        const newSections = sections.filter((_, i) => i !== index)
        setSections(newSections)
    }

    const addSection = (type: Section["type"]) => {
        const id = Math.random().toString(36).substr(2, 9)
        let defaultData: any = {}

        switch (type) {
            case "hero": defaultData = { title: initialData.name, variant: 'centered' }; break
            case "links": defaultData = { links: [], showLogos: true, useButton: false }; break
            case "tracklist": defaultData = { tracks: [], embedMode: 'floating' }; break
            case "merch": defaultData = { title: "Official Merch", items: [], variant: 'grid', storeUrl: '' }; break
            case "tour_dates": defaultData = { title: "Upcoming Shows", dates: [] }; break
            case "email_capture": defaultData = { title: "Join the mailing list" }; break
            case "video": defaultData = { title: "Featured Video", videoUrl: "" }; break
            default: defaultData = {}
        }

        setSections([...sections, { id, type, data: defaultData }])
        setSelectedSectionId(id)
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans">
            {/* Sidebar - Reusing ReleaseEditor styling */}
            <div className={`w-full md:w-96 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col h-full overflow-hidden ${showMobilePreview ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">
                            Artist Builder
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowMobilePreview(true)}
                            className="md:hidden bg-zinc-800 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase hover:bg-zinc-700 transition-all border border-zinc-700"
                        >
                            Preview
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-black uppercase hover:bg-zinc-200 transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {selectedSection ? (
                        <div className="p-6">
                            <button
                                onClick={() => setSelectedSectionId(null)}
                                className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                Back to Sections
                            </button>

                            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                                <span className="w-2 h-6 bg-purple-500 rounded-full" />
                                {selectedSection.type.replace('_', ' ')} Settings
                            </h3>

                            <div className="space-y-6">
                                {/* Common UI components from ReleaseEditor should be abstracted, but for now I'll duplicate essential ones or use a simplified approach */}
                                {selectedSection.type === 'hero' && (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={selectedSection.data.title || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Subtitle</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={selectedSection.data.subtitle || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { subtitle: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Cover Image URL</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={selectedSection.data.coverImage || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { coverImage: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Layout</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['centered', 'split', 'full-screen'].map(v => (
                                                    <button
                                                        key={v}
                                                        onClick={() => updateSectionData(selectedSection.id, { variant: v })}
                                                        className={`py-2 rounded-lg text-[10px] font-black uppercase border ${selectedSection.data.variant === v ? 'bg-purple-600 border-purple-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                                                    >
                                                        {v.split('-')[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Links, Merch, Tracklist etc. can reuse sections of the ReleaseEditor code */}
                                {/* For brevity in this turn, I'll assume the user wants a similar experience and I'll keep the core logic identical */}
                                {['links'].includes(selectedSection.type) && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Links</label>
                                            </div>

                                            {/* Link List */}
                                            {(() => {
                                                // Migration/Normalization Logic on render
                                                const existingLinks = selectedSection.data.links || []

                                                // If no unified links but legacy data exists, we should show them (user will save unified data)
                                                // This is a visual migration helper
                                                const legacyPlatforms = ['spotify', 'appleMusic', 'soundCloud', 'youtube', 'instagram', 'twitter', 'tiktok', 'facebook']
                                                const displayLinks = existingLinks.length > 0 ? existingLinks : legacyPlatforms.map(p => {
                                                    if (selectedSection.data[p]) {
                                                        return {
                                                            id: p,
                                                            platform: p,
                                                            url: selectedSection.data[p],
                                                            behavior: ['spotify', 'appleMusic', 'soundCloud', 'youtube'].includes(p) ? 'embed' : 'redirect'
                                                        }
                                                    }
                                                    return null
                                                }).filter(Boolean)

                                                const updateLink = (index: number, updates: any) => {
                                                    const newLinks = [...displayLinks]
                                                    newLinks[index] = { ...newLinks[index], ...updates }
                                                    updateSectionData(selectedSection.id, { links: newLinks })
                                                }

                                                const removeLink = (index: number) => {
                                                    const newLinks = displayLinks.filter((_: any, i: number) => i !== index)
                                                    updateSectionData(selectedSection.id, { links: newLinks })
                                                }

                                                const moveLink = (index: number, direction: 'up' | 'down') => {
                                                    const newLinks = [...displayLinks]
                                                    if (direction === 'up' && index > 0) {
                                                        [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]]
                                                    } else if (direction === 'down' && index < newLinks.length - 1) {
                                                        [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]]
                                                    }
                                                    updateSectionData(selectedSection.id, { links: newLinks })
                                                }

                                                const streamingServices = ['spotify', 'appleMusic', 'soundCloud', 'youtube']
                                                const streamingLinks = displayLinks.filter((l: any) => streamingServices.includes(l.platform))
                                                const otherLinks = displayLinks.filter((l: any) => !streamingServices.includes(l.platform))

                                                const renderLinkItem = (link: any) => {
                                                    const originalIndex = displayLinks.findIndex((l: any) => l === link)
                                                    return (
                                                        <div key={`${link.platform}-${originalIndex}`} className="bg-zinc-800/50 border border-zinc-700 p-3 rounded-lg space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2 py-1 rounded">{link.platform}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button onClick={() => moveLink(originalIndex, 'up')} disabled={originalIndex === 0} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30">
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                                        </button>
                                                                        <button onClick={() => moveLink(originalIndex, 'down')} disabled={originalIndex === displayLinks.length - 1} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30">
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => removeLink(originalIndex)} className="text-zinc-500 hover:text-red-500 transition-colors">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>

                                                            <input
                                                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                                                                value={link.url}
                                                                onChange={(e) => updateLink(originalIndex, { url: e.target.value })}
                                                                placeholder="URL"
                                                            />

                                                            {streamingServices.includes(link.platform) && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] uppercase font-bold text-zinc-500">Action:</span>
                                                                    <select
                                                                        className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] uppercase font-bold text-zinc-300 outline-none"
                                                                        value={link.behavior || 'embed'}
                                                                        onChange={(e) => updateLink(originalIndex, { behavior: e.target.value })}
                                                                    >
                                                                        <option value="embed">Embed Player</option>
                                                                        <option value="embed-floating">Embed Player Floating</option>
                                                                        <option value="redirect">Redirect</option>
                                                                    </select>
                                                                </div>
                                                            )}
                                                            {link.platform === 'custom' && (
                                                                <input
                                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none mt-2"
                                                                    value={link.label || ''}
                                                                    onChange={(e) => updateLink(originalIndex, { label: e.target.value })}
                                                                    placeholder="Label"
                                                                />
                                                            )}
                                                        </div>
                                                    )
                                                }

                                                return (
                                                    <div className="space-y-6">
                                                        {streamingLinks.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-1">Streaming Services</h4>
                                                                {streamingLinks.map(renderLinkItem)}
                                                            </div>
                                                        )}
                                                        {otherLinks.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-1">Social & Web</h4>
                                                                {otherLinks.map(renderLinkItem)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })()}

                                            {/* Add Button */}
                                            <div className="relative group">
                                                <select
                                                    className="w-full bg-zinc-800 border-dashed border-2 border-zinc-700 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer appearance-none text-center"
                                                    value=""
                                                    onChange={(e) => {
                                                        const platform = e.target.value
                                                        if (!platform) return
                                                        const currentLinks = selectedSection.data.links || []
                                                        // Migrate legacy if first add
                                                        let newLinks = currentLinks
                                                        if (currentLinks.length === 0) {
                                                            const legacyPlatforms = ['spotify', 'appleMusic', 'soundCloud', 'youtube', 'instagram', 'twitter', 'tiktok', 'facebook']
                                                            const legacyLinks = legacyPlatforms.map(p => {
                                                                if (selectedSection.data[p]) {
                                                                    return {
                                                                        id: p,
                                                                        platform: p,
                                                                        url: selectedSection.data[p],
                                                                        behavior: ['spotify', 'appleMusic', 'soundCloud', 'youtube'].includes(p) ? 'embed' : 'redirect'
                                                                    }
                                                                }
                                                                return null
                                                            }).filter(Boolean)
                                                            newLinks = legacyLinks
                                                        }

                                                        updateSectionData(selectedSection.id, {
                                                            links: [
                                                                ...newLinks,
                                                                {
                                                                    id: `${platform}-${Date.now()}`,
                                                                    platform,
                                                                    url: '',
                                                                    behavior: ['spotify', 'appleMusic', 'soundCloud', 'youtube'].includes(platform) ? 'embed' : 'redirect'
                                                                }
                                                            ]
                                                        })
                                                        e.target.value = ""
                                                    }}
                                                >
                                                    <option value="">+ Add Link</option>
                                                    <option value="spotify">Spotify</option>
                                                    <option value="appleMusic">Apple Music</option>
                                                    <option value="soundCloud">SoundCloud</option>
                                                    <option value="youtube">YouTube</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="twitter">X (Twitter)</option>
                                                    <option value="tiktok">TikTok</option>
                                                    <option value="facebook">Facebook</option>
                                                    <option value="custom">Custom Link</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Display Options */}
                                        <div className="space-y-3 pt-3 border-t border-zinc-800">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Show Service Logos</label>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                    checked={selectedSection.data.showLogos !== false}
                                                    onChange={(e) => updateSectionData(selectedSection.id, { showLogos: e.target.checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Display as Button</label>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                    checked={selectedSection.data.useButton || false}
                                                    onChange={(e) => updateSectionData(selectedSection.id, { useButton: e.target.checked })}
                                                />
                                            </div>
                                            {selectedSection.data.useButton && (
                                                <div className="space-y-3 pl-4 border-l-2 border-purple-500/30">
                                                    <input
                                                        type="text"
                                                        placeholder="Button Label"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                                        value={selectedSection.data.buttonLabel || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { buttonLabel: e.target.value })}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[9px] font-bold uppercase text-zinc-500">Show Icon</label>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                            checked={selectedSection.data.showIcon !== false}
                                                            onChange={(e) => updateSectionData(selectedSection.id, { showIcon: e.target.checked })}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[9px] font-bold uppercase text-zinc-500">Show Description</label>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                            checked={selectedSection.data.showDescription !== false}
                                                            onChange={(e) => updateSectionData(selectedSection.id, { showDescription: e.target.checked })}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[9px] font-bold uppercase text-zinc-500">Show Title When Expanded</label>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                            checked={selectedSection.data.showTitleExpanded || false}
                                                            onChange={(e) => updateSectionData(selectedSection.id, { showTitleExpanded: e.target.checked })}
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Custom Description override"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                                        value={selectedSection.data.customDescription || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { customDescription: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedSection.type === 'email_capture' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">CTA Text</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={selectedSection.data.ctaText || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { ctaText: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-zinc-500">Show Name</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSection.data.showName !== false}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { showName: e.target.checked })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-zinc-500">Show Phone</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSection.data.showPhone || false}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { showPhone: e.target.checked })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-zinc-500">Name Required</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSection.data.nameRequired || false}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { nameRequired: e.target.checked })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-zinc-500">Phone Required</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSection.data.phoneRequired || false}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { phoneRequired: e.target.checked })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sequential Steps (Two-step flow)</label>
                                            <input
                                                type="checkbox"
                                                checked={selectedSection.data.progressive || false}
                                                onChange={(e) => updateSectionData(selectedSection.id, { progressive: e.target.checked })}
                                            />
                                        </div>
                                        {selectedSection.data.progressive && (
                                            <div className="space-y-3 pt-2">
                                                <div>
                                                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Email Submit Label</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Join the list"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs"
                                                        value={selectedSection.data.emailButtonText || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { emailButtonText: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Phone Submit Label</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Complete Profile"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs"
                                                        value={selectedSection.data.phoneButtonText || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { phoneButtonText: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 mt-4 border-t border-zinc-800 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Popup on Load</label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSection.data.popupOnLoad || false}
                                                    onChange={(e) => updateSectionData(selectedSection.id, { popupOnLoad: e.target.checked })}
                                                />
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">After Sign-Up Reward (Content Locker)</label>
                                                <select
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                    value={selectedSection.data.rewardType || 'none'}
                                                    onChange={(e) => updateSectionData(selectedSection.id, { rewardType: e.target.value })}
                                                >
                                                    <option value="none">None</option>
                                                    <option value="link">Redirect to Link</option>
                                                    <option value="file">File Download Link</option>
                                                </select>

                                                {selectedSection.data.rewardType && selectedSection.data.rewardType !== 'none' && (
                                                    <div className="space-y-3 p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl">
                                                        <div>
                                                            <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Reward URL</label>
                                                            <input
                                                                type="text"
                                                                placeholder="https://..."
                                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                                                                value={selectedSection.data.rewardUrl || ''}
                                                                onChange={(e) => updateSectionData(selectedSection.id, { rewardUrl: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Custom Success Message (Optional)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Here is your reward!"
                                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                                                                value={selectedSection.data.rewardMessage || ''}
                                                                onChange={(e) => updateSectionData(selectedSection.id, { rewardMessage: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {selectedSection.type === 'merch' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Display Variant</label>
                                            <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                                                {['grid', 'link-hub'].map(v => (
                                                    <button
                                                        key={v}
                                                        onClick={() => updateSectionData(selectedSection.id, { variant: v })}
                                                        className={`flex-1 py-1.5 text-[9px] font-bold rounded-md transition-all ${selectedSection.data.variant === v || (!selectedSection.data.variant && v === 'grid') ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                                                    >
                                                        {v === 'link-hub' ? 'Link Hub' : v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Section Title</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
                                                value={selectedSection.data.title || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Store URL</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
                                                placeholder="https://..."
                                                value={selectedSection.data.storeUrl || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { storeUrl: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Display as Button</label>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                    checked={selectedSection.data.useButton || false}
                                                    onChange={(e) => updateSectionData(selectedSection.id, { useButton: e.target.checked })}
                                                />
                                            </div>
                                            {selectedSection.data.useButton && (
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Button Label (e.g. Merch)"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                                        value={selectedSection.data.buttonLabel || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { buttonLabel: e.target.value })}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Show Icon</label>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                            checked={selectedSection.data.showIcon !== false}
                                                            onChange={(e) => updateSectionData(selectedSection.id, { showIcon: e.target.checked })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Items</label>
                                            <button
                                                onClick={() => {
                                                    const newItems = [...(selectedSection.data.items || []), { id: Date.now().toString(), name: 'T-Shirt', price: '$25', imageUrl: '', buyUrl: '' }]
                                                    updateSectionData(selectedSection.id, { items: newItems })
                                                }}
                                                className="text-[10px] font-black uppercase text-purple-400 hover:text-purple-300"
                                            >
                                                + Add Item
                                            </button>
                                        </div>
                                        {(selectedSection.data.items || []).map((item: any, i: number) => (
                                            <div key={item.id} className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-xl space-y-3 relative group">
                                                <button
                                                    onClick={() => {
                                                        const ni = selectedSection.data.items.filter((_: any, idx: number) => idx !== i)
                                                        updateSectionData(selectedSection.id, { items: ni })
                                                    }}
                                                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 p-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                <input
                                                    placeholder="Product Name"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const ni = [...selectedSection.data.items]; ni[i].name = e.target.value
                                                        updateSectionData(selectedSection.id, { items: ni })
                                                    }}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        placeholder="Price"
                                                        className="bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                        value={item.price}
                                                        onChange={(e) => {
                                                            const ni = [...selectedSection.data.items]; ni[i].price = e.target.value
                                                            updateSectionData(selectedSection.id, { items: ni })
                                                        }}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.soldOut}
                                                            onChange={(e) => {
                                                                const ni = [...selectedSection.data.items]; ni[i].soldOut = e.target.checked
                                                                updateSectionData(selectedSection.id, { items: ni })
                                                            }}
                                                        />
                                                        <span className="text-[10px] font-bold uppercase text-zinc-500">Sold Out</span>
                                                    </div>
                                                </div>
                                                <input
                                                    placeholder="Image URL"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={item.imageUrl}
                                                    onChange={(e) => {
                                                        const ni = [...selectedSection.data.items]; ni[i].imageUrl = e.target.value
                                                        updateSectionData(selectedSection.id, { items: ni })
                                                    }}
                                                />
                                                <input
                                                    placeholder="Buy URL"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={item.buyUrl}
                                                    onChange={(e) => {
                                                        const ni = [...selectedSection.data.items]; ni[i].buyUrl = e.target.value
                                                        updateSectionData(selectedSection.id, { items: ni })
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedSection.type === 'tour_dates' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Section Title</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
                                                value={selectedSection.data.title || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dates</label>
                                            <button
                                                onClick={() => {
                                                    const newDates = [...(selectedSection.data.dates || []), { date: new Date().toISOString().split('T')[0], venue: 'Madison Square Garden', city: 'New York', ticketUrl: '' }]
                                                    updateSectionData(selectedSection.id, { dates: newDates })
                                                }}
                                                className="text-[10px] font-black uppercase text-purple-400 hover:text-purple-300"
                                            >
                                                + Add Date
                                            </button>
                                        </div>
                                        {(selectedSection.data.dates || []).map((date: any, i: number) => (
                                            <div key={i} className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-xl space-y-3 relative group">
                                                <button
                                                    onClick={() => {
                                                        const nd = selectedSection.data.dates.filter((_: any, idx: number) => idx !== i)
                                                        updateSectionData(selectedSection.id, { dates: nd })
                                                    }}
                                                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 p-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                <input
                                                    type="date"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={date.date}
                                                    onChange={(e) => {
                                                        const nd = [...selectedSection.data.dates]; nd[i].date = e.target.value
                                                        updateSectionData(selectedSection.id, { dates: nd })
                                                    }}
                                                />
                                                <input
                                                    placeholder="Venue"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={date.venue}
                                                    onChange={(e) => {
                                                        const nd = [...selectedSection.data.dates]; nd[i].venue = e.target.value
                                                        updateSectionData(selectedSection.id, { dates: nd })
                                                    }}
                                                />
                                                <input
                                                    placeholder="City"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={date.city}
                                                    onChange={(e) => {
                                                        const nd = [...selectedSection.data.dates]; nd[i].city = e.target.value
                                                        updateSectionData(selectedSection.id, { dates: nd })
                                                    }}
                                                />
                                                <input
                                                    placeholder="Ticket URL"
                                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-2 py-1 text-xs"
                                                    value={date.ticketUrl}
                                                    onChange={(e) => {
                                                        const nd = [...selectedSection.data.dates]; nd[i].ticketUrl = e.target.value
                                                        updateSectionData(selectedSection.id, { dates: nd })
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedSection.type === 'video' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Video URL (YouTube/Vimeo)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                placeholder="https://..."
                                                value={selectedSection.data.videoUrl || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { videoUrl: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={selectedSection.data.title || ''}
                                                onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Display Variant</label>
                                            <select
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                value={selectedSection.data.variant || 'contained'}
                                                onChange={(e) => updateSectionData(selectedSection.id, { variant: e.target.value })}
                                            >
                                                <option value="contained">Contained</option>
                                                <option value="full-width">Full Width</option>
                                                <option value="background">Background Loop</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Autoplay</label>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                checked={selectedSection.data.autoplay || false}
                                                onChange={(e) => updateSectionData(selectedSection.id, { autoplay: e.target.checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Start Muted</label>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                checked={selectedSection.data.muted || false}
                                                onChange={(e) => updateSectionData(selectedSection.id, { muted: e.target.checked })}
                                            />
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Active Sections</h3>
                                <div className="space-y-3">
                                    {sections.map((section, index) => (
                                        <div
                                            key={section.id}
                                            className="group bg-zinc-800/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-purple-500/50 transition-all cursor-pointer"
                                            onClick={() => setSelectedSectionId(section.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                                <span className="font-black text-sm uppercase tracking-tight">{section.type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        className="bg-zinc-900 border border-zinc-700 rounded-md text-[10px] uppercase font-bold px-2 py-1 text-zinc-400 hover:text-white focus:outline-none focus:border-purple-500"
                                                        value={section.data.spacing || 'compact'}
                                                        onChange={(e) => updateSectionData(section.id, { spacing: e.target.value })}
                                                    >
                                                        <option value="compact">Tight</option>
                                                        <option value="default">Normal</option>
                                                        <option value="wide">Wide</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => moveSection(index, 'up')} className="p-1 px-2 hover:bg-zinc-700 rounded-lg text-zinc-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                                                    <button onClick={() => moveSection(index, 'down')} className="p-1 px-2 hover:bg-zinc-700 rounded-lg text-zinc-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
                                                    <button onClick={() => removeSection(index)} className="p-1 px-2 hover:bg-red-900/40 rounded-lg text-red-500 ml-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Add Content</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['hero', 'links', 'tracklist', 'merch', 'tour_dates', 'video', 'email_capture'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => addSection(type as any)}
                                            className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:border-zinc-600 transition-all active:scale-[0.95]"
                                        >
                                            {type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Tracking Pixels</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Facebook Pixel ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            value={facebookPixelId}
                                            onChange={(e) => setFacebookPixelId(e.target.value)}
                                            placeholder="e.g. 1234567890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">TikTok Pixel ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            value={tiktokPixelId}
                                            onChange={(e) => setTiktokPixelId(e.target.value)}
                                            placeholder="e.g. CEK123..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Google Analytics ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            value={googleAnalyticsId}
                                            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                            placeholder="e.g. G-XXXXXXX"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Artist Page</p>
                    <p className="text-sm font-bold truncate">{initialData.name}</p>
                    {message && <p className="mt-2 text-xs text-purple-400 animate-pulse">{message}</p>}
                </div>
            </div>

            {/* Preview Panel */}
            <div className={`flex-1 overflow-y-auto bg-black relative custom-scrollbar ${showMobilePreview ? 'block' : 'hidden md:block'}`}>
                <div className="sticky top-0 left-0 right-0 z-50 p-4 flex justify-between pointer-events-none">
                    <button
                        onClick={() => setShowMobilePreview(false)}
                        className="md:hidden pointer-events-auto bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors shadow-2xl"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        Editor
                    </button>
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl pointer-events-auto ml-auto">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Preview</span>
                    </div>
                </div>
                <div className="min-h-full">
                    <SectionRenderer
                        sections={sections}
                        context={{
                            organizationId: organizationId,
                            releaseId: artistId // For artist pages, we use artistId as the releaseId context
                        }}
                    />
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
            `}</style>
        </div >
    )
}
