import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fanId = searchParams.get("fanId"); // Optional now
    const releaseId = searchParams.get("releaseId");
    const redirectUrl = searchParams.get("redirectUrl");

    if (!releaseId) {
        return NextResponse.json({ error: "Missing releaseId" }, { status: 400 });
    }

    const stateObj = { fanId, releaseId, redirectUrl };
    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");
    const scope = "user-library-modify user-read-email";
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/spotify/callback`;

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(authUrl);
}
