
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminAction } from "@/lib/audit-log"

// POST - bulk hide/unhide
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { ids, entityType, action } = body // entityType: "artists" | "releases", action: "hide" | "unhide"

    if (!ids?.length || !entityType || !["hide", "unhide"].includes(action)) {
        return NextResponse.json({ error: "ids, entityType, and action (hide/unhide) are required" }, { status: 400 })
    }

    const isSuspended = action === "hide"

    try {
        if (entityType === "artists") {
            await prisma.artist.updateMany({
                where: { id: { in: ids } },
                data: { isSuspended },
            })
        } else {
            await prisma.release.updateMany({
                where: { id: { in: ids } },
                data: { isSuspended },
            })
        }

        await logAdminAction({
            action: isSuspended ? "CONTENT_BULK_HIDDEN" : "CONTENT_BULK_VISIBLE",
            entityType: entityType === "artists" ? "ARTIST" : "RELEASE",
            entityId: ids.join(","),
            entityLabel: `${ids.length} ${entityType}`,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
            metadata: { ids, action },
        })

        return NextResponse.json({
            message: `${ids.length} ${entityType} ${action === "hide" ? "hidden" : "made visible"}`,
            count: ids.length,
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
