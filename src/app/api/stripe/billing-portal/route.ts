import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { organizationId } = await req.json()

        const membership = await prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId
                }
            },
            include: { organization: true }
        })

        if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const org = membership.organization

        if (!org.stripeCustomerId) {
            return NextResponse.json({ message: "No billing account found" }, { status: 400 })
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: org.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/settings/billing`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error("Stripe portal error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
