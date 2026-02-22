import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_failed`);
    }

    try {
        const decodedState = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
        const { fanId, releaseId, redirectUrl } = decodedState;

        const clientId = process.env.SPOTIFY_CLIENT_ID!;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/spotify/callback`;

        // Exchange code for token
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: new URLSearchParams({
                code,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description);
        }

        const { access_token, refresh_token, expires_in, scope, token_type } = tokenData;

        // Fetch user profile from Spotify
        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const profileData = await profileResponse.json();

        if (!profileData.email) {
            throw new Error("Spotify email is required for Pre-saves.");
        }

        // We need organizationId to create/find a Fan. We can get it from the releaseId.
        const release = await prisma.release.findUnique({
            where: { id: releaseId },
            include: { artist: true }
        });

        if (!release) throw new Error("Release not found");

        // Upsert Fan
        const fan = await prisma.fan.upsert({
            where: {
                email_organizationId: {
                    email: profileData.email,
                    organizationId: release.artist.organizationId,
                }
            },
            update: {
                name: profileData.display_name || undefined,
            },
            create: {
                email: profileData.email,
                name: profileData.display_name,
                organizationId: release.artist.organizationId,
            }
        });

        // Upsert FanConnection
        const connection = await prisma.fanConnection.upsert({
            where: { fanId_platform: { fanId: fan.id, platform: "spotify" } },
            update: {
                providerId: profileData.id,
                accessToken: access_token,
                refreshToken: refresh_token || undefined,
                expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
                scope,
                tokenType: token_type,
            },
            create: {
                fanId: fan.id,
                platform: "spotify",
                providerId: profileData.id,
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
                scope,
                tokenType: token_type,
            },
        });

        // Record PreSave intent if releaseId is provided
        if (releaseId) {
            await prisma.preSave.upsert({
                where: { fanId_releaseId_platform: { fanId: fan.id, releaseId, platform: "spotify" } },
                update: { status: "PENDING", errorMessage: null },
                create: {
                    fanId: fan.id,
                    releaseId,
                    platform: "spotify",
                    status: "PENDING",
                },
            });
        }

        const finalRedirect = redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}`;
        const finalUrlObj = new URL(finalRedirect);
        // Append a success parameter to show a success state to the fan
        finalUrlObj.searchParams.set("presave_success", "true");
        return NextResponse.redirect(finalUrlObj.toString());

    } catch (e) {
        console.error("Spotify OAuth Error:", e);
        // Safely extract error message if available
        const errorMsg = e instanceof Error ? e.message : "oauth_failed";
        const redirect = `${process.env.NEXT_PUBLIC_APP_URL}?error=${encodeURIComponent(errorMsg)}`;
        return NextResponse.redirect(redirect);
    }
}
