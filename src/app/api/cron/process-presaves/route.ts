import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ensure this matches your CRON_SECRET configured in Vercel for security
const CRON_SECRET = process.env.CRON_SECRET || "development-secret";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");

    // In production, Vercel sets this authorization header for Cron Jobs
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find all pending pre-saves for releases that have dropped
        const pendingPreSaves = await prisma.preSave.findMany({
            where: {
                status: "PENDING",
                release: {
                    releaseDate: {
                        lte: new Date()
                    }
                }
            },
            include: {
                fan: {
                    include: {
                        connections: true
                    }
                },
                release: true
            }
        });

        if (pendingPreSaves.length === 0) {
            return NextResponse.json({ message: "No pending presaves to process" });
        }

        const results = {
            processed: 0,
            success: 0,
            failed: 0,
            details: [] as any[]
        };

        for (const presave of pendingPreSaves) {
            results.processed++;

            try {
                if (presave.platform === "spotify") {
                    const connection = presave.fan.connections.find(c => c.platform === "spotify");

                    if (!connection || !connection.refreshToken) {
                        throw new Error("Missing Spotify connection or refresh token for Fan");
                    }

                    let accessToken = connection.accessToken;

                    // Refresh token if expired
                    if (!connection.expiresAt || connection.expiresAt < new Date()) {
                        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
                            },
                            body: new URLSearchParams({
                                grant_type: "refresh_token",
                                refresh_token: connection.refreshToken,
                            }),
                        });

                        const tokenData = await tokenResponse.json();

                        // If token refresh fails, mark connection and presave as failed
                        if (tokenData.error) {
                            throw new Error(`Token refresh failed: ${tokenData.error_description}`);
                        }

                        accessToken = tokenData.access_token;

                        // Update connection with new token
                        await prisma.fanConnection.update({
                            where: { id: connection.id },
                            data: {
                                accessToken: accessToken,
                                expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
                            }
                        });
                    }

                    // Extract Spotify ID from Release Links
                    const layout = typeof presave.release.layout === 'string' ? JSON.parse(presave.release.layout) : presave.release.layout || [];
                    let spotifyUrl = null;

                    // Search layout blocks for a streaming links section with Spotify URL
                    for (const section of layout as any[]) {
                        if (section.type === "links" && section.data?.links) {
                            const spotifyLink = section.data.links.find((l: any) => l.platform === 'spotify');
                            if (spotifyLink && spotifyLink.url) {
                                spotifyUrl = spotifyLink.url;
                                break;
                            }
                        } else if (section.type === "links" && section.data?.spotify) {
                            spotifyUrl = section.data.spotify;
                            break;
                        }
                    }

                    if (!spotifyUrl) {
                        throw new Error("Release missing Spotify URL in Links section");
                    }

                    const isAlbum = spotifyUrl.includes("album");
                    const isTrack = spotifyUrl.includes("track");
                    const idMatch = spotifyUrl.match(/(?:album|track)\/([a-zA-Z0-9]+)/);
                    const spotifyId = idMatch ? idMatch[1] : null;

                    if (!spotifyId) {
                        throw new Error("Could not parse Spotify ID from URL");
                    }

                    // Call Spotify API to add to library
                    const endpoint = isAlbum ? "https://api.spotify.com/v1/me/albums" : "https://api.spotify.com/v1/me/tracks";
                    const saveResponse = await fetch(`${endpoint}?ids=${spotifyId}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (!saveResponse.ok) {
                        const err = await saveResponse.text();
                        throw new Error(`Spotify API save failed: ${err}`);
                    }

                    // Success - update status
                    await prisma.preSave.update({
                        where: { id: presave.id },
                        data: { status: "COMPLETED", errorMessage: null }
                    });

                    results.success++;
                    results.details.push({ id: presave.id, status: "COMPLETED" });

                } else if (presave.platform === "apple-music") {
                    throw new Error("Apple Music not fully configured yet.");
                }

            } catch (err: any) {
                const message = err.message || "Unknown error";

                await prisma.preSave.update({
                    where: { id: presave.id },
                    data: { status: "FAILED", errorMessage: message }
                });

                results.failed++;
                results.details.push({ id: presave.id, status: "FAILED", error: message });
            }
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error("Cron Processing Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
