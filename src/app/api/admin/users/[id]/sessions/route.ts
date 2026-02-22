
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// GET - list sessions for a user
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
        const sessions = await prisma.session.findMany({
            where: { userId: id },
            orderBy: { expires: "desc" },
        })

        return NextResponse.json({ sessions })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// DELETE - revoke all sessions (force logout)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const result = await prisma.session.deleteMany({
            where: { userId: id },
        })

        await logAdminAction({
            action: "USER_SESSIONS_REVOKED",
            entityType: "USER",
            entityId: id,
            entityLabel: user.email || user.name || id,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
            metadata: { sessionsRevoked: result.count },
        })

        return NextResponse.json({
            message: `Revoked ${result.count} sessions`,
            count: result.count,
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
