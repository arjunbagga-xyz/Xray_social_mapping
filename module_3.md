# Module 3: The "Burn Book" Dossier (Detail UI)

## Status
- **State:** Pending
- **Dependencies:** `src/store/index.ts` (Completed)

## Objectives
1.  **Dossier Container:**
    - Create `src/popup/components/Dossier.tsx`.
    - Slide-over panel (absolute positioned on right side).
2.  **Content Logic:**
    - Watch `selectedNodeId` and `selectedEdgeId` from Zustand.
    - If `selectedNodeId`: Fetch Profile from DB. Show Bio, Tags, "Vibe Check" summary.
    - If `selectedEdgeId`: Fetch Relationship from DB. Show "Context", Sentiment, Interaction Count.
3.  **Actions:**
    - Add "Analyze Deeper" button (triggers background analysis).
    - Add "Crawl Connections" button (triggers Module 1 logic).

## Interfaces
- **Component:** `<Dossier />`

## Notes
- Needs smooth animation (Transition API or CSS transitions).
- Show "Loading..." state if analysis is running.
