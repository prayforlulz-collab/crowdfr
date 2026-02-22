"use client"

import { Mail } from 'lucide-react'

interface ContactSectionProps {
    data: {
        title?: string
        email: string
        label?: string
    }
}

export default function ContactSection({ data }: ContactSectionProps) {
    return (
        <section className="w-full py-24 px-6 bg-black text-white border-t border-zinc-900">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 bg-gradient-to-r from-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                    {data.title || 'Contact'}
                </h3>
                <a
                    href={`mailto:${data.email}`}
                    className="inline-flex items-center gap-3 text-xl md:text-3xl font-medium transition-colors group relative"
                >
                    <Mail className="w-8 h-8 md:w-10 md:h-10 group-hover:text-purple-400 transition-colors" />
                    <span className="relative">
                        {data.email}
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 group-hover:w-full transition-all duration-500" />
                    </span>
                </a>
                {data.label && (
                    <p className="mt-4 text-zinc-500 uppercase tracking-widest text-sm">
                        {data.label}
                    </p>
                )}
            </div>
        </section>
    )
}
