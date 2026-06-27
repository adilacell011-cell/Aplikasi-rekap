---
name: BlockChoice (no native selects)
description: Convention — AlfathPulsa frontend uses an inline block selector instead of native <select> dropdowns
---

AlfathPulsa intentionally has NO native `<select>` dropdowns in the frontend. Every dropdown is the inline `BlockChoice` component (`artifacts/alfathpulsa/src/components/BlockChoice.tsx`): a `role="radiogroup"` of selectable blocks.

**Why:** The user (non-technical, mobile PWA) found OS-native select popups jarring and explicitly asked that "every choice becomes a block that lays out inline." Native popups are also inconsistent with the neumorphic theme.

**How to apply:** When adding any new choice/picker UI, use `BlockChoice` (value/onChange of strings; convert numbers via `String(...)` / `parseInt(...)`). Do not introduce a native `<select>`. Because the native `required` attribute no longer enforces selection, required single-choice fields must validate in the submit handler and surface feedback via `iosAlert` (see SalarySlips member picker), not a silent return.
