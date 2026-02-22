"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface EmailCaptureProps {
    organizationId: string;
    releaseId: string;
    ctaText?: string;
    successMessage?: string;
    fields?: {
        showName?: boolean;
        nameRequired?: boolean;
        showPhone?: boolean;
        phoneRequired?: boolean;
        emailButtonText?: string;
        phoneButtonText?: string;
    };
    progressive?: boolean;
    popupOnLoad?: boolean;
    rewardType?: 'none' | 'link' | 'file';
    rewardUrl?: string;
    rewardMessage?: string;
}

import { useAnalytics } from "@/hooks/useAnalytics";

export default function EmailCapture({
    organizationId,
    releaseId,
    ctaText = "Join the Inner Circle",
    successMessage = "You're in! Check your inbox to confirm.",
    fields = { showName: true, showPhone: false },
    progressive = false,
    popupOnLoad = false,
    rewardType = 'none',
    rewardUrl = '',
    rewardMessage = ''
}: EmailCaptureProps) {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "verified">("idle");
    const [step, setStep] = useState<"email" | "phone">("email");
    const [error, setError] = useState("");
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const { trackEvent } = useAnalytics({ organizationId, releaseId });

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            setStatus("verified");
        }
    }, [searchParams]);

    useEffect(() => {
        if (popupOnLoad) {
            const hasSeenPopup = localStorage.getItem(`has_seen_popup_${organizationId}_${releaseId}`);
            if (!hasSeenPopup && status !== 'success' && status !== 'verified') {
                // slight delay to let the page load visually first
                const timer = setTimeout(() => setIsPopupVisible(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [popupOnLoad, organizationId, releaseId, status]);

    const closePopup = () => {
        setIsPopupVisible(false);
        localStorage.setItem(`has_seen_popup_${organizationId}_${releaseId}`, 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setError("");

        try {
            const response = await fetch("/api/fans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    name: step === "email" && fields.showName ? name : undefined,
                    phone: step === "phone" ? phone : (progressive ? undefined : (fields.showPhone ? phone : undefined)),
                    organizationId,
                    releaseId,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                const errorMsg = data.error || "Something went wrong";
                const errorDetail = data.code ? ` (${data.code})` : "";
                throw new Error(`${errorMsg}${errorDetail}`);
            }

            // If we just submitted email and have a phone step to do
            if (step === "email" && progressive && fields.showPhone) {
                setStep("phone");
                setStatus("idle");
                // Track intermediate step
                trackEvent({
                    eventType: "fan_signup_partial",
                    eventData: { source: "release_page_capture", hasName: !!name }
                });
                return;
            }

            // Final success
            trackEvent({
                eventType: "fan_signup",
                eventData: {
                    source: "release_page_capture",
                    hasName: !!name,
                    hasPhone: !!phone
                }
            });

            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setError(err.message);
        }
    };

    if (status === "success" || status === "verified") {
        const finalMessage = rewardMessage || (status === "verified" ? "Email confirmed! You're all set." : successMessage);
        const hasReward = rewardType && rewardType !== 'none' && rewardUrl;

        const successContent = (
            <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl animate-in fade-in zoom-in-95 duration-500 text-center relative">
                {isPopupVisible && (
                    <button onClick={closePopup} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-700 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-zinc-100 font-semibold text-lg max-w-sm">
                    {finalMessage}
                </p>

                {hasReward && (
                    <a
                        href={rewardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        onClick={(e) => {
                            if (isPopupVisible) closePopup();
                        }}
                    >
                        {rewardType === 'file' ? (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Now
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                Access Content
                            </>
                        )}
                    </a>
                )}
            </div>
        );

        if (isPopupVisible) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md relative">
                        {successContent}
                    </div>
                </div>
            );
        }

        return successContent;
    }

    const showNameField = fields.showName && (!progressive || email.includes("@"));
    const showPhoneField = fields.showPhone && (!progressive || (email.includes("@") && (!fields.showName || name.length > 1)));

    const captureContent = (
        <section className="w-full max-w-md mx-auto p-[1px] bg-gradient-to-br from-zinc-700/50 via-zinc-900 to-zinc-700/50 rounded-3xl shadow-2xl relative">
            {isPopupVisible && (
                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800 z-10"
                    type="button"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
            <div className="p-6 sm:p-8 bg-zinc-900/95 backdrop-blur-md rounded-[calc(1.5rem-1px)]">
                <div className="flex flex-col space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                            {ctaText}
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Get exclusive access to new music, merch drops, and tour dates before anyone else.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === "email" ? (
                            <>
                                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all font-medium"
                                    />
                                </div>

                                {fields.showName && (
                                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-500">
                                        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                            Name {fields.nameRequired && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required={fields.nameRequired}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all font-medium"
                                        />
                                    </div>
                                )}

                                {!progressive && fields.showPhone && (
                                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-500">
                                        <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                            Phone Number {fields.phoneRequired && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            required={fields.phoneRequired}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all font-medium"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                                <div className="space-y-1.5">
                                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                        Phone Number {fields.phoneRequired && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        autoFocus
                                        required={fields.phoneRequired}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStatus("success")}
                                    className="w-full text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors py-2"
                                >
                                    Skip for now
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-2"
                        >
                            {status === "loading" ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                step === "email" ? (fields.emailButtonText || ctaText) : (fields.phoneButtonText || "Complete Profile")
                            )}
                        </button>

                        {status === "error" && (
                            <div className="space-y-2 animate-in slide-in-from-top-1">
                                <p className="text-red-400 text-xs text-center font-medium">
                                    {error}
                                </p>
                                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-[8px] text-red-300 font-mono break-all opacity-80 text-center">
                                        [Debug] Org: {organizationId} | Release: {releaseId}
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-[10px] text-zinc-500 text-center uppercase tracking-tight">
                            By signing up, you agree to receive marketing communications. No spam, ever.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );

    if (isPopupVisible) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md relative">
                    {captureContent}
                </div>
            </div>
        );
    }

    return captureContent;
}
