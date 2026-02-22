"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const verified = searchParams.get("verified")
    const urlError = searchParams.get("error")

    const errorMap: Record<string, string> = {
        MissingToken: "Verification token is missing.",
        InvalidToken: "Invalid verification token.",
        ExpiredToken: "Verification token has expired.",
        EmailNotFound: "Email associated with token not found.",
        EmailNotVerified: "Please verify your email address before logging in.",
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                if (res.error === "EmailNotVerified") {
                    setError("Please verify your email address before logging in.")
                } else {
                    setError("Invalid email or password")
                }
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) {
            setError("Please enter your email first.")
            return
        }
        setIsLoading(true)
        setError("")
        try {
            const res = await fetch("/api/register/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (res.ok) {
                setError("Verification email sent! Please check your inbox.")
            } else {
                setError(data.message || "Failed to resend email.")
            }
        } catch (err) {
            setError("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-teal-500 bg-clip-text text-transparent mb-2">
                        Crowdfr
                    </h1>
                    <p className="text-gray-400 text-sm">Welcome back. Enter your credentials.</p>
                </div>

                {verified && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center mb-6 text-sm font-bold">
                        Email verified successfully! You can now log in.
                    </div>
                )}

                {urlError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center mb-6 text-sm font-bold">
                        {errorMap[urlError] || "An error occurred during verification."}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            placeholder="artist@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex flex-col gap-2">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                            {error === "Please verify your email address before logging in." && (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors underline decoration-dotted underline-offset-4"
                                >
                                    Resend activation email
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-gray-500 text-sm">
                        Don't have an account?{" "}
                        <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                            Create one
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[120px] rounded-full" />

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
