"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import ConfirmationDialog from "./ConfirmationDialog"

export default function ProfileSettings() {
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: "", text: "" })

    // Profile form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        image: "",
        links: { spotify: "", apple: "", instagram: "", website: "" } as Record<string, string>
    })

    // Password form
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    // Account deletion
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user) {
                try {
                    const res = await fetch("/api/user")
                    if (res.ok) {
                        const data = await res.json()
                        let parsedLinks = { spotify: "", apple: "", instagram: "", website: "" }
                        if (data.links) {
                            try {
                                const jsonLinks = JSON.parse(data.links)
                                parsedLinks = { ...parsedLinks, ...jsonLinks }
                            } catch (e) {
                                console.error("Failed to parse links", e)
                            }
                        }

                        setFormData({
                            name: session.user.name || "",
                            email: session.user.email || "",
                            image: session.user.image || "",
                            links: parsedLinks
                        })
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error)
                }
            }
        }

        fetchProfile()
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: "", text: "" })

        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to update profile")
            }

            await update({
                name: formData.name,
                email: formData.email,
                image: formData.image
            })
            setMessage({ type: "success", text: "Profile updated successfully!" })
        } catch (error: any) {
            setMessage({ type: "error", text: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordMessage({ type: "", text: "" })

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: "error", text: "New passwords don't match" })
            return
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" })
            return
        }

        setIsChangingPassword(true)
        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to change password")
            }

            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            setPasswordMessage({ type: "success", text: "Password changed successfully!" })
        } catch (error: any) {
            setPasswordMessage({ type: "error", text: error.message })
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true)
        try {
            const res = await fetch("/api/user/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: session?.user?.email }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to delete account")
            }

            signOut({ callbackUrl: "/login" })
        } catch (error: any) {
            alert(error.message)
            setIsDeletingAccount(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Profile Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-1">Your Profile</h2>
                <p className="text-zinc-500 text-sm mb-6">Manage your personal information.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {formData.email !== session?.user?.email && (
                            <p className="text-amber-400 text-xs mt-2 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                                </svg>
                                Changing your email will require you to log in again
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Avatar URL
                        </label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Social & Streaming Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(formData.links).map(([key, value]) => {
                                const PLATFORMS: Record<string, { label: string, placeholder: string }> = {
                                    spotify: { label: 'Spotify URL', placeholder: 'https://open.spotify.com/artist/...' },
                                    apple: { label: 'Apple Music URL', placeholder: 'https://music.apple.com/...' },
                                    instagram: { label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                                    website: { label: 'Website URL', placeholder: 'https://yourwebsite.com' },
                                    twitter: { label: 'Twitter / X URL', placeholder: 'https://twitter.com/...' },
                                    tiktok: { label: 'TikTok URL', placeholder: 'https://tiktok.com/...' },
                                    youtube: { label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
                                    soundcloud: { label: 'SoundCloud URL', placeholder: 'https://soundcloud.com/...' },
                                    bandcamp: { label: 'Bandcamp URL', placeholder: 'https://bandcamp.com/...' },
                                    merch: { label: 'Merch Store URL', placeholder: 'https://store.yourdomain.com' },
                                    linkedin: { label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                                    facebook: { label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                                }

                                const platform = PLATFORMS[key]
                                const label = platform?.label || (key.charAt(0).toUpperCase() + key.slice(1) + " URL")
                                const placeholder = platform?.placeholder || "https://..."

                                return (
                                    <div key={key} className="relative group">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                                                {label}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newLinks = { ...formData.links }
                                                    delete newLinks[key]
                                                    setFormData({ ...formData, links: newLinks })
                                                }}
                                                className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <input
                                            type="url"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                            value={value}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                links: { ...formData.links, [key]: e.target.value }
                                            })}
                                            placeholder={placeholder}
                                        />
                                    </div>
                                )
                            })}

                            {/* Add Link Button */}
                            <div className="relative flex items-end">
                                <div className="w-full">
                                    <label className="block text-zinc-600 text-xs font-semibold mb-2 uppercase tracking-wider opacity-50">
                                        Add More Links
                                    </label>
                                    <div className="relative group">
                                        <select
                                            className="w-full bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl px-4 py-3 text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium appearance-none cursor-pointer hover:bg-zinc-800/50 hover:text-zinc-300"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setFormData({
                                                        ...formData,
                                                        links: { ...formData.links, [e.target.value]: "" }
                                                    })
                                                    e.target.value = ""
                                                }
                                            }}
                                            value=""
                                        >
                                            <option value="">+ Add Platform</option>
                                            {[
                                                { id: 'spotify', label: 'Spotify' },
                                                { id: 'apple', label: 'Apple Music' },
                                                { id: 'instagram', label: 'Instagram' },
                                                { id: 'twitter', label: 'Twitter / X' },
                                                { id: 'tiktok', label: 'TikTok' },
                                                { id: 'youtube', label: 'YouTube' },
                                                { id: 'soundcloud', label: 'SoundCloud' },
                                                { id: 'bandcamp', label: 'Bandcamp' },
                                                { id: 'merch', label: 'Merch Store' },
                                                { id: 'facebook', label: 'Facebook' },
                                                { id: 'linkedin', label: 'LinkedIn' },
                                            ].filter(p => !Object.keys(formData.links).includes(p.id)).map(p => (
                                                <option key={p.id} value={p.id}>{p.label}</option>
                                            ))}
                                            <option value="website">Custom Website</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-1">Change Password</h2>
                <p className="text-zinc-500 text-sm mb-6">Update your password to keep your account secure.</p>
                <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Current Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    {passwordMessage.text && (
                        <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
                            {passwordMessage.text}
                        </p>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isChangingPassword ? "Changing..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-500/20 bg-red-500/5 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-red-400 mb-1">Danger Zone</h2>
                <p className="text-zinc-500 text-sm mb-6">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold px-6 py-3 rounded-xl transition-all border border-red-500/30 hover:border-red-500"
                >
                    Delete Account
                </button>
            </div>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Your Account"
                description="This will permanently disable your account, remove you from all organizations, and delete your personal data. This cannot be undone."
                confirmLabel="Delete My Account"
                confirmText={session?.user?.email || ""}
                variant="danger"
                isLoading={isDeletingAccount}
            />
        </div>
    )
}
