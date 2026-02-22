import { sendFanSubscriptionConfirmation } from "./mail-service";
import { prisma } from "./prisma";

export async function createFan(data: {
    email: string;
    name?: string;
    phone?: string;
    country?: string;
    organizationId: string;
    releaseId: string;
}) {
    const { email, name, phone, country, organizationId, releaseId } = data;

    // 1. Create or update the Fan record
    let fan;
    try {
        // Find existing fan
        fan = await (prisma.fan as any).findUnique({
            where: {
                email_organizationId: {
                    email,
                    organizationId,
                },
            },
        });

        if (fan) {
            // Update existing
            fan = await (prisma.fan as any).update({
                where: { id: fan.id },
                data: {
                    name: name || undefined,
                    phone: phone || undefined,
                    country: country || undefined,
                    updatedAt: new Date(),
                },
            });

        } else {
            // Create new
            fan = await (prisma.fan as any).create({
                data: {
                    email,
                    name,
                    phone,
                    country,
                    organizationId,
                },
            });

        }
    } catch (e: any) {
        console.error(`[createFan] Fan operation failed: ${e.message}`, e);
        throw e;
    }

    // 2. Create or update the FanSubscription for this release
    let subscription = null;
    if (releaseId && releaseId !== "") {
        try {
            subscription = await prisma.fanSubscription.upsert({
                where: {
                    fanId_releaseId: {
                        fanId: fan.id,
                        releaseId,
                    },
                },
                update: {
                    updatedAt: new Date(),
                },
                create: {
                    fanId: fan.id,
                    releaseId,
                    status: "PENDING",
                },
                include: {
                    release: {
                        include: {
                            artist: true
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Subscription failed (likely invalid releaseId for artist page):", e);
        }
    }

    // 3. Send verification email
    if (subscription) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verificationUrl = `${baseUrl}/api/fans/verify?id=${subscription.id}`;

        try {
            await sendFanSubscriptionConfirmation(
                email,
                verificationUrl,
                subscription.release?.artist?.name || "the artist",
                subscription.release?.title || "new release"
            );
        } catch (e) {
            console.error("Failed to send verification email:", e);
        }
    }

    return { fan, subscription };
}

export async function verifySubscription(subscriptionId: string) {
    return await prisma.fanSubscription.update({
        where: { id: subscriptionId },
        data: {
            status: "ACTIVE",
            updatedAt: new Date(),
        },
        include: {
            release: true,
            fan: true,
        },
    });
}

export async function getFansByOrganization(organizationId: string) {
    return await prisma.fan.findMany({
        where: { organizationId },
        include: {
            subscriptions: {
                include: {
                    release: true,
                },
            },
            tags: true,
        },
    });
}

export async function addTagToFan(fanId: string, tagName: string, organizationId: string) {
    return await prisma.fan.update({
        where: { id: fanId },
        data: {
            tags: {
                connectOrCreate: {
                    where: {
                        name_organizationId: {
                            name: tagName,
                            organizationId,
                        },
                    },
                    create: {
                        name: tagName,
                        organizationId,
                    },
                },
            },
        },
        include: {
            tags: true,
            subscriptions: {
                include: { release: true }
            }
        }
    });
}

export async function removeTagFromFan(fanId: string, tagId: string) {
    return await prisma.fan.update({
        where: { id: fanId },
        data: {
            tags: {
                disconnect: { id: tagId }
            }
        },
        include: {
            tags: true,
            subscriptions: {
                include: { release: true }
            }
        }
    });
}

export async function getFanById(fanId: string) {
    return await prisma.fan.findUnique({
        where: { id: fanId },
        include: {
            subscriptions: {
                include: { release: true },
                orderBy: { createdAt: 'desc' }
            },
            tags: true,
            organization: true
        }
    });
}
