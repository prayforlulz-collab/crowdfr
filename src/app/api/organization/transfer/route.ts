import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// POST /api/organization/transfer — transfer ownership to another member
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { newOwnerUserId } = body

        if (!newOwnerUserId) {
            return NextResponse.json({ error: "New owner user ID is required" }, { status: 400 })
        }

        // Verify current user is OWNER
        const currentMembership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
        })

        if (!currentMembership || currentMembership.role !== "OWNER") {
            return NextResponse.json({ error: "Only the owner can transfer ownership" }, { status: 403 })
        }

        // Verify the target is a member of the same org
        const targetMembership = await prisma.membership.findFirst({
            where: {
                userId: newOwnerUserId,
                organizationId: currentMembership.organizationId,
            },
        })

        if (!targetMembership) {
            return NextResponse.json({ error: "User is not a member of this organization" }, { status: 400 })
        }

        // Transfer: promote target to OWNER, demote current to ADMIN
        await prisma.$transaction([
            prisma.membership.update({
                where: { id: targetMembership.id },
                data: { role: "OWNER" },
            }),
            prisma.membership.update({
                where: { id: currentMembership.id },
                data: { role: "ADMIN" },
            }),
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error transferring ownership:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}
