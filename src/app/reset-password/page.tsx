"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function ResetPasswordForm() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setStatus("error")
            setMessage("Passwords do not match")
            return
        }
        
        if (!token) {
            setStatus("error")
            setMessage("Invalid or missing reset token")
            return
        }

        setStatus("loading")
        setMessage("")

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (res.ok) {
                setStatus("success")
                setMessage("Password updated successfully!")
            } else {
                setStatus("error")
                setMessage(data.error || "Failed to update password")
            }
        } catch (err) {
            setStatus("error")
            setMessage("An unexpected error occurred")
        }
    }

    if (!token && status !== "success") {
        return (
            <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10">
                <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
                <p className="text-gray-400 mb-6">This password reset link is invalid or missing the token.</p>
                <a href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Request a new link
                </a>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md p-8 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-teal-500 bg-clip-text text-transparent mb-2">
                        Set New Password
                    </h1>
                    <p className="text-gray-400 text-sm">Please enter your new password below.</p>
                </div>

                {status === "success" ? (
                    <div className="text-center space-y-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center text-sm font-bold">
                            {message}
                        </div>
                        <a
                            href="/login"
                            className="block w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all"
                        >
                            Log In Now
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-red-400 text-sm text-center">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {status === "loading" ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[120px] rounded-full" />

            <Suspense fallback={<div className="text-white relative z-10">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
