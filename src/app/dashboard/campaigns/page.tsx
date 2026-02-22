"use client"

import { useState, useEffect } from "react"
import { EMAIL_TEMPLATES, EmailTemplate } from "@/lib/email-center-templates"

type Tab = 'overview' | 'drafts' | 'scheduled' | 'sent'

export default function EmailCenterPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>('overview')

    // Modal & Flow state
    const [showModal, setShowModal] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [step, setStep] = useState(1) // 1: Category, 2: Template, 3: Edit/Schedule
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Form state
    const [selectedCategory, setSelectedCategory] = useState<EmailTemplate['category'] | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
    const [subject, setSubject] = useState("")
    const [content, setContent] = useState("")
    const [scheduledAt, setScheduledAt] = useState("")
    const [type, setType] = useState("custom")

    // Template data (for dynamic filling)
    const [artists, setArtists] = useState<any[]>([])
    const [releases, setReleases] = useState<any[]>([])
    const [selectedArtist, setSelectedArtist] = useState<any>(null)
    const [selectedRelease, setSelectedRelease] = useState<any>(null)

    useEffect(() => {
        fetchCampaigns()
        fetchInitialData()
    }, [])

    const fetchCampaigns = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/campaigns")
            if (res.ok) {
                const data = await res.json()
                setCampaigns(data)
            }
        } catch (e) {
            console.error("Failed to fetch campaigns", e)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchInitialData = async () => {
        try {
            const [artistsRes, releasesRes] = await Promise.all([
                fetch("/api/artists"),
                fetch("/api/releases")
            ])
            if (artistsRes.ok) setArtists(await artistsRes.json())
            if (releasesRes.ok) setReleases(await releasesRes.json())
        } catch (e) {
            console.error("Failed to fetch template data", e)
        }
    }

    const getFinalContent = () => {
        let finalContent = content
        if (selectedTemplate && selectedTemplate.id === 'new-release' && selectedRelease) {
            const artist = artists.find(a => a.id === selectedRelease.artistId)
            finalContent = selectedTemplate.html({
                artistName: artist?.name || "The Artist",
                releaseTitle: selectedRelease.title,
                coverUrl: selectedRelease.coverImage || "",
                listenUrl: `${window.location.origin}/r/${selectedRelease.slug}`
            })
        }
        return finalContent
    }

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        const finalContent = getFinalContent()

        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    content: finalContent,
                    type: selectedTemplate?.id || type,
                    category: selectedTemplate?.category || null,
                    scheduledAt: scheduledAt || null
                })
            })

            if (res.ok) {
                setShowModal(false)
                resetForm()
                fetchCampaigns()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to process campaign")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setSelectedCategory(null)
        setSelectedTemplate(null)
        setSubject("")
        setContent("")
        setScheduledAt("")
        setSelectedRelease(null)
        setShowPreview(false)
    }

    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === 'overview') return true
        if (activeTab === 'drafts') return c.status === 'DRAFT'
        if (activeTab === 'scheduled') return c.status === 'SCHEDULED'
        if (activeTab === 'sent') return c.status === 'SENT' || c.status === 'SENT_WITH_ERRORS'
        return true
    })

    const categories = ["Announcements", "Engagement", "Sales & Promotion", "Events", "Seasonal"]

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0c]">
            <header className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
                        Email Center
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Connect with your audience through beautiful, targeted emails.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                    + New Campaign
                </button>
            </header>

            {/* Management Tabs */}
            <div className="flex gap-8 border-b border-zinc-800 mb-8 overflow-x-auto pb-px">
                {(['overview', 'drafts', 'scheduled', 'sent'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-24">
                    <span className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-7xl mb-8 animate-bounce">✉️</div>
                        <h2 className="text-3xl font-black mb-3">No {activeTab} yet</h2>
                        <p className="text-zinc-500 mb-10 text-lg">
                            {activeTab === 'overview'
                                ? "Your email communications will appear here. Start reaching out to your fans today!"
                                : `You don't have any items in ${activeTab}.`}
                        </p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="bg-zinc-800 border border-zinc-700 text-white px-10 py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-all"
                        >
                            Create Your First Campaign
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <StatCard title="Total Sent" value={campaigns.filter(c => c.status === 'SENT').length} icon="📤" />
                            <StatCard title="Scheduled" value={campaigns.filter(c => c.status === 'SCHEDULED').length} icon="⏰" />
                            <StatCard title="Total Opens" value={campaigns.reduce((acc, c) => acc + (c.opens || 0), 0)} icon="👁️" />
                        </div>
                    )}

                    <div className="grid gap-4">
                        {filteredCampaigns.map(campaign => (
                            <div key={campaign.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-500/50 hover:bg-zinc-900 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                                        {categoryIcon(campaign.category)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl tracking-tight">{campaign.subject}</h3>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${campaign.status === 'SENT' ? 'bg-green-500/10 text-green-500' :
                                                campaign.status === 'SCHEDULED' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {campaign.status}
                                            </span>
                                            {campaign.category && (
                                                <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-lg">
                                                    {campaign.category}
                                                </span>
                                            )}
                                            <span className="text-zinc-500 text-xs font-medium">
                                                {new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    {campaign.status === 'SENT' && (
                                        <div className="hidden md:flex gap-6 items-center">
                                            <MetricSmall label="Opens" value={campaign.opens || 0} />
                                            <MetricSmall label="Clicks" value={campaign.clicks || 0} />
                                        </div>
                                    )}
                                    <button className="bg-zinc-800/50 hover:bg-indigo-500 hover:text-white p-3 rounded-xl text-zinc-400 transition-all">
                                        <ArrowIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Campaign Creator Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isSubmitting && setShowModal(false)} />
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

                        <div className="p-10 pb-4 flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md">Step {step} of 3</span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">
                                    {step === 1 ? "Choose a Category" : step === 2 ? "Select a Template" : "Customize & Send"}
                                </h2>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 pt-6">
                            {step === 1 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => { setSelectedCategory(cat as any); setStep(2); }}
                                            className="p-8 bg-black/40 border-2 border-zinc-800 rounded-[32px] text-left hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all group active:scale-[0.98]"
                                        >
                                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{categoryIcon(cat)}</div>
                                            <h3 className="font-black text-xl mb-1">{cat}</h3>
                                            <p className="text-zinc-500 text-sm font-medium">Professional templates for your {cat.toLowerCase()}.</p>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setSelectedCategory(null); setSelectedTemplate(null); setStep(3); setType("custom"); }}
                                        className="p-8 bg-zinc-800/20 border-2 border-dashed border-zinc-700 rounded-[32px] text-left hover:border-zinc-500 transition-all flex flex-col justify-center items-center text-center opacity-60 hover:opacity-100"
                                    >
                                        <div className="text-3xl mb-2">✍️</div>
                                        <h3 className="font-bold">Start from scratch</h3>
                                        <p className="text-zinc-500 text-xs mt-1">Manual HTML editor</p>
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">← Back to categories</button>
                                    <div className="grid gap-4">
                                        {EMAIL_TEMPLATES.filter(t => t.category === selectedCategory).map(template => (
                                            <button
                                                key={template.id}
                                                onClick={() => {
                                                    setSelectedTemplate(template);
                                                    setSubject(template.subject);
                                                    setStep(3);
                                                }}
                                                className="p-6 bg-black/40 border border-zinc-800 rounded-3xl text-left hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">📄</div>
                                                    <div>
                                                        <h3 className="font-black text-lg">{template.name}</h3>
                                                        <p className="text-zinc-500 text-xs font-medium">{template.description}</p>
                                                    </div>
                                                </div>
                                                <span className="text-indigo-400 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleCreateCampaign} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Subject Line</label>
                                                <input
                                                    required
                                                    value={subject}
                                                    onChange={e => setSubject(e.target.value)}
                                                    placeholder="e.g. My New Single is Out Now!"
                                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Scheduling (Optional)</label>
                                                <input
                                                    type="datetime-local"
                                                    value={scheduledAt}
                                                    onChange={e => setScheduledAt(e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {selectedTemplate ? (
                                            <div className="bg-black/50 p-8 rounded-[32px] border border-zinc-800 space-y-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center text-sm">✨</div>
                                                    <p className="text-sm font-bold text-zinc-300">Dynamic Template: <span className="text-white">{selectedTemplate.name}</span></p>
                                                </div>

                                                {selectedTemplate.id === 'new-release' && (
                                                    <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                                                        <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest">Select Release to Feature</label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {releases.map(r => (
                                                                <button
                                                                    key={r.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedRelease(r)}
                                                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedRelease?.id === r.id
                                                                        ? 'bg-indigo-500/10 border-indigo-500 text-white'
                                                                        : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                                                        }`}
                                                                >
                                                                    <img src={r.coverImage} className="w-10 h-10 rounded shadow-md" />
                                                                    <span className="font-bold">{r.title}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedTemplate.id !== 'new-release' && (
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest">Email Message</label>
                                                        <textarea
                                                            value={content}
                                                            onChange={e => setContent(e.target.value)}
                                                            rows={6}
                                                            placeholder="Write your personal message here..."
                                                            className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Manual HTML Content</label>
                                                <textarea
                                                    value={content}
                                                    onChange={e => setContent(e.target.value)}
                                                    rows={10}
                                                    placeholder="<p>Hello fans!</p>"
                                                    className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-sm font-medium italic animate-shake">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setStep(selectedCategory ? 2 : 1)} className="flex-1 bg-zinc-800 text-white font-bold py-5 rounded-2xl hover:bg-zinc-700 transition-all">Back</button>

                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className="flex-1 bg-zinc-800 border border-zinc-700 text-white font-bold py-5 rounded-2xl hover:bg-zinc-700 transition-all"
                                        >
                                            Preview
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !subject}
                                            className="flex-[2] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black py-5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-indigo-900/40 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Processing..." : scheduledAt ? "Schedule Broadast" : "Initialize Broadcast"}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-center text-zinc-600 uppercase font-black tracking-widest">SendGrid Integration v2 • Real-time Delivery Tracking</p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal overlay */}
            {showPreview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl text-zinc-900">
                    <div className="absolute inset-0" onClick={() => setShowPreview(false)} />
                    <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-4xl h-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-6 bg-zinc-50 border-b flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="bg-zinc-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded">PREVIEW MODE</span>
                                <h3 className="font-bold text-zinc-900">{subject || "No Subject"}</h3>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="text-zinc-400 hover:text-zinc-600 font-bold p-2 transition-all">✕ Close Preview</button>
                        </div>
                        <div className="flex-1 bg-[#f4f4f5] p-12 overflow-y-auto">
                            <div className="bg-white shadow-sm border mx-auto max-w-[600px] min-h-full">
                                <div dangerouslySetInnerHTML={{ __html: getFinalContent() }} />
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-50 border-t text-center">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Rendered with Crowdz Email Engine</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ title, value, icon }: { title: string, value: any, icon: string }) {
    return (
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-[32px] hover:border-indigo-500/30 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:scale-125 transition-transform">{icon}</div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-2">{title}</p>
            <p className="text-4xl font-black text-white">{value}</p>
        </div>
    )
}

function MetricSmall({ label, value }: { label: string, value: number }) {
    return (
        <div className="text-center">
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{label}</p>
            <p className="text-lg font-black text-white">{value}</p>
        </div>
    )
}

function categoryIcon(cat?: string) {
    switch (cat) {
        case "Announcements": return "📢"
        case "Engagement": return "❤️"
        case "Sales & Promotion": return "💎"
        case "Events": return "🎪"
        case "Seasonal": return "🎄"
        default: return "✉️"
    }
}

function ArrowIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    )
}
