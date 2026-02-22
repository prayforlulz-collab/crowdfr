
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const release = await prisma.release.findFirst({
        include: {
            artist: true
        }
    })

    if (!release) {
        console.log("No release found")
        return
    }

    console.log(`Release Slug: ${release.slug}`)
    console.log(`Release Title: ${release.title}`)
    console.log("Release Layout:")
    console.log(JSON.stringify(release.layout, null, 2))

    console.log("\nArtist Name: " + release.artist.name)
    console.log("Artist Layout:")
    console.log(JSON.stringify(release.artist.layout, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
