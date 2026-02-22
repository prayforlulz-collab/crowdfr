import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: { author: { select: { name: true, email: true } } }
        })
        return NextResponse.json(posts)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await req.json()
        const { title, slug, content, excerpt, coverImage, published } = json

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                published,
                authorId: session.user.id
            }
        })

        return NextResponse.json(post)
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }
}
