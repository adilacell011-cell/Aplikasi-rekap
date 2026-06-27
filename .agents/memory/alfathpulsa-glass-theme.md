---
name: AlfathPulsa "Kaca Bercahaya" glass theme
description: Where the glowing-glass UI styling lives and how it's applied app-wide.
---

# AlfathPulsa glowing-glass ("Kaca Bercahaya") theme

The dark-mode glass + glow look is applied **globally from `artifacts/alfathpulsa/src/index.css`**, NOT per-component. It overrides existing Tailwind utility classes rather than editing the 13 component files.

Key rules (all scoped to `:root:not([data-mode='light'])` so Light Mode stays untouched):
- `.bg-asphalt-800` (and the `/50`, `bg-asphalt-900/40|50|60` soft variants) become translucent + `backdrop-filter: blur()` = frosted glass. This is the dominant card/header/nav/input surface.
- `body` gets an ambient blue radial-gradient "lamp" glow (brand `#0084FF`), `background-attachment: fixed`.
- Large card radii `rounded-[2.5rem]`/`rounded-[2rem]` are shrunk (~1.3-1.5rem) and `.p-7` trimmed, because the user felt cards were "kebesaran" (oversized).
- Those large-radius cards + `.bg-brand-500/600` buttons get a brand-blue glow box-shadow (rim light).

**Why:** restyling via global utility overrides keeps the redesign consistent everywhere and avoids touching every component. **How to apply:** to tweak the glass/glow intensity, edit the `--glass-*` / `--glow-brand` vars and the box-shadow blocks in index.css; do not hand-edit component class strings. Verify with the testing skill logged in as admin/admin123 since the effect only shows over real content.
