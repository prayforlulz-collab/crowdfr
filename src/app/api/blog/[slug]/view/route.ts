import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    try {
        await prisma.post.update({
            where: { slug },
            data: { views: { increment: 1 } }
        })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 })
    }
}
