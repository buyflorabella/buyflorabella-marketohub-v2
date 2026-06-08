# Task 8 Plan — Product PDF Buttons Section
**Status:** PENDING
**Intent:** `claude_docs/tasks/task8_intent.md`

---

## Inventory Summary

**Home page render chain:**
```
_index.tsx → <LandingPage /> → componentsMockup2/pages/HomePage.tsx
```

**Current HomePage section order:**
```
AnnouncementBar → HeroSection → ReassuranceStrip → BenefitsGrid →
HowItWorks → MineralComposition → SocialProof → EducationSection →
VideoReelsIframe → CommunityCallout
```

**Existing CTA button style (HeroSection.tsx, lines 33/71/77):**
Green gradient rounded-full buttons (`gradient-green`, `shiny-border`). These are the
primary shop CTAs.

**"Yellow border / pink background" buttons:** These do not exist in the current
componentsMockup2 component set. The site's palette in this range (from ReassuranceStrip.tsx):
- Pink: `#ff0080`
- Neon yellow: `#d4ff00`

The intent describes a distinct secondary CTA style — rectangular + rounded corners + yellow
border + pink background + white uppercase text. This will be implemented as new Tailwind
classes, staying consistent with the site's existing color tokens.

**Site-validations and script/ directories** are present in `frontend/` but are excluded
from Oxygen deploy. No action required.

---

## Execution Blocks

### Block 0 — Create Evidence document
**File:** `claude_docs/tasks/task8_evidence.md`
Record: files reviewed, files modified, files added, change summary.
Written after Block 2 completes.

---

### Block 1 — Create `ProductPdfButtons.tsx`
**File (new):** `frontend/app/componentsMockup2/components/ProductPdfButtons.tsx`

The component renders a visually lightweight section with two PDF anchor buttons.

**Section wrapper:** minimal vertical padding (`py-10`), neutral/off-white background
(`bg-[#f5f5f0]`) consistent with the light sections elsewhere. No marketing copy. No
headers larger than a short label if any.

**Button spec:**
```
<a href="..." target="_blank" rel="noopener noreferrer">
  AERATOR PLUS
</a>
```

Tailwind classes for each button:
```
inline-block px-8 py-4 rounded-lg
bg-[#ff0080] border-2 border-[#d4ff00]
text-white font-bold uppercase tracking-widest text-sm
hover:bg-[#cc0066] transition-colors duration-200
```

Two buttons side-by-side (`flex flex-wrap justify-center gap-6`).

**Hardcoded URLs (from intent):**
- AERATOR PLUS → `https://cdn.shopify.com/s/files/1/0640/4833/2903/files/FB-Direct_Ag_Solutions_Areator_Plus_Flyer_PROD.pdf?v=1780594887`
- YIELDBOOST → `https://cdn.shopify.com/s/files/1/0640/4833/2903/files/FB-YIELDBOOST_Brochure_PROD.pdf?v=1780594891`

No props. No state. No imports beyond React (none needed — no Link, no router, pure anchor tags opening external URLs).

---

### Block 2 — Insert into `HomePage.tsx`
**File (modified):** `frontend/app/componentsMockup2/pages/HomePage.tsx`

**Placement:** After `EducationSection`, before `VideoReelsIframe`.

Rationale: `EducationSection` is the informational mid-page zone. PDF brochures are
educational/supplementary product materials — natural fit here. Keeps the button near
content rather than at the extremes (top hero or bottom community CTA).

Change is additive: one import line + one JSX element. No existing line removed or altered.

```tsx
// Before (excerpt):
      <EducationSection />
      <VideoReelsIframe />

// After:
      <EducationSection />
      <ProductPdfButtons />
      <VideoReelsIframe />
```

---

### Block 3 — Write evidence document and update DEVLOG
- Write `claude_docs/tasks/task8_evidence.md`
- Append entry to `claude_docs/DEVLOG.md`

---

## Files Summary

| File | Action |
|---|---|
| `componentsMockup2/components/ProductPdfButtons.tsx` | **Create** |
| `componentsMockup2/pages/HomePage.tsx` | **Modify** (1 import + 1 JSX line) |
| `claude_docs/tasks/task8_evidence.md` | **Create** |
| `claude_docs/DEVLOG.md` | **Append** |

No other files touched.

---

## Constraints Checklist
- [ ] No modifications to HeroSection, FeatureProduct, SoloShopButton, or any existing component
- [ ] No new CSS files (Tailwind arbitrary values only)
- [ ] No props, context, or loader dependencies in `ProductPdfButtons`
- [ ] URLs hardcoded as specified in intent — no env var indirection
- [ ] Both links open in new tab with `rel="noopener noreferrer"`
