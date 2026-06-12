# Qadsiah Predictions — Color System

Source of truth: `src/index.css` (`@theme` block + utility classes). Dark-only theme.
Palette sampled from the club's official World Cup 2026 backdrop artwork
(`public/images/app-bg.jpg`); gold remains an artwork-only accent (the trophy).

## Brand core
| Token | Hex | Role |
|---|---|---|
| primary | #45B75A | Bright green — CTAs, highlights, digits, focus ring |
| accent | #B4D337 | Lime — event actions, wheel pointer, urgency |
| primary-deep | #2E8C44 | Darker green — bottom stops of gradients |
| (artwork) | #0B4C40 / #0B5332 | Deep teal + flag green — backdrop/poster surfaces |

## Surfaces
| Token | Hex | Role |
|---|---|---|
| background | #04120F | Page base (green near-black) |
| card | #0A1F18 | Card / popover fill |
| secondary / muted | #11332A | Inset surfaces, chips, inputs |
| border / input | #1B3D33 | Hairlines, input borders |
| glass | rgba(10,31,24,0.75) + blur(16px) | Sticky headers |
| body backdrop | radial #11604E → #0A3C31 → #051F19 → #04120F | Green top glow |

## Text
| Token | Hex | Role |
|---|---|---|
| foreground | #EFFAF3 | Primary text (mint off-white) |
| muted-foreground | #9CBFAF | Secondary text, hints, dates |
| primary-foreground | #04150F | Dark text on bright green |
| accent-foreground | #1A2405 | Dark text on lime |

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
| btn-cta | #6FD584 → #45B75A (55%) → #2E8C44; glow rgba(69,183,90,.30) |
| btn-cta-accent | #C8E156 → #B4D337 (55%) → #87A622 |
| text-gradient-brand | #C8F0D2 → #45B75A (60%) → #2E8C44 |
| card-elevated border | 165deg rgba(69,183,90,.28) → rgba(27,61,51,.6) → rgba(180,211,55,.14) |
| card-brand border | 165deg rgba(69,183,90,.65) → rgba(46,140,68,.25) → rgba(27,61,51,.7) → rgba(180,211,55,.35) |
| wheel segments | #45B75A, #0A2A1F, #B4D337, #0B5332 (text: #04150F / #45B75A / #1A2405 / #FFFFFF) |

## Fonts
Cairo (Arabic, RTL default) · Space Grotesk (Latin) · Bebas Neue (digits only — no Arabic glyphs)
