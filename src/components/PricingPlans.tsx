"use client"

import { useState } from "react"
import { PRICING_TIERS, TierId } from "@/lib/pricing"

interface PricingPlansProps {
    onSelect: (tierId: TierId) => void
    currentTier?: TierId
    isLoading?: boolean
}

export default function PricingPlans({ onSelect, currentTier, isLoading }: PricingPlansProps) {
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-8">
                {(Object.values(PRICING_TIERS) as any[]).map((tier) => {
                    const isCurrent = currentTier === tier.id
                    const isRecommended = tier.recommended

                    return (
                        <div
                            key={tier.id}
                            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 mx-auto max-w-md ${isRecommended
                                ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-indigo-500 shadow-xl shadow-indigo-900/10 z-10'
                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                }`}
                        >
                            {isRecommended && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <span className="bg-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                                <p className="text-zinc-400 text-sm font-medium h-10">{tier.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                {tier.price !== null ? (
                                    <>
                                        <span className="text-4xl font-black text-white">${tier.price}</span>
                                        <span className="text-zinc-500 font-bold text-sm">/month</span>
                                    </>
                                ) : (
                                    <span className="text-4xl font-black text-white">Custom</span>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {tier.features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                                        <span className="text-indigo-500 text-lg">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => onSelect(tier.id)}
                                disabled={isLoading || isCurrent}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${isCurrent
                                    ? 'bg-zinc-800 text-zinc-500 cursor-default'
                                    : isRecommended
                                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-900/20 active:scale-[0.98]'
                                        : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98]'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                ) : isCurrent ? (
                                    "Current Plan"
                                ) : tier.price === null ? (
                                    "Contact Sales"
                                ) : (
                                    tier.price === 0 ? "Get Started" : "Choose Plan"
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
