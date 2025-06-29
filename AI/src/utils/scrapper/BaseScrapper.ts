import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { getRandomUserAgent } from './userAgents';

puppeteerExtra.use(StealthPlugin());

class BaseScraper {
    private static browser: Browser;
    private static page: Page;

    static async init(): Promise<typeof BaseScraper> {
        if (!this.browser) {
            this.browser = await puppeteerExtra.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920x1080',
                    `--user-agent=${getRandomUserAgent({ browser: 'chrome', platform: 'windows' })}`,
                ],
            });
            this.page = await this.browser.newPage();
            await this.page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            );
        }
        return this;
    }

    static async renderAndExtract(url: string): Promise<string> {
        await this.init();
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(res => setTimeout(res, 1500));
            return await this.page.content();
        } catch (err) {
            console.warn('[renderAndExtract] Error loading URL:', url, (err as Error).message);
            return '';
        }
    }

    static async extractContent(url: string): Promise<string> {
        const html = await this.renderAndExtract(url);
        const $ = cheerio.load(html);
        const paragraphs = $('p')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(p => p.length > 60);
        return paragraphs.slice(0, 3).join('\n');
    }
}

export default BaseScraper;
