
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// GET - Full user profile with memberships, sessions, action history
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
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                memberships: {
                    include: {
                        organization: {
                            select: { id: true, name: true, slug: true, tier: true }
                        }
                    }
                },
                sessions: {
                    orderBy: { expires: "desc" },
                    take: 10,
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Fetch action history for this user
        const actionHistory = await prisma.auditLog.findMany({
            where: { entityType: "USER", entityId: id },
            orderBy: { createdAt: "desc" },
            take: 20,
        })

        // Fetch admin notes for this user
        const notes = await prisma.adminNote.findMany({
            where: { entityType: "USER", entityId: id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ user, actionHistory, notes })
    } catch (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// DELETE - Soft delete user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id: targetUserId } = await params

    if (targetUserId === session.user.id) {
        return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: targetUserId } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Soft delete
        await prisma.user.update({
            where: { id: targetUserId },
            data: { isDeleted: true, deletedAt: new Date() },
        })

        await logAdminAction({
            action: "USER_DELETED",
            entityType: "USER",
            entityId: targetUserId,
            entityLabel: user.email || user.name || targetUserId,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
        })

        return NextResponse.json({ success: true, message: "User soft-deleted" })
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
