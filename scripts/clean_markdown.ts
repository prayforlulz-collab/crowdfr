import fs from 'fs/promises'
import path from 'path'

async function main() {
    const blogDir = path.join(__dirname, '../src/content/blog')
    const files = await fs.readdir(blogDir)

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(blogDir, file);
        let content = await fs.readFile(filePath, 'utf-8');

        const lines = content.split('\n');
        const newLines: string[] = [];

        for (let line of lines) {
            // Check for numbered bold headings: e.g. "**1. The Hook**" or "**8. CTA**"
            const boldHeadingMatch = line.match(/^(\*\*|__)\d+\.\s+(.*?)\1$/);
            if (boldHeadingMatch) {
                const innerText = boldHeadingMatch[2].trim();
                const lowerText = innerText.toLowerCase();

                // Completely remove "The Hook", "CTA", "The Conclusion", etc.
                if (
                    lowerText === 'the hook' ||
                    lowerText === 'cta' ||
                    lowerText === 'the command' ||
                    lowerText.includes('execute') && lowerText.split(' ').length === 1 ||
                    lowerText === 'the conclusion' ||
                    lowerText === 'conclusion'
                ) {
                    continue;
                }

                line = `**${innerText}**`;
            }

            // Check for inline bold numbered items: "**1. The Trade:**" -> "**The Trade:**"
            const inlineBoldNumMatch = line.match(/^(\*\*|__)\d+\.\s+(.*?):(.*)\1(.*?)$/);
            if (inlineBoldNumMatch) {
                line = `**${inlineBoldNumMatch[2]}:${inlineBoldNumMatch[3]}**${inlineBoldNumMatch[4]}`;
            }

            // Let's also remove non-numbered bold headings that are just "The Hook" or "CTA"
            const plainBoldMatch = line.match(/^(\*\*|__)(.*?)\1$/);
            if (plainBoldMatch) {
                const lowerText = plainBoldMatch[2].trim().toLowerCase();
                if (
                    lowerText === 'the hook' ||
                    lowerText === 'cta' ||
                    lowerText === 'the command' ||
                    lowerText.includes('execute') && lowerText.split(' ').length === 1
                ) {
                    continue;
                }
            }

            // Convert bulleted numbered lists e.g. "* 1. Item" -> "- Item"
            line = line.replace(/^(\s*)[*\-]\s+\d+\.\s+/, '$1- ');
            // Convert normal numbered lists e.g. "1. Item" -> "- Item"
            line = line.replace(/^(\s*)\d+\.\s+/, '$1- ');

            newLines.push(line);
        }

        // Just to ensure normal '#' headings like '### 8. Heading' are cleaned
        for (let i = 0; i < newLines.length; i++) {
            const hMatch = newLines[i].match(/^(#+)\s+\d+\.\s+(.*)$/);
            if (hMatch) {
                const hashes = hMatch[1];
                let headingText = hMatch[2].trim();

                const lowerText = headingText.toLowerCase();
                if (lowerText === 'the hook' || lowerText === 'cta' || lowerText === 'the command') {
                    newLines[i] = ''; // blank line
                } else {
                    newLines[i] = `${hashes} ${headingText}`;
                }
            }
        }

        await fs.writeFile(filePath, newLines.join('\n'), 'utf-8');
        console.log(`Cleaned ${file}`);
    }
}

main().catch(e => {
    console.error(e)
    process.exit(1)
});
