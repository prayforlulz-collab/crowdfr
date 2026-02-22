"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PricingPlans from "@/components/PricingPlans"
import { TierId, getTier } from "@/lib/pricing"

export default function OnboardingPage() {
    const [step, setStep] = useState(1) // 1: Org Details, 2: Links, 3: Pricing
    const [orgName, setOrgName] = useState("")
    const [orgSlug, setOrgSlug] = useState("")
    const [links, setLinks] = useState({ spotify: "", apple: "", instagram: "", website: "" })
    const [selectedTier, setSelectedTier] = useState<TierId>('FREE')
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const saved = localStorage.getItem('selectedPlan')
        if (saved && ['FREE', 'PRO', 'ENTERPRISE'].includes(saved)) {
            setSelectedTier(saved as TierId)
        }
    }, [])

    const handleOrgSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStep(2)
    }

    const handleLinksSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            // Save links to user profile
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ links }),
            })
            if (!res.ok) throw new Error("Failed to save links")
            setStep(3)
        } catch (err) {
            console.error(err)
            // Proceed anyway, not blocking
            setStep(3)
        } finally {
            setIsLoading(false)
        }
    }

    const handleTierSelection = async (tierId: TierId) => {
        setSelectedTier(tierId)
        setIsLoading(true)
        setError("")

        try {
            // Create the organization
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: orgName,
                    slug: orgSlug,
                    tier: "FREE" // Initially create as FREE, then upgrade if needed
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to create organization")
            }

            const org = await res.json()

            const tier = getTier(tierId)
            if (tier.price !== null && tier.price > 0) {
                const checkoutRes = await fetch("/api/stripe/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        organizationId: org.id,
                        tierId: tierId
                    }),
                })

                if (checkoutRes.ok) {
                    const { url } = await checkoutRes.json()
                    window.location.href = url
                    return // Don't redirect to dashboard yet
                } else {
                    console.error("Failed to initiate checkout, proceeding with free tier")
                    // Fallback to dashboard if checkout fails (user is created on free tier)
                }
            }

            // If Free tier or checkout failed, go to dashboard
            router.push("/dashboard")

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
            setStep(1) // Go back to fix potential errors
            setIsLoading(false)
        }
    }

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        setOrgName(name)
        setOrgSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    }

    const getStepTitle = () => {
        if (step === 1) return "Set Up Your Space"
        if (step === 2) return "Connect Your Profiles"
        return "Choose Your Plan"
    }

    const getStepDescription = () => {
        if (step === 1) return "Create your organization to manage artists and releases."
        if (step === 2) return "Add your social and streaming links to verify your identity."
        return "Select the plan that fits your needs."
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans py-20">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 blur-[120px] rounded-full" />

            <div className={`w-full ${step === 3 ? 'max-w-6xl' : 'max-w-lg'} p-8 relative z-10 transition-all duration-500`}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                            {getStepTitle()}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {getStepDescription()}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleOrgSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Organization Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    placeholder="Universal Music or Independent Artist Name"
                                    value={orgName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Workspace URL</label>
                                <div className="flex items-center">
                                    <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-xl px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                                        crowdfr.com/
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                        placeholder="slug"
                                        value={orgSlug}
                                        onChange={(e) => setOrgSlug(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98]"
                            >
                                Continue →
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleLinksSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Spotify URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                        placeholder="https://open.spotify.com/artist/..."
                                        value={links.spotify}
                                        onChange={(e) => setLinks({ ...links, spotify: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Apple Music URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                        placeholder="https://music.apple.com/..."
                                        value={links.apple}
                                        onChange={(e) => setLinks({ ...links, apple: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Instagram URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                        placeholder="https://instagram.com/..."
                                        value={links.instagram}
                                        onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Website URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                        placeholder="https://yourwebsite.com"
                                        value={links.website}
                                        onChange={(e) => setLinks({ ...links, website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all"
                                >
                                    BACK
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? "Saving..." : "Continue →"}
                                </button>
                            </div>
                            <div className="text-center text-xs text-zinc-500">
                                <button type="button" onClick={() => setStep(3)} className="hover:text-white underline">Skip for now</button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div>
                            <PricingPlans
                                onSelect={handleTierSelection}
                                isLoading={isLoading}
                                currentTier={selectedTier}
                            />
                            {error && <p className="text-red-400 text-sm text-center mt-6">{error}</p>}
                            <div className="mt-8 text-center text-xs text-zinc-500">
                                <button onClick={() => setStep(2)} className="hover:text-white underline">← Back to Links</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
