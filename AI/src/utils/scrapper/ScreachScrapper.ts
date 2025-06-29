import * as cheerio from 'cheerio';
import { ScraperUtility } from './scraperUtility';
import BaseScraper from './BaseScrapper';

interface Source {
    name: string;
    handler: (query: string) => Promise<string>;
}

export class Scraper extends BaseScraper {
    static async smartSearch(query: string): Promise<string> {
        const methodNames = ScraperUtility.listSearchMethods(this);
        const sources: Source[] = methodNames.map(method => ({
            name: ScraperUtility.getReadableSourceName(method),
            handler: (this as any)[method], // relies on static method access
        }));

        for (const source of sources) {
            try {
                const result = await source.handler.call(this, query);
                if (result?.trim()) {
                    return `<!-- ==== ${source.name} ==== -->\n${result}`;
                }
            } catch (err) {
                console.warn(`[Scraper] ${source.name} failed:`, err);
            }
        }

        return '[Scraper] No results found from any source. Please reply with "Sorry, I could not find any information on that topic."';
    }

    // ========================
    //   Search Implementations
    // ========================

    static async searchWikipedia(query: string): Promise<string> {
        const safeQuery = query.replace(/ /g, '_').replace(/[^\w\-]/g, '');
        const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(safeQuery)}`;
        const html = await this.renderAndExtract(url);
        const $ = cheerio.load(html);
        const para = $('#mw-content-text p')
            .filter((_, el) => $(el).text().trim().length > 50)
            .first()
            .text()
            .trim();
        return para || '';
    }

    static async searchDuckDuckGo(query: string): Promise<string> {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const html = await this.renderAndExtract(url);
        const $ = cheerio.load(html);

        const links = $('.result__title a.result__a')
            .map((_, el) => $(el).attr('href'))
            .get()
            .map(href => ScraperUtility.decodeDuckDuckGoLink(href!))
            .filter(link => !!link && !ScraperUtility.isBlacklisted(link))
            .slice(0, 3);

        const pages = await Promise.all(links.map(link => this.renderAndExtract(link)));
        return pages.filter(Boolean).join('\n<!-- ---- NEXT ARTICLE ---- -->\n');
    }

    static async searchBing(query: string): Promise<string> {
        const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        const html = await this.renderAndExtract(url);
        const $ = cheerio.load(html);

        const links = $('li.b_algo h2 a')
            .map((_, el) => $(el).attr('href'))
            .get()
            .filter(link => !!link && !ScraperUtility.isBlacklisted(link))
            .slice(0, 3);

        const pages = await Promise.all(links.map(link => this.renderAndExtract(link)));
        return pages.filter(Boolean).join('\n<!-- ---- NEXT ARTICLE ---- -->\n');
    }

    static async searchGoogleNews(query: string): Promise<string> {
        const url = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const html = await this.renderAndExtract(url);
        const $ = cheerio.load(html);

        const links = $('article h3 a')
            .map((_, el) => $(el).attr('href'))
            .get()
            .map(href => href?.startsWith('./') ? `https://news.google.com${href.slice(1)}` : href)
            .filter(link => !!link && !ScraperUtility.isBlacklisted(link!))
            .slice(0, 3);

        const pages = await Promise.all(links.map(link => this.renderAndExtract(link!)));
        return pages.filter(Boolean).join('\n<!-- ---- NEXT ARTICLE ---- -->\n');
    }
}
