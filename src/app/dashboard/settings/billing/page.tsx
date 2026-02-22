"use client"

import { useState, useEffect } from "react"
import { getTier, TierId } from "@/lib/pricing"
import PricingPlans from "@/components/PricingPlans"
import UsageIndicator from "@/components/UsageIndicator"
import Link from "next/link"

export default function BillingPage() {
    const [organization, setOrganization] = useState<any>(null)
    const [usageStats, setUsageStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpgrading, setIsUpgrading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [orgRes, usageRes] = await Promise.all([
                fetch("/api/organizations"),
                fetch("/api/organizations/current/usage") // We need to create this endpoint or fetch differently
            ])

            // For now, let's assume /api/organizations returns list and we take the first one
            // In a real app with multiple orgs, we'd need to select context
            if (orgRes.ok) {
                const orgs = await orgRes.json()
                if (orgs.length > 0) {
                    setOrganization(orgs[0])
                    // Fetch usage for this org (mocking the endpoint call for now or impl it)
                    fetchUsage(orgs[0].id)
                }
            }
        } catch (e) {
            console.error("Failed to fetch billing data", e)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsage = async (orgId: string) => {
        try {
            const res = await fetch(`/api/organizations/${orgId}/usage`)
            if (res.ok) {
                const data = await res.json()
                setUsageStats(data)
            }
        } catch (e) {
            console.error("Failed to fetch usage", e)
        }
    }

    const handleManageBilling = async () => {
        if (!organization) return
        setIsUpgrading(true)
        try {
            const res = await fetch("/api/stripe/billing-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId: organization.id })
            })

            if (res.ok) {
                const { url } = await res.json()
                window.location.href = url
            }
        } catch (e) {
            console.error("Failed to redirect to billing portal", e)
            setIsUpgrading(false)
        }
    }

    const handleUpgrade = async (tierId: TierId) => {
        if (!organization) return
        setIsUpgrading(true)
        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: organization.id,
                    tierId: tierId
                })
            })

            if (res.ok) {
                const { url } = await res.json()
                window.location.href = url
            }
        } catch (e) {
            console.error("Failed to start upgrade", e)
            setIsUpgrading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
                <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!organization) {
        return (
            <div className="p-8 text-center text-zinc-500">
                Organization not found.
            </div>
        )
    }

    const currentTier = getTier(organization.tier)

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0c] font-sans">
            <div className="mb-8">
                <Link href="/dashboard" className="text-zinc-500 hover:text-white text-sm font-bold mb-4 inline-block">← Back to Dashboard</Link>
                <h1 className="text-4xl font-black text-white mb-2">Billing & Plans</h1>
                <p className="text-zinc-400">Manage your subscription and usage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Current Subscription</h2>
                                <p className="text-zinc-400 text-sm">You are currently on the <strong className="text-white">{currentTier.name}</strong> plan.</p>
                            </div>
                            <div className="flex gap-3">
                                {currentTier.price !== null && currentTier.price > 0 && (
                                    <button
                                        onClick={handleManageBilling}
                                        disabled={isUpgrading}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all"
                                    >
                                        Manage Subscription
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Plan Details Badge - only show for paid plans */}
                        {currentTier.price !== null && currentTier.price > 0 && (
                            <div className="inline-flex items-center gap-3 bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50">
                                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                                    💎
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Plan Status</p>
                                    <p className="text-white font-bold capitalize">
                                        {organization.subscriptionStatus || "Active"}
                                        {organization.currentPeriodEnd && <span className="text-zinc-500 font-normal text-xs ml-2">Renews {new Date(organization.currentPeriodEnd).toLocaleDateString()}</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-8 p-8 border border-white/5 bg-white/5 rounded-3xl">
                        <h2 className="text-xl font-bold text-white mb-2">Grow with Crowdfr</h2>
                        <p className="text-zinc-400">We are currently in a limited rollout. Professional plans with unlimited releases and advanced analytics will be available soon.</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white mb-6">Usage & Limits</h2>
                    {usageStats ? (
                        <UsageIndicator stats={usageStats} currentTier={organization.tier as TierId} />
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500">
                            Loading usage stats...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
