import { dbPromise } from '../lib/db';
import { Profile, Interaction } from '../types/db';
import browser from 'webextension-polyfill';
import { addToCrawlerQueue } from './crawler';
import { analyzeVibe, setGeminiKey } from '../lib/ai';
import { analyzeRelationship } from '../lib/analysis';

console.log("Mean Girls Background Worker: Online");

// Listen for messages from Content Script or Popup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
browser.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: any) => {
  if (message.type === 'ADD_PROFILE') {
    handleProfileAdd(message.payload).then(() => {
        // Send success response if needed, though we return true for async
    });
    return true; // Keep channel open
  }

  if (message.type === 'SAVE_INTERACTIONS') {
      handleSaveInteractions(message.payload);
  }

  if (message.type === 'SET_API_KEY') {
      setGeminiKey(message.payload).then(() => {
          sendResponse({ status: 'success' });
      });
      return true;
  }

  if (message.type === 'START_CRAWL_TEST') {
      addToCrawlerQueue(message.payload.source, message.payload.target);
  }

  if (message.type === 'ANALYZE_RELATIONSHIP') {
      analyzeRelationship(message.payload.source, message.payload.target).then((res) => {
          sendResponse({ status: 'success', data: res });
      });
      return true;
  }

  return true;
});

async function handleProfileAdd(profile: Profile) {
  const db = await dbPromise;

  // 1. Save initial profile
  await db.put('profiles', profile);
  console.log(`[Burn Book] Added entry: ${profile.handle}`);

  // 2. Trigger "Vibe Check" (Background Analysis)
  try {
      // For MVP, we don't have recent tweets yet at the moment of adding (scraper only gets bio)
      // So we just use Bio. In future, scraper should get first 3 tweets.
      const aiResult = await analyzeVibe(profile.bio, []);

      const updatedProfile = { ...profile, tags: aiResult.tags, bio: profile.bio + `\n\n[Burn Book]: ${aiResult.summary}` };
      await db.put('profiles', updatedProfile);
      console.log(`[Burn Book] Vibe Checked: ${profile.handle} -> ${aiResult.tags}`);

  } catch (e) {
      console.error("Vibe Check Failed", e);
  }
}

async function handleSaveInteractions(data: { source: string, target: string, interactions: Interaction[] }) {
    const db = await dbPromise;
    for (const interaction of data.interactions) {
        await db.put('interactions', interaction);
    }
    console.log(`[Burn Book] Saved ${data.interactions.length} interactions between ${data.source} and ${data.target}`);

    // Trigger Analysis immediately after saving?
    // Let's do it to be "saucy" fast.
    try {
        const relationship = await analyzeRelationship(data.source, data.target);
        if (relationship) {
            console.log(`[Burn Book] Analysis Complete: ${relationship.sentiment} - ${relationship.context}`);
        }
    } catch (e) {
        console.error("Auto-Analysis Failed", e);
    }
}
