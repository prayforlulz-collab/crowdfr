import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/sendgrid"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
        })

        if (!membership) {
            return NextResponse.json([])
        }

        const campaigns = await prisma.campaign.findMany({
            where: { organizationId: membership.organizationId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(campaigns)
    } catch (error) {
        console.error("Error fetching campaigns:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { subject, content, type, category, scheduledAt } = body

        if (!subject || !content) {
            return NextResponse.json({ message: "Subject and content are required" }, { status: 400 })
        }

        // Resolve organization
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true }
        })

        if (!membership) {
            return NextResponse.json({ message: "Organization not found" }, { status: 404 })
        }

        // Check tier limits
        const { canSendCampaign } = await import("@/lib/tier-enforcement")
        const allowed = await canSendCampaign(membership.organizationId)

        if (!allowed) {
            return NextResponse.json({
                message: "Campaign limit reached for your current plan. Please upgrade to send more campaigns.",
                code: "LIMIT_REACHED"
            }, { status: 403 })
        }

        const isScheduled = !!scheduledAt && new Date(scheduledAt) > new Date()
        const status = isScheduled ? "SCHEDULED" : "SENDING"

        // 1. Create campaign record
        const campaign = await prisma.campaign.create({
            data: {
                subject,
                content,
                type,
                category,
                status,
                scheduledAt: isScheduled ? new Date(scheduledAt) : null,
                organizationId: membership.organizationId
            }
        })

        if (isScheduled) {
            // In a real app, a cron job or worker would pick this up at scheduledAt
            // For now, we just mark it as SCHEDULED and return.
            // SendGrid's send_at can also handle this if we send the request now.
            // Let's implement the actual SendGrid schedule if requested.

            // Fetch all fans to get total count for scheduling
            const fans = await prisma.fan.findMany({
                where: { organizationId: membership.organizationId }
            })

            if (fans.length > 0) {
                const sendAtUnix = Math.floor(new Date(scheduledAt).getTime() / 1000)
                const fromName = membership.organization.name || "Crowdfr"
                const fromEmail = "updates@mg.crowdfr.com"

                // We'll send individual scheduled requests (or one batch if fans count is low)
                // For simplicity and to use SendGrid's scheduler:
                for (const fan of fans) {
                    await sendEmail({
                        to: fan.email,
                        toName: fan.name || undefined,
                        from: fromEmail,
                        fromName: fromName,
                        subject: subject,
                        html: content,
                        sendAt: sendAtUnix,
                        campaignId: campaign.id
                    })
                }
            }

            return NextResponse.json({ ...campaign, message: "Campaign scheduled successfully." })
        }

        // 2. Immediate sending logic
        const fans = await prisma.fan.findMany({
            where: { organizationId: membership.organizationId }
        })

        if (fans.length === 0) {
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: "SENT", sentAt: new Date() }
            })
            return NextResponse.json({ ...campaign, status: "SENT", message: "No fans to send to." })
        }



        let successCount = 0
        let failCount = 0

        const fromName = membership.organization.name || "Crowdfr"
        const fromEmail = "updates@mg.crowdfr.com"

        for (const fan of fans) {
            try {
                await sendEmail({
                    to: fan.email,
                    toName: fan.name || undefined,
                    from: fromEmail,
                    fromName: fromName,
                    subject: subject,
                    html: content,
                    campaignId: campaign.id
                })
                successCount++
            } catch (err) {
                console.error(`Failed to send email to ${fan.email}:`, err)
                failCount++
            }
        }

        const finalStatus = failCount === 0 ? "SENT" : (successCount > 0 ? "SENT_WITH_ERRORS" : "FAILED")

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
                status: finalStatus,
                sentAt: new Date(),
                processed: fans.length,
                delivered: successCount // Initial delivered count, usually updated via webhooks later
            }
        })

        return NextResponse.json({
            ...updatedCampaign,
            metrics: { total: fans.length, success: successCount, failed: failCount }
        })

    } catch (error) {
        console.error("Error creating/sending campaign:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
