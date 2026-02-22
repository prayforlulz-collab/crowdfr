import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// Map specific phrases to link inter-blog
const INTERNAL_LINKS = {
    'landing page builder': '/blog/best-landing-page-builders-for-artists-2026-why-aesthetics-aren-t-enough',
    'landing pages': '/blog/best-landing-page-builders-for-artists-2026-why-aesthetics-aren-t-enough',
    'smart link tools': '/blog/best-smart-link-tools-for-musicians-2026-beyond-the-link-in-bio',
    'best smart links': '/blog/best-smart-link-tools-for-musicians-2026-beyond-the-link-in-bio',
    'email marketing': '/blog/email-marketing-for-musicians-the-2026-fan-ownership-guide',
    'fan email list': '/blog/how-to-build-a-fan-email-list-as-an-artist-the-2026-growth-guide',
    'build a mailing list': '/blog/how-to-build-a-fan-email-list-as-an-artist-the-2026-growth-guide',
    'launch a single': '/blog/how-to-launch-a-single-independently-in-2026-the-ownership-blueprint',
    'meta ads': '/blog/meta-ads-for-music-promotion-the-2026-conversion-guide',
    'facebook ads': '/blog/meta-ads-for-music-promotion-the-2026-conversion-guide',
    'music marketing funnel': '/blog/music-marketing-funnel-explained-how-to-turn-scrollers-into-superfans',
    'marketing funnel': '/blog/music-marketing-funnel-explained-how-to-turn-scrollers-into-superfans',
    'smart link vs': '/blog/smart-link-vs',
    'spotify ads': '/blog/spotify-ads-for-musicians-the-complete-2026-guide-stop-buying-streams-start-buying-fans',
    'what is a smart link': '/blog/what-is-a-smart-link-for-music-the-2026-reality-check',
}

const CTA_BLOCK = `

---

### Ready to Build Your Fan Empire?
Stop relying on borrowed audiences and algorithmic timelines. Build a home for your music that you actually own. 

[👉 Start building your Crowdfr page for free today!](/)

*Want to learn more? Check out our [Full 2026 Guide to Music Marketing](/blog/music-marketing-funnel-explained-how-to-turn-scrollers-into-superfans).*
`

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function processInternalLinks(content: string, currentSlug: string) {
    let newContent = content;
    const addedLinks = new Set<string>();
    addedLinks.add('/blog/' + currentSlug); // Prevent linking to itself

    // Sort keywords from longest to shortest to avoid replacing sub-words
    const keywords = Object.keys(INTERNAL_LINKS).sort((a, b) => b.length - a.length);

    for (const keyword of keywords) {
        const url = INTERNAL_LINKS[keyword as keyof typeof INTERNAL_LINKS];
        if (addedLinks.has(url)) continue; // Keep unique links

        // Match keyword not inside a markdown link already
        const regex = new RegExp(`(?<!\\[)(?:\\b)(${keyword})(?:\\b)(?!\\]\\()`, 'i');

        if (regex.test(newContent)) {
            newContent = newContent.replace(regex, `[$1](${url})`);
            addedLinks.add(url);
        }
    }

    return newContent;
}

function removeListNumbers(content: string) {
    // Replaces matches like "1. ", "12. " at start of the string or newline, with "- "
    return content.replace(/^(\s*)\d+\.\s+/gm, '$1- ');
}

async function main() {
    const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!adminUser) {
        console.error('No admin user found. Please create one first or the posts will have no author.');
        process.exit(1);
    }

    const blogDir = path.join(__dirname, '../src/content/blog')
    const imgDir = path.join(__dirname, '../public/images/blog')

    const files = await fs.readdir(blogDir)
    const images = await fs.readdir(imgDir)

    // Optional: Delete existing posts if we want a fully clean slate
    await prisma.post.deleteMany({});

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const baseTitle = file.replace('.md', '').trim();
        let rawTitle = baseTitle;
        const slug = generateSlug(rawTitle);

        // Fix underscores which were probably question marks or colons in the original file name
        rawTitle = rawTitle.replace(/_/g, '?');

        if (rawTitle === "Smart Link vs?") {
            rawTitle = "Smart Link vs Landing Pages";
        } else if (rawTitle === "Smart Link vs") {
            rawTitle = "Smart Link vs Landing Pages";
        }

        let content = await fs.readFile(path.join(blogDir, file), 'utf-8');

        // Exact match instead of substring just to be safe. But some might have punctuation differences.
        // Let's check if the image starts precisely with the baseTitle.
        // Removing "_" or standardizing can help, but if the user named them properly, it should match directly.
        let imageFile = images.find(img => img.startsWith(baseTitle));

        // Fallback: substring matching just in case of weird characters in image naming
        if (!imageFile) {
            const prefix = baseTitle.substring(0, 15);
            imageFile = images.find(img => img.startsWith(prefix));
        }

        const coverImageUrl = imageFile ? `/images/blog/${imageFile}` : null;

        // Process Content
        content = removeListNumbers(content);
        content = processInternalLinks(content, slug);
        content += CTA_BLOCK;

        // Create excerpt
        const excerptMatch = content.match(/^([^#].*)/m);
        const excerpt = excerptMatch ? excerptMatch[0].substring(0, 160) + '...' : rawTitle;

        // Save to DB
        await prisma.post.upsert({
            where: { slug },
            update: {
                title: rawTitle,
                content: content,
                coverImage: coverImageUrl,
                excerpt: excerpt,
                published: true, // Auto publish
            },
            create: {
                title: rawTitle,
                slug,
                content: content,
                coverImage: coverImageUrl,
                excerpt: excerpt,
                published: true,
                authorId: adminUser.id,
            }
        });

        console.log(`✅ Imported: ${rawTitle} ${imageFile ? '(with image)' : '(no image)'}`);
    }

    console.log('All posts imported successfully!');
}

main().catch(e => {
    console.error(e)
    process.exit(1)
}).finally(() => {
    prisma.$disconnect()
})
