"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("loading")
        setMessage("")

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (res.ok) {
                setStatus("success")
                setMessage(data.message || "If an account exists, a reset link was sent.")
            } else {
                setStatus("error")
                setMessage(data.error || "Failed to process request")
            }
        } catch (err) {
            setStatus("error")
            setMessage("An unexpected error occurred")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-teal-500 bg-clip-text text-transparent mb-2">
                            Reset Password
                        </h1>
                        <p className="text-gray-400 text-sm">Enter your email to receive a reset link.</p>
                    </div>

                    {status === "success" ? (
                        <div className="text-center space-y-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center text-sm font-bold">
                                {message}
                            </div>
                            <a
                                href="/login"
                                className="block w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Return to login
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    placeholder="artist@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                {status === "loading" ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <a href="/login" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Back to login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
