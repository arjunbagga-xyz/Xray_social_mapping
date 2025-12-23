# Module 2: The "Investigation Board" (Graph Core)

## Status
- **State:** Pending
- **Dependencies:** `src/store/index.ts` (Completed), `src/lib/db.ts` (Completed)

## Objectives
1.  **Graph Container:**
    - Create `src/popup/components/Graph.tsx`.
    - Initialize `cytoscape` instance.
2.  **Data Binding:**
    - On mount, fetch all `profiles` (nodes) and `relationships` (edges) from `IndexedDB`.
    - Subscribe to DB changes (or poll) to update graph in real-time as crawler works.
3.  **Interaction:**
    - On click node/edge -> Call `useStore.getState().selectNode(id)`.
4.  **Styling:**
    - Use "Mean Girls" colors: Pink (#ec4899) for edges, images for nodes.
    - Edge thickness based on `interactionCount`.
    - Edge color based on `sentiment` (Red=Hostile, Green=Friendly).

## Interfaces
- **Component:** `<Graph />`
- **State:** Reads `selectedNodeId` to highlight selection.

## Notes
- Cytoscape needs a container with defined height/width.
- Handle "layout" (e.g., `cose` or `fcose`) to auto-arrange nodes.
