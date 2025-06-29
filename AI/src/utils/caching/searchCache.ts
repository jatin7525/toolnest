import fs from 'fs';
import path from 'path';

interface CacheEntry {
    result: string;
    cachedAt: number;
}
/**
 * SearchCache is a utility class for caching search results.
 * It stores results in a JSON file and provides methods to get, set, and clean up cache entries.
 * Cache entries are valid for 24 hours.
 */
export class SearchCache {
    private static readonly CACHE_FILE = path.resolve('search-cache.json');
    private static store: Record<string, CacheEntry> = {};

    // Initialize cache from file if exists
    static init() {
        if (fs.existsSync(this.CACHE_FILE)) {
            try {
                const raw = fs.readFileSync(this.CACHE_FILE, 'utf-8');
                this.store = JSON.parse(raw);
            } catch (err) {
                console.warn('[SearchCache] Failed to load cache, starting fresh.', err);
                this.store = {};
            }
        }
    }

    // Generate a normalized cache key from user input
    static generateKey(prompt: string): string {
        return prompt.toLowerCase().replace(/[^a-z0-9]/gi, ' ').trim().replace(/\s+/g, '-').slice(0, 100);
    }

    // Get cached result if valid
    static get(key: string): string | null {
        const entry = this.store[key];
        if (!entry) return null;
        if (!this.isValid(entry)) {
            delete this.store[key];
            return null;
        }
        return entry.result;
    }

    // Set result in cache
    static set(key: string, result: string) {
        this.store[key] = {
            result,
            cachedAt: Date.now()
        };
        this.persist();
    }

    // Check if a cache entry is still valid
    private static isValid(entry: CacheEntry): boolean {
        const now = Date.now();
        return now - entry.cachedAt < 24 * 60 * 60 * 1000; // 24h
    }

    // Persist cache to disk
    private static persist() {
        fs.writeFileSync(this.CACHE_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    }

    // Remove all expired entries
    static cleanup() {
        const now = Date.now();
        for (const key in this.store) {
            if (now - this.store[key].cachedAt > 24 * 60 * 60 * 1000) {
                delete this.store[key];
            }
        }
        this.persist();
    }
}

SearchCache.init();
