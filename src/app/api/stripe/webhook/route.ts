import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === "checkout.session.completed") {
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Metadata from checkout creation
        const organizationId = session.metadata?.organizationId
        const tierId = session.metadata?.tierId

        if (organizationId && tierId) {
            await prisma.organization.update({
                where: { id: organizationId },
                data: {
                    tier: tierId,
                    stripeSubscriptionId: subscriptionId,
                    stripeCustomerId: session.customer as string,
                    subscriptionStatus: subscription.status,
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
                }
            })
        }
    }

    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status

        // Look up organization by Stripe ID
        const org = await prisma.organization.findUnique({
            where: { stripeSubscriptionId: subscription.id }
        })

        if (org) {
            await prisma.organization.update({
                where: { id: org.id },
                data: {
                    subscriptionStatus: status,
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
                }
            })
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription

        // Downgrade to FREE
        const org = await prisma.organization.findUnique({
            where: { stripeSubscriptionId: subscription.id }
        })

        if (org) {
            await prisma.organization.update({
                where: { id: org.id },
                data: {
                    tier: "FREE",
                    subscriptionStatus: "canceled",
                    currentPeriodEnd: null
                }
            })
        }
    }

    return new NextResponse(null, { status: 200 })
}
