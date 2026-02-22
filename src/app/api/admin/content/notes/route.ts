
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// GET - list notes for content
export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType") // "ARTIST" or "RELEASE"
    const entityId = searchParams.get("entityId")

    if (!entityType || !entityId) {
        return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 })
    }

    try {
        const notes = await prisma.adminNote.findMany({
            where: { entityType, entityId },
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json({ notes })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST - add a content note
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { entityType, entityId, content } = body

    if (!entityType || !entityId || !content?.trim()) {
        return NextResponse.json({ error: "entityType, entityId, and content are required" }, { status: 400 })
    }

    try {
        const note = await prisma.adminNote.create({
            data: {
                entityType,
                entityId,
                content: content.trim(),
                createdBy: session.user.id,
                adminEmail: session.user.email || undefined,
            },
        })

        await logAdminAction({
            action: "NOTE_ADDED",
            entityType: entityType as any,
            entityId,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
        })

        return NextResponse.json({ note })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
