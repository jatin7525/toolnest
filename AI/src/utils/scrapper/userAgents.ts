type UAFilter = {
    browser?: 'chrome' | 'firefox' | 'safari' | 'edge';
    platform?: 'windows' | 'mac' | 'linux';
};

const manualUserAgents = [
    // ✅ Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.81',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',

    // ✅ Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:117.0) Gecko/20100101 Firefox/117.0',
    'Mozilla/5.0 (X11; Linux i686; rv:124.0) Gecko/20100101 Firefox/124.0',

    // ✅ Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
];

/**
 * Extract metadata to enable filtering
 */
function parseUA(ua: string): { browser: string; platform: string } {
    const uaLower = ua.toLowerCase();
    const browser = uaLower.includes('chrome')
        ? 'chrome'
        : uaLower.includes('firefox')
            ? 'firefox'
            : uaLower.includes('safari')
                ? 'safari'
                : uaLower.includes('edg')
                    ? 'edge'
                    : 'unknown';

    const platform = uaLower.includes('windows')
        ? 'windows'
        : uaLower.includes('mac')
            ? 'mac'
            : uaLower.includes('linux')
                ? 'linux'
                : 'unknown';

    return { browser, platform };
}

/**
 * Get a random user-agent with optional filters
 */
export function getRandomUserAgent(filter?: UAFilter): string {
    let list = [...manualUserAgents];

    if (filter) {
        list = list.filter((ua) => {
            const meta = parseUA(ua);
            return (
                (!filter.browser || meta.browser === filter.browser) &&
                (!filter.platform || meta.platform === filter.platform)
            );
        });
    }

    if (!list.length) throw new Error('No matching user-agents found for filter.');

    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Get all user-agents (optionally filtered)
 */
export function getAllUserAgents(filter?: UAFilter): string[] {
    if (!filter) return manualUserAgents;

    return manualUserAgents.filter((ua) => {
        const meta = parseUA(ua);
        return (
            (!filter.browser || meta.browser === filter.browser) &&
            (!filter.platform || meta.platform === filter.platform)
        );
    });
}
