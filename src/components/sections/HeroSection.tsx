"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface HeroSectionProps {
    data: {
        title: string
        subtitle?: string
        coverImage?: string
        variant?: 'centered' | 'split' | 'full-screen'
        releaseDate?: string
    }
}

function Countdown({ date }: { date: string }) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

    useEffect(() => {
        const target = new Date(date).getTime()
        const update = () => {
            const now = new Date().getTime()
            const diff = target - now
            if (diff <= 0) { setTimeLeft(null); return }
            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            })
        }
        update()
        const timer = setInterval(update, 1000)
        return () => clearInterval(timer)
    }, [date])

    if (!timeLeft) return null

    return (
        <div className="py-12 px-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Available In</span>
            </div>

            <div className="flex gap-4 md:gap-10 justify-center">
                {[
                    { label: 'Days', value: timeLeft.d },
                    { label: 'Hours', value: timeLeft.h },
                    { label: 'Minutes', value: timeLeft.m },
                    { label: 'Seconds', value: timeLeft.s },
                ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className={`relative ${unit.label === 'Seconds' ? 'animate-pulse' : ''}`}>
                            <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                                {String(unit.value).padStart(2, '0')}
                            </span>
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mt-2">{unit.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function HeroSection({ data }: HeroSectionProps) {
    const [isReleased, setIsReleased] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (data.releaseDate) {
            setIsReleased(new Date(data.releaseDate).getTime() <= new Date().getTime())
        } else {
            setIsReleased(true)
        }
    }, [data.releaseDate])

    const variant = data.variant || 'centered'

    if (variant === 'full-screen') {
        return (
            <section className={`relative w-full h-screen flex flex-col items-center justify-center text-center bg-black text-white overflow-hidden transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                {data.coverImage && (
                    <Image
                        src={data.coverImage}
                        alt=""
                        fill
                        className="object-cover opacity-60"
                        priority
                        sizes="100vw"
                    />
                )}
                <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 to-transparent h-1/3" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase leading-none bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(255,255,255,0.1)]">
                        {data.title}
                    </h1>
                    {data.subtitle && (
                        <p className="text-lg sm:text-xl md:text-3xl font-light text-zinc-200 tracking-widest uppercase">
                            {data.subtitle}
                        </p>
                    )}
                    {data.releaseDate && !isReleased && <Countdown date={data.releaseDate} />}
                </div>
            </section>
        )
    }

    if (variant === 'split') {
        return (
            <section className={`relative w-full py-12 px-6 bg-black text-white overflow-hidden transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="order-2 md:order-1 text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
                            {data.title}
                        </h1>
                        {data.subtitle && (
                            <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-lg mx-auto md:mx-0">
                                {data.subtitle}
                            </p>
                        )}
                        {data.releaseDate && !isReleased && <Countdown date={data.releaseDate} />}
                    </div>
                    <div className="order-1 md:order-2">
                        {data.coverImage && (
                            <div className="relative w-full aspect-square max-w-md mx-auto group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 via-transparent to-indigo-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <Image
                                    src={data.coverImage}
                                    alt={data.title}
                                    fill
                                    className="rounded-lg shadow-2xl object-cover relative z-10"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        )
    }

    // Default centered layout
    return (
        <section className={`relative w-full py-12 px-6 flex flex-col items-center text-center bg-black text-white overflow-hidden transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {data.coverImage && (
                <div className="absolute inset-0 pointer-events-none">
                    <Image
                        src={data.coverImage}
                        alt=""
                        fill
                        className="object-cover opacity-20 blur-2xl scale-110"
                        sizes="100vw"
                    />
                </div>
            )}
            <div className="relative z-10 max-w-4xl mx-auto">
                {data.coverImage && (
                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto mb-10 group">
                        <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 via-transparent to-indigo-500/30 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <Image
                            src={data.coverImage}
                            alt={data.title}
                            fill
                            className="rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] object-cover relative z-10 transition-transform duration-700 group-hover:scale-[1.02]"
                            priority
                            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
                        />
                    </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight">
                    {data.title}
                </h1>
                {data.subtitle && (
                    <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto">
                        {data.subtitle}
                    </p>
                )}
                {data.releaseDate && !isReleased && <Countdown date={data.releaseDate} />}
            </div>
        </section>
    )
}
