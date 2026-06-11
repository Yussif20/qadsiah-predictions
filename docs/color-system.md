# فارس المونديال — Color System

Source of truth: `src/index.css` (`@theme` block + utility classes). Dark-only theme.
Brand yellow/red verified from Al-Qadsiah FC's official logo SVGs.

## Brand core
| Token | Hex | Role |
|---|---|---|
| primary | #F9DF00 | Club yellow — CTAs, highlights, digits, focus ring |
| accent | #EE0000 | Club red — event actions, wheel pointer, urgency |
| gold-deep | #C9B400 | Darker gold — bottom stops of gradients |

## Surfaces
| Token | Hex | Role |
|---|---|---|
| background | #0B0905 | Page base (warm near-black) |
| card | #161208 | Card / popover fill |
| secondary / muted | #241E0F | Inset surfaces, chips, inputs |
| border / input | #332B16 | Hairlines, input borders |
| glass | rgba(22,18,8,0.75) + blur(16px) | Sticky headers |
| body backdrop | radial #3D3406 → #241E06 → #120E04 → #0B0905 | Golden top glow |

## Text
| Token | Hex | Role |
|---|---|---|
| foreground | #FBF7EA | Primary text (warm off-white) |
| muted-foreground | #B0A788 | Secondary text, hints, dates |
| primary-foreground | #181400 | Dark text on yellow |
| accent-foreground | #FFFFFF | Text on red |

## Semantic
| Token | Hex | Used for |
|---|---|---|
| success | #22C55E | Exact tier, added, completed |
| warning | #F59E0B | Closest tier, locked, warnings |
| destructive | #EF4444 | Delete actions |
| info | #38BDF8 | Upcoming status |

## Signature gradients
| Where | Stops |
|---|---|
| btn-cta | #FFEB3D → #F9DF00 (55%) → #C9B400; glow rgba(249,223,0,.30) |
| btn-cta-accent | #FF4D4D → #EE0000 (55%) → #A30000 |
| text-gradient-gold | #FFF7B0 → #F9DF00 (60%) → #C9B400 |
| card-elevated border | 165deg rgba(249,223,0,.28) → rgba(51,43,22,.6) → rgba(238,0,0,.14) |
| card-gold border | 165deg rgba(249,223,0,.65) → rgba(201,180,0,.25) → rgba(51,43,22,.7) → rgba(238,0,0,.35) |
| wheel segments | #F9DF00, #1D1810, #EE0000, #2A2310 (text: #181400 / #F9DF00 / #FFFFFF) |

## Fonts
Cairo (Arabic, RTL default) · Space Grotesk (Latin) · Bebas Neue (digits only — no Arabic glyphs)
