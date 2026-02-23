"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function AdminPostsPage() {
    const { data: session } = useSession()
    const [posts, setPosts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/admin/posts")
            const data = await res.json()
            setPosts(data)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const deletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return
        try {
            await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
            setPosts(posts.filter(p => p.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    if (isLoading) return <div className="text-zinc-500">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Blog Posts</h1>
                    <p className="text-zinc-500 mt-1">Manage public blog articles</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Post
                </Link>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Views</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {posts.map(post => (
                            <tr key={post.id} className="hover:bg-zinc-800/20 transition-colors">
                                <td className="px-6 py-4 font-bold">{post.title}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-400">{post.author?.name || post.authorId}</td>
                                <td className="px-6 py-4 text-zinc-400 font-mono">{post.views?.toLocaleString() || 0}</td>
                                <td className="px-6 py-4 text-zinc-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/posts/${post.id}`} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => deletePost(post.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                        No posts found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}
