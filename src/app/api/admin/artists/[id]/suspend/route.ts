
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
        const artist = await prisma.artist.findUnique({ where: { id } })
        if (!artist) {
            return NextResponse.json({ message: "Artist not found" }, { status: 404 })
        }

        const newStatus = !artist.isSuspended

        await prisma.artist.update({
            where: { id },
            data: { isSuspended: newStatus }
        })

        return NextResponse.json({
            message: `Artist ${newStatus ? 'suspended' : 'restored'}`,
            isSuspended: newStatus
        })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
