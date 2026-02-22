import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, artistName, layout, coverImage } = body

        if (!title || !artistName) {
            return NextResponse.json({ message: "Title and artist name are required" }, { status: 400 })
        }

        // Find the user's organization first to check limits
        const membershipCheck = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (membershipCheck) {
            // Check tier limits
            const { canCreateRelease } = await import("@/lib/tier-enforcement")
            const allowed = await canCreateRelease(membershipCheck.organizationId)

            if (!allowed) {
                return NextResponse.json({
                    message: "Release limit reached for your current plan. Please upgrade to add more releases.",
                    code: "LIMIT_REACHED"
                }, { status: 403 })
            }
        }

        // Generate slug from title
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        const slug = `${baseSlug}-${Date.now().toString(36)}`

        // Find or create the user's organization
        let membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (!membership) {
            // Auto-create a personal organization
            const org = await prisma.organization.create({
                data: {
                    name: session.user.name || "My Label",
                    slug: `org-${Date.now().toString(36)}`,
                    memberships: {
                        create: {
                            userId: session.user.id,
                            role: "OWNER",
                        },
                    },
                },
            })
            membership = await prisma.membership.findFirst({
                where: { userId: session.user.id, organizationId: org.id },
                include: { organization: true },
            })
        }

        if (!membership) {
            return NextResponse.json({ message: "Failed to resolve organization" }, { status: 500 })
        }

        // Find or create the artist
        const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        let artist = await prisma.artist.findFirst({
            where: {
                organizationId: membership.organizationId,
                name: artistName,
            },
        })

        if (!artist) {
            artist = await prisma.artist.create({
                data: {
                    name: artistName,
                    slug: `${artistSlug}-${Date.now().toString(36)}`,
                    organizationId: membership.organizationId,
                },
            })
        }

        // Create the release
        const release = await prisma.release.create({
            data: {
                title,
                slug,
                artistId: artist.id,
                layout: layout ? JSON.stringify(layout) : undefined,
                coverImage: coverImage || undefined,
                createdById: session.user.id,
            },
            include: {
                artist: true,
            },
        })

        return NextResponse.json(release, { status: 201 })
    } catch (error) {
        console.error("Error creating release:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
