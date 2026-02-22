"use client"

import { useState } from "react"
import { ShoppingBag } from 'lucide-react'
import Image from "next/image"

interface MerchItem {
    id: string
    name: string
    price: string
    imageUrl: string
    buyUrl: string
    soldOut?: boolean
}

interface MerchSectionProps {
    data: {
        title?: string
        items: MerchItem[]
        variant?: 'grid' | 'carousel' | 'link-hub'
        storeUrl?: string
        spacing?: string
    }
}

export default function MerchSection({ data }: MerchSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null)
    const variant = data.variant || 'grid'
    const spacingClass = {
        'compact': 'py-2',
        'default': 'py-6',
        'wide': 'py-12'
    }[data.spacing as 'compact' | 'default' | 'wide'] || (variant === 'link-hub' ? 'py-8' : 'py-10')

    if (variant === 'link-hub') {
        return (
            <section className={`w-full px-6 bg-black text-white ${spacingClass}`}>
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl p-6 transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ShoppingBag className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black uppercase tracking-tight text-lg">{data.title || 'Official Store'}</h3>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                    {data.items.length} {data.items.length === 1 ? 'Product' : 'Products'} Available
                                </p>
                            </div>
                        </div>
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    {isExpanded && (
                        <div className="mt-4 p-4 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {data.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="flex gap-4 items-center p-3 hover:bg-white/5 rounded-2xl transition-all text-left group/item"
                                    >
                                        <div className="relative w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-white/5">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm group-hover/item:text-white transition-colors">{item.name}</h4>
                                            <p className="text-zinc-500 text-xs font-mono">{item.price}</p>
                                        </div>
                                        <div className="hidden group-hover/item:block mr-2">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {data.storeUrl && (
                                <a
                                    href={data.storeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-center block hover:bg-zinc-200 transition-all active:scale-[0.98]"
                                >
                                    Visit Store
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Lightbox Overlay */}
                {selectedItem && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setSelectedItem(null)}
                        />
                        <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-6 right-6 z-10 p-2 bg-black/40 hover:bg-black rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="p-2">
                                <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-black">
                                    <Image
                                        src={selectedItem.imageUrl}
                                        alt={selectedItem.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, 512px"
                                    />
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedItem.name}</h3>
                                    <p className="text-xl font-mono text-zinc-400">{selectedItem.price}</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <a
                                        href={selectedItem.buyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-center hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
                                    >
                                        Buy Now
                                    </a>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="w-full py-4 text-zinc-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                                    >
                                        Back to Store
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        )
    }

    return (
        <section className={`w-full px-6 bg-black text-white ${spacingClass}`}>
            <div className="max-w-6xl mx-auto">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center">
                    {data.title || 'Official Store'}
                </h3>

                <div className={`grid gap-8 ${variant === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'flex overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide'
                    }`}>
                    {data.items.map((item) => (
                        <div
                            key={item.id}
                            className={`group relative flex flex-col ${variant === 'carousel' ? 'min-w-[280px] sm:min-w-[300px] snap-center' : ''}`}
                        >
                            <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-900 mb-4">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                {item.soldOut && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-4 py-2 rotate-12">
                                            Sold Out
                                        </span>
                                    </div>
                                )}
                                {!item.soldOut && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a
                                            href={item.buyUrl}
                                            className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                        >
                                            Buy Now
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h4 className="text-lg font-bold mb-1">{item.name}</h4>
                                <p className="text-zinc-400 font-mono">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
