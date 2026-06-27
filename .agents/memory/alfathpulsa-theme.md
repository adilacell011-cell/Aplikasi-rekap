---
name: AlfathPulsa theme system ("Fresh Light")
description: How theming works app-wide and the current light-first design direction.
---

# AlfathPulsa theme system

The app has **light & dark modes** (`data-mode` on `<html>`) plus an accent color (`data-theme`), driven by `themeStore` (zustand, persisted). Theme attributes are applied at the **App root** so the Login and loading screens are themed too — not only inside `Layout` (which also sets them). If you add a screen rendered before `Layout`, it still gets themed via the App-root effect.

Current direction is **light-first ("Fresh Light")**: airy blue gradient canvas, crisp white cards with soft shadows, and colorful gradient rounded-square menu icon tiles (white icons). Dark mode is retained as a calm ambient-blue option (no heavy frosted-glass anymore).

All theme styling lives as **global utility-class overrides in `artifacts/alfathpulsa/src/index.css`**, NOT per-component — edit the `[data-mode='light']` / `:root:not([data-mode='light'])` blocks and the `--bg-asphalt-*` / `--brand-*` vars there. The colorful menu-tile gradients are the one exception: they're a per-label map inside the `ServiceIcon` component in `Dashboard.tsx`.

**Why:** the user explicitly rejected the earlier dark "glowing glass" theme as "kurang puas dan kurang pas" and asked for a light/fresh look matching a reference image. **How to apply:** to retune the look, edit the index.css override blocks; to recolor menu tiles, edit the `serviceStyles` map in `ServiceIcon`. Verify with the testing skill logged in as admin/admin123 (effects only show over real content).

**Persist-key gotcha:** the themeStore persist `name` is versioned (`alfath-theme-storage-v2`). Bumping it forces existing users back to defaults — and resets **both** the mode and the accent color, not just the mode. Bump it only when you intend that reset.
