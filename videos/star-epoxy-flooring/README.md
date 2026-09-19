# Star Epoxy Flooring — Industrial · Product Promo

1920×1080 · 30 fps · 39 s · H.264 · silent.
Built with HyperFrames to the **Starshield Product Video Style Guide v1.1**, Variant B
(Brand Red / White / Black).

Deliverable: `renders/video.mp4` · contact sheet: `renders/contact-sheet.jpg`

## Layers

| File | What it is |
|---|---|
| `BRIEF.md` | the confirmed brief — every decision and its receipt |
| `STORYBOARD.md` | the seven scenes, their shot sequences, and the video direction block |
| `frame.md` | the design system, transcribed from the client style guide |
| `assets/styles/house.css` | the single source of the house style — every brand device lives here |
| `tools/build-frames.mjs` | regenerates all seven scene compositions from one spec |
| `compositions/frames/*.html` | the generated scenes (do not hand-edit) |

## Rebuilding

Scene HTML is **generated**. Edit `assets/styles/house.css` (look) or
`tools/build-frames.mjs` (content/motion), never the frame HTML directly:

```bash
node tools/build-frames.mjs     # regenerate all seven scenes
npx hyperframes check           # lint + runtime + layout + motion + contrast
npx hyperframes snapshot --at 3,7.5,12.5,18,24.5,30,36
npx hyperframes render --quality high --output renders/video.mp4
```

`house.css` is inlined into each scene at build time — a `<link>` inside a
sub-composition `<template>` does not apply, so the stylesheet must be inlined.

## Environment notes

This project was built where stock-photo hosts, the Shopify CDN and jsdelivr are all
blocked. Consequences, all deliberate:

- **Backgrounds are engineered, not photographed** — a receding glossy epoxy plane in
  perspective with specular bloom, depth haze, horizon and grain. This is a documented
  deviation from the style guide's "real stock photo" checklist line.
- **GSAP and the webfonts are vendored** into `assets/` rather than loaded from a CDN.
- **The STARSHIELD logo is a CSS/SVG reconstruction** in the brand colours, not the
  official vector. Swapping in the real SVG is a one-file change in `tools/build-frames.mjs`.

## Sourcing

Every on-screen number traces to the Star Epoxy Flooring Technical Data Sheet, except
the **−20 °C…120 °C service temperature** and the **500 µm–2 mm film thickness**, which
are published on the official product page and not in the TDS results table. The service
temperature carries a † and an on-screen source line in Scene 5.

No pack sizes and no prices appear anywhere: the storefront and the TDS disagree on every
pack size, and the 15 L variant's selling price currently exceeds its own MRP.
