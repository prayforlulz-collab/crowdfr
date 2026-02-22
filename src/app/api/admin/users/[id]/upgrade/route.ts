
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        // Find user's owned organization
        const membership = await prisma.membership.findFirst({
            where: {
                userId: id,
                role: "OWNER"
            },
            include: { organization: true }
        })

        if (!membership) {
            return NextResponse.json({ message: "User does not own any organization" }, { status: 400 })
        }

        // Upgrade to PRO
        await prisma.organization.update({
            where: { id: membership.organizationId },
            data: {
                tier: "PRO",
                // Optionally set subscription status to active override
                subscriptionStatus: "active_admin_override",
                stripeSubscriptionId: "sub_admin_override_" + Date.now()
            }
        })

        return NextResponse.json({
            message: `Organization ${membership.organization.name} upgraded to PRO`
        })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
