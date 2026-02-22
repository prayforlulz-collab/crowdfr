
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        const release = await prisma.release.findUnique({ where: { id } })
        if (!release) {
            return NextResponse.json({ message: "Release not found" }, { status: 404 })
        }

        const newStatus = !release.isSuspended

        await prisma.release.update({
            where: { id },
            data: { isSuspended: newStatus }
        })

        return NextResponse.json({
            message: `Release ${newStatus ? 'suspended' : 'restored'}`,
            isSuspended: newStatus
        })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
