"use client"

export default function Loading() {
    return (
        <div className="min-h-screen bg-black animate-pulse">
            {/* Hero skeleton */}
            <div className="relative w-full py-12 px-6 flex flex-col items-center text-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-zinc-900 rounded-lg mx-auto mb-10" />
                <div className="h-10 md:h-14 w-3/4 max-w-md bg-zinc-900 rounded-lg mb-4" />
                <div className="h-6 w-1/2 max-w-xs bg-zinc-900/60 rounded-lg" />
            </div>

            {/* Links skeleton */}
            <div className="w-full py-10 px-6">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[72px] bg-zinc-900 rounded-2xl border border-white/5" />
                    ))}
                </div>
            </div>

            {/* Tracklist skeleton */}
            <div className="w-full py-12 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between mb-8">
                        <div className="h-4 w-20 bg-zinc-900 rounded" />
                        <div className="h-4 w-16 bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 bg-zinc-900/40 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
