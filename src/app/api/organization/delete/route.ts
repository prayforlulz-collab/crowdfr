import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// DELETE /api/organization/delete — soft delete the organization (owner only)
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { confirmation } = body

        // Verify current user is OWNER
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (!membership || membership.role !== "OWNER") {
            return NextResponse.json({ error: "Only the owner can delete the organization" }, { status: 403 })
        }

        if (confirmation !== membership.organization.name) {
            return NextResponse.json({ error: "Please type the organization name to confirm deletion" }, { status: 400 })
        }

        // Soft delete
        await prisma.organization.update({
            where: { id: membership.organizationId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting organization:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}
