"use client"

import Image from "next/image"

interface BioSectionProps {
    data: {
        title?: string
        content: string
        imageUrl?: string
        variant?: 'centered' | 'split' | 'image-left'
    }
}

export default function BioSection({ data }: BioSectionProps) {
    const variant = data.variant || 'centered'

    if (variant === 'split' || variant === 'image-left') {
        return (
            <section className="w-full py-20 px-6 bg-zinc-950 text-white overflow-hidden">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className={`${variant === 'split' ? 'order-2' : 'order-1'}`}>
                        {data.imageUrl && (
                            <div className="relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 group">
                                <Image
                                    src={data.imageUrl}
                                    alt={data.title || 'Artist'}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        )}
                    </div>
                    <div className={`${variant === 'split' ? 'order-1 text-right' : 'order-2 text-left'}`}>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 max-w-lg">
                            {data.title || 'Biography'}
                        </h3>
                        <div className="prose prose-invert prose-lg text-zinc-400 leading-relaxed">
                            {data.content.split('\n').map((paragraph, i) => (
                                <p key={i} className="mb-4">{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // Default centered
    return (
        <section className="w-full py-24 px-6 bg-zinc-950 text-white">
            <div className="max-w-3xl mx-auto text-center">
                {data.imageUrl && (
                    <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto mb-8 overflow-hidden border-4 border-zinc-800 group">
                        <Image
                            src={data.imageUrl}
                            alt={data.title || 'Artist'}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 128px, 192px"
                        />
                    </div>
                )}
                <h3 className="text-3xl font-bold uppercase tracking-widest mb-8 text-zinc-500">
                    {data.title || 'About'}
                </h3>
                <div className="prose prose-invert prose-xl text-zinc-300 mx-auto">
                    {data.content.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-6">{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    )
}
