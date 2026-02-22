/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react"
import SectionRenderer from "../sections/SectionRenderer"

interface Section {
    id: string
    type: "hero" | "links" | "tracklist" | "merch" | "tour_dates" | "video" | "email_capture" | "bio" | "contact"
    data: any
}

interface ReleaseEditorProps {
    releaseId: string
    organizationId: string
    initialData: {
        title: string
        subtitle?: string
        layout: any
    }
    artistLayout?: any[]
}

export default function ReleaseEditor({ releaseId, organizationId, initialData, artistLayout }: ReleaseEditorProps) {
    const [sections, setSections] = useState<Section[]>(() => {
        const layout = initialData.layout
        if (Array.isArray(layout) && layout.length > 0) return layout

        return [
            { id: "hero-1", type: "hero", data: { title: initialData.title || 'New Release', subtitle: initialData.subtitle || '', variant: 'centered', releaseDate: '' } },
            { id: "links-1", type: "streaming_links", data: { links: [], showLogos: true, useButton: false } }
        ] as Section[]
    })
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState("")

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [importUrl, setImportUrl] = useState("")
    const [isImporting, setIsImporting] = useState(false)

    const selectedSection = sections.find(s => s.id === selectedSectionId)

    const handleSave = async () => {
        setIsSaving(true)
        setMessage("")
        try {
            const heroSection = sections.find(s => s.type === 'hero')
            const payload: any = { layout: sections }

            if (heroSection) {
                payload.title = heroSection.data.title
                payload.subtitle = heroSection.data.subtitle
                payload.coverImage = heroSection.data.coverImage
                payload.releaseDate = heroSection.data.releaseDate
            }

            const res = await fetch(`/api/releases/${releaseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setMessage("Changes saved successfully!")
            } else {
                setMessage("Failed to save changes.")
            }
        } catch (error) {
            setMessage("An error occurred while saving.")
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
            case "hero": defaultData = { title: "New Hero", variant: 'centered', releaseDate: '' }; break
            case "links": defaultData = { links: [], showLogos: true, useButton: false }; break
            case "tracklist": defaultData = { tracks: [], embedMode: 'floating' }; break
            case "merch": defaultData = { title: "Official Merch", items: [], variant: 'grid', storeUrl: '' }; break
            case "tour_dates": defaultData = { title: "Upcoming Shows", dates: [] }; break
            case "email_capture": defaultData = { title: "Join the mailing list", fields: { name: true, email: true, phone: false }, ctaText: "Sign Up" }; break
            case "video": defaultData = { title: "Featured Video", videoUrl: "", variant: 'contained' }; break
            case "bio": defaultData = { title: "Biography", content: "", variant: 'centered' }; break
            case "contact": defaultData = { title: "Contact", email: "", label: "Inquiries" }; break
            default: defaultData = {}
        }

        setSections([...sections, { id, type, data: defaultData }])
        setSelectedSectionId(id)
    }

    const handleImport = async () => {
        if (!selectedSectionId || !importUrl) return
        setIsImporting(true)

        try {
            let endpoint = ""
            if (importUrl.includes("music.apple.com")) endpoint = "/api/import/apple-music"
            else if (importUrl.includes("spotify.com")) endpoint = "/api/import/spotify"
            else throw new Error("Invalid URL. Please use Apple Music or Spotify.")

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: importUrl })
            })

            if (!res.ok) throw new Error("Import failed")

            const data: {
                tracks?: Array<{
                    title: string;
                    duration?: string;
                    spotifyTrackId?: string;
                    appleMusicTrackId?: string;
                    previewUrl?: string;
                }>
            } = await res.json()

            const section = sections.find(s => s.id === selectedSectionId)
            if (!section) return

            const currentTracks = section.data.tracks || []
            let newTracks = [...currentTracks]

            if (newTracks.length === 0 && data.tracks) {
                // If empty, just fill
                newTracks = data.tracks.map((t) => ({
                    title: t.title,
                    duration: t.duration,
                    spotifyTrackId: t.spotifyTrackId,
                    appleMusicTrackId: t.appleMusicTrackId,
                    previewUrl: t.previewUrl || ''
                }))
            } else if (data.tracks) {
                // Merge logic
                data.tracks.forEach((importedTrack, index) => {
                    // Try to match by Title
                    const matchIndex = newTracks.findIndex(vt => vt.title && importedTrack.title && vt.title.toLowerCase() === importedTrack.title.toLowerCase())

                    if (matchIndex >= 0) {
                        if (importedTrack.spotifyTrackId) newTracks[matchIndex].spotifyTrackId = importedTrack.spotifyTrackId
                        if (importedTrack.appleMusicTrackId) newTracks[matchIndex].appleMusicTrackId = importedTrack.appleMusicTrackId
                    } else if (index < newTracks.length) {
                        // Match by index fallback
                        if (importedTrack.spotifyTrackId) newTracks[index].spotifyTrackId = importedTrack.spotifyTrackId
                        if (importedTrack.appleMusicTrackId) newTracks[index].appleMusicTrackId = importedTrack.appleMusicTrackId
                    }
                })
            }

            updateSectionData(selectedSectionId, { tracks: newTracks })
            setImportModalOpen(false)
            setImportUrl("")
            setMessage("Tracks imported successfully!")
        } catch (e) {
            setMessage("Error: " + (e instanceof Error ? e.message : "Unknown error"))
        } finally {
            setIsImporting(false)
        }
    }

    const UniversalSettings = ({ section }: { section: Section }) => (
        <div className="space-y-4 pt-6 mt-6 border-t border-zinc-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Universal Settings</h4>

            {/* Inheritance Toggle - Exclude Hero and Tracklist */}
            {!['hero', 'tracklist'].includes(section.type) && (
                <div className="flex items-center justify-between py-2 border-b border-zinc-800 mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Inherit from Artist</label>
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                        checked={section.data.inheritFromArtist || false}
                        onChange={(e) => updateSectionData(section.id, { inheritFromArtist: e.target.checked })}
                    />
                </div>
            )}

            <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Spacing</label>
                <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    {['compact', 'default', 'wide'].map(s => (
                        <button
                            key={s}
                            onClick={() => updateSectionData(section.id, { spacing: s })}
                            className={`flex-1 py-1.5 text-[9px] font-bold rounded-md transition-all ${(section.data.spacing || 'compact') === s ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                        >
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Display as Button</label>
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                    checked={section.data.useButton || false}
                    onChange={(e) => updateSectionData(section.id, { useButton: e.target.checked })}
                />
            </div>

            {section.data.useButton && (
                <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Button Label</label>
                        <input
                            type="text"
                            placeholder="e.g. Bio"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            value={section.data.buttonLabel || ''}
                            onChange={(e) => updateSectionData(section.id, { buttonLabel: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Show Icon</label>
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                            checked={section.data.showIcon !== false}
                            onChange={(e) => updateSectionData(section.id, { showIcon: e.target.checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Show Description</label>
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                            checked={section.data.showDescription !== false}
                            onChange={(e) => updateSectionData(section.id, { showDescription: e.target.checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Show Title Expanded</label>
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                            checked={section.data.showTitleExpanded || false}
                            onChange={(e) => updateSectionData(section.id, { showTitleExpanded: e.target.checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Description</label>
                        <input
                            type="text"
                            placeholder="Override text"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            value={section.data.customDescription || ''}
                            onChange={(e) => updateSectionData(section.id, { customDescription: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans">
            <div className="w-full md:w-96 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">
                            DropSite Editor
                        </h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-black uppercase hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {selectedSectionId ? (
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
                                {selectedSection?.type.replace('_', ' ')} Settings
                            </h3>
                            <div className="space-y-6">
                                {selectedSection?.data.inheritFromArtist && !['hero', 'tracklist'].includes(selectedSection.type) ? (
                                    <div className="p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-center space-y-2">
                                        <p className="text-sm font-bold text-white">Inheriting from Artist Profile</p>
                                        <p className="text-xs text-zinc-500">
                                            This section is synced with your artist profile settings.<br />
                                            Disable inheritance below to customize it for this release.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {selectedSection?.type === 'hero' && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Title</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                        value={selectedSection.data.title || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Subtitle</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                        value={selectedSection.data.subtitle || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { subtitle: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Cover Image URL</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                        placeholder="https://..."
                                                        value={selectedSection.data.coverImage || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { coverImage: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Layout</label>
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
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Release Date</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-xs"
                                                        value={selectedSection.data.releaseDate || ''}
                                                        onChange={(e) => updateSectionData(selectedSection.id, { releaseDate: e.target.value })}
                                                    />
                                                    <p className="text-[9px] text-zinc-500 mt-1 italic">If in the future, a countdown timer will appear.</p>
                                                </div>
                                            </div>
                                        )}
                                        {['links', 'streaming_links', 'social_links', 'merch', 'tour_dates', 'video', 'email_capture', 'bio', 'contact'].includes(selectedSection?.type || '') && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Section Inheritance</span>
                                                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">Sync with Artist Page</span>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                        checked={selectedSection?.data.inheritFromArtist || false}
                                                        onChange={(e) => updateSectionData(selectedSection!.id, { inheritFromArtist: e.target.checked })}
                                                    />
                                                </div>

                                                {!selectedSection?.data.inheritFromArtist && (
                                                    <>
                                                        {['links', 'streaming_links', 'social_links'].includes(selectedSection?.type || '') && (
                                                            <div className="space-y-6">
                                                                <div className="space-y-3">
                                                                    {(() => {
                                                                        const displayLinks = selectedSection?.data.links || []

                                                                        const updateLink = (index: number, updates: any) => {
                                                                            const newLinks = [...displayLinks]
                                                                            newLinks[index] = { ...newLinks[index], ...updates }
                                                                            updateSectionData(selectedSection!.id, { links: newLinks })
                                                                        }

                                                                        const removeLink = (index: number) => {
                                                                            const newLinks = displayLinks.filter((_: any, i: number) => i !== index)
                                                                            updateSectionData(selectedSection!.id, { links: newLinks })
                                                                        }

                                                                        const moveLink = (index: number, direction: 'up' | 'down') => {
                                                                            const newLinks = [...displayLinks]
                                                                            if (direction === 'up' && index > 0) {
                                                                                [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]]
                                                                            } else if (direction === 'down' && index < newLinks.length - 1) {
                                                                                [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]]
                                                                            }
                                                                            updateSectionData(selectedSection!.id, { links: newLinks })
                                                                        }

                                                                        const streamingServices = ['spotify', 'appleMusic', 'soundCloud', 'youtube']

                                                                        return (
                                                                            <div className="space-y-3">
                                                                                {displayLinks.map((link: { id: number; platform: string; url: string; behavior?: string }, originalIndex: number) => (
                                                                                    <div key={originalIndex} className="bg-zinc-800/50 border border-zinc-800/50 p-3 rounded-xl space-y-3">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">{link.platform}</span>
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <button onClick={() => moveLink(originalIndex, 'up')} disabled={originalIndex === 0} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30">
                                                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                                                                    </button>
                                                                                                    <button onClick={() => moveLink(originalIndex, 'down')} disabled={originalIndex === displayLinks.length - 1} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30">
                                                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                            <button onClick={() => removeLink(originalIndex)} className="text-zinc-600 hover:text-red-500">
                                                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                                            </button>
                                                                                        </div>
                                                                                        <input
                                                                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                                                                                            value={link.url || ''}
                                                                                            onChange={(e) => updateLink(originalIndex, { url: e.target.value })}
                                                                                            placeholder="URL"
                                                                                        />
                                                                                        {streamingServices.includes(link.platform) && (
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[9px] uppercase font-bold text-zinc-500">Action:</span>
                                                                                                <select
                                                                                                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[9px] uppercase font-bold text-zinc-300 outline-none"
                                                                                                    value={link.behavior || 'embed'}
                                                                                                    onChange={(e) => updateLink(originalIndex, { behavior: e.target.value })}
                                                                                                >
                                                                                                    <option value="embed">Embed Player</option>
                                                                                                    <option value="embed-floating">Embed Floating</option>
                                                                                                    <option value="redirect">Redirect</option>
                                                                                                </select>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )
                                                                    })()}

                                                                    <div className="relative group">
                                                                        <select
                                                                            className="w-full bg-zinc-800 border-dashed border border-zinc-700 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer appearance-none text-center"
                                                                            value=""
                                                                            onChange={(e) => {
                                                                                const platform = e.target.value
                                                                                if (!platform) return
                                                                                const currentLinks = selectedSection?.data.links || []
                                                                                updateSectionData(selectedSection!.id, {
                                                                                    links: [...currentLinks, { id: Date.now(), platform, url: '', behavior: ['spotify', 'appleMusic', 'soundCloud', 'youtube'].includes(platform) ? 'embed' : 'redirect' }]
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
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {['links', 'streaming_links', 'social_links'].includes(selectedSection?.type || '') && (
                                                    <div className="space-y-3 pt-6 border-t border-zinc-800">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Show Service Logos</label>
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                                                checked={selectedSection?.data.showLogos !== false}
                                                                onChange={(e) => updateSectionData(selectedSection!.id, { showLogos: e.target.checked })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {selectedSection?.type === 'tracklist' && (
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tracks</label>
                                                        <button
                                                            onClick={() => {
                                                                const tracks = [...(selectedSection.data.tracks || []), { title: 'New Track', duration: '3:00' }]
                                                                updateSectionData(selectedSection.id, { tracks })
                                                            }}
                                                            className="text-[10px] font-black uppercase text-purple-400 hover:text-purple-300"
                                                        >
                                                            + Add Track
                                                        </button>
                                                    </div>
                                                    {(selectedSection.data.tracks || []).map((track: { title: string; duration: string }, i: number) => (
                                                        <div key={i} className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-800 space-y-2 relative group">
                                                            <div className="flex items-center gap-2">
                                                                <input className="flex-1 bg-transparent border-b border-zinc-700/50 text-sm focus:outline-none focus:border-purple-500" value={track.title} onChange={(e) => { const nt = [...selectedSection.data.tracks]; nt[i].title = e.target.value; updateSectionData(selectedSection.id, { tracks: nt }) }} />
                                                                <input className="w-12 bg-transparent border-b border-zinc-700/50 text-xs text-zinc-500 text-right focus:outline-none" value={track.duration} onChange={(e) => { const nt = [...selectedSection.data.tracks]; nt[i].duration = e.target.value; updateSectionData(selectedSection.id, { tracks: nt }) }} />
                                                                <button onClick={() => { const nt = selectedSection.data.tracks.filter((_: { title: string; duration: string }, idx: number) => idx !== i); updateSectionData(selectedSection.id, { tracks: nt }) }} className="text-zinc-600 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button onClick={() => setImportModalOpen(true)} className="w-full py-2 border border-dashed border-zinc-700 rounded-lg text-[10px] font-black uppercase text-purple-500 hover:text-purple-400 hover:border-purple-500/50">Import / Sync</button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 pt-4 border-t border-zinc-800">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Player Mode</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(['floating', 'inline'] as const).map(mode => (
                                                            <button
                                                                key={mode}
                                                                onClick={() => updateSectionData(selectedSection.id, { embedMode: mode })}
                                                                className={`py-2.5 rounded-lg text-[10px] font-black uppercase border transition-all ${(selectedSection.data.embedMode || 'floating') === mode ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                                                            >
                                                                {mode}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="text-[9px] text-zinc-500 italic">
                                                        {(selectedSection.data.embedMode || 'floating') === 'floating'
                                                            ? 'Opens player in a floating bar at the bottom of the page.'
                                                            : 'Embeds the player inline directly below the track.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}


                                        {importModalOpen && (
                                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                                                <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
                                                    <h3 className="text-lg font-bold mb-4">Import Metadata</h3>
                                                    <p className="text-xs text-zinc-400 mb-4">
                                                        Paste a Spotify or Apple Music album URL. We&apos;ll fetch track IDs and sync them with your tracklist.
                                                    </p>
                                                    <input
                                                        autoFocus
                                                        type="url"
                                                        placeholder="https://open.spotify.com/album/..."
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                                                        value={importUrl}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportUrl(e.target.value)}
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setImportModalOpen(false)}
                                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleImport}
                                                            disabled={isImporting || !importUrl}
                                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
                                                        >
                                                            {isImporting ? 'Importing...' : 'Import'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedSection?.type === 'merch' && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Title</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm" value={selectedSection.data.title || ''} onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Display Mode</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {['grid', 'carousel', 'link-hub'].map(v => (
                                                            <button key={v} onClick={() => updateSectionData(selectedSection.id, { variant: v })} className={`py-2 rounded-lg text-[9px] font-black uppercase border ${selectedSection.data.variant === v ? 'bg-purple-600 border-purple-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                                                {v.replace('-', ' ')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {(selectedSection.data.items || []).map((item: any, i: number) => (
                                                        <div key={i} className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-xl space-y-3 relative group focus-within:border-purple-500/50 transition-all">
                                                            <button onClick={() => { const items = selectedSection.data.items.filter((_: any, idx: number) => idx !== i); updateSectionData(selectedSection.id, { items }) }} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                            <input placeholder="Name" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none" value={item.name} onChange={(e) => { const items = [...selectedSection.data.items]; items[i].name = e.target.value; updateSectionData(selectedSection.id, { items }) }} />
                                                            <div className="flex gap-2">
                                                                <input placeholder="Price" className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none" value={item.price} onChange={(e) => { const items = [...selectedSection.data.items]; items[i].price = e.target.value; updateSectionData(selectedSection.id, { items }) }} />
                                                                <div className="flex items-center gap-2 px-2 bg-zinc-900 border border-zinc-800 rounded">
                                                                    <span className="text-[9px] font-black uppercase text-zinc-500">Sold Out</span>
                                                                    <input type="checkbox" checked={item.soldOut || false} onChange={(e) => { const items = [...selectedSection.data.items]; items[i].soldOut = e.target.checked; updateSectionData(selectedSection.id, { items }) }} />
                                                                </div>
                                                            </div>
                                                            <input placeholder="Image URL" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none" value={item.imageUrl} onChange={(e) => { const items = [...selectedSection.data.items]; items[i].imageUrl = e.target.value; updateSectionData(selectedSection.id, { items }) }} />
                                                            <input placeholder="Buy URL" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none" value={item.buyUrl} onChange={(e) => { const items = [...selectedSection.data.items]; items[i].buyUrl = e.target.value; updateSectionData(selectedSection.id, { items }) }} />
                                                        </div>
                                                    ))}
                                                    <button onClick={() => updateSectionData(selectedSection.id, { items: [...(selectedSection.data.items || []), { name: '', price: '', imageUrl: '', buyUrl: '', soldOut: false }] })} className="w-full py-2 border border-dashed border-zinc-700 rounded-lg text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-300">+ Add Item</button>
                                                </div>
                                            </div>
                                        )}

                                        {selectedSection?.type === 'tour_dates' && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Title</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm" value={selectedSection.data.title || ''} onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })} />
                                                </div>
                                                <div className="space-y-4">
                                                    {(selectedSection.data.dates || []).map((date: any, i: number) => (
                                                        <div key={i} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-xl space-y-2 relative group">
                                                            <button onClick={() => { const dates = selectedSection.data.dates.filter((_: any, idx: number) => idx !== i); updateSectionData(selectedSection.id, { dates }) }} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                            <input placeholder="Venue" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none" value={date.venue} onChange={(e) => { const dates = [...selectedSection.data.dates]; dates[i].venue = e.target.value; updateSectionData(selectedSection.id, { dates }) }} />
                                                            <input placeholder="Location" className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400 focus:outline-none" value={date.location} onChange={(e) => { const dates = [...selectedSection.data.dates]; dates[i].location = e.target.value; updateSectionData(selectedSection.id, { dates }) }} />
                                                            <div className="flex gap-2">
                                                                <input type="text" placeholder="Date (e.g. Oct 24)" className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none" value={date.date} onChange={(e) => { const dates = [...selectedSection.data.dates]; dates[i].date = e.target.value; updateSectionData(selectedSection.id, { dates }) }} />
                                                                <input type="text" placeholder="URL" className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none" value={date.url} onChange={(e) => { const dates = [...selectedSection.data.dates]; dates[i].url = e.target.value; updateSectionData(selectedSection.id, { dates }) }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => updateSectionData(selectedSection.id, { dates: [...(selectedSection.data.dates || []), { venue: '', location: '', date: '', url: '' }] })} className="w-full py-2 border border-dashed border-zinc-700 rounded-lg text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-300 transition-colors">+ Add Date</button>
                                                </div>
                                            </div>
                                        )}

                                        {selectedSection?.type === 'video' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">YouTube/vimeo URL</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" value={selectedSection.data.videoUrl || ''} onChange={(e) => updateSectionData(selectedSection.id, { videoUrl: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Display Style</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['contained', 'full-width'].map(v => (
                                                            <button key={v} onClick={() => updateSectionData(selectedSection.id, { variant: v })} className={`py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${selectedSection.data.variant === v ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>{v}</button>
                                                        ))}
                                                    </div>
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

                                        {selectedSection?.type === 'email_capture' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Headline</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" value={selectedSection.data.title || ''} onChange={(e) => updateSectionData(selectedSection.id, { title: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Button Text</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" value={selectedSection.data.ctaText || ''} onChange={(e) => updateSectionData(selectedSection.id, { ctaText: e.target.value })} />
                                                </div>
                                            </div>
                                        )}

                                        {selectedSection?.type === 'bio' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Biography</label>
                                                    <textarea rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 custom-scrollbar" value={selectedSection.data.content || ''} onChange={(e) => updateSectionData(selectedSection.id, { content: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Layout</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['centered', 'split'].map(v => (
                                                            <button key={v} onClick={() => updateSectionData(selectedSection.id, { variant: v })} className={`py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${selectedSection.data.variant === v ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>{v}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Image URL</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" value={selectedSection.data.imageUrl || ''} onChange={(e) => updateSectionData(selectedSection.id, { imageUrl: e.target.value })} />
                                                </div>
                                            </div>
                                        )}

                                        {selectedSection?.type === 'contact' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</label>
                                                    <input type="email" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" value={selectedSection.data.email || ''} onChange={(e) => updateSectionData(selectedSection.id, { email: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Label</label>
                                                    <input type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="e.g. Inquiries, Mgmt" value={selectedSection.data.label || ''} onChange={(e) => updateSectionData(selectedSection.id, { label: e.target.value })} />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <UniversalSettings section={selectedSection!} />
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
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => moveSection(index, 'up')} className="p-1 px-2 hover:bg-zinc-700 rounded-lg text-zinc-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                                                <button onClick={() => moveSection(index, 'down')} className="p-1 px-2 hover:bg-zinc-700 rounded-lg text-zinc-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
                                                <button onClick={() => removeSection(index)} className="p-1 px-2 hover:bg-red-900/40 rounded-lg text-red-500 ml-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Add Content</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { type: 'hero', label: 'Hero' },
                                        { type: 'streaming_links', label: 'Streaming' },
                                        { type: 'social_links', label: 'Social' },
                                        { type: 'tracklist', label: 'Tracklist' },
                                        { type: 'tour_dates', label: 'Tour Dates' },
                                        { type: 'merch', label: 'Merch' },
                                        { type: 'video', label: 'Video' },
                                        { type: 'email_capture', label: 'Email Capture' },
                                        { type: 'bio', label: 'Biography' },
                                        { type: 'contact', label: 'Contact' }
                                    ].map(btn => (
                                        <button key={btn.type} onClick={() => addSection(btn.type as any)} className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:border-zinc-600 transition-all active:scale-[0.95]">{btn.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                    }
                </div >

                <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Workspace</p>
                            <p className="text-sm font-bold truncate">{initialData.title}</p>
                        </div>
                        {message && <div className="text-[10px] font-black uppercase text-purple-400 animate-pulse">{message}</div>}
                    </div>
                </div>
            </div >

            <div className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
                <div className="sticky top-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Preview</span>
                    </div>
                </div>
                <div className="min-h-full">
                    <SectionRenderer sections={sections} context={{ organizationId, releaseId, artistLayout: artistLayout || [] }} />
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
            `}</style>
        </div >
    )
}
