/**
 * Parses an ISO 8601 duration string (e.g., PT4M11S) and returns a human-readable format (e.g., 4:11).
 */
export function formatDuration(isoDuration?: string): string {
    if (!isoDuration) return ""

    // If it's already in M:SS format, return as is
    if (/^\d+:?\d*$/.test(isoDuration)) return isoDuration

    try {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        const matches = isoDuration.match(regex)

        if (!matches) return isoDuration

        const hours = parseInt(matches[1] || "0")
        const minutes = parseInt(matches[2] || "0")
        const seconds = parseInt(matches[3] || "0")

        let result = ""

        if (hours > 0) {
            result += `${hours}:${minutes.toString().padStart(2, '0')}:`
        } else {
            result += `${minutes}:`
        }

        result += seconds.toString().padStart(2, '0')

        return result
    } catch (e) {
        return isoDuration
    }
}
