
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// GET - list notes for an org
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        const notes = await prisma.adminNote.findMany({
            where: { entityType: "ORGANIZATION", entityId: id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ notes })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST - add a note
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    try {
        const note = await prisma.adminNote.create({
            data: {
                entityType: "ORGANIZATION",
                entityId: id,
                content: content.trim(),
                createdBy: session.user.id,
                adminEmail: session.user.email || undefined,
            },
        })

        await logAdminAction({
            action: "NOTE_ADDED",
            entityType: "ORGANIZATION",
            entityId: id,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
        })

        return NextResponse.json({ note })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
