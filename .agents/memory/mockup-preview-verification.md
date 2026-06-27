---
name: Mockup preview verification quirk
description: Why external_url screenshots blank out on some canvas mockups, and what to use instead
---

# Verifying canvas/mockup-sandbox previews

The `screenshot` tool with `type: external_url` (Firecrawl) can return a fully BLANK
white image for components that are actually fine — it chokes on heavy
`backdrop-filter: blur(...)` + multi-stop gradients (e.g. glassmorphism dashboards).
Repeating the external_url screenshot does NOT help; it blanks consistently.

**How to apply:** To verify a mockup-sandbox preview renders, use
`screenshot` with `type: app_preview`, `artifact_dir_name: "mockup-sandbox"`,
`path: "/preview/<group>/<Component>"`. That uses the real workspace browser
(localhost:80/__mockup/...), renders correctly, AND returns the browser console log
so you can spot real runtime errors. Trust app_preview over external_url here.

Also: avoid CSS `@import url(google fonts)` inside a mockup's `_group.css` — the
mockup-sandbox preview shell loads fonts via non-blocking <link> on purpose because
`@import` is render-blocking. Use a font-family fallback stack instead.
