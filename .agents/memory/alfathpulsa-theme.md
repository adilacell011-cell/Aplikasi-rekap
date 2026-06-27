---
name: AlfathPulsa theme system ("Neumorphism Tajam + Lampu")
description: How theming works app-wide and the current light-first design direction.
---

# AlfathPulsa theme system

The app has **light & dark modes** (`data-mode` on `<html>`) plus an accent color (`data-theme`), driven by `themeStore` (zustand, persisted). Theme attributes are applied at the **App root** so the Login and loading screens are themed too — not only inside `Layout` (which also sets them). If you add a screen rendered before `Layout`, it still gets themed via the App-root effect.

Current direction is **light-first ("Neumorphism Tajam + Lampu")**: one soft cool-gray surface (`#E4E8EF`) shared by canvas + cards; cards are raised via twin neumorphic shadows (`--neu-light` top-left, `--neu-dark` bottom-right); inputs and inner panels (`.bg-asphalt-900/40|50|60`) are inset/carved-in; borders are kept transparent/minimal; solid brand buttons (`.bg-brand-500`) get a glowing blue "lampu" shadow. Big balance nominals stay dark charcoal (not glowing) via the global `.text-white` → dark override. Dark mode is retained as a calm ambient-blue option (neumorphism is light-mode only).

All theme styling lives as **global utility-class overrides in `artifacts/alfathpulsa/src/index.css`**, NOT per-component — edit the `[data-mode='light']` / `:root:not([data-mode='light'])` blocks and the `--bg-asphalt-*` / `--brand-*` / `--neu-*` vars there. Menu service tiles are also CSS-driven now: the old per-label rainbow gradient map was removed from `ServiceIcon` (`Dashboard.tsx`); each tile just emits `.menu-tile` (one raised neumorphic surface) + `.menu-tile-icon` (single blue `--brand-500` accent), styled in index.css. All buttons get a tactile press (`:active` → carve-in inset + slight scale-down) so taps "feel alive" — the user explicitly asked for this and for the unified, de-rainbowed menu.

**Why:** the user rejected the earlier dark "glowing glass" theme and a later "Fresh Light" white-card look, then approved sharp neumorphism + glow via a canvas mockup. **How to apply:** to retune the look, edit the index.css override blocks; to restyle menu tiles, edit the `.menu-tile` / `.menu-tile-icon` rules in index.css (there is no longer any color map in `ServiceIcon`). Neumorphic effects only show over real logged-in content, so verify with the testing skill (log in with the seeded admin documented in `replit.md` → "Default login").

**Gotcha — global input shadow vs focus ring:** the light-mode `input/textarea/select` override sets `box-shadow: ... !important` for the inset look, which suppresses Tailwind's `focus:ring` (also box-shadow). A dedicated `input:focus` rule restores a visible brand focus ring — keep it if you touch the form-field overrides.

**Gotcha — fluid fonts:** `html { font-size: clamp(...) }` (plus a short-landscape `@media`) scales all rem-based Tailwind sizes (text AND spacing) so nothing looks oversized across phone/tablet/orientation. Fixed `px` sizes (`text-[10px]` etc.) do NOT scale by design.

**Persist-key gotcha:** the themeStore persist `name` is versioned (`alfath-theme-storage-v2`). Bumping it forces existing users back to defaults — and resets **both** the mode and the accent color, not just the mode. Bump it only when you intend that reset.
