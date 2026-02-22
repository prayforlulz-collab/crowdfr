"use client"
import { use, useEffect } from "react"
import PostEditor from "@/components/admin/PostEditor"

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <PostEditor postId={id} />
}
