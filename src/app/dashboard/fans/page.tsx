import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getFansByOrganization } from "@/lib/fans"
import Link from "next/link"
import FansDashboard from "@/components/fans/FansDashboard"

export default async function FansPage() {
    const session = await getServerSession(authOptions)
    if (!session) return <div>Unauthorized</div>

    // For now, find the first organization. 
    // In a real app, this would be the user's active organization.
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: { include: { organization: true } } }
    })

    const organization = user?.memberships[0]?.organization

    if (!organization) {
        return (
            <div className="p-8">
                <h1 className="text-4xl font-black mb-4">Fans</h1>
                <p className="text-zinc-500">No organization found for your user. Please set up an organization first.</p>
            </div>
        )
    }

    const fans = await getFansByOrganization(organization.id)

    // Calculate simple stats
    const stats = {
        totalFans: fans.length,
        activeSubscribers: fans.filter(f => f.subscriptions.some(s => s.status === 'ACTIVE')).length,
        newThisWeek: fans.filter(f => {
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
            return f.createdAt > oneWeekAgo
        }).length
    }

    return (
        <FansDashboard
            initialFans={fans}
            organizationId={organization.id}
            stats={stats}
        />
    )
}
