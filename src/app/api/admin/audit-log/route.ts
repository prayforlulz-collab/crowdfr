
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - paginated audit log with filters
export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const action = searchParams.get("action")
    const performedBy = searchParams.get("performedBy")
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (action) where.action = { contains: action }
    if (performedBy) where.performedBy = performedBy

    try {
        const entries = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit + 1, // Fetch one extra for pagination
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        })

        const hasMore = entries.length > limit
        const items = hasMore ? entries.slice(0, limit) : entries

        return NextResponse.json({
            entries: items,
            nextCursor: hasMore ? items[items.length - 1].id : null,
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
