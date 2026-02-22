
import { prisma } from "@/lib/prisma"

/**
 * Generates a unique slug for a given table and column.
 * If the base slug exists, appends a short random suffix.
 */
export async function generateUniqueSlug(
    baseName: string,
    model: 'artist' | 'release' | 'organization'
): Promise<string> {
    const baseSlug = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    // Check if the base slug is available
    let existing;
    if (model === 'artist') {
        existing = await prisma.artist.findUnique({ where: { slug: baseSlug } });
    } else if (model === 'release') {
        existing = await prisma.release.findUnique({ where: { slug: baseSlug } });
    } else if (model === 'organization') {
        existing = await prisma.organization.findUnique({ where: { slug: baseSlug } });
    }

    if (!existing) {
        return baseSlug;
    }

    // If it exists, append a random suffix
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `${baseSlug}-${randomSuffix}`;
}
