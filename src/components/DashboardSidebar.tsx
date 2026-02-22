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
        <aside className="w-64 border-r border-zinc-800 flex flex-col h-screen sticky top-0 bg-[#0a0a0c]">
            <div className="p-8">
                <Link href="/dashboard">
                    <Logo />
                </Link>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "text-zinc-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="text-xl">{link.icon}</span>
                            {link.label}
                        </Link>
                    )
                })}

                {/* Admin Link */}
                {session?.user?.role === "ADMIN" && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-bold transition-all mt-4 border border-red-500/20"
                    >
                        <span className="text-xl">🛡️</span>
                        Admin Portal
                    </Link>
                )}
            </nav>

            {/* User Panel */}
            <div className="p-4 border-t border-zinc-800 relative">
                {session?.user ? (
                    <>
                        {showUserMenu && (
                            <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-4 border-b border-zinc-800">
                                    <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                                </div>
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <span>⚙️</span> Settings
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                >
                                    <span>🚪</span> Sign Out
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {(session.user.name?.[0] || session.user.email?.[0] || "?").toUpperCase()}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-bold text-white truncate">{session.user.name || "User"}</p>
                                <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                            </div>
                            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors text-xs">
                                {showUserMenu ? "▼" : "▲"}
                            </span>
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-teal-500 transition-all"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </aside>
    )
}
