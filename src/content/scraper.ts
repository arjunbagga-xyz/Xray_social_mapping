import browser from 'webextension-polyfill';
import { Interaction, SimpleProfile } from '../types/db';

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

export async function scrapeProfileList(): Promise<void> {
    console.log(`[Scraper] Starting profile list scrape`);
    const profiles: Map<string, SimpleProfile> = new Map();
    const maxProfiles = 50;
    const maxScrolls = 20;

    for (let i = 0; i < maxScrolls; i++) {
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');

        userCells.forEach(cell => {
            if (profiles.size >= maxProfiles) return;

            const userLink = cell.querySelector('a[href^="/"]');
            const handle = userLink?.getAttribute('href')?.replace('/', '') || '';

            // Text content usually contains Name\n@handle\nBio...
            // It's a bit messy, let's try to find specific elements if possible
            // X DOM is obfuscated, but usually there's a structure.
            // Let's fallback to text parsing if selectors fail.

            // Name is usually in a span with heavy font
            // Bio is in a div with dir="auto" below the name

            // Better approach:
            // Handle: derived from href
            // Name: First text node?
            const nameEl = cell.querySelector('div[dir="ltr"] span span'); // Very brittle
            const name = nameEl?.textContent || handle;

            // Let's just grab the whole text content of the cell and let AI figure it out?
            // Or try to be slightly smarter.
            // The structure is usually: Avatar | Name+Handle | Bio | Follow Button
            // We can grab the text of the middle column.

            // For now, let's extract what we can.
            if (!handle) return;

            const bio = (cell as HTMLElement).innerText.replace(/\n/g, ' ');
            // This will include "Follow", name, handle, etc.
            // We can clean it later or send raw text to AI.
            // But `SimpleProfile` expects `bio`.
            // Let's try to strip the known parts.

            if (!profiles.has(handle)) {
                 profiles.set(handle, {
                    handle,
                    name: name, // Placeholder
                    bio: bio,   // Raw text for now, AI can parse "Bio: ..."
                    avatarUrl: cell.querySelector('img')?.src
                });
            }
        });

        if (profiles.size >= maxProfiles) break;

        window.scrollBy(0, 800);
        await new Promise(r => setTimeout(r, Math.random() * 500 + 500));
    }

    // Send back to background
    // We are not returning, but sending a message because this is running in a tab
    await browser.runtime.sendMessage({
        type: 'SAVE_PROFILES_LIST',
        payload: { profiles: Array.from(profiles.values()) }
    });

    await browser.runtime.sendMessage({ type: 'CRAWL_COMPLETE' });
}
