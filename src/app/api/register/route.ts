import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail-service"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // emailVerified is null by default
            },
        })

        // Generate verification token
        try {
            const verificationToken = await generateVerificationToken(email)
            // Send verification email
            await sendVerificationEmail(email, verificationToken.token, name)
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError)
            // We don't throw here so the user creation still succeeds
            // They just won't get the email if the API keys are missing/invalid
        }

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name },
            message: "User created successfully. (Note: Email service may be limited during setup)"
        }, { status: 201 })
    } catch (error) {
        console.error("Registration error details:", error)
        return NextResponse.json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
