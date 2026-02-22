import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCategoryStats } from "@/lib/sendgrid"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await params

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        })

        if (!campaign) {
            return NextResponse.json({ message: "Campaign not found" }, { status: 404 })
        }

        // Fetch stats from SendGrid using the campaign ID as the category
        // We look back to when the campaign was created
        const startDate = new Date(campaign.createdAt).toISOString().split('T')[0]
        const stats = await getCategoryStats(campaign.id, startDate)

        // Map SendGrid stats to our model
        // SendGrid returns an array of daily stats. We aggregate them.
        let metrics = {
            processed: 0,
            delivered: 0,
            opens: 0,
            uniqueOpens: 0,
            clicks: 0,
            uniqueClicks: 0,
            bounces: 0,
            blocks: 0,
            spamReports: 0,
            unsubscribes: 0
        }

        if (stats && stats.length > 0) {
            stats.forEach((day: any) => {
                day.stats.forEach((stat: any) => {
                    const s = stat.metrics
                    metrics.processed += s.processed || 0
                    metrics.delivered += s.delivered || 0
                    metrics.opens += s.opens || 0
                    metrics.uniqueOpens += s.unique_opens || 0
                    metrics.clicks += s.clicks || 0
                    metrics.uniqueClicks += s.unique_clicks || 0
                    metrics.bounces += s.bounces || 0
                    metrics.blocks += s.blocks || 0
                    metrics.spamReports += s.spam_reports || 0
                    metrics.unsubscribes += s.unsubscribes || 0
                })
            })

            // Update local DB with latest metrics for caching/fast viewing
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: metrics
            })
        }

        return NextResponse.json({ ...campaign, ...metrics, rawStats: stats })
    } catch (error) {
        console.error("Error fetching campaign stats:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
