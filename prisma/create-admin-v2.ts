import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    const email = 'newadmin@dropsite.com'
    const password = 'newadmin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`Creating admin user: ${email}`)

    // Ensure organization exists
    const org = await prisma.organization.upsert({
        where: { slug: 'test-records' },
        update: {},
        create: {
            name: 'Test Records',
            slug: 'test-records',
        }
    })

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            name: 'New Admin',
            email,
            password: hashedPassword,
        }
    })

    await prisma.membership.upsert({
        where: {
            userId_organizationId: {
                userId: user.id,
                organizationId: org.id
            }
        },
        update: { role: 'ADMIN' },
        create: {
            userId: user.id,
            organizationId: org.id,
            role: 'ADMIN'
        }
    })

    console.log('Admin user created successfully')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
