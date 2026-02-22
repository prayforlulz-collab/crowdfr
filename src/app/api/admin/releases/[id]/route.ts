
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    try {
        await prisma.release.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: "Release deleted" })
    } catch (error) {
        console.error("Error deleting release:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
