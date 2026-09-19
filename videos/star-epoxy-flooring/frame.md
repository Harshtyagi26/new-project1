---
version: alpha
name: Starshield Promo — Frame (video / frame layer)
description: >
  The Starshield house promo style, Variant B (Brand Red / White / Black), transcribed from
  "STARSHIELD PRODUCT VIDEO — STYLE GUIDE v1.1" (Sept 2026) for Star Epoxy Flooring (Industrial).
  Atoms are sacred: near-black ground, the single accent red, Montserrat 900 uppercase headlines
  over Poppins chrome and body, the baseline tick motif on every dark scene, the two-layer scrim
  under every full-bleed ground, and the white end card. Composition is per-scene.
unit: the frame — 1920x1080, 30fps
principle: atoms are sacred · every number traces to the TDS · the tick motif never leaves a dark scene

colors:
  near-black: "#0a0a0a"
  ground-a: "#151515"
  ground-b: "#0d0d0d"
  accent-red: "#E5484D"
  brand-red: "#C1272D"
  brand-red-dark: "#8C1B20"
  pure-white: "#FFFFFF"
  ink: "#1A1A1A"
  support-text: "#dcdcdc"
  card-desc: "#c9c9c9"
  pill-text: "#eaeaea"
  end-tagline: "#6b6b6b"
  hairline: "rgba(255,255,255,0.10)"
  card-fill: "rgba(255,255,255,0.045)"
  card-border: "rgba(255,255,255,0.09)"

typography:
  # Montserrat 900 uppercase = every headline. Poppins = everything else. No third family.
  hero-headline:  { fontFamily: "Montserrat", cqw: 5.6,  weight: 900, lineHeight: 1.04, tracking: "0.5px", upper: true }
  headline:       { fontFamily: "Montserrat", cqw: 3.6,  weight: 900, lineHeight: 1.06, tracking: "0.5px", upper: true }
  stat-number:    { fontFamily: "Montserrat", cqw: 9.9,  weight: 900, lineHeight: 0.92, tracking: "-1px" }
  stat-unit:      { fontFamily: "Montserrat", cqw: 2.5,  weight: 900, lineHeight: 1.1,  upper: true }
  card-title:     { fontFamily: "Montserrat", cqw: 1.56, weight: 800, lineHeight: 1.15, upper: true }
  end-headline:   { fontFamily: "Montserrat", cqw: 5.6,  weight: 900, lineHeight: 1.0,  tracking: "0.5px", upper: true }
  eyebrow:        { fontFamily: "Poppins", cqw: 1.09, weight: 600, tracking: "5px", upper: true }
  support:        { fontFamily: "Poppins", cqw: 1.40, weight: 400, lineHeight: 1.55 }
  card-body:      { fontFamily: "Poppins", cqw: 1.09, weight: 400, lineHeight: 1.55 }
  pill:           { fontFamily: "Poppins", cqw: 0.94, weight: 500, tracking: "0.5px" }
  tile-caption:   { fontFamily: "Poppins", cqw: 1.04, weight: 500, lineHeight: 1.4 }
  step-num:       { fontFamily: "Montserrat", cqw: 1.9, weight: 900 }
  end-subhead:    { fontFamily: "Poppins", cqw: 1.40, weight: 500 }
  end-tagline-t:  { fontFamily: "Poppins", cqw: 1.15, weight: 500, tracking: "6px", upper: true }
  end-caption:    { fontFamily: "Poppins", cqw: 1.04, weight: 400 }

spacing:
  edge-x: "120px"     # text column always starts here on text-led scenes
  logo-box: "230x64px at top-right, all scenes"
  product-zone: "right 35-40% of frame width on Hero / Why / Stat / Specs"
  tick-baseline: "56px above the bottom edge"
  rule-size: "120x5px"
  support-max-width: "960px"

components:
  eyebrow:
    typography: "{typography.eyebrow}"
    color: "{colors.accent-red}"
    marker: "34px x 3px accent bar before the text, 14px gap"
    description: "Scene label. Shares its color with the one highlighted headline word — always."
  headline:
    typography: "{typography.headline} / {typography.hero-headline}"
    color: "{colors.pure-white}"
    highlight: "exactly one word in {colors.accent-red}"
    description: "Never tint the whole headline. Plain white, one accent word."
  rule:
    backgroundColor: "{colors.brand-red}"
    size: "120x5px"
    description: "Divider under the headline. Uses the deeper brand red, never the bright accent."
  support:
    typography: "{typography.support}"
    color: "{colors.support-text}"
    maxWidth: "960px"
    description: "One sentence. The scene's single idea, stated plainly."
  benefit-card:
    background: "{colors.card-fill}"
    border: "1px solid {colors.card-border}"
    radius: "14px"
    typography: "{typography.card-title} + {typography.card-body}"
    icon: "44px square, {colors.accent-red} stroke"
    description: "Card count decides the grid: 2 -> 2-up wide (icon left), 3 -> 1x3 tall (icon top), 4 -> 2x2 wide-short (icon left). Never leave dead space at a card's bottom."
  spec-chip:
    background: "{colors.card-fill}"
    border: "1px solid {colors.card-border}"
    radius: "12px"
    typography: "{typography.stat-unit} value + {typography.pill} label"
    description: "Compact spec readout for the specs beat. Value in white, unit in accent, label in pill grey."
  step-tile:
    overlay: "linear-gradient(180deg, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.88) 100%)"
    radius: "14px"
    typography: "{typography.step-num} top-left in {colors.accent-red} + {typography.tile-caption} bottom"
    description: "Numbered application tile. 2-3 per scene."
  pill:
    background: "rgba(255,255,255,0.06)"
    border: "1px solid {colors.card-border}"
    radius: "100px"
    typography: "{typography.pill}"
    color: "{colors.pill-text}"
    description: "Wrapped row of spec tags under the step tiles."
  tick-motif:
    line: "2px horizontal gradient, transparent -> {colors.accent-red} -> transparent"
    ticks: "18-24 marks, 10px wide, 16px tall, gradient {colors.accent-red} -> {colors.brand-red-dark}, 4px radius on top corners, 34px gutter, 72px side padding, 55% opacity"
    placement: "56px above the bottom edge"
    description: "THE identifying brand device. Every dark scene. Never the end card."
  scrim:
    layer1: "linear-gradient(100deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.20) 100%)"
    layer2: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.55) 100%)"
    description: "Two layers, always both. Never a flat single-color overlay - that reads as a box, not a graded scrim."
  floor-environment:
    description: "The engineered ground standing in for stock photography. A receding glossy epoxy plane in perspective at the lower third, a soft elliptical specular bloom, a wide radial haze, a 1px horizon hairline, and a fine grain layer. Built per scene with a different hue-lean and camera height so no two scenes share a frame."
  end-card:
    background: "{colors.pure-white}"
    rings: "3 concentric outlines, r=170/255/340px, 1.5px #e5e5e5, bleeding off the top-right corner"
    marks: "3 rotated 'diamond' dots, centered, {colors.brand-red}"
    typography: "{typography.end-headline} in {colors.brand-red} + {typography.end-tagline-t} in {colors.end-tagline} + boxed {typography.end-subhead} in {colors.ink}"
    description: "Centered on white. No tick motif. Formula: mark -> product name -> 3-word tagline -> boxed descriptor -> caption."
---

# Starshield Promo Frame

## Overview

A short, punchy vertical-of-facts product promo: dark cinematic ground with a bold editorial
type system laid over it, closing on a white end card. This spec is Variant B of the client's
two-variant system — the corporate Brand Red / White / Black palette that matches the STARSHIELD
wordmark and holds across the whole product line.

## The Frame

1920x1080 at 30fps. Six-to-seven scenes, 5-7s each, 33-40s total. Every scene is one idea:
a single eyebrow, one headline, one support line.

## Composition Rules

- **Text-led scenes** (Hero / Why / Stat / Specs): left-aligned column starting at x=120px —
  eyebrow, headline, 120x5px rule, support text (max 960px). The right 35-40% of the frame
  carries the product; the top-right 230x64 carries the logo. Nothing else enters those zones.
- **Benefits grid**: card count decides the grid shape. Match the internal card layout to the
  cell's aspect ratio — icon-top/text-stacked needs a tall cell, icon-left/text-right needs a
  short-wide cell — or the card overflows or leaves a visible gap at its bottom.
- **Application scene**: eyebrow + headline at top, 2-3 numbered tiles, a wrapped pill row below.
- **End card**: centered on white, rings bleeding off the top-right corner.

## Color Rules

- The eyebrow and the one highlighted headline word always share the accent red.
- Headline body text is plain white on dark, ink on the white end card — never the accent.
- The divider rule uses the deeper brand red (#C1272D), not the bright accent (#E5484D).
- Never place a palette color on a ground without the two-layer scrim beneath it.

## Motion

Entrances only — nothing idles, pulses, or loops. Background drift (scale 1 -> 1.08 across the
full scene, linear) is the single non-eased move; everything else uses an "out" ease so it
settles rather than stopping. A big number gets the spring pop (back.out); plain text never does.

## Don'ts

- No third typeface.
- No flat single-color overlay in place of the graded scrim.
- No tick motif on the end card.
- No certification or registration wall — it is noise, not proof.
- No invented statistic, certification, or duration. Every number traces to the TDS or the
  official product page, and any non-TDS figure is flagged to the client before it goes in.
