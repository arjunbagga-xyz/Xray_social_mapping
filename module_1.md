# Module 1: The "Social Climber" (AI Pathfinding)

## Status
- **State:** Completed
- **Dependencies:** `src/lib/ai.ts` (Completed), `src/background/crawler.ts` (Completed)

## Objectives
1.  Implement **"Smart Expansion"**:
    - When a user adds a profile, optionally fetch their "Following" list (top 50).
    - *Note:* We need a new scraper function `scrapeFollowing(handle)` in `src/content/scraper.ts`. (Completed as `scrapeProfileList`)
2.  Implement **AI Priority Queue**:
    - Send the list of 50 handles + Bios to Gemini.
    - Prompt: "Who is most likely to be relevant to [Target User] or creates the most drama?"
    - Result: A ranked list of handles. (Completed `rankProfilesForDrama`)
3.  **Queue Injection**:
    - Add these high-priority handles to the `crawlerQueue` in `src/background/crawler.ts`. (Completed)

## Interfaces
- **New Content Script Function:** `scrapeFollowing(handle: string): Promise<SimpleProfile[]>` -> Implemented as `scrapeProfileList` which sends a message.
- **New AI Function:** `rankProfilesForDrama(profiles: SimpleProfile[]): Promise<string[]>` -> Implemented to return detailed objects.

## Notes
- Ensure we don't spam Gemini. Batch the request.
- Respect rate limits on X.com when scraping following lists.
- Implemented `scrape_connections` task in `crawler.ts` that scrapes both Following and Followers lists.
