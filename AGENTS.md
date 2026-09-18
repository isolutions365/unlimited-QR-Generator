# Agent Guidelines & UI/UX Pro Max Design Intelligence

This repository has the **UI/UX Pro Max** design intelligence skill installed directly from GitHub (`https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`).

## Installed Skill Directories
- `.agent/skills/ui-ux-pro-max/`
- `.agents/skills/ui-ux-pro-max/`
- `.claude/skills/ui-ux-pro-max/`

### Companion Design Skills Included:
1. `ui-ux-pro-max`: Core design intelligence with 79 UI styles, 192 product palettes, 74 font pairings, 119 UX guidelines, 105 curated icons, 17 animation presets, 25 chart types, and 22 technology stacks.
2. `ui-styling`: Accessible UI styling and component patterns (Tailwind CSS, Radix UI, headless components).
3. `design-system`: Design tokens, layout logic, typography scales, and component specs.
4. `design`: High-level creative direction and layout design systems.
5. `brand`: Brand guideline templates, asset organization, and color management.
6. `banner-design`: Standard dimensions, aspect ratios, and styles for web/social banners.
7. `slides`: Presentation decks and visual narrative structures.

---

## Design Intelligence Search Tool
Whenever designing, refactoring, or polishing user interfaces, query the local database using Python:

```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
```

### Search Domains:
- `--domain style`: 79 UI styles (Bento Box, Glassmorphism, Brutalism, Minimalist Swiss, Neumorphism, Data-Dense, etc.)
- `--domain product`: 192 product types with tailored style recommendations, landing page patterns, and dashboard layouts
- `--domain color`: Color palettes, harmony rules, semantic tokens, and light/dark contrast specs
- `--domain typography`: Font pairings, scale multipliers, baseline line-heights, and character widths
- `--domain ux`: 119 UX rules, accessibility standards, touch guidelines, and interaction feedback
- `--domain icon`: Curated icon mappings (Lucide React) and sizing specs
- `--domain chart`: 25 chart types with best-fit use cases and accessibility considerations
- `--domain gsap`: Animation curves, duration presets, and micro-interaction timings
- `--domain stack`: Framework-specific best practices (React, Tailwind CSS, etc.)

---

## Priority Order for UI/UX Decisions
1. **Accessibility (CRITICAL)**: WCAG AA contrast (≥ 4.5:1 for body text), visible focus rings, full keyboard navigability, semantic ARIA labels, zero gray-on-color text.
2. **Touch & Interaction (CRITICAL)**: Minimum 44×44px interactive touch targets, minimum 8px touch spacing, instant visual feedback on click/tap, loading state indicators.
3. **Performance (HIGH)**: Modern image formats, lazy loading, reserved aspect ratios to prevent Cumulative Layout Shift (CLS < 0.1).
4. **Style Selection (HIGH)**: Match product archetype directly, maintain consistent corner radii and shadow logic (`Inner Radius = Outer Radius - Padding`).
5. **Layout & Responsive (HIGH)**: Mobile-first responsive hierarchy, fluid container bounds (`max-w-7xl mx-auto`), zero horizontal scroll on mobile.
6. **Typography & Color (MEDIUM)**: Minimum 16px body font size, line-height 1.5–1.7, line width 65–75ch, mathematically stepped heading ratios.
7. **Animation & Motion (MEDIUM)**: Context-aware timing with Framer Motion (`motion/react`), meaningful spatial transitions, respectful of `prefers-reduced-motion`.
8. **Forms & Feedback (MEDIUM)**: Visible field labels, inline error messages adjacent to inputs, progressive disclosure for long flows.
9. **Navigation Patterns (HIGH)**: Clear breadcrumbs, persistent accessible back navigation, mobile bottom navigation capped at 5 primary actions.
10. **Charts & Data (LOW)**: Color palettes with secondary shape/label encoding, responsive tooltips, clear legend keys.
