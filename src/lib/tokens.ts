import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function generateVerificationToken(email: string) {
    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 Hour

    const existingToken = await prisma.verificationToken.findFirst({
        where: { identifier: email }
    })

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token
                }
            }
        })
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    })

    return verificationToken
}

export async function getVerificationTokenByToken(token: string) {
    try {
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        })

        return verificationToken
    } catch {
        return null
    }
}

export async function getVerificationTokenByEmail(email: string) {
    try {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { identifier: email }
        })

        return verificationToken
    } catch {
        return null
    }
}
