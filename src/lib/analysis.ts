import { dbPromise } from './db';
import { Relationship } from '../types/db';
import { getGeminiKey } from './ai';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeRelationship(source: string, target: string) {
    const db = await dbPromise;

    // 1. Fetch all interactions between these two
    const interactions = await db.getAll('interactions');
    const relevantInteractions = interactions.filter(i =>
        (i.from === source && i.to === target) || (i.from === target && i.to === source)
    );

    if (relevantInteractions.length === 0) return null;

    // 2. Calculate Reciprocity
    const sourceToTarget = relevantInteractions.filter(i => i.from === source).length;
    const targetToSource = relevantInteractions.filter(i => i.from === target).length;
    const total = sourceToTarget + targetToSource;

    // 3. Prepare text for AI Analysis
    const conversationText = relevantInteractions
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(i => `${i.from}: ${i.content}`)
        .join('\n');

    // 4. AI Analysis
    const aiAnalysis = await getAIContext(source, target, conversationText);

    // 5. Construct Relationship Object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sentiment: any = aiAnalysis.sentiment || 'neutral';

    const relationship: Relationship = {
        source,
        target,
        type: (sourceToTarget > 0 && targetToSource > 0) ? 'mutual' : (sourceToTarget > 0 ? 'follows' : 'followed_by'),
        interactions: total,
        sentiment: sentiment,
        context: aiAnalysis.context,
        updatedAt: Date.now()
    };

    // 6. Save to DB
    await db.put('relationships', relationship);
    return relationship;
}

async function getAIContext(p1: string, p2: string, text: string) {
    const key = await getGeminiKey();
    if (!key) return { sentiment: 'neutral', context: 'No API Key' };

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze the relationship between @${p1} and @${p2} based on their interaction history:

    "${text}"

    Determine:
    1. Sentiment: (hostile, friendly, neutral, romantic, transactional)
    2. Context: A short, spicy "Mean Girls" style explanation of what's going on.
       - Detect if someone is "simping" (high effort, low return).
       - Detect if they are "frenemies".
       - Detect if it's purely "business/grift".
       - Detect "flirting".

    Return ONLY JSON:
    {
        "sentiment": "romantic",
        "context": "He's definitely trying to slide into her DMs, but she's just being polite."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Analysis Failed", e);
        return { sentiment: 'neutral', context: 'Analysis failed' };
    }
}
