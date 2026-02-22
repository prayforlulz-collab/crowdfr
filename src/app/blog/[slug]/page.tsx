import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post || !post.published) return { title: "Not Found" }

    return {
        title: `${post.title} - CrowdFR Blog`,
        description: post.excerpt || post.title,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            images: post.coverImage ? [post.coverImage] : [],
        },
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await prisma.post.findUnique({
        where: { slug },
        include: { author: { select: { name: true } } }
    })

    if (!post || !post.published) notFound()

    return (
        <div className="min-h-screen bg-black text-white font-sans py-24">
            <div className="max-w-3xl mx-auto px-6">
                <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-12">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                <article className="space-y-8">
                    <header className="space-y-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-500">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>&bull;</span>
                            <span>{post.author?.name || 'CrowdFR Staff'}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
                            {post.title}
                        </h1>
                    </header>

                    {post.coverImage && (
                        <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="prose prose-invert prose-purple max-w-none mx-auto pt-8">
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-black uppercase tracking-tighter mt-12 mb-6" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-black uppercase tracking-tighter mt-10 mb-5" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-black uppercase tracking-tighter mt-8 mb-4" {...props} />,
                                p: ({ node, ...props }) => <p className="text-zinc-300 leading-relaxed mb-6" {...props} />,
                                a: ({ node, ...props }) => <a className="text-purple-400 hover:text-purple-300 underline underline-offset-4 font-bold" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6 text-zinc-300" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-6 text-zinc-300" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-500 pl-4 py-1 my-6 text-zinc-400 italic bg-purple-500/5 rounded-r-lg" {...props} />,
                                code: ({ node, inline, className, children, ...props }: any) => {
                                    return inline ? (
                                        <code className="bg-zinc-800 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 my-6 overflow-x-auto">
                                            <code className="text-sm font-mono text-zinc-300" {...props}>
                                                {children}
                                            </code>
                                        </div>
                                    )
                                },
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </article>
            </div>
        </div>
    )
}
