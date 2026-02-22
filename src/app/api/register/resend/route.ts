import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail-service"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // We return 200 even if user not found to prevent email enumeration
            return NextResponse.json({ message: "Verification email sent if account exists" })
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: "Email is already verified" }, { status: 400 })
        }

        // Generate verification token
        try {
            const verificationToken = await generateVerificationToken(email)
            // Send verification email
            await sendVerificationEmail(email, verificationToken.token, user.name || undefined)
        } catch (emailError) {
            console.error("Failed to resend verification email:", emailError)
            return NextResponse.json({ message: "Failed to send email. Please try again later." }, { status: 500 })
        }

        return NextResponse.json({
            message: "Verification email sent"
        }, { status: 200 })
    } catch (error) {
        console.error("Resend verification error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
