import { Profile } from '../types/db';
import browser from 'webextension-polyfill';
import { scrapeInteractions, scrapeProfileList } from './scraper';

console.log("Mean Girls Injection Loaded");

// Listen for crawl commands from background
// eslint-disable-next-line @typescript-eslint/no-explicit-any
browser.runtime.onMessage.addListener((message: any) => {
    if (message.type === 'CRAWL_INTERACTIONS') {
        scrapeInteractions(message.payload.source, message.payload.target);
    } else if (message.type === 'SCRAPE_PROFILE_LIST') {
        scrapeProfileList();
    }
});

// Wait for the page to load sufficiently
const observer = new MutationObserver(() => {
  injectButton();
});

observer.observe(document.body, { childList: true, subtree: true });

function injectButton() {
  // Check if we are on a profile page
  const path = window.location.pathname;
  if (path === '/' || path === '/home' || path === '/explore' || path === '/notifications') return;

  // Find the "Follow" or "Edit Profile" button area
  // X.com structure is obfuscated, so we look for the user actions bar
  const userActions = document.querySelector('[data-testid="userActions"]');
  if (!userActions) return;

  // Avoid double injection
  if (document.getElementById('mean-girls-add-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'mean-girls-add-btn';
  btn.innerText = 'Add to Graph';
  btn.style.backgroundColor = '#ec4899'; // Pink-500
  btn.style.color = 'white';
  btn.style.fontWeight = 'bold';
  btn.style.border = 'none';
  btn.style.borderRadius = '9999px';
  btn.style.padding = '8px 16px';
  btn.style.marginLeft = '8px';
  btn.style.cursor = 'pointer';
  btn.style.zIndex = '9999';

  btn.onclick = async () => {
    btn.innerText = 'Adding...';
    try {
      const profile = await scrapeProfile();
      if (profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await browser.runtime.sendMessage({ type: 'ADD_PROFILE', payload: profile }) as any;
        if (response && response.status === 'success') {
          btn.innerText = 'Added!';
          btn.style.backgroundColor = '#10b981'; // Green-500
        } else {
          btn.innerText = 'Error';
        }
      }
    } catch (e) {
      console.error(e);
      btn.innerText = 'Failed';
    }
  };

  // Insert before the follow button (first child usually)
  userActions.prepend(btn);
}

async function scrapeProfile(): Promise<Profile | null> {
  // Scrape visible data
  // Note: Selectors are fragile on X.com. We try to be as generic as possible or use data-testids.

  const handle = window.location.pathname.replace('/', '');
  const nameElement = document.querySelector('div[data-testid="UserName"] span span');
  const bioElement = document.querySelector('[data-testid="UserDescription"]');
  const followersElement = document.querySelector('a[href$="/verified_followers"] span span') || document.querySelector('a[href$="/followers"] span span');
  const followingElement = document.querySelector('a[href$="/following"] span span');

  const avatarImage = document.querySelector('div[data-testid="User-UserAvatar"] img') as HTMLImageElement;

  if (!nameElement) {
    alert("Could not find profile data. Are you on a profile page?");
    return null;
  }

  const parseCount = (str: string) => {
    if (!str) return 0;
    str = str.replace(/,/g, '');
    if (str.includes('K')) return parseFloat(str) * 1000;
    if (str.includes('M')) return parseFloat(str) * 1000000;
    return parseInt(str);
  };

  return {
    handle: handle,
    name: nameElement.textContent || handle,
    bio: bioElement?.textContent || "",
    avatarUrl: avatarImage?.src || "",
    followersCount: parseCount(followersElement?.textContent || "0"),
    followingCount: parseCount(followingElement?.textContent || "0"),
    addedAt: Date.now(),
    tags: []
  };
}
