"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface LegalPageLayoutProps {
    title: string;
    lastUpdated?: string;
    children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-purple-500/30">
            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-white/5">
                <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">
                    Crowdfr
                </Link>
                <div className="flex items-center gap-8">
                    <Link href="/pricing" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                        Pricing
                    </Link>
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
            <main className="relative z-10 max-w-4xl mx-auto pt-20 pb-32 px-6">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{title}</h1>
                    {lastUpdated && (
                        <p className="text-zinc-500 text-sm font-medium">Last updated: {lastUpdated}</p>
                    )}
                </div>

                <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-12 px-8 bg-zinc-950/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-zinc-500 text-sm font-medium">
                        © {new Date().getFullYear()} Crowdfr Inc. All rights reserved.
                    </div>
                    <div className="flex gap-8 text-zinc-500 text-sm font-bold">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
