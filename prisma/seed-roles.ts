import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log('--- SEEDING ROLES AND TIERS ---')

    const password = await bcrypt.hash('password123', 10)

    const users = [
        {
            email: 'global.admin@dropsite.com',
            name: 'Global Admin',
            role: 'ADMIN',
            orgName: 'Admin Org',
            tier: 'FREE' // Admins might not need a tier, or FREE by default
        },
        {
            email: 'customer.free@dropsite.com',
            name: 'Free Tier Customer',
            role: 'USER',
            orgName: 'Free Tier Records',
            tier: 'FREE'
        },
        {
            email: 'customer.plan1@dropsite.com',
            name: 'Plan 1 Customer',
            role: 'USER',
            orgName: 'Plan 1 Records',
            tier: 'PLAN_1'
        },
        {
            email: 'customer.plan2@dropsite.com',
            name: 'Plan 2 Customer',
            role: 'USER',
            orgName: 'Plan 2 Records',
            tier: 'PLAN_2'
        },
    ]

    for (const u of users) {
        console.log(`Creating ${u.name}...`)

        // Create/Update Organization
        const orgSlug = u.orgName.toLowerCase().replace(/ /g, '-')
        const org = await prisma.organization.upsert({
            where: { slug: orgSlug },
            update: { tier: u.tier },
            create: {
                name: u.orgName,
                slug: orgSlug,
                tier: u.tier
            }
        })

        // Create/Update User
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role, password },
            create: {
                name: u.name,
                email: u.email,
                role: u.role,
                password
            }
        })

        // Link User to Org
        await prisma.membership.upsert({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId: org.id
                }
            },
            update: { role: 'ADMIN' }, // Every user is an ADMIN of their own org
            create: {
                userId: user.id,
                organizationId: org.id,
                role: 'ADMIN'
            }
        })
    }

    console.log('--- SEEDING COMPLETE ---')
    console.log('Credentials (password: password123):')
    users.forEach(u => console.log(`- ${u.name}: ${u.email} [${u.role} / ${u.tier}]`))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
