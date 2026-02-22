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
    })

    if (!membership) {
        return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const members = await prisma.membership.findMany({
        where: { organizationId: membership.organizationId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    })

    const formattedMembers = members.map((m) => ({
        id: m.id,
        role: m.role,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
    }))

    return NextResponse.json(formattedMembers)
}

export async function POST(request: Request) {
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
        const { email, role } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const validRoles = ["VIEWER", "EDITOR", "ADMIN"]
        const assignedRole = validRoles.includes(role) ? role : "VIEWER"

        // Non-owners cannot invite admins
        if (assignedRole === "ADMIN" && membership.role !== "OWNER") {
            return NextResponse.json({ error: "Only the owner can assign the Admin role" }, { status: 403 })
        }

        const userToAdd = await prisma.user.findUnique({
            where: { email },
        })

        if (!userToAdd) {
            return NextResponse.json({ error: "User not found. They must register first." }, { status: 404 })
        }

        const existingMembership = await prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId: userToAdd.id,
                    organizationId: membership.organizationId,
                },
            },
        })

        if (existingMembership) {
            return NextResponse.json({ error: "User is already a member" }, { status: 400 })
        }

        const newMembership = await prisma.membership.create({
            data: {
                userId: userToAdd.id,
                organizationId: membership.organizationId,
                role: assignedRole,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        })

        return NextResponse.json({
            id: newMembership.id,
            role: newMembership.role,
            userId: newMembership.userId,
            name: newMembership.user.name,
            email: newMembership.user.email,
            image: newMembership.user.image,
        })

    } catch (error) {
        console.error("Error adding member:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}

// PATCH — update a member's role
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentMembership = await prisma.membership.findFirst({
        where: { userId: session.user.id },
    })

    if (!currentMembership || (currentMembership.role !== "OWNER" && currentMembership.role !== "ADMIN")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { membershipId, newRole } = body

        if (!membershipId || !newRole) {
            return NextResponse.json({ error: "Membership ID and new role are required" }, { status: 400 })
        }

        const validRoles = ["VIEWER", "EDITOR", "ADMIN"]
        if (!validRoles.includes(newRole)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        // Only owners can promote to admin
        if (newRole === "ADMIN" && currentMembership.role !== "OWNER") {
            return NextResponse.json({ error: "Only the owner can assign the Admin role" }, { status: 403 })
        }

        const targetMembership = await prisma.membership.findUnique({
            where: { id: membershipId },
        })

        if (!targetMembership || targetMembership.organizationId !== currentMembership.organizationId) {
            return NextResponse.json({ error: "Membership not found" }, { status: 404 })
        }

        // Cannot change owner's role
        if (targetMembership.role === "OWNER") {
            return NextResponse.json({ error: "Cannot change the owner's role. Use transfer ownership instead." }, { status: 400 })
        }

        // If demoting the last admin to a lower role, block it
        if (targetMembership.role === "ADMIN" && newRole !== "ADMIN") {
            const adminCount = await prisma.membership.count({
                where: {
                    organizationId: currentMembership.organizationId,
                    role: { in: ["ADMIN", "OWNER"] }
                }
            })
            if (adminCount <= 1) {
                return NextResponse.json({ error: "Cannot remove the last admin. Promote another member first." }, { status: 400 })
            }
        }

        await prisma.membership.update({
            where: { id: membershipId },
            data: { role: newRole },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating member role:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const membershipId = url.searchParams.get("id")

    if (!membershipId) {
        return NextResponse.json({ error: "Membership ID required" }, { status: 400 })
    }

    const currentMembership = await prisma.membership.findFirst({
        where: { userId: session.user.id },
    })

    if (!currentMembership || (currentMembership.role !== "OWNER" && currentMembership.role !== "ADMIN")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const targetMembership = await prisma.membership.findUnique({
        where: { id: membershipId },
    })

    if (!targetMembership || targetMembership.organizationId !== currentMembership.organizationId) {
        return NextResponse.json({ error: "Membership not found" }, { status: 404 })
    }

    // Cannot remove the owner
    if (targetMembership.role === "OWNER") {
        return NextResponse.json({ error: "Cannot remove the organization owner" }, { status: 400 })
    }

    // Non-owners cannot remove admins
    if (targetMembership.role === "ADMIN" && currentMembership.role !== "OWNER") {
        return NextResponse.json({ error: "Only the owner can remove admins" }, { status: 403 })
    }

    try {
        await prisma.membership.delete({
            where: { id: membershipId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error removing member:", error)
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
    }
}
