
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// POST - toggle disabled state
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        const org = await prisma.organization.findUnique({ where: { id } })
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        const newStatus = !org.isDeleted

        await prisma.organization.update({
            where: { id },
            data: {
                isDeleted: newStatus,
                deletedAt: newStatus ? new Date() : null,
            },
        })

        await logAdminAction({
            action: newStatus ? "ORG_DISABLED" : "ORG_ENABLED",
            entityType: "ORGANIZATION",
            entityId: id,
            entityLabel: org.name,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
        })

        return NextResponse.json({
            message: `Organization ${newStatus ? "disabled" : "enabled"} successfully`,
            isDeleted: newStatus,
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
