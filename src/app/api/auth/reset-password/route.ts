import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!resetToken || resetToken.expires < new Date()) {
            return NextResponse.json({ error: "Invalid or expired reset link. Please request a new one." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: resetToken.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        // Hash new password using 12 rounds matching the existing system
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Clean up all reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { email: user.email! }
        });

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("[RESET_PASSWORD_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
