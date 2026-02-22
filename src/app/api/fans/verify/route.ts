import { NextRequest, NextResponse } from "next/server";
import { verifySubscription } from "@/lib/fans";
import { trackEvent } from "@/lib/analytics";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Subscription ID is required" },
                { status: 400 }
            );
        }

        const subscription = await verifySubscription(id);

        // Track verification event
        await trackEvent({
            eventType: 'fan_verified',
            releaseId: subscription.releaseId,
            fanId: subscription.fanId,
            organizationId: subscription.fan.organizationId,
            eventData: {
                subscriptionId: subscription.id
            }
        });

        // Redirect back to the release page with a success flag
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUrl = new URL(`/r/${subscription.release.slug}`, baseUrl);
        redirectUrl.searchParams.set("verified", "true");

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error) {
        console.error("Error verifying subscription:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
