"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ProfileSettings from "@/components/settings/ProfileSettings"
import OrgSettings from "@/components/settings/OrgSettings"
import TeamSettings from "@/components/settings/TeamSettings"
import BillingSettings from "@/components/settings/BillingSettings"

const tabs = [
    {
        id: "profile", label: "Profile", icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
    {
        id: "organization", label: "Organization", icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        id: "team", label: "Team", icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        id: "billing", label: "Billing", icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        )
    },
]

export default function SettingsPage() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState("profile")
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await fetch("/api/organizations")
                if (res.ok) {
                    const orgs = await res.json()
                    if (orgs.length > 0) {
                        // Check role in the first organization context
                        // The API returns organizations with the user's membership role included
                        // But we might need to fetch membership specifically if not included
                        // Assuming /api/organizations returns list where we can infer role or fetch specific org
                        // Let's fetch the specific org details to be sure (limit 1)
                        const detailRes = await fetch(`/api/organizations/${orgs[0].id}`)
                        if (detailRes.ok) {
                            const orgData = await detailRes.json()
                            // Find user's membership in this org
                            const membership = orgData.memberships.find((m: any) => m.userId === session?.user?.id)
                            if (membership) {
                                setUserRole(membership.role)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch organization role", error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.id) {
            checkRole()
        } else {
            setLoading(false)
        }
    }, [session])

    // Filter tabs based on role
    // Only OWNERS and ADMINs (org level) can see Organization, Team, Billing
    const allowedTabs = tabs.filter(tab => {
        if (tab.id === "profile") return true
        if (loading) return false // Hide until loaded
        return userRole === "OWNER" || userRole === "ADMIN"
    })

    return (
        <div className="min-h-screen text-white p-4 sm:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Manage your account and organization.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 sm:gap-12">
                    {/* Sidebar Navigation */}
                    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                        {allowedTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${activeTab === tab.id
                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <span className={`transition-colors ${activeTab === tab.id ? 'text-purple-400' : 'text-zinc-600'}`}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Main Content */}
                    <main className="min-w-0">
                        {activeTab === "profile" && <ProfileSettings />}
                        {activeTab === "organization" && (userRole === "OWNER" || userRole === "ADMIN") && <OrgSettings />}
                        {activeTab === "team" && (userRole === "OWNER" || userRole === "ADMIN") && <TeamSettings />}
                        {activeTab === "billing" && (userRole === "OWNER" || userRole === "ADMIN") && <BillingSettings />}
                    </main>
                </div>
            </div>
        </div>
    )
}
