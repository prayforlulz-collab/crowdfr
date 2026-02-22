
"use client"

import { useState, useMemo } from "react"
import {
    Trash2, Search, Music, Disc, ExternalLink, Eye, EyeOff,
    CheckSquare, Square, MessageSquare, X, Send, History, Filter
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ContentItem {
    id: string
    name?: string
    title?: string
    slug: string
    imageUrl?: string | null
    coverImage?: string | null
    createdAt: Date
    isSuspended: boolean
    isDeleted?: boolean
    organization?: { name: string }
    artist?: { name: string }
}

type FilterMode = "all" | "hidden" | "newest"

export default function ContentList({ artists, releases }: { artists: any[]; releases: any[] }) {
    const [view, setView] = useState<"ARTISTS" | "RELEASES">("ARTISTS")
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<FilterMode>("all")
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [actionType, setActionType] = useState<string | null>(null)
    const [localArtists, setLocalArtists] = useState(artists)
    const [localReleases, setLocalReleases] = useState(releases)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkLoading, setBulkLoading] = useState(false)

    // Notes drawer
    const [notesOpen, setNotesOpen] = useState(false)
    const [notesEntity, setNotesEntity] = useState<{ id: string; type: string; name: string } | null>(null)
    const [notes, setNotes] = useState<any[]>([])
    const [notesLoading, setNotesLoading] = useState(false)
    const [newNote, setNewNote] = useState("")
    const [noteSubmitting, setNoteSubmitting] = useState(false)

    // History drawer
    const [historyOpen, setHistoryOpen] = useState(false)
    const [historyEntries, setHistoryEntries] = useState<any[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const router = useRouter()

    const data = view === "ARTISTS" ? localArtists : localReleases

    const filteredData = useMemo(() => {
        let items = data.filter((item: any) =>
            (item.name || item.title)?.toLowerCase().includes(search.toLowerCase()) ||
            item.slug?.toLowerCase().includes(search.toLowerCase())
        )

        if (filter === "hidden") {
            items = items.filter((item: any) => item.isSuspended)
        } else if (filter === "newest") {
            items = [...items].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }

        // Exclude soft-deleted
        items = items.filter((item: any) => !item.isDeleted)

        return items
    }, [data, search, filter])

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    const selectAll = () => {
        if (selectedIds.size === filteredData.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredData.map((d: any) => d.id)))
        }
    }

    const handleBulkAction = async (action: "hide" | "unhide") => {
        if (selectedIds.size === 0) return
        if (!confirm(`${action === "hide" ? "Hide" : "Unhide"} ${selectedIds.size} items?`)) return

        setBulkLoading(true)
        try {
            const res = await fetch("/api/admin/content/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: Array.from(selectedIds),
                    entityType: view.toLowerCase(),
                    action,
                }),
            })
            if (res.ok) {
                const newSuspended = action === "hide"
                const updateFn = (items: any[]) =>
                    items.map((item: any) => selectedIds.has(item.id) ? { ...item, isSuspended: newSuspended } : item)

                if (view === "ARTISTS") setLocalArtists(updateFn)
                else setLocalReleases(updateFn)

                setSelectedIds(new Set())
                router.refresh()
            } else {
                alert("Bulk action failed")
            }
        } catch (error) {
            alert("Error performing bulk action")
        } finally {
            setBulkLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Soft-delete "${name}"? It will be hidden but data preserved.`)) return

        setLoadingId(id)
        setActionType("delete")
        try {
            const endpoint = view === "ARTISTS" ? "artists" : "releases"
            const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: "DELETE" })
            if (!res.ok) {
                alert("Failed to delete")
                return
            }
            if (view === "ARTISTS") setLocalArtists((prev: any[]) => prev.map((a: any) => a.id === id ? { ...a, isDeleted: true } : a))
            else setLocalReleases((prev: any[]) => prev.map((r: any) => r.id === id ? { ...r, isDeleted: true } : r))
            router.refresh()
        } catch (error) {
            alert("An error occurred")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleSuspend = async (id: string, currentStatus: boolean, name: string) => {
        const action = currentStatus ? "show" : "hide"
        if (!confirm(`${action} "${name}"?`)) return

        setLoadingId(id)
        setActionType("suspend")
        try {
            const endpoint = view === "ARTISTS" ? "artists" : "releases"
            const res = await fetch(`/api/admin/${endpoint}/${id}/suspend`, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                if (view === "ARTISTS") setLocalArtists((prev: any[]) => prev.map((a: any) => a.id === id ? { ...a, isSuspended: data.isSuspended } : a))
                else setLocalReleases((prev: any[]) => prev.map((r: any) => r.id === id ? { ...r, isSuspended: data.isSuspended } : r))
                router.refresh()
            } else {
                alert(data.message || "Failed")
            }
        } catch (error) {
            alert("Error")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const openNotes = async (id: string, entityType: string, name: string) => {
        setNotesEntity({ id, type: entityType, name })
        setNotesOpen(true)
        setNotesLoading(true)
        try {
            const res = await fetch(`/api/admin/content/notes?entityType=${entityType}&entityId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setNotes(data.notes)
            }
        } finally {
            setNotesLoading(false)
        }
    }

    const handleAddNote = async () => {
        if (!notesEntity || !newNote.trim()) return
        setNoteSubmitting(true)
        try {
            const res = await fetch("/api/admin/content/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entityType: notesEntity.type,
                    entityId: notesEntity.id,
                    content: newNote.trim(),
                }),
            })
            if (res.ok) {
                const data = await res.json()
                setNotes([data.note, ...notes])
                setNewNote("")
            }
        } finally {
            setNoteSubmitting(false)
        }
    }

    const openHistory = async (id: string, entityType: string) => {
        setHistoryOpen(true)
        setHistoryLoading(true)
        try {
            const res = await fetch(`/api/admin/audit-log?entityType=${entityType}&entityId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setHistoryEntries(data.entries || [])
            }
        } finally {
            setHistoryLoading(false)
        }
    }

    return (
        <div>
            {/* View Toggle + Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3">
                    <button onClick={() => { setView("ARTISTS"); setSelectedIds(new Set()) }} className={`px-6 py-2 rounded-xl font-bold transition-all ${view === "ARTISTS" ? "bg-white text-black" : "bg-[#121214] text-zinc-400 hover:text-white border border-white/5"}`}>
                        Artists
                    </button>
                    <button onClick={() => { setView("RELEASES"); setSelectedIds(new Set()) }} className={`px-6 py-2 rounded-xl font-bold transition-all ${view === "RELEASES" ? "bg-white text-black" : "bg-[#121214] text-zinc-400 hover:text-white border border-white/5"}`}>
                        Releases
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#121214] border border-white/10 rounded-xl p-1">
                        {(["all", "newest", "hidden"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${filter === f ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search + Bulk Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={`Search ${view.toLowerCase()}...`}
                        className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-white/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-400">{selectedIds.size} selected</span>
                            <button onClick={() => handleBulkAction("hide")} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                                Bulk Hide
                            </button>
                            <button onClick={() => handleBulkAction("unhide")} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all">
                                Bulk Unhide
                            </button>
                        </div>
                    )}
                    <span className="text-zinc-500 text-sm">Showing {filteredData.length} {view.toLowerCase()}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-zinc-400 text-sm font-medium">
                            <th className="px-4 py-4 w-10">
                                <button onClick={selectAll} className="text-zinc-500 hover:text-white">
                                    {selectedIds.size === filteredData.length && filteredData.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="px-4 py-4">Name</th>
                            <th className="px-4 py-4">Visibility</th>
                            <th className="px-4 py-4">Slug</th>
                            <th className="px-4 py-4">{view === "ARTISTS" ? "Organization" : "Artist"}</th>
                            <th className="px-4 py-4">Created</th>
                            <th className="px-4 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredData.map((item: any) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-4">
                                    <button onClick={() => toggleSelect(item.id)} className="text-zinc-500 hover:text-white">
                                        {selectedIds.has(item.id) ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden flex-shrink-0">
                                            {item.imageUrl || item.coverImage ? (
                                                <img src={item.imageUrl || item.coverImage} className="w-full h-full object-cover" />
                                            ) : (
                                                view === "ARTISTS" ? <Music className="w-4 h-4" /> : <Disc className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="text-white font-medium">{item.name || item.title}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {item.isSuspended ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Hidden</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-zinc-400 font-mono text-sm">{item.slug}</td>
                                <td className="px-4 py-4 text-zinc-400 text-sm">
                                    {item.organization?.name || (view === "RELEASES" && item.artist?.name)}
                                </td>
                                <td className="px-4 py-4 text-zinc-500 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => handleSuspend(item.id, item.isSuspended, item.name || item.title || "")}
                                            disabled={loadingId === item.id}
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title={item.isSuspended ? "Make Visible" : "Hide"}
                                        >
                                            {loadingId === item.id && actionType === "suspend" ? (
                                                <span className="w-4 h-4 block animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                                            ) : item.isSuspended ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <a
                                            href={view === "ARTISTS" ? `/a/${item.slug}` : `/r/${item.slug}`}
                                            target="_blank"
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="View Public Preview"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => openNotes(item.id, view === "ARTISTS" ? "ARTIST" : "RELEASE", item.name || item.title || "")}
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="Admin Notes"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.name || item.title)}
                                            disabled={loadingId === item.id}
                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                            title="Soft Delete"
                                        >
                                            {loadingId === item.id && actionType === "delete" ? (
                                                <span className="w-4 h-4 block animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                                            ) : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notes Drawer */}
            {notesOpen && notesEntity && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setNotesOpen(false)} />
                    <div className="relative w-[420px] h-full bg-[#0e0e10] border-l border-white/10 overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0e0e10] z-10">
                            <div>
                                <h2 className="text-lg font-bold text-white">Admin Notes</h2>
                                <p className="text-zinc-400 text-sm">{notesEntity.name}</p>
                            </div>
                            <button onClick={() => setNotesOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Add a note..."
                                    className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                                />
                                <button onClick={handleAddNote} disabled={noteSubmitting || !newNote.trim()} className="px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all disabled:opacity-50">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            {notesLoading ? (
                                <div className="flex justify-center py-8"><span className="w-5 h-5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" /></div>
                            ) : notes.length === 0 ? (
                                <p className="text-zinc-500 text-sm">No notes yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {notes.map((note: any) => (
                                        <div key={note.id} className="p-3 bg-[#121214] rounded-xl border border-white/5">
                                            <p className="text-zinc-200 text-sm mb-2">{note.content}</p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span>{note.adminEmail || "Admin"}</span>
                                                <span>•</span>
                                                <span>{new Date(note.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
