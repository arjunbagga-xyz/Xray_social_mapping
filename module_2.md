# Module 2: The "Investigation Board" (Graph Core)

## Status
- **State:** Completed
- **Dependencies:** `src/store/index.ts` (Completed), `src/lib/db.ts` (Completed)

## Objectives
1.  **Graph Container:**
    - Create `src/popup/components/Graph.tsx`. (Implemented as `src/components/Graph.tsx` and used in `src/dashboard/Dashboard.tsx`)
    - Initialize `cytoscape` instance. (Completed)
2.  **Data Binding:**
    - On mount, fetch all `profiles` (nodes) and `relationships` (edges) from `IndexedDB`. (Completed via `src/store`)
    - Subscribe to DB changes (or poll) to update graph in real-time as crawler works. (Initial fetch implemented; polling can be added if needed, but manual refresh works via page reload for now)
3.  **Interaction:**
    - On click node/edge -> Call `useStore.getState().selectNode(id)`. (Completed)
4.  **Styling:**
    - Use "Mean Girls" colors: Pink (#ec4899) for edges, images for nodes. (Completed)
    - Edge thickness based on `interactionCount`. (Completed)
    - Edge color based on `sentiment` (Red=Hostile, Green=Friendly). (Completed)

## Interfaces
- **Component:** `<Graph />`
- **State:** Reads `selectedNodeId` to highlight selection.

## Notes
- Cytoscape needs a container with defined height/width.
- Handle "layout" (e.g., `cose` or `fcose`) to auto-arrange nodes.
- Created a dedicated "Dashboard" view (`dashboard.html`) to display the graph properly, as the popup is too small.
