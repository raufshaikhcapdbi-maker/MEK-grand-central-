# Design QA: MEK Grand Central Final Fixes

## Source and Evidence

- Source visual truth:
  - `C:\Users\User\AppData\Local\Temp\codex-clipboard-7c06d561-e683-447a-8784-1fde84b6f0eb.png`
  - `C:\Users\User\AppData\Local\Temp\codex-clipboard-3070e4c7-ef24-4768-8e2e-332e129afaf0.png`
  - `C:\Users\User\AppData\Local\Temp\codex-clipboard-40c7860d-208f-4afc-b04d-a820c033c161.png`
  - `C:\Users\User\AppData\Local\Temp\codex-clipboard-c20ce534-39f4-4d61-aecb-b2791a5740aa.png`
- Live implementation: `http://localhost:4173/`
- Combined comparison input: `qa/final-fixes/comparison-board.png` at 1494 x 1642 pixels.
- Desktop implementation evidence: `qa/final-fixes/modal-1366.png`, `header-top-1366.png`, `amenities-1366.png`, and `preloader-1366.png`.
- Mobile implementation evidence: `qa/final-fixes/modal-390.png` and `amenities-390.png`.
- Desktop viewport: 1366 x 768 CSS pixels at density 1.
- Mobile viewport: 390 x 844 CSS pixels at density 1.
- Short mobile states: 390 x 667 and 320 x 568 CSS pixels at density 1.
- Normalization: source and implementation captures were aspect-fit into equal 720 x 350 comparison cells without stretching.
- States: animated preloader, scrolled transparent-to-solid header, modal opened over Gallery, modal closed by button/Escape/backdrop, and active amenities preview.

## Findings

- No actionable P0, P1, or P2 findings remain.
- The compact modal intentionally has no visible scrollbar when all content fits. At shorter viewport heights, its single panel becomes the only vertical scroller.

## Required Fidelity Surfaces

- Fonts and typography: the existing serif/sans system is unchanged. Modal heading scale, labels, fields, and CTA spacing are reduced without losing hierarchy.
- Spacing and layout rhythm: desktop modal is approximately 960 x 645 px at 1366 x 768 instead of filling the viewport. Mobile padding and field heights are compact and stable.
- Colors and visual tokens: existing black, ivory, green, and gold tokens are preserved. The scrolled header has no bottom border or hard shadow.
- Image quality and asset fidelity: amenity images use their original 3:2 ratio with `object-fit: contain`; source content remains fully visible at all tested widths.
- Copy and content: enquiry form copy and project facts are unchanged.
- Icons and affordances: existing close, CTA, navigation, sticky-action, and scroll-top controls remain intact.
- Accessibility: focus restoration, Escape close, backdrop close, labelled controls, reduced-motion behavior, and body scroll locking are preserved.

## Comparison History

### Pass 1

- Findings: the modal was 1160 px wide with excessive internal spacing; body restoration inherited global smooth scrolling; the header used a visible bottom border; amenity imagery was cropped with `cover`; the preloader showed a percentage counter and progress line.
- Result: blocked pending corrections.

### Pass 2

- Fixes: reduced modal width, height, padding, heading, field, and CTA dimensions; constrained overflow to one panel; added fixed-body position preservation and immediate exact restoration; removed header border/shadow; changed amenity frames and imagery to matching 3:2 contain behavior; replaced progress UI with the supplied animated logo.
- Post-fix evidence: `qa/final-fixes/comparison-board.png` and the focused captures listed above.
- Result: no remaining P0/P1/P2 mismatch.

## Verification

- Responsive widths checked: 320, 375, 390, 414, 768, 1024, and 1440 px.
- Short-height modal checks: 390 x 667 and 320 x 568.
- Popup: contained within viewport, `overflow-x: hidden`, one `overflow-y: auto` panel, fixed body lock, exact scroll restoration, and no layout overflow.
- Close behavior: close button, overlay area, and Escape all pass.
- Logo: header brand retains `href="#top"`; JavaScript prevents navigation/reload and smoothly scrolls to zero from other sections.
- Header: computed bottom border is `0px` and box shadow is `none` in both top and scrolled states.
- Images: amenity preview remains visible with a 1.5 ratio and `object-fit: contain` at every tested breakpoint.
- Preloader: supplied logo renders; percentage/progress nodes count is zero.
- Console: no warnings or errors.
- Images: no completed image has zero natural dimensions.

## Final Result

final result: passed
