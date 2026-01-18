# Module 4: "Spill the Tea" (Export & Polish)

## Status
- **State:** Completed
- **Dependencies:** Module 2 (Graph)

## Objectives
1.  **Export:**
    - Add "Export as Image" button to the Dashboard header. (Completed - Implemented in `Dashboard.tsx` via `cy.png()`)
    - Use `cy.png()` or `cy.jpg()` to generate the blob and download. (Completed)
2.  **Monetization:**
    - "Donate to Dev" button is already in Header, ensure it links to a valid placeholder (e.g., generic BuyMeACoffee). (Completed - Added to Sidebar Header)
3.  **UI Polish:**
    - Ensure fonts are "Mean Girl" coded (maybe a custom Google Font if possible, or just standard Sans). (Completed - Using `font-sans` and `font-mono` with custom styling)
    - Check consistent padding/margins. (Completed)

## Notes
- Ensure the exported image has a white background (Cytoscape defaults to transparent sometimes). (Handled via `{ bg: 'white', full: true }` in export config)
