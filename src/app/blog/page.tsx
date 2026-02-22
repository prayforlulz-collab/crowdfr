import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Blog - CrowdFR",
    description: "Read the latest news and updates from CrowdFR.",
}

export default async function BlogPage() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } }
    })

    return (
        <div className="min-h-screen bg-black text-white font-sans py-24">
            <div className="max-w-4xl mx-auto px-6">
                <div className="space-y-4 mb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">The Blog</h1>
                    <p className="text-zinc-400 text-lg">News, updates, and stories from CrowdFR.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                            <article className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col hover:border-zinc-700 transition-colors">
                                {post.coverImage && (
                                    <div className="w-full h-48 bg-zinc-800 overflow-hidden">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mt-2 mb-3 group-hover:text-purple-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="text-zinc-400 text-sm line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </article>
                        </Link>
                    ))}

                    {posts.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <p className="text-zinc-500">No posts published yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
