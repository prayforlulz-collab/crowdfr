import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail-service";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // We still return 200 to prevent email enumeration attacks
            return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent." });
        }

        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        // Clean up any old tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email }
        });

        // Create new token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires
            }
        });

        // Send email with token
        await sendPasswordResetEmail(email, token, user.name || undefined);

        return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent." });
    } catch (error) {
        console.error("[FORGOT_PASSWORD_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
