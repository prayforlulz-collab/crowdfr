import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
        return NextResponse.redirect(new URL("/login?error=MissingToken", req.url))
    }

    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!verificationToken) {
        return NextResponse.redirect(new URL("/login?error=InvalidToken", req.url))
    }

    const hasExpired = new Date(verificationToken.expires) < new Date()

    if (hasExpired) {
        return NextResponse.redirect(new URL("/login?error=ExpiredToken", req.url))
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: verificationToken.identifier },
    })

    if (!existingUser) {
        return NextResponse.redirect(new URL("/login?error=EmailNotFound", req.url))
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: verificationToken.identifier
        },
    })

    await prisma.verificationToken.delete({
        where: { token },
    })

    return NextResponse.redirect(new URL("/login?verified=true", req.url))
}
