export type TierId = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface TierLimits {
    artists: number // -1 for unlimited
    releases: number // -1 for unlimited
    fans: number // -1 for unlimited
    campaigns: number // -1 for unlimited
    emailsPerMonth: number // -1 for unlimited
}

export interface PricingTier {
    id: TierId
    name: string
    description: string
    price: number | null
    stripePriceId: string
    limits: TierLimits
    features: string[]
    recommended?: boolean
}

export const PRICING_TIERS: Partial<Record<TierId, PricingTier>> = {
    FREE: {
        id: "FREE",
        name: "Free",
        description: "Everything you need to get started",
        price: 0,
        stripePriceId: "",
        limits: {
            artists: 1,
            releases: 3,
            fans: 1000,
            campaigns: 1,
            emailsPerMonth: 100,
        },
        features: ["1 Artist Profile", "3 Releases", "1,000 Fans", "Basic Analytics"],
    },
    /*
    PRO: {
        id: "PRO",
        name: "Pro",
        description: "For growing independent artists",
        price: 29,
        stripePriceId: "price_PRO_PLACEHOLDER", // To be replaced with env var or actual ID
        limits: {
            artists: 3,
            releases: -1, // unlimited
            fans: 5000,
            campaigns: -1,
            emailsPerMonth: 10000,
        },
        features: ["3 Artist Profiles", "Unlimited Releases", "5,000 Fans", "Email Campaigns", "Advanced Analytics"],
        recommended: true,
    },
    ENTERPRISE: {
        id: "ENTERPRISE",
        name: "Label",
        description: "For labels and management",
        price: null,
        stripePriceId: "price_ENTERPRISE_PLACEHOLDER", // To be replaced with env var or actual ID
        limits: {
            artists: -1,
            releases: -1,
            fans: -1,
            campaigns: -1,
            emailsPerMonth: -1,
        },
        features: ["Unlimited Artists", "Unlimited Everything", "Priority Support", "White-label", "Team Access"],
    },
    */
}

export const DEFAULT_TIER = PRICING_TIERS.FREE!

export function getTier(tierId: string | null | undefined): PricingTier {
    return (tierId && PRICING_TIERS[tierId as TierId]) || PRICING_TIERS.FREE!
}
