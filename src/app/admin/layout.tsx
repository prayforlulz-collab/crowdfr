
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Building2, Music, ScrollText, LogOut, ShieldAlert, Heart } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    if (session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const navItems = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/fans", label: "Fans", icon: Heart },
        { href: "/admin/organizations", label: "Organizations", icon: Building2 },
        { href: "/admin/content", label: "Content", icon: Music },
        { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
    ]

    return (
        <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-[#0a0a0c] z-50">
                <div className="p-6">
                    <Link href="/admin" className="text-2xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        ADMIN
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all mb-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Exit to App
                    </Link>
                    <div className="px-4 py-3">
                        <p className="text-sm font-bold text-white mb-1">{session.user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
