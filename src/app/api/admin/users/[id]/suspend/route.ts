
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    if (id === session.user.id) {
        return NextResponse.json({ message: "Cannot suspend your own account" }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        const newStatus = !user.isSuspended

        await prisma.user.update({
            where: { id },
            data: { isSuspended: newStatus },
        })

        await logAdminAction({
            action: newStatus ? "USER_SUSPENDED" : "USER_ACTIVATED",
            entityType: "USER",
            entityId: id,
            entityLabel: user.email || user.name || id,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
        })

        return NextResponse.json({
            message: `User ${newStatus ? "suspended" : "activated"} successfully`,
            isSuspended: newStatus,
        })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
