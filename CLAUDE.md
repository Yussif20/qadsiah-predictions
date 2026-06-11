# Qadsiah Predictions — World Cup 2026

A public, QR-code-driven score prediction site for Al-Qadsiah FC. Employees watching Saudi national team matches at the club venue scan a poster QR, enter **name + phone** (no account), and predict the exact score. After the match, exact-score predictors (or the closest, when nobody is exact) become winners, and a **lucky wheel** is spun live on the venue projector to pick the prize winner.

**Client:** Al-Qadsiah FC (Saudi Arabia)
**Sibling project:** `../reda-predictions` (same stack, but that one uses per-employee Firebase Auth accounts, points and leaderboards — this project has none of that)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@theme` tokens in `src/index.css`) |
| DB / Auth | Firebase Firestore + Auth (admin only), Spark free tier |
| Routing | React Router 7 |
| i18n | react-i18next (Arabic default + English, RTL-first) |
| Icons | Lucide React |
| Toasts | sonner |
| Wheel FX | canvas-confetti |
| QR | qrcode |
| Tests | Vitest |

**Hosting:** Netlify (SPA redirect in `netlify.toml` + one serverless function: the football-data.org proxy). No Cloud Functions — all app logic is client-side, enforced by Firestore rules.

**No React Query** (unlike reda) — live data uses plain `onSnapshot` hooks; the app is small enough that a query cache adds nothing.

---

## Commands

```bash
npm run dev         # Dev server (localhost:5173)
npm run build       # Type-check + production build
npm run lint        # ESLint
npm test            # Vitest once (phone + winners logic)
npm run test:watch  # Vitest watch
```

---

## Brand / Theme

Al-Qadsiah colors, verified from the official logo SVGs: **yellow `#F9DF00`** (primary) and **red `#EE0000`** (accent), on a warm near-black background. Dark-only UI (class `dark` hardcoded on `<html>`). Fonts match reda-predictions: **Space Grotesk** for Latin (`--font-sans`), **Cairo** for Arabic (`--font-arabic`, applied via a `[dir="rtl"] body` rule), **Bebas Neue** for big score digits (`--font-display`). Theme tokens live in `src/index.css` under `@theme`.

---

## Project Structure

```
src/
├── main.tsx                         # Entry
├── App.tsx                          # Routes; admin pages lazy-loaded
├── index.css                        # Tailwind 4 theme (Qadsiah palette) + utilities
├── context/AuthContext.tsx          # Admin auth (login checks admins/{uid} doc)
├── types/index.ts                   # Match, Prediction, Contact, WheelSpin, PrizeWinner
├── lib/
│   ├── firebase.ts                  # Firebase init
│   ├── firestore.ts                 # All Firestore ops (submitPrediction, enterResult, saveWheelSpin, …)
│   ├── phone.ts                     # Saudi phone normalize/mask/sha-256 hash (tested)
│   ├── winners.ts                   # Exact/closest winner computation (tested)
│   ├── matchStatus.ts               # upcoming/locked/completed derived from the clock
│   ├── format.ts                    # Gregorian-forced date formatting; datetime-local helpers
│   ├── confetti.ts                  # Brand-colored celebration burst
│   ├── constants.ts                 # SCORE_MAX, stages, Saudi flag code
│   └── utils.ts                     # cn()
├── hooks/
│   ├── useMatches.ts                # Live matches / single match (onSnapshot)
│   ├── useMyPrediction.ts           # Visitor identity (localStorage) + own prediction + submit
│   ├── useMatchWinners.ts           # Winners of a completed match (public)
│   ├── useAdminPredictions.ts       # Predictions joined with full phones (admin)
│   └── useNow.ts                    # Ticking clock
├── components/
│   ├── ui/ (Spinner, CountryFlag)
│   ├── layout/ (PublicLayout, AdminLayout, LanguageSwitcher)
│   ├── auth/ProtectedRoute.tsx
│   ├── predict/ (MatchHero, PredictionForm, ScoreInput, CountdownTimer, HowItWorks)
│   ├── winners/MatchWinnersCard.tsx
│   ├── wheel/LuckyWheel.tsx         # SVG wheel, CSS-transition spin, lands on chosen index
│   └── admin/ (MatchFormModal, QrPoster)
└── pages/
    ├── HomePage.tsx                 # Current match + prediction form (the QR target)
    ├── WinnersPage.tsx              # Completed matches + winners + prize winners
    └── admin/ (AdminLoginPage, AdminMatchesPage, AdminMatchDetailPage, WheelPage)
```

---

## Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Predict (QR target) | Public |
| `/winners` | Winners | Public |
| `/admin/login` | Admin login | Public |
| `/admin` | Matches CRUD + stats + QR poster download | Admin |
| `/admin/matches/:matchId` | Result entry, predictions table, winners | Admin |
| `/admin/wheel/:matchId` | Full-screen projector lucky wheel | Admin |

---

## Firestore Collections

### `matches`
Generic two-team fixture (the main event is Saudi matches, but the admin can add any WC game for testing/screenings). `home`/`away` is just fixture order — the tournament is on neutral ground, so the UI labels teams "first/second", never home/away, and there are no venue fields. Key fields: `home`/`away` (`TeamInfo`: `{name, nameAr, flag, crest?}` — manual create defaults the first team to Saudi Arabia), `stage`, `matchDate`, `status` (`"upcoming" | "completed"` — "locked" is **derived from the clock**, never stored), `actualScoreHome/Away`, `winnerTier` (`"exact" | "closest" | null`), `winnersCount`, `prizeWinner` (`{predictionId, name, phoneMasked} | null`), `wheelSpins[]` (every spin incl. re-spins), `apiMatchId`.

`snapToMatch()` normalizes legacy pre-refactor docs (`opponent`+`saudiIsHome` shape) on read so they render and can be deleted — but delete any such test docs rather than keeping them.

### `predictions` — doc ID = `{matchId}_{sha256(normalizedPhone)}`
`matchId`, `name`, `phoneMasked` ("050•••••67"), `predictedScoreHome/Away`, `isWinner`, `winnerTier`, `goalError`. **Never contains a raw phone.**

### `contacts` — doc ID mirrors the prediction ID
`matchId`, `name`, `phone` (full, normalized `+9665XXXXXXXX`). **Admin-only read.**

### `admins` — doc per admin UID
Created manually in the Firebase console; client can never write.

---

## Security model (the important part)

Participants are anonymous — there is no Firebase Auth for them — so all integrity comes from Firestore rules + doc-ID design:

1. **Phone identity without exposure:** prediction doc IDs embed `sha256(phone)`. The public `predictions` collection allows `get` to anyone (you must know the phone to compute the ID = you can only fetch your own) but allows `list` **only when the parent match is completed** (winners display) or for the admin. Full phones live in `contacts`, admin-read-only.
2. **Kickoff lock is server-side:** create/update rules compare `match.matchDate > request.time`. No cron or admin action needed; the UI countdown is cosmetic.
3. **One prediction per phone per match:** deterministic doc ID makes a second submission an overwrite, not a duplicate.
4. **Winner fields are admin-only:** public writes must have `isWinner == false`, `winnerTier == null`, `goalError == null`.
5. **Accepted risk (client signed off):** no OTP — someone who knows a colleague's phone number could overwrite that colleague's prediction. Fine for an internal venue event.

---

## Winner & wheel rules

- Winner = exact final score. If nobody is exact, **all predictions tied at the smallest total goal error** (`|Δsaudi| + |Δopp|`) win instead (`winnerTier: "closest"`).
- `enterResult()` recomputes everything idempotently; re-entering a corrected score **resets `prizeWinner` and `wheelSpins`** (the winner pool changed), so the wheel must be re-spun.
- The wheel (`/admin/wheel/:matchId`) picks with `crypto.getRandomValues`, animates ~7s, saves `prizeWinner` + appends to `wheelSpins`. **Re-spin** (winner not in the room) excludes previously drawn names — tracked locally too, so an instant re-spin can't re-draw the same person before the snapshot lands.

---

## Football API integration (football-data.org)

Same account/key as reda-predictions (free tier, 10 req/min, admin-only usage). All calls go through a same-origin `/football-api/*` proxy that injects `X-Auth-Token` server-side:

- **Dev:** Vite proxy in `vite.config.ts` (reads `FOOTBALL_API_KEY` from `.env` — no `VITE_` prefix, so it never enters the client bundle).
- **Prod:** `netlify/functions/football-proxy.mts` (set `FOOTBALL_API_KEY` in Netlify Site settings → Environment variables). The `netlify.toml` redirect for `/football-api/*` must stay above the SPA fallback.

Two admin features (`src/lib/football-api.ts`):
1. **Import from API** (`/admin` → "Import from API"): fetches all WC matches (competition 2000) with a **Saudi matches / All matches** toggle (all-matches mode exists for testing the app on earlier WC games), marks already-imported ones (`apiMatchId` on the match doc), and prefills the create-match modal — team EN/AR names + flags come from `src/lib/team-mappings.ts`, which covers all 48 WC-2026 teams (verified against the live API). Unmapped teams (future-proofing) fall back to the API name + the football-data.org **crest URL** stored on `TeamInfo.crest`, which `TeamFlag` renders in preference to the flagcdn flag.
2. **Sync score** (match detail → "Sync score from API", shown only for imported matches): fetches the live/full-time score into the result steppers; the admin still clicks save to commit (winner computation + wheel reset are deliberate actions). Imported matches keep the API's home/away order, so scores map directly.

WC 2026 verified live (June 2026): Saudi group matches are Uruguay (537370), Spain (537371), Cape Verde (537374). API stage `LAST_32`/`ROUND_OF_32`/`PLAYOFF_ROUND` map to stage `round32`.

---

## i18n

- Arabic **default** (localStorage-only detection — browser locale is ignored), English toggle. `dir` flips on `<html>` per language.
- Namespaces: `common`, `admin` (`src/i18n/locales/{ar,en}/`).
- Arabic plural forms (`_zero/_one/_two/_few/_many/_other`) used for winner counts.
- Dates formatted with explicit **Gregorian** calendar (`ar-SA-u-ca-gregory-nu-latn`) — some browsers default ar-SA to Hijri.
- Phone input accepts Arabic-Indic digits (`٠٥٠…`) — normalized in `lib/phone.ts`.

---

## Firebase setup (new environment)

1. Create a Firebase project, enable **Authentication → Email/Password** and **Firestore**.
2. Register a web app, copy the config into `.env` (see `.env.example`).
3. Deploy rules: `firebase deploy --only firestore:rules` (or paste `firestore.rules` into the console).
4. In Authentication, create the admin user; copy their UID.
5. In Firestore, create doc `admins/{thatUid}` with any content (e.g. `{ createdAt: now }`).
6. Deploy to Netlify; build command and SPA redirect are in `netlify.toml`.
7. From `/admin`, download the QR PNG for the venue poster.

No composite indexes needed (equality-only queries; sorting is client-side).

---

## Known trade-offs / future work

- **Lucide bundle:** lucide-react 1.x doesn't tree-shake under Vite — icons ship as one ~125 kB gzip cached chunk (reda-predictions ships the same way). Could switch to per-icon deep imports if mobile load time matters.
- No public "X people predicted" counter — would require public list/count access before completion, which the privacy rules intentionally block.
- `prizeWinner.phoneMasked` is shown on the public winners page so same-named winners are distinguishable; full numbers are never public.
