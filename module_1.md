# Module 1: The "Social Climber" (AI Pathfinding)

## Status
- **State:** Pending
- **Dependencies:** `src/lib/ai.ts` (Completed), `src/background/crawler.ts` (Completed)

## Objectives
1.  Implement **"Smart Expansion"**:
    - When a user adds a profile, optionally fetch their "Following" list (top 50).
    - *Note:* We need a new scraper function `scrapeFollowing(handle)` in `src/content/scraper.ts`.
2.  Implement **AI Priority Queue**:
    - Send the list of 50 handles + Bios to Gemini.
    - Prompt: "Who is most likely to be relevant to [Target User] or creates the most drama?"
    - Result: A ranked list of handles.
3.  **Queue Injection**:
    - Add these high-priority handles to the `crawlerQueue` in `src/background/crawler.ts`.

## Interfaces
- **New Content Script Function:** `scrapeFollowing(handle: string): Promise<SimpleProfile[]>`
- **New AI Function:** `rankProfilesForDrama(profiles: SimpleProfile[]): Promise<string[]>`

## Notes
- Ensure we don't spam Gemini. Batch the request.
- Respect rate limits on X.com when scraping following lists.
