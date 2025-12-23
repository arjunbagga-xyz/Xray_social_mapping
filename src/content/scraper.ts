import browser from 'webextension-polyfill';
import { Interaction } from '../types/db';

export async function scrapeInteractions(sourceHandle: string, targetHandle: string) {
    console.log(`[Scraper] Starting interaction scrape for ${sourceHandle} <-> ${targetHandle}`);

    const maxScrolls = 5; // Keep it low for MVP, prevents getting stuck

    const interactions: Interaction[] = [];

    for (let i = 0; i < maxScrolls; i++) {
        // Find tweets
        const articles = document.querySelectorAll('article[data-testid="tweet"]');

        articles.forEach(article => {
            const timeEl = article.querySelector('time');
            const textEl = article.querySelector('[data-testid="tweetText"]');
            const userEl = article.querySelector('[data-testid="User-Name"]');

            if (!timeEl || !textEl || !userEl) return;

            const timestamp = new Date(timeEl.getAttribute('datetime') || '').getTime();
            const text = textEl.textContent || '';
            const userHandle = (userEl.textContent?.match(/@(\w+)/) || [])[1];

            if (!userHandle) return;

            // Determine direction
            const from = userHandle;
            const to = from === sourceHandle ? targetHandle : sourceHandle;
            // Note: This logic is simplified. In search results, it's safer to assume if it's from A, it's to B or mentions B.

            // Basic dupe check (should rely on ID ideally, but we don't scrape ID yet efficiently)
            // Let's assume ID is effectively timestamp for now or scrape the link
            const link = article.querySelector('a[href*="/status/"]');
            const id = link?.getAttribute('href')?.split('/').pop() || `${timestamp}-${from}`;

            interactions.push({
                id,
                from,
                to,
                content: text,
                timestamp,
                type: 'mention' // refine later
            });
        });

        // Scroll
        window.scrollBy(0, 500);
        await new Promise(r => setTimeout(r, Math.random() * 1000 + 1000));

        // Check if end reached (simplified)
        if (document.body.scrollHeight - window.scrollY < 1000) {
             // maybe wait for loading?
             await new Promise(r => setTimeout(r, 2000));
        }
    }

    // Send back to background
    await browser.runtime.sendMessage({
        type: 'SAVE_INTERACTIONS',
        payload: { source: sourceHandle, target: targetHandle, interactions }
    });

    await browser.runtime.sendMessage({ type: 'CRAWL_COMPLETE' });
}
