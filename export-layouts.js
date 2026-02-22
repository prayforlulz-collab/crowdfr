
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

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

    console.log(`Exporting layouts for: ${release.title} (${release.slug})`)

    const releaseLayout = typeof release.layout === 'string' ? JSON.parse(release.layout) : release.layout
    const artistLayout = typeof release.artist.layout === 'string' ? JSON.parse(release.artist.layout) : release.artist.layout

    fs.writeFileSync('release-layout.json', JSON.stringify(releaseLayout, null, 2))
    fs.writeFileSync('artist-layout.json', JSON.stringify(artistLayout, null, 2))

    console.log("Done.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
