"use client"

import { MapPin } from 'lucide-react'

interface TourDate {
    date: string
    venue: string
    city: string
    ticketUrl: string
    soldOut?: boolean
}

interface TourDatesSectionProps {
    data: {
        title?: string
        dates: TourDate[]
        variant?: 'list' | 'grid' | 'minimal'
    }
}

export default function TourDatesSection({ data }: TourDatesSectionProps) {
    const variant = data.variant || 'list'

    // Find the nearest upcoming date
    const now = new Date().getTime()
    const nextUpIndex = data.dates.findIndex(d => new Date(d.date).getTime() > now && !d.soldOut)

    return (
        <section className="w-full py-12 px-6 bg-black text-white">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center">
                    {data.title || 'Tour Dates'}
                </h3>

                {variant === 'list' && (
                    <div className="space-y-4">
                        {data.dates.map((tour, index) => (
                            <div
                                key={index}
                                className={`flex flex-col sm:flex-row items-center justify-between p-5 sm:p-6 bg-zinc-900/50 border rounded-xl transition-all duration-300 gap-4 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/5 ${index === nextUpIndex
                                        ? 'border-purple-500/40 bg-purple-500/5'
                                        : 'border-zinc-900 hover:bg-zinc-900'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                                    {index === nextUpIndex && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 sm:hidden">Next Up</span>
                                    )}
                                    <div className="flex flex-col items-center sm:items-start min-w-[100px]">
                                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                            {new Date(tour.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-3xl font-black">
                                            {new Date(tour.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {index === nextUpIndex && (
                                            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full mr-2">Next Up</span>
                                        )}
                                        <div>
                                            <h4 className="text-lg sm:text-xl font-bold">{tour.venue}</h4>
                                            <div className="flex items-center gap-2 text-zinc-400 justify-center sm:justify-start">
                                                <MapPin size={16} />
                                                <span>{tour.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={tour.soldOut ? '#' : tour.ticketUrl}
                                    className={`px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all w-full sm:w-auto text-center ${tour.soldOut
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_4px_20px_-5px_rgba(255,255,255,0.2)]'
                                        }`}
                                >
                                    {tour.soldOut ? 'Sold Out' : 'Get Tickets'}
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {variant === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.dates.map((tour, index) => (
                            <div
                                key={index}
                                className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 group"
                            >
                                <span className="text-zinc-500 text-sm font-mono mb-2">
                                    {new Date(tour.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <h4 className="text-2xl font-bold mb-1">{tour.city}</h4>
                                <p className="text-zinc-400 mb-6">{tour.venue}</p>
                                <a
                                    href={tour.soldOut ? '#' : tour.ticketUrl}
                                    className={`mt-auto w-full py-3 rounded-xl font-bold uppercase text-sm transition-all ${tour.soldOut
                                        ? 'bg-zinc-800 text-zinc-500'
                                        : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98]'
                                        }`}
                                >
                                    {tour.soldOut ? 'Sold Out' : 'Tickets'}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
