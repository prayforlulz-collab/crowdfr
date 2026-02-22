import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        // Find the user's organization
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (!membership) {
            // If no organization yet, return empty list (or could create one, but GET conceptually shouldn't mutate)
            return NextResponse.json([])
        }

        const artists = await prisma.artist.findMany({
            where: { organizationId: membership.organizationId },
            orderBy: { updatedAt: 'desc' }
        })

        return NextResponse.json(artists)
    } catch (error) {
        console.error("Error fetching artists:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, bio, imageUrl } = body

        if (!name) {
            return NextResponse.json({ message: "Artist name is required" }, { status: 400 })
        }

        // Find the user's organization first to check limits
        let membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (!membership) {
            // Logic below handles creating new org if missing, but we can't check limits without an org.
            // For new users/orgs, limits won't be hit immediately, so we can proceed.
            // However, the current flow attempts to find membership later. Let's rely on that flow checks.
        } else {
            // Check tier limits
            const { canCreateArtist } = await import("@/lib/tier-enforcement")
            const allowed = await canCreateArtist(membership.organizationId)

            if (!allowed) {
                return NextResponse.json({
                    message: "Artist limit reached for your current plan. Please upgrade to add more artists.",
                    code: "LIMIT_REACHED"
                }, { status: 403 })
            }
        }

        // Generate unique slug from name
        const { generateUniqueSlug } = await import("@/lib/utils/slugs")
        const slug = await generateUniqueSlug(name, "artist")

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
            console.error("Failed to resolve membership after creation attempt")
            return NextResponse.json({ message: "Failed to resolve organization" }, { status: 500 })
        }

        // Fetch user details to get links
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { links: true }
        })

        let defaultLayout = "[]"
        if (user?.links) {
            try {
                const links = JSON.parse(user.links)
                if (Object.values(links).some(v => v)) {
                    // Create default links section
                    const linksSection = {
                        id: `section-${Date.now()}`,
                        type: "links",
                        data: {
                            spotify: links.spotify,
                            appleMusic: links.apple, // Mapped from apple to appleMusic
                            instagram: links.instagram,
                            // Map website to otherLinks if present
                            otherLinks: links.website ? [{ label: "Website", url: links.website }] : []
                        }
                    }
                    defaultLayout = JSON.stringify([linksSection])
                }
            } catch (e) {
                console.error("Failed to parse user links for artist creation", e)
            }
        }



        const artist = await prisma.artist.create({
            data: {
                name,
                slug,
                bio: bio || undefined,
                imageUrl: imageUrl || undefined,
                organizationId: membership.organizationId,
                createdById: session.user.id,
                layout: defaultLayout
            },
        })


        return NextResponse.json(artist, { status: 201 })
    } catch (error) {
        console.error("Error creating artist:", error)
        return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 })
    }
}
