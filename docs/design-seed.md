# Editorial design seed

Reference: https://toss.tech/ (2026-10-24).

## Observed reference

The public page source uses white, neutral gray text and surfaces, category navigation, article thumbnails, and blue interactive accents. Observed source colors include #ffffff, #f9fafb, #6b7684, #8b95a1, and #3182f6. Browser visual inspection was unavailable; exact spacing is not a measured copy.

## Applied interpretation

- White background #ffffff; main text #333d4b; secondary text #6b7684; subtle surface #f2f4f6; border #e5e8eb.
- Replace blue interactive accents with forest green #246b50; soft selected surface #eaf4ee. Green text on white is approximately 6.3:1 contrast.
- Pretendard throughout, 100% base sizing; desktop article body 18px, mobile 17px. Use weight and whitespace for hierarchy.
- Home: start directly with recent writing, one featured article with a large cover, then image-and-text rows. No introduction banner or replacement slogan. Keep AI briefings and projects.
- Featured title 32px desktop / 27px mobile; regular titles 24px / 19px.
- Content page maximum width 1080px including padding. At 700px, the featured article stacks; regular rows retain a compact thumbnail.
- All nine current posts have individual vector illustrations exported as 1200×750 PNGs and attached through frontmatter. The same PNG appears in lists, article headers, and social sharing. Source SVGs and the generator are retained for editing. Future posts without a cover have a CSS fallback. No reference images, logos, or source components are reused.
- Preserve category URLs, search, RSS, theme toggle, diagrams, and comments. Article and project pages have no table of contents: center the body column in the viewport, keep text left-aligned, and let wide diagrams expand symmetrically.
- Dark mode uses neutral charcoal surfaces and brighter green accents. Reduced-motion users receive no thumbnail movement.
- Article components share gray panels and 14px corners: code blocks, inline code, tables, quotes, and diagrams. Code syntax retains meaningful string/type/error colors. All 15 body SVGs receive the shared light/dark palette at build time. The timeout diagram has a dedicated mobile layout.

## Approved palette (2026-10-24)

This is the accepted design baseline. Reuse it for new articles, diagrams, and code blocks. Do not reintroduce brown accents or use unrelated decorative hues.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#ffffff` | `#17191c` |
| Content panel | `#f2f4f6` | `#202329` |
| Main text | `#333d4b` | `#e5e8eb` |
| Secondary text | `#6b7684` | `#b0b8c1` |
| Link / interactive accent | `#246b50` | `#4fbe8f` |
| Graph: primary work | `#246b50` | `#80cfa7` |
| Graph: review / waiting | `#4f9699` | `#4f9699` |
| Graph: boundary / return / rework | `#b2c77d` | `#b2c77d` |
| Graph: context | `#a6afb9` | `#77838f` |

Graph labels use separate darker text tokens, not light bar fills. Preserve category labels and values so meaning never depends on color alone. Text warnings and syntax errors may retain red. Details and semantic mappings live in `docs/diagrams.md`.

Code uses forest green for keywords/functions, teal for strings, and leaf green for numbers/types. Panels use 14px corners; inline code and table headers use their smaller component radii. Article column widths are 684px for technical/project writing and 594px for essays, with responsive side padding.

## Files

`src/styles/tokens.css`: color tokens. `src/styles/editorial.css`: editorial typography and layout overrides. `PostListItem.astro` and `ArticleCover.astro`: reusable presentation. `scripts/generate-post-covers.mjs`: source artwork and repeatable export.

`src/styles/article-content.css`: article components. `src/styles/diagram-theme.css`: canonical light/dark diagram tokens, synchronized automatically during build. `src/lib/code-themes.mjs`: syntax highlighting. `docs/diagrams.md`: diagram conventions.

Local mockups and generated review PNGs are ignored by Git; the design source and generators are versioned.

## Project covers (2026-10-24)

The four project covers use original vector illustrations in the same white/gray/forest-green palette. `scripts/generate-project-covers.mjs` writes editable SVGs and 1200×750 PNGs under `public/images/projects/<id>/`. Project frontmatter `cover` supplies the same image to cards and detail headers. These are conceptual illustrations; existing screenshots, awards, and experiment images remain the evidence. Regenerate with `node scripts/generate-project-covers.mjs`.
