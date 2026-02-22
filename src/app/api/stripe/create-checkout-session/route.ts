import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getTier } from "@/lib/pricing"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { organizationId, tierId } = await req.json()

        if (!organizationId || !tierId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        // Verify user owns/administers the organization
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
            return NextResponse.json({ message: "Unauthorized to manage billing" }, { status: 403 })
        }

        const org = membership.organization
        const targetTier = getTier(tierId)

        if (!targetTier) {
            return NextResponse.json({ message: "Invalid tier" }, { status: 400 })
        }

        // If trying to switch to free tier, handle that separately (downgrade)
        if (targetTier.price === 0) {
            return NextResponse.json({ message: "Use billing portal to cancel subscription" }, { status: 400 })
        }

        const priceId = targetTier.stripePriceId || "price_H5ggYmf5g"

        // If organization already has a stripe customer ID, use it
        let customerId = org.stripeCustomerId

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: session.user.email || undefined,
                name: org.name,
                metadata: {
                    organizationId: org.id
                }
            })
            customerId = customer.id

            await prisma.organization.update({
                where: { id: org.id },
                data: { stripeCustomerId: customerId }
            })
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/settings/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/settings/billing?canceled=true`,
            subscription_data: {
                metadata: {
                    organizationId: org.id,
                    tierId: targetTier.id
                }
            },
            metadata: {
                organizationId: org.id,
                tierId: targetTier.id
            }
        })

        if (!checkoutSession.url) {
            return NextResponse.json({ message: "Failed to create checkout session" }, { status: 500 })
        }

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error("Stripe checkout error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
