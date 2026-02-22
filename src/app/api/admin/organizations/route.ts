
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - list all organizations with counts
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const orgs = await prisma.organization.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { memberships: true, artists: true },
                },
            },
        })

        return NextResponse.json({ organizations: orgs })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
