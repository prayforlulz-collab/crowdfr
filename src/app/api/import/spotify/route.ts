
import { NextResponse } from 'next/server';

// Spotify API endpoints
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

async function getSpotifyAccessToken(): Promise<string> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Spotify API credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file.');
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Spotify access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

function extractSpotifyId(url: string): { type: 'track' | 'album'; id: string } | null {
    // Handles URLs like:
    // https://open.spotify.com/track/ID
    // https://open.spotify.com/album/ID
    // https://open.spotify.com/intl-pt/track/ID
    // https://open.spotify.com/intl-pt/album/ID?si=...
    const trackMatch = url.match(/spotify\.com(?:\/intl-[a-z]{2})?\/track\/([a-zA-Z0-9]+)/);
    if (trackMatch) return { type: 'track', id: trackMatch[1] };

    const albumMatch = url.match(/spotify\.com(?:\/intl-[a-z]{2})?\/album\/([a-zA-Z0-9]+)/);
    if (albumMatch) return { type: 'album', id: albumMatch[1] };

    return null;
}

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('spotify.com')) {
            return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 });
        }

        const parsed = extractSpotifyId(url);
        if (!parsed) {
            return NextResponse.json({ error: 'Could not parse Spotify URL. Please use a track or album link.' }, { status: 400 });
        }

        const accessToken = await getSpotifyAccessToken();
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        const tracks: any[] = [];
        let albumTitle = '';
        let albumCover = '';

        if (parsed.type === 'track') {
            // Fetch single track
            const res = await fetch(`${SPOTIFY_API_BASE}/tracks/${parsed.id}`, { headers });
            if (!res.ok) {
                return NextResponse.json({ error: 'Track not found on Spotify' }, { status: 404 });
            }
            const track = await res.json();

            albumTitle = track.album?.name || track.name;
            albumCover = track.album?.images?.[0]?.url || '';

            tracks.push({
                title: track.name,
                duration: formatDuration(track.duration_ms),
                spotifyTrackId: track.id,
                spotifyTrackUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
                track_number: track.track_number || 1,
                duration_ms: track.duration_ms,
            });

        } else if (parsed.type === 'album') {
            // Fetch album metadata
            const albumRes = await fetch(`${SPOTIFY_API_BASE}/albums/${parsed.id}`, { headers });
            if (!albumRes.ok) {
                return NextResponse.json({ error: 'Album not found on Spotify' }, { status: 404 });
            }
            const album = await albumRes.json();

            albumTitle = album.name;
            albumCover = album.images?.[0]?.url || '';

            // Album response includes tracks (first 50)
            let allTracks = album.tracks?.items || [];

            // If there are more tracks (albums with 50+ tracks), paginate
            let nextUrl = album.tracks?.next;
            while (nextUrl) {
                const nextRes = await fetch(nextUrl, { headers });
                if (!nextRes.ok) break;
                const nextData = await nextRes.json();
                allTracks = [...allTracks, ...(nextData.items || [])];
                nextUrl = nextData.next;
            }

            allTracks.forEach((track: any) => {
                tracks.push({
                    title: track.name,
                    duration: formatDuration(track.duration_ms),
                    spotifyTrackId: track.id,
                    spotifyTrackUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
                    track_number: track.track_number,
                    duration_ms: track.duration_ms,
                });
            });
        }

        return NextResponse.json({
            title: albumTitle,
            coverImage: albumCover,
            tracks,
        });

    } catch (error: any) {
        console.error('Spotify Import Error:', error);

        // Give a helpful message if it's a credentials issue
        if (error.message?.includes('credentials not configured')) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
