
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - full org detail
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                memberships: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true },
                        },
                    },
                },
                _count: {
                    select: { artists: true, fans: true },
                },
            },
        })

        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        const actionHistory = await prisma.auditLog.findMany({
            where: { entityType: "ORGANIZATION", entityId: id },
            orderBy: { createdAt: "desc" },
            take: 20,
        })

        const notes = await prisma.adminNote.findMany({
            where: { entityType: "ORGANIZATION", entityId: id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ organization: org, actionHistory, notes })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
