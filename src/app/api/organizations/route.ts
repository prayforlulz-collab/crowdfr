import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const memberships = await prisma.membership.findMany({
            where: { userId: session.user.id },
            include: { organization: true }
        })

        const organizations = memberships.map(m => m.organization)

        return NextResponse.json(organizations)
    } catch (error) {
        console.error("Error fetching organizations:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { name, slug } = await req.json()

        if (!name || !slug) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        const existingOrg = await prisma.organization.findUnique({
            where: { slug },
        })

        if (existingOrg) {
            return NextResponse.json({ message: "Organization slug already exists" }, { status: 400 })
        }

        const organization = await prisma.organization.create({
            data: {
                name,
                slug,
                memberships: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER",
                    },
                },
            },
        })

        return NextResponse.json(organization, { status: 201 })
    } catch (error) {
        console.error("Organization creation error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
