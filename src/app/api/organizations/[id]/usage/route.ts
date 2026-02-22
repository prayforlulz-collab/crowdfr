import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getUsageStats } from "@/lib/tier-enforcement"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // Verify membership
        const membership = await prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: id
                }
            }
        })

        if (!membership) {
            return NextResponse.json({ message: "Unauthorized access to organization" }, { status: 403 })
        }

        const stats = await getUsageStats(id)
        return NextResponse.json(stats)

    } catch (error) {
        console.error("Error fetching usage stats:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
