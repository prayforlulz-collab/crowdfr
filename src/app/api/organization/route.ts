import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id },
        include: { organization: true },
    })

    if (!membership) {
        return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    return NextResponse.json(membership.organization)
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id },
    })

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { name, slug, logoUrl } = body

        // Check availability of slug if changed
        // Note: Ideally we compare with current slug, but unique constraint handles conflict

        const updatedOrg = await prisma.organization.update({
            where: { id: membership.organizationId },
            data: {
                name,
                slug,
                logoUrl,
            },
        })

        return NextResponse.json(updatedOrg)
    } catch (error) {
        // Prisma error P2002 is unique constraint violation
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
        }
        console.error("Error updating organization:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}
