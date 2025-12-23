// The Crawler Brain
// Manages the queue and instructs the crawler tab

import browser from 'webextension-polyfill';

interface CrawlerTask {
  type: 'search_interactions';
  sourceHandle: string;
  targetHandle: string;
}

let isCrawling = false;
let crawlerTabId: number | null = null;
const queue: CrawlerTask[] = [];

export async function addToCrawlerQueue(source: string, target: string) {
  queue.push({
    type: 'search_interactions',
    sourceHandle: source,
    targetHandle: target,
  });
  console.log(`[Crawler] Added to queue: ${source} -> ${target}`);
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

async function performTask(task: CrawlerTask) {
  console.log(`[Crawler] Starting task: ${task.type}`);

  // Ensure we have a tab
  if (!crawlerTabId) {
    const tab = await browser.tabs.create({ active: false, url: 'https://x.com' });
    crawlerTabId = tab.id!;
    // Wait for tab to load
    await new Promise(r => setTimeout(r, 5000));
  }

  if (task.type === 'search_interactions') {
    const query = `(from:${task.sourceHandle} @${task.targetHandle}) OR (from:${task.targetHandle} @${task.sourceHandle})`;
    const url = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

    await browser.tabs.update(crawlerTabId, { url });

    // Wait for page load + random delay
    await new Promise(r => setTimeout(r, 5000 + Math.random() * 2000));

    // Inject scraper into the tab
    // We send a message to the content script which should already be there
    // But since it's a new nav, we might need to wait for the content script to load

    try {
      await browser.tabs.sendMessage(crawlerTabId, {
        type: 'CRAWL_INTERACTIONS',
        payload: { source: task.sourceHandle, target: task.targetHandle }
      });
    } catch (e) {
      console.error("Failed to send CRAWL message", e);
      // Retry once?
    }

    // Wait for the content script to finish scrolling/scraping
    // Realistically we need a way for the content script to signal "I'm done"
    // For now, we'll just wait a fixed time or listen for a 'DONE' message
    await new Promise(r => setTimeout(r, 10000));
  }
}

// Listen for "CRAWL_COMPLETE" from content script to release the lock
// eslint-disable-next-line @typescript-eslint/no-explicit-any
browser.runtime.onMessage.addListener((message: any) => {
  if (message.type === 'CRAWL_COMPLETE') {
    console.log("[Crawler] Task complete");
    // We could resolve a promise here if we structured it that way
  }
});
