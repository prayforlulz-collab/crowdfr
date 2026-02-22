"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Logo } from "./Logo"

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: "💿" },
        { href: "/dashboard/fans", label: "Fans", icon: "👥" },
        { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
        { href: "/dashboard/campaigns", label: "Email Center", icon: "✉️" },
    ]

    return (
        <aside className="w-68 border-r border-white/5 flex flex-col h-screen sticky top-0 bg-[#0a0a0c] z-10">
            <div className="p-10">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <Logo />
                </Link>
            </div>

            <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Menu</div>
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 relative group overflow-hidden ${isActive
                                ? "bg-white/5 text-white shadow-[0_4px_20px_rgba(99,102,241,0.1)]"
                                : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full" />
                            )}
                            <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${isActive ? "opacity-100" : "opacity-40"}`}>{link.icon}</span>
                            <span className="relative z-10">{link.label}</span>

                            {/* Hover Backdrop Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    )
                })}

                {/* Admin Link */}
                {session?.user?.role === "ADMIN" && (
                    <div className="pt-6">
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-4">Management</div>
                        <Link
                            href="/admin"
                            className="flex items-center gap-4 px-4 py-3.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl font-bold text-sm transition-all duration-300 group"
                        >
                            <span className="text-xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">🛡️</span>
                            Admin Portal
                        </Link>
                    </div>
                )}
            </nav>

            {/* User Panel */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                {session?.user ? (
                    <div className="relative">
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-4 bg-[#121215] border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                                <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                                    <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                                    <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-wider mt-0.5">{session.user.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <span className="text-lg">⚙️</span> Settings
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500/70 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
                                    >
                                        <span className="text-lg">🚪</span> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${showUserMenu ? 'bg-white/5 ring-1 ring-white/10' : 'hover:bg-white/5'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                                    {(session.user.name?.[0] || session.user.email?.[0] || "?").toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[3px] border-[#0a0a0c] rounded-full" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-bold text-white truncate leading-tight">{session.user.name || "User"}</p>
                                <p className="text-[10px] font-bold text-zinc-600 truncate uppercase mt-0.5">Verified Account</p>
                            </div>
                            <span className={`text-zinc-600 group-hover:text-zinc-400 transition-all duration-300 text-[10px] ${showUserMenu ? 'rotate-180' : ''}`}>
                                ▲
                            </span>
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black text-sm hover:from-indigo-500 hover:to-teal-500 transition-all shadow-xl shadow-indigo-500/10"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </aside>
    )
}
