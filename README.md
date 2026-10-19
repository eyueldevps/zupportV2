# Zupport: Phase 1 (foundation + public site)

Setup: `cp .env.example .env` (Neon Postgres URL) > `npm install` > `npx prisma db push` > `npm run db:seed` > `npm run dev`

## Locked decisions
- Final data model is already in `prisma/schema.prisma` (users, orgs, many pages per account, tiers, posts, payments ledger, memberships, verification, reports, payouts, audit log).
- Money is stored in minor units with an explicit currency. Fee is snapshotted per payment (`feeBps`).
- Light theme is default; dark only when the user toggles it (cookie, no flash). Colors are semantic tokens in `globals.css`.
- Text lives in `messages/*.json`. Amharic goes in `am.json` after native review; missing keys fall back to English.
- Videos: creators upload to YouTube as UNLISTED (not private) and paste the link; `lib/format.ts:youtubeId` validates it. Embeds use youtube-nocookie.
- Payments: manual Telebirr first (Phase 4), Chapa later as another provider on the same `Payment` table.

## Phases
1 Foundation + public site (this) | 2 Accounts + onboarding | 3 Creator dashboard + publishing | 4 Manual Telebirr payments + memberships
5 Trust & safety + verification | 6 Supporter side (tips, notifications) | 7 Amharic, analytics, orgs, Chapa
