
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import UserList from "@/components/admin/UserList"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)

    const users = await prisma.user.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
            isSuspended: true,
            isDeleted: true,
            _count: {
                select: { memberships: true }
            },
        },
    })

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">User Management</h1>
                    <p className="text-zinc-400">Manage all users registered on the platform.</p>
                </div>
            </header>

            <UserList initialUsers={users} />
        </div>
    )
}
