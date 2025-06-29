import DDG from 'duck-duck-scrape';

export async function duckSearch(query: string) {
    const result = await DDG.search(query, {
        safeSearch: DDG.SafeSearchType.STRICT
    });
    return result.results.slice(0, 3); // Top 3 results
}