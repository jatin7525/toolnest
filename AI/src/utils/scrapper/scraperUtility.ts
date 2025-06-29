import { URL } from 'url';

export class ScraperUtility {
    static blacklist = [
        'baidu.com', 'yandex.ru', 'sogou.com', 'vk.com', 'pinterest.com', 'reddit.com',
        'quora.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
        'youtube.com', 'vimeo.com', 'cloudflare.com', 'amazon.com', 'ebay.com',
        'bilibili.com', 'weibo.com', 'tiktok.com', 'tumblr.com', 'ask.com', 'flipkart.com',
        'snapchat.com', 'apkpure.com', 'softonic.com', 'archive.org',
    ];

    static isBlacklisted(url: string): boolean {
        return this.blacklist.some(domain => url.includes(domain));
    }

    static decodeDuckDuckGoLink(raw: string): string {
        try {
            const url = new URL(raw, 'https://duckduckgo.com');
            const encoded = url.searchParams.get('uddg');
            return encoded ? decodeURIComponent(encoded) : raw;
        } catch {
            return raw;
        }
    }

    static getReadableSourceName(methodName: string): string {
        return methodName
            .replace(/^search/, '')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .trim();
    }

    static listSearchMethods(cls: any): string[] {
        return Object.getOwnPropertyNames(cls)
            .filter(name => typeof cls[name] === 'function' && name.startsWith('search'));
    }
}
