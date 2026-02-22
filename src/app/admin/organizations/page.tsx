
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import OrgList from "@/components/admin/OrgList"

export default async function OrganizationsPage() {
    const session = await getServerSession(authOptions)

    const organizations = await prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { memberships: true, artists: true },
            },
        },
    })

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Organization Management</h1>
                <p className="text-zinc-400">Manage organizations, subscriptions, and memberships.</p>
            </header>

            <OrgList initialOrgs={organizations} />
        </div>
    )
}
