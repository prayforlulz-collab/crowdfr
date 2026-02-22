"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import PricingPlans from "@/components/PricingPlans"
import { TierId } from "@/lib/pricing"

export default function PricingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSelect = (tierId: TierId) => {
        setIsLoading(true)
        // Save to local storage to persist through registration/login
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedPlan', tierId)
        }
        router.push(`/register?plan=${tierId}`)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-purple-500/30">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition-opacity">
                    Crowdfr
                </Link>
                <div className="flex items-center gap-8">
                    <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-20 pb-20 px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-400 mb-8 backdrop-blur-md">
                        PRICING
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">pricing.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                        Start for free. Professional plans and advanced features coming soon.
                    </p>
                </div>

                <PricingPlans
                    onSelect={handleSelect}
                    isLoading={isLoading}
                />

                <div className="mt-20 text-center">
                    <p className="text-zinc-500 text-sm">
                        Enterprise details? <a href="mailto:sales@crowdfr.com" className="text-indigo-400 hover:text-indigo-300 underline">Contact Sales</a>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 mt-20 py-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-6">
                    <div className="text-zinc-500 text-sm font-medium">
                        © 2026 Crowdfr Inc. Built for artists.
                    </div>
                    <div className="flex gap-8 text-zinc-500 text-sm font-bold">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
