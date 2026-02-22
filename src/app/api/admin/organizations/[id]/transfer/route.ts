
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// POST - transfer ownership to another member
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
    const { newOwnerId } = body

    if (!newOwnerId) {
        return NextResponse.json({ error: "newOwnerId is required" }, { status: 400 })
    }

    try {
        const org = await prisma.organization.findUnique({ where: { id } })
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        // Find current owner
        const currentOwner = await prisma.membership.findFirst({
            where: { organizationId: id, role: "OWNER" },
        })

        // Verify new owner is a member
        const newOwnerMembership = await prisma.membership.findFirst({
            where: { organizationId: id, userId: newOwnerId },
        })

        if (!newOwnerMembership) {
            return NextResponse.json({ error: "Target user is not a member of this organization" }, { status: 400 })
        }

        // Demote current owner to ADMIN
        if (currentOwner) {
            await prisma.membership.update({
                where: { id: currentOwner.id },
                data: { role: "ADMIN" },
            })
        }

        // Promote new owner
        await prisma.membership.update({
            where: { id: newOwnerMembership.id },
            data: { role: "OWNER" },
        })

        await logAdminAction({
            action: "ORG_OWNERSHIP_TRANSFERRED",
            entityType: "ORGANIZATION",
            entityId: id,
            entityLabel: org.name,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
            metadata: { newOwnerId, previousOwnerId: currentOwner?.userId },
        })

        return NextResponse.json({ message: "Ownership transferred successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
