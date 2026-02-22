export const getEmbedUrl = (platform: 'spotify' | 'apple-music' | 'soundcloud' | 'youtube', url: string) => {
    if (platform === 'spotify') {
        // If it's a full URL, extract ID and Type
        if (url.includes('spotify.com')) {
            const id = url.split('/').pop()?.split('?')[0]
            const type = url.includes('/track/') ? 'track' : 'album'
            // The split might return empty or undefined if URL is malformed, fallback to original logic or error handling if needed
            return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
        }
        // If it's just an ID, assume it's a track
        return `https://open.spotify.com/embed/track/${url}?utm_source=generator&theme=0`
    }
    if (platform === 'apple-music') {
        // Handle raw IDs
        if (!url.includes('music.apple.com')) {
            return `https://embed.music.apple.com/us/album/song/${url}?i=${url}&theme=dark`
        }

        // Preserve existing query parameters (like ?i= for tracks) but ensure it's an embed URL
        let embedUrl = url.replace('music.apple.com', 'embed.music.apple.com')

        // Ensure theme is set to dark as requested
        const separator = embedUrl.includes('?') ? '&' : '?'
        if (!embedUrl.includes('theme=')) {
            embedUrl += `${separator}theme=dark`
        }

        return embedUrl
    }
    if (platform === 'soundcloud') {
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
    }
    if (platform === 'youtube') {
        // Handle different YouTube URL formats:
        // - https://www.youtube.com/watch?v=VIDEO_ID
        // - https://www.youtube.com/embed/VIDEO_ID
        // - https://youtu.be/VIDEO_ID

        let videoId = ''

        if (url.includes('youtube.com/embed/')) {
            // Already an embed URL, extract ID
            videoId = url.split('youtube.com/embed/')[1].split('?')[0].split('&')[0]
        } else if (url.includes('youtube.com/watch')) {
            // Watch URL with v= parameter
            const urlParams = new URLSearchParams(url.split('?')[1])
            videoId = urlParams.get('v') || ''
        } else if (url.includes('youtu.be/')) {
            // Short URL format
            videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0]
        } else {
            // Fallback: try to extract from end of URL
            videoId = url.split('/').pop()?.split('?')[0] || ''
        }

        return `https://www.youtube.com/embed/${videoId}`
    }
    return ''
}
