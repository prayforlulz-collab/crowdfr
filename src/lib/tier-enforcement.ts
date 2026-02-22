import { prisma } from "@/lib/prisma"
import { getTier, TierId, TierLimits } from "./pricing"

export async function getOrganizationTier(organizationId: string): Promise<TierId> {
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { tier: true }
    })
    return (org?.tier as TierId) || 'FREE'
}

export function getTierLimits(tier: TierId): TierLimits {
    return getTier(tier).limits
}

export interface UsageStats {
    artists: { used: number; limit: number }
    releases: { used: number; limit: number }
    fans: { used: number; limit: number }
    campaigns: { used: number; limit: number }
    emails: { used: number; limit: number }
}

export async function getUsageStats(organizationId: string): Promise<UsageStats> {
    const tierId = await getOrganizationTier(organizationId)
    const limits = getTierLimits(tierId)

    const [artistCount, releaseCount, fanCount, campaignCount] = await Promise.all([
        prisma.artist.count({ where: { organizationId } }),
        prisma.release.count({
            where: {
                artist: { organizationId }
            }
        }),
        prisma.fan.count({ where: { organizationId } }),
        prisma.campaign.count({ where: { organizationId } })
    ])

    // Calculate emails sent this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Note: In a real implementation, we'd aggregate 'delivered' count from campaigns sent this month
    // For now, we'll just count campaigns * fanCount as a rough estimate or implement a cleaner way later
    // This is a placeholder for email usage tracking
    const emailUsage = 0

    return {
        artists: { used: artistCount, limit: limits.artists },
        releases: { used: releaseCount, limit: limits.releases },
        fans: { used: fanCount, limit: limits.fans },
        campaigns: { used: campaignCount, limit: limits.campaigns },
        emails: { used: emailUsage, limit: limits.emailsPerMonth }
    }
}

export async function canCreateArtist(organizationId: string): Promise<boolean> {
    const tierId = await getOrganizationTier(organizationId)
    const limits = getTierLimits(tierId)

    if (limits.artists === -1) return true

    const count = await prisma.artist.count({ where: { organizationId } })
    return count < limits.artists
}

export async function canCreateRelease(organizationId: string): Promise<boolean> {
    const tierId = await getOrganizationTier(organizationId)
    const limits = getTierLimits(tierId)

    if (limits.releases === -1) return true

    const count = await prisma.release.count({
        where: {
            artist: { organizationId }
        }
    })
    return count < limits.releases
}

export async function canAddFan(organizationId: string): Promise<boolean> {
    const tierId = await getOrganizationTier(organizationId)
    const limits = getTierLimits(tierId)

    if (limits.fans === -1) return true

    const count = await prisma.fan.count({ where: { organizationId } })
    return count < limits.fans
}

export async function canSendCampaign(organizationId: string): Promise<boolean> {
    const tierId = await getOrganizationTier(organizationId)
    const limits = getTierLimits(tierId)

    // Check campaign count limit if applicable (often unlimited on paid plans, but let's check)
    if (limits.campaigns !== -1) {
        const count = await prisma.campaign.count({ where: { organizationId } })
        if (count >= limits.campaigns) return false
    }

    // Email volume check would go here (complex, skipping for initial implementation)
    return true
}
