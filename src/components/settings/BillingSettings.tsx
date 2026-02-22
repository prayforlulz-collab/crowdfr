"use client"

import { useState, useEffect } from "react"
import { getTier, TierId } from "@/lib/pricing"
import Link from "next/link"

interface OrgData {
    id: string
    name: string
    tier: string
    subscriptionStatus: string | null
    currentPeriodEnd: string | null
    stripeCustomerId: string | null
}

export default function BillingSettings() {
    const [org, setOrg] = useState<OrgData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isManaging, setIsManaging] = useState(false)

    useEffect(() => {
        fetchOrg()
    }, [])

    const fetchOrg = async () => {
        try {
            const res = await fetch("/api/organization")
            const data = await res.json()
            if (!data.error) {
                setOrg(data)
            }
        } catch (e) {
            console.error("Failed to fetch org", e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleManageBilling = async () => {
        if (!org) return
        setIsManaging(true)
        try {
            const res = await fetch("/api/stripe/billing-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId: org.id })
            })

            if (res.ok) {
                const { url } = await res.json()
                window.location.href = url
            }
        } catch (e) {
            console.error("Failed to redirect to billing portal", e)
            setIsManaging(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-pulse">
                        <div className="h-6 bg-zinc-800 rounded-lg w-1/3 mb-4" />
                        <div className="h-4 bg-zinc-800 rounded-lg w-2/3" />
                    </div>
                ))}
            </div>
        )
    }

    if (!org) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                <p className="text-zinc-500">Organization not found.</p>
            </div>
        )
    }

    const currentTier = getTier(org.tier)
    const isPaid = (currentTier.price ?? 0) > 0
    const statusColors: Record<string, string> = {
        active: "text-green-400 bg-green-500/10 border-green-500/20",
        trialing: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        past_due: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        canceled: "text-red-400 bg-red-500/10 border-red-500/20",
        incomplete: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    }
    const status = org.subscriptionStatus || (isPaid ? "active" : "free")
    const statusColor = statusColors[status] || statusColors.active

    return (
        <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-1">Current Plan</h2>
                <p className="text-zinc-500 text-sm mb-6">Your organization&apos;s subscription details.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Plan Name */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Plan</p>
                        <p className="text-xl font-bold text-white">{currentTier.name}</p>
                    </div>

                    {/* Price */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Price</p>
                        <p className="text-xl font-bold text-white">
                            {currentTier.price === 0 ? "Free" : `$${currentTier.price}/mo`}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Status</p>
                        <span className={`inline-flex text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColor}`}>
                            {status}
                        </span>
                    </div>

                    {/* Renewal */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">
                            {org.subscriptionStatus === "canceled" ? "Expires" : "Renews"}
                        </p>
                        <p className="text-xl font-bold text-white">
                            {org.currentPeriodEnd
                                ? new Date(org.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "—"
                            }
                        </p>
                    </div>
                </div>

                {/* Plan Features */}
                <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Included Features</p>
                    <div className="flex flex-wrap gap-2">
                        {currentTier.features.map(feature => (
                            <span key={feature} className="text-xs font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 px-3 py-1.5 rounded-full">
                                ✓ {feature}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    {isPaid && (
                        <button
                            onClick={handleManageBilling}
                            disabled={isManaging}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isManaging ? "Redirecting..." : "Manage Subscription"}
                        </button>
                    )}
                    <div
                        className="inline-block bg-zinc-800 text-zinc-500 font-bold px-6 py-3 rounded-xl cursor-default"
                    >
                        Fully Onboarded
                    </div>
                </div>
            </div>

            {/* Billing Email / Portal */}
            {isPaid && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                    <h2 className="text-xl font-bold mb-1">Billing Portal</h2>
                    <p className="text-zinc-500 text-sm mb-6">
                        View invoices, update payment methods, and manage your billing details through Stripe.
                    </p>
                    <button
                        onClick={handleManageBilling}
                        disabled={isManaging}
                        className="bg-white text-black font-black px-8 py-3 rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
                    >
                        {isManaging ? "Opening..." : "Open Billing Portal →"}
                    </button>
                </div>
            )}

            {/* Cancel Note */}
            {isPaid && org.subscriptionStatus !== "canceled" && (
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-3xl p-8">
                    <h2 className="text-lg font-bold text-amber-400 mb-1">Cancel Subscription</h2>
                    <p className="text-zinc-500 text-sm mb-4">
                        You can cancel your subscription through the Stripe billing portal. You&apos;ll retain access until the end of your current billing period.
                    </p>
                    <button
                        onClick={handleManageBilling}
                        disabled={isManaging}
                        className="text-amber-400 font-bold text-sm hover:text-amber-300 transition-colors"
                    >
                        Manage in Billing Portal →
                    </button>
                </div>
            )}
        </div>
    )
}
