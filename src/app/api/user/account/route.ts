import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// DELETE /api/user/account — soft delete the user's account
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { confirmation } = body

        if (confirmation !== session.user.email) {
            return NextResponse.json({ error: "Please type your email to confirm deletion" }, { status: 400 })
        }

        // Check if user is the sole OWNER of any organization
        const ownerships = await prisma.membership.findMany({
            where: { userId: session.user.id, role: "OWNER" },
            include: {
                organization: {
                    include: {
                        memberships: { where: { role: "OWNER" } }
                    }
                }
            }
        })

        const soleOwnerOrgs = ownerships.filter(o => o.organization.memberships.length === 1)
        if (soleOwnerOrgs.length > 0) {
            const orgNames = soleOwnerOrgs.map(o => o.organization.name).join(", ")
            return NextResponse.json({
                error: `You are the sole owner of: ${orgNames}. Transfer ownership or delete these organizations first.`
            }, { status: 400 })
        }

        // Soft delete
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                isSuspended: true,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting account:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}
