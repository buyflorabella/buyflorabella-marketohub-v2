# Intent Document
# Task: Add Product PDF Button Section
# Status: PLANNING / IMPLEMENTATION
# Rule: Existing Code Preservation Required

## Primary Objective

Implement a new UI section that introduces two product buttons:

1. AERATOR PLUS
2. YIELDBOOST

This effort must preserve all existing functionality.

---

## Code Preservation Requirements

The intent of this task is:

- NO modifications to existing business logic.
- NO refactoring of existing components.
- NO cleanup work.
- NO redesign of existing sections.
- NO removal of existing code.
- NO replacement of existing code.

Prefer:

- New components.
- New styles.
- New content blocks.
- Additive-only changes.

The existing codebase should continue to function exactly as it does today.

---

## Evidence Requirements

Before making changes:

1. Take a quick inventory of the relevant frontend area.
2. Create an Evidence document for this effort.

The Evidence document should include:

### Files Reviewed
- List of frontend files examined.

### Files Modified
- Only list files actually modified.

### Files Added
- Any new files created.

### Change Summary
- Brief summary of what was added.

This does NOT need to be an exhaustive codebase audit.

The purpose is simply to track what frontend components were touched during this effort.

---

## UI Requirements

Create a NEW section.

This section should be visually lightweight.

Do NOT create:

- Large content areas
- Marketing blocks
- Product descriptions
- Long explanatory text
- Hero sections

The section should contain only two product buttons.

---

## Button Requirements

Match the visual styling of the existing "CLICK HERE TO SHOP" style buttons found near the top of the site.

Buttons should be:

- Rectangular
- Rounded corners
- Yellow border
- Pink background
- White text
- All uppercase text

Button labels:

- AERATOR PLUS
- YIELDBOOST

---

## Behavior Requirements

Each button should open a PDF document.

Requirements:

- Hardcoded URLs for now.
- URLs will be supplied later.
- Open PDF in a new browser tab.
- Use standard secure external-link behavior.

Example behavior:

AERATOR PLUS
→ opens Aerator Plus PDF

https://cdn.shopify.com/s/files/1/0640/4833/2903/files/FB-Direct_Ag_Solutions_Areator_Plus_Flyer_PROD.pdf?v=1780594887

YIELDBOOST
→ opens YieldBoost PDF

https://cdn.shopify.com/s/files/1/0640/4833/2903/files/FB-YIELDBOOST_Brochure_PROD.pdf?v=1780594891

---

## Placement

Determine the most appropriate placement for this new section based on the current page structure.

Prefer placing it near existing CTA/button areas so the design remains consistent.

Avoid disrupting existing layouts.

---

## Deliverables

Provide:

1. Evidence document.
2. Files modified.
3. Files added.
4. Implementation summary.
5. Any placeholder PDF URLs that require replacement.