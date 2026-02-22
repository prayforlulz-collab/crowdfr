
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"
import crypto from "crypto"
import { logAdminAction } from "@/lib/audit-log"

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
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        const newPassword = crypto.randomBytes(8).toString("hex")
        const hashedPassword = await hash(newPassword, 12)

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        })

        await logAdminAction({
            action: "USER_PASSWORD_RESET",
            entityType: "USER",
            entityId: id,
            entityLabel: user.email || user.name || id,
            performedBy: session.user.id,
            adminEmail: session.user.email || undefined,
        })

        return NextResponse.json({
            message: "Password reset successfully",
            newPassword,
        })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
