
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// POST - upgrade or downgrade tier
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
    const { tier } = body

    const validTiers = ["FREE", "PLAN_1", "PLAN_2"]
    if (!tier || !validTiers.includes(tier)) {
        return NextResponse.json({ error: "Invalid tier. Must be FREE, PLAN_1, or PLAN_2" }, { status: 400 })
    }

    try {
        const org = await prisma.organization.findUnique({ where: { id } })
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        const previousTier = org.tier

        await prisma.organization.update({
            where: { id },
            data: {
                tier,
                subscriptionStatus: tier === "FREE" ? null : "active",
            },
        })

        const isUpgrade = validTiers.indexOf(tier) > validTiers.indexOf(previousTier)

        await logAdminAction({
            action: isUpgrade ? "ORG_PRO_UPGRADED" : "ORG_PRO_DOWNGRADED",
            entityType: "ORGANIZATION",
            entityId: id,
            entityLabel: org.name,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
            metadata: { previousTier, newTier: tier },
        })

        return NextResponse.json({
            message: `Organization tier changed from ${previousTier} to ${tier}`,
            tier,
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
