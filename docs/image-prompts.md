# AI Image Prompts — فارس المونديال

Rules: never generate text inside images (Arabic comes out garbled — headlines stay HTML);
avoid the real FIFA trophy / logos / player faces (legal + generators mangle them).

**Style suffix — append to every prompt:**
premium sports brand aesthetic, very dark warm charcoal background #0B0905, dramatic golden-yellow #F9DF00 rim lighting, deep red #EE0000 accent highlights, cinematic, high contrast, clean composition, no text, no words, no logos, no watermarks

**Negative prompt:** text, letters, numbers, watermark, real faces, FIFA logo, official trophy replica, blurry, low quality, deformed

| # | Placement | Ratio | Prompt |
|---|-----------|-------|--------|
| 1 | Home hero banner | 16:9 | Wide cinematic shot of a single glowing golden soccer ball resting on the center spot of a dark empty stadium pitch at night, stadium floodlights flaring in the distance, faint golden confetti drifting in the air, light fog, shallow depth of field, large dark empty space in the upper half for a headline |
| 2 | Knight emblem / logo | 1:1 | Minimalist geometric crest of an Arabian knight on a rearing horse, bold silhouette inside an angular shield shape, flat vector sports-club emblem style, golden yellow #F9DF00 shape on near-black background with a sharp deep-red outline, strong angular lines, centered, symmetrical |
| 3 | Winners page header | 16:9 | Generic golden football trophy on a dark pedestal, surrounded by floating golden and red confetti and soft bokeh stadium lights, celebratory atmosphere, trophy slightly off-center with empty dark space on one side for a title |
| 4 | Wheel projector backdrop | 16:9 | Dark celebration backdrop, soft radial golden spotlight glow in the center fading to near-black edges, sparse floating golden and red confetti particles, gentle bokeh, mostly empty center, strong vignette — designed as a background that UI elements sit on top of |
| 5 | QR poster background | 2:3 | Vertical sports poster background, dark stadium tunnel opening toward a brightly lit pitch, golden light rays bursting outward, a soccer ball silhouette in the foreground, energetic red and yellow light streaks along the edges, the lower third almost completely dark and empty for a QR code placement |
| 6 | Saudi match-day hero | 16:9 | Silhouetted crowd of fans in a dark indoor venue watching a giant bright screen, waving small green and white flags, golden ambient glow, atmospheric depth, celebratory energy, viewed from behind the crowd |
| 7 | OG / WhatsApp share | 1200×630 | A glowing golden soccer ball and a colorful prize wheel side by side on a dark background, confetti accents, bold simple composition readable at small sizes, generous empty dark space in the center-left for a logo overlay |
| 8 | How-it-works icons (×3) | 1:1 | Flat vector icon of [a smartphone scanning a QR code / a scoreboard with a target symbol / a segmented prize wheel with a pointer], thin golden-yellow #F9DF00 line art with one deep-red #EE0000 accent element, on near-black background, minimal, consistent stroke weight, centered with padding |

Delivery notes: export ~2x display size, convert to WebP, keep each under ~200 KB
(participants are on phones via QR). Drop finished files in `public/img/` and ask
Claude to wire them into the hero, winners page, wheel page, OG tags, and poster.
