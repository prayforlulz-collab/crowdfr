import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('music.apple.com')) {
            return NextResponse.json({ error: 'Invalid Apple Music URL' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch Apple Music page' }, { status: 500 });
        }

        const html = await response.text();

        // Find JSON-LD script tags
        const ldJsonPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
        let match;
        const results = [];

        while ((match = ldJsonPattern.exec(html)) !== null) {
            try {
                const data = JSON.parse(match[1].trim());
                results.push(data);
            } catch (e) {
                // Ignore invalid JSON
            }
        }

        // Find the MusicAlbum type
        const albumData = results.find(item =>
            item['@type'] === 'MusicAlbum' ||
            (Array.isArray(item['@graph']) && item['@graph'].some((g: any) => g['@type'] === 'MusicAlbum'))
        );

        if (!albumData) {
            return NextResponse.json({ error: 'Could not find album metadata on page' }, { status: 404 });
        }

        const album = albumData['@type'] === 'MusicAlbum' ? albumData : albumData['@graph'].find((g: any) => g['@type'] === 'MusicAlbum');

        const rawTracks = album.track?.itemListElement || album.tracks || [];

        // Try to get release date from مختلف places
        const releaseDate = album.datePublished || album.releaseDate || (results.find(r => r.datePublished)?.datePublished);

        const extracted = {
            title: album.name,
            artist: album.byArtist?.name || album.byArtist?.[0]?.name,
            coverImage: album.image,
            releaseDate: releaseDate,
            tracks: rawTracks.map((item: any) => {
                const track = item.item || item;
                const trackUrl = track.url || '';
                // Extract track ID from end of URL
                const id = trackUrl.split('/').pop()?.split('?')[0];
                return {
                    title: track.name,
                    duration: track.duration, // ISO 8601
                    url: trackUrl,
                    appleMusicTrackId: id
                };
            })
        };

        return NextResponse.json(extracted);
    } catch (error: any) {
        console.error('Apple Music Import Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
