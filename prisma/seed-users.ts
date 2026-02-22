import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log('--- SEEDING USERS ---')

    const hashedPassword = await bcrypt.hash('admin123', 10)
    const userPassword = await bcrypt.hash('user123', 10)

    // Ensure organization exists
    const org = await prisma.organization.upsert({
        where: { slug: 'test-records' },
        update: {},
        create: {
            name: 'Test Records',
            slug: 'test-records',
        }
    })

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dropsite.com' },
        update: { password: hashedPassword },
        create: {
            name: 'Admin User',
            email: 'admin@dropsite.com',
            password: hashedPassword,
        }
    })

    await prisma.membership.upsert({
        where: {
            userId_organizationId: {
                userId: admin.id,
                organizationId: org.id
            }
        },
        update: { role: 'ADMIN' },
        create: {
            userId: admin.id,
            organizationId: org.id,
            role: 'ADMIN'
        }
    })

    // Create Regular User
    const user = await prisma.user.upsert({
        where: { email: 'user@dropsite.com' },
        update: { password: userPassword },
        create: {
            name: 'Regular User',
            email: 'user@dropsite.com',
            password: userPassword,
        }
    })

    await prisma.membership.upsert({
        where: {
            userId_organizationId: {
                userId: user.id,
                organizationId: org.id
            }
        },
        update: { role: 'VIEWER' },
        create: {
            userId: user.id,
            organizationId: org.id,
            role: 'VIEWER'
        }
    })

    console.log('--- USERS SEEDED ---')
    console.log('Admin: admin@dropsite.com / admin123')
    console.log('User: user@dropsite.com / user123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
