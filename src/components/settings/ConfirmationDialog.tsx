"use client"

import { useState } from "react"

interface ConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    confirmText?: string // Text to type to confirm
    variant?: "danger" | "warning"
    isLoading?: boolean
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    confirmText,
    variant = "danger",
    isLoading = false,
}: ConfirmationDialogProps) {
    const [inputValue, setInputValue] = useState("")

    if (!isOpen) return null

    const isConfirmDisabled = confirmText ? inputValue !== confirmText : false

    const handleConfirm = () => {
        if (isConfirmDisabled) return
        onConfirm()
        setInputValue("")
    }

    const handleClose = () => {
        setInputValue("")
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${variant === "danger" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                    {variant === "danger" ? (
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                        </svg>
                    )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{description}</p>

                {confirmText && (
                    <div className="mb-6">
                        <p className="text-xs text-zinc-500 mb-2">
                            Type <strong className="text-zinc-300">{confirmText}</strong> to confirm
                        </p>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 transition-all font-mono"
                            placeholder={confirmText}
                            autoFocus
                        />
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled || isLoading}
                        className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed ${variant === "danger"
                            ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                            : "bg-amber-600 hover:bg-amber-500 text-white"
                            }`}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
