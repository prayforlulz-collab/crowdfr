"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { useSession } from "next-auth/react"

export default function PostEditor({ postId }: { postId?: string }) {
    const router = useRouter()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(!!postId)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        coverImage: "",
        published: false
    })
    const [error, setError] = useState("")

    useEffect(() => {
        if (postId) {
            fetchPost()
        }
    }, [postId])

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/admin/posts/${postId}`)
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setFormData({
                title: data.title || "",
                slug: data.slug || "",
                content: data.content || "",
                excerpt: data.excerpt || "",
                coverImage: data.coverImage || "",
                published: data.published || false
            })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSaving(true)

        try {
            const url = postId ? `/api/admin/posts/${postId}` : "/api/admin/posts"
            const method = postId ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to save")

            router.push("/admin/posts")
            router.refresh()
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value
        if (!postId && !formData.slug) {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            setFormData({ ...formData, title, slug })
        } else {
            setFormData({ ...formData, title })
        }
    }

    if (isLoading) return <div className="text-zinc-500">Loading...</div>

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/posts" className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">{postId ? 'Edit Post' : 'New Post'}</h1>
                    <p className="text-zinc-500 mt-1">Manage blog content</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Title <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Post title..."
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Slug <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="url-friendly-slug"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cover Image URL</label>
                        <input
                            type="url"
                            value={formData.coverImage}
                            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Excerpt</label>
                        <textarea
                            rows={2}
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                            placeholder="Brief summary..."
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Content (Markdown) <span className="text-red-500">*</span></label>
                        <textarea
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
                            placeholder="# Heading 1&#10;Write your content in markdown format..."
                        />
                    </div>

                    <div className="col-span-2 flex items-center justify-between pt-6 border-t border-zinc-800">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.published}
                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.published ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.published ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">Publish immediately</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-white text-black px-6 py-3 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
