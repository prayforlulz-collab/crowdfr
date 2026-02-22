import { NextRequest, NextResponse } from "next/server";
import { createFan } from "@/lib/fans";

function getCountryFromRequest(req: NextRequest): string | undefined {
    // 1. Vercel / Cloudflare automatically provide country headers
    const vercelCountry = req.headers.get("x-vercel-ip-country");
    if (vercelCountry && vercelCountry !== "XX") return vercelCountry;

    const cfCountry = req.headers.get("cf-ipcountry");
    if (cfCountry && cfCountry !== "XX") return cfCountry;

    // 2. Fallback: use geoip-lite for self-hosted / local dev
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;

    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
        try {
            // Dynamic import to avoid issues if geoip-lite isn't available
            const geoip = require("geoip-lite");
            const geo = geoip.lookup(ip);
            if (geo?.country) return geo.country;
        } catch {
            // geoip-lite not available, skip
        }
    }

    return undefined;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name, phone, organizationId, releaseId } = body;

        if (!email || !organizationId) {
            return NextResponse.json(
                { error: "Email and organizationId are required" },
                { status: 400 }
            );
        }

        // Auto-detect country from IP if not explicitly provided
        const country = body.country || getCountryFromRequest(req);

        const result = await createFan({
            email,
            name,
            phone,
            country,
            organizationId,
            releaseId: releaseId || "",
        });

        return NextResponse.json(
            { message: "Fan captured successfully", result },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error capturing fan:", error);
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
                code: error.code,
                meta: error.meta
            },
            { status: 500 }
        );
    }
}
