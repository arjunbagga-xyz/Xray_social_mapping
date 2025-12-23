import { GoogleGenerativeAI } from "@google/generative-ai";
import browser from 'webextension-polyfill';
import { SimpleProfile } from '../types/db';

let genAI: GoogleGenerativeAI | null = null;
let apiKey: string | null = null;

export async function setGeminiKey(key: string) {
    apiKey = key;
    genAI = new GoogleGenerativeAI(apiKey);
    await browser.storage.local.set({ geminiKey: key });
}

export async function getGeminiKey(): Promise<string | null> {
    if (apiKey) return apiKey;
    const result = await browser.storage.local.get('geminiKey');
    if (result.geminiKey) {
        apiKey = result.geminiKey as string;
        genAI = new GoogleGenerativeAI(apiKey);
        return apiKey;
    }
    return null;
}

export async function analyzeVibe(bio: string, recentTweets: string[]) {
    if (!genAI) {
        const key = await getGeminiKey();
        if (!key) throw new Error("Gemini API Key not set");
    }

    const model = genAI!.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a sarcastic, "Mean Girl" social analyst.
    Analyze this X.com profile based on their bio and recent tweets.

    Bio: "${bio}"
    Recent Tweets: ${JSON.stringify(recentTweets)}

    1. Give them 3 short, punchy tags (e.g., "Tech Bro", "Pick-me", "Crypto Grifter", "Swiftie", "Reply Guy").
    2. Write a 1-sentence "Burn Book" style summary of their vibe.

    Return ONLY a JSON object:
    {
        "tags": ["tag1", "tag2", "tag3"],
        "summary": "She doesn't even go here."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Simple cleanup to ensure JSON
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Gemini Analysis Failed", e);
        return { tags: ["Unknown"], summary: "Analysis failed. Maybe they're boring." };
    }
}

export async function rankProfilesForDrama(targetHandle: string, profiles: SimpleProfile[]) {
    if (!genAI) {
        const key = await getGeminiKey();
        if (!key) throw new Error("Gemini API Key not set");
    }

    const model = genAI!.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Limit to prevent token limits if necessary, but 50 profiles should be fine.
    // Minimizing the profile data sent
    const minifiedProfiles = profiles.map(p => ({ handle: p.handle, bio: p.bio }));

    const prompt = `
    You are a strategic social climber and drama analyst.
    Target User: @${targetHandle}

    Here is a list of profiles (Following/Followers) associated with the Target User:
    ${JSON.stringify(minifiedProfiles)}

    Task:
    1. Identify the TOP 10 profiles that are most likely to be:
       - Involved in drama with the target.
       - Useful for "social climbing" (high status/relevance).
       - Sources of tea/gossip.
    2. Ignore boring or corporate accounts unless they are shady.

    Return a JSON array of objects. Each object must have:
    - "handle": The twitter handle.
    - "reason": A short, mean-girl style explanation of why they were picked.
    - "score": A relevance score from 1-10.

    Return ONLY the JSON array:
    [
      { "handle": "user1", "reason": "...", "score": 9 },
      ...
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr) as { handle: string; reason: string; score: number }[];
    } catch (e) {
        console.error("Gemini Ranking Failed", e);
        return [];
    }
}
