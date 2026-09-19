# Asset inventory — Star Epoxy Flooring (Industrial)

No site capture was performed: `starshieldpaints.com` and `cdn.shopify.com` are both
blocked by this environment's egress policy (403 on CONNECT). The brief supplied the
source material directly, which is the workflow's sanctioned no-capture condition.

All five assets below were supplied by the user, not scraped.

| File | What it is | Where it belongs |
|---|---|---|
| `assets/hero-banner.jpg` (1884x835) | Official landing-page hero banner: industrial warehouse with glossy epoxy floor, yellow racking, the four-part product group, and the STARSHIELD logo. Carries its own headline text, so it is a brand/colour reference — not a clean background plate. | Reference only. Not composited. |
| `assets/pack-flooring.webp` (2000x2000) | Star Epoxy Flooring Part A + Part B, two magenta/pink tins on white. The core 2-component product. | Scene 1 HERO — right-hand product zone. |
| `assets/pack-topcoat.jpg` (2000x2000) | Star Epoxy Shield Top Coat Part A, gold tin on white. "High-Performance Epoxy Top Coat / For Seamless & Joint free floors". | Scene 5 SPECS — right-hand product zone. |
| `assets/pack-primer.jpg` (2000x2000) | Star Epoxy Shield Primer Part A, pink tin on white. "For concrete, tiles, wood, metal surfaces". | Scene 6 APPLY — step tile 1 (prepare/prime). |
| `assets/pack-screed.jpg` (2000x2000) | Star Epoxy Shield Screed Part A, orange tin on white. "Self-Leveling Epoxy Floor Screed". | Scene 6 APPLY — step tile 2 (level/screed). |

## Preparation note

All four pack shots are product-on-pure-white. They are composited onto near-black
scenes, so each needs its white ground cut to alpha before use. The tins have white
lids and white label bands, so a naive white chroma-key would punch holes through the
product — background removal must be edge-connected (flood fill from the border) or
model-based, never a global colour key.

## Backgrounds

No photographic backgrounds are available (stock hosts and the HeyGen image catalog are
both unreachable). Dark-scene grounds are engineered in CSS per the confirmed brief.
