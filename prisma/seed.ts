
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- RESETTING DATABASE ---')
    await prisma.tag.deleteMany({})
    await prisma.fanSubscription.deleteMany({})
    await prisma.fan.deleteMany({})
    await prisma.release.deleteMany({})
    await prisma.artist.deleteMany({})
    await prisma.membership.deleteMany({})
    await prisma.organization.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('--- SEEDING DATABASE ---')

    const org = await prisma.organization.create({
        data: {
            name: 'Test Records',
            slug: 'test-records',
        }
    })

    const artist = await prisma.artist.create({
        data: {
            name: 'The Test Artist',
            slug: 'the-test-artist',
            organizationId: org.id,
        }
    })

    await prisma.release.create({
        data: {
            title: 'Phase 3 Test Release',
            slug: 'phase-3-test',
            artistId: artist.id,
            layout: [
                {
                    id: 'hero-1',
                    type: 'hero',
                    data: {
                        title: 'Phase 3 Test Release',
                        subtitle: 'Testing the Fan Engine'
                    }
                },
                {
                    id: 'capture-1',
                    type: 'email_capture',
                    data: {
                        ctaText: 'Test the Fan Engine',
                        successMessage: 'Signup successful! Simulation email "sent".'
                    }
                }
            ]
        }
    })

    console.log('--- SEEDING COMPLETE ---')
    console.log('URL to test: http://localhost:3000/r/phase-3-test')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
