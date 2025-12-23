// The Crawler Brain
// Manages the queue and instructs the crawler tab

import browser from 'webextension-polyfill';
import { rankProfilesForDrama } from '../lib/ai';
import { SimpleProfile } from '../types/db';

interface CrawlerTask {
  type: 'search_interactions' | 'scrape_connections';
  sourceHandle: string;
  targetHandle?: string; // Optional for scrape_connections
}

let isCrawling = false;
let crawlerTabId: number | null = null;
const queue: CrawlerTask[] = [];

// Temporary storage for scraped profiles during expansion
let scrapedProfilesBuffer: SimpleProfile[] = [];
// Resolve function to release the lock
let taskResolver: (() => void) | null = null;

export async function addToCrawlerQueue(source: string, target: string) {
  queue.push({
    type: 'search_interactions',
    sourceHandle: source,
    targetHandle: target,
  });
  console.log(`[Crawler] Added to queue: ${source} -> ${target}`);
  processQueue();
}

export async function startSmartExpansion(handle: string) {
    queue.push({
        type: 'scrape_connections',
        sourceHandle: handle
    });
    console.log(`[Crawler] Added expansion task for: ${handle}`);
    processQueue();
}

async function processQueue() {
  if (isCrawling || queue.length === 0) return;

  isCrawling = true;
  const task = queue.shift();

  if (task) {
    try {
      await performTask(task);
    } catch (e) {
      console.error("[Crawler] Task failed", e);
    }
  }

  isCrawling = false;
  // Small delay between tasks to be safe
  setTimeout(processQueue, Math.random() * 2000 + 1000);
}

async function ensureTab() {
     if (!crawlerTabId) {
        const tab = await browser.tabs.create({ active: false, url: 'https://x.com' });
        crawlerTabId = tab.id!;
        // Wait for tab to load
        await new Promise(r => setTimeout(r, 5000));
      }
      return crawlerTabId;
}

async function performTask(task: CrawlerTask) {
  console.log(`[Crawler] Starting task: ${task.type}`);
  const tabId = await ensureTab();

  if (task.type === 'search_interactions' && task.targetHandle) {
    const query = `(from:${task.sourceHandle} @${task.targetHandle}) OR (from:${task.targetHandle} @${task.sourceHandle})`;
    const url = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

    await browser.tabs.update(tabId, { url });
    await new Promise(r => setTimeout(r, 5000 + Math.random() * 2000));

    // We wrap this in a promise that resolves when 'CRAWL_COMPLETE' is received
    await new Promise<void>((resolve) => {
        taskResolver = resolve;

        // Timeout fallback
        setTimeout(() => {
            if (taskResolver) {
                console.warn("Task timed out");
                taskResolver();
                taskResolver = null;
            }
        }, 30000); // 30s timeout

        browser.tabs.sendMessage(tabId, {
            type: 'CRAWL_INTERACTIONS',
            payload: { source: task.sourceHandle, target: task.targetHandle }
        }).catch(e => {
            console.error("Failed to send CRAWL message", e);
            resolve();
        });
    });

  } else if (task.type === 'scrape_connections') {
      // 1. Scrape Following
      console.log(`[Crawler] Scraping Following for ${task.sourceHandle}`);
      await browser.tabs.update(tabId, { url: `https://x.com/${task.sourceHandle}/following` });
      await new Promise(r => setTimeout(r, 5000 + Math.random() * 2000));

      scrapedProfilesBuffer = [];

      await new Promise<void>((resolve) => {
          taskResolver = resolve;
          // Timeout
          setTimeout(() => { if (taskResolver) { taskResolver(); taskResolver = null; } }, 45000);

          browser.tabs.sendMessage(tabId, { type: 'SCRAPE_PROFILE_LIST' }).catch(() => resolve());
      });

      // 2. Scrape Followers
      console.log(`[Crawler] Scraping Followers for ${task.sourceHandle}`);
      await browser.tabs.update(tabId, { url: `https://x.com/${task.sourceHandle}/followers` });
      await new Promise(r => setTimeout(r, 5000 + Math.random() * 2000));

      await new Promise<void>((resolve) => {
          taskResolver = resolve;
          setTimeout(() => { if (taskResolver) { taskResolver(); taskResolver = null; } }, 45000);
          browser.tabs.sendMessage(tabId, { type: 'SCRAPE_PROFILE_LIST' }).catch(() => resolve());
      });

      // 3. Process Logic
      console.log(`[Crawler] Analyzing ${scrapedProfilesBuffer.length} profiles for drama...`);
      // Dedup by handle
      const uniqueProfiles = Array.from(new Map(scrapedProfilesBuffer.map(p => [p.handle, p])).values());

      if (uniqueProfiles.length > 0) {
          const ranked = await rankProfilesForDrama(task.sourceHandle, uniqueProfiles);
          console.log(`[Crawler] AI identified ${ranked.length} targets.`);

          for (const item of ranked) {
             // Add to queue to find interactions
             // Ensure we don't add duplicates to the queue? The queue logic can be improved later.
             // We add interaction search between SOURCE and TARGET
             addToCrawlerQueue(task.sourceHandle, item.handle);
          }
      }

      scrapedProfilesBuffer = [];
  }
}

// Message Listener
// eslint-disable-next-line @typescript-eslint/no-explicit-any
browser.runtime.onMessage.addListener((message: any) => {
  if (message.type === 'CRAWL_COMPLETE') {
    console.log("[Crawler] Received completion signal");
    if (taskResolver) {
        taskResolver();
        taskResolver = null;
    }
  } else if (message.type === 'SAVE_PROFILES_LIST') {
      if (message.payload && message.payload.profiles) {
          console.log(`[Crawler] Received ${message.payload.profiles.length} profiles`);
          scrapedProfilesBuffer.push(...message.payload.profiles);
      }
  } else if (message.type === 'START_EXPANSION') {
      if (message.payload && message.payload.handle) {
          startSmartExpansion(message.payload.handle);
      }
  }
});
