# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One fixed group of friends who play the dice game together in person, in Brazilian Portuguese, with phones in hand at the table.

- Members have real accounts (username + password). People without accounts exist as **managed profiles**, created by the group admin and linkable to a real account later.
- **@itspx** is the operator: manages players, adds retroactive finished games, edits/deletes finished games, and can record a loser's spending on their behalf.
- Terminology is part of the product: jogador, sessão/partida, rodada, perdedor, gasto, quadro, análises, retroativo, gerido.

## Product Purpose

Tenho Dado formalizes the group's dice ritual. Each player rolls three dice; the lowest sum loses. The loser records what they spent — real money on drinks, food, or whatever the group agreed — and the app keeps that record.

It runs a live session across phones and preserves a permanent board of past games, losses, and spending. Success means the group uses it every game and trusts the history enough to argue over it.

## Positioning

A private, single-group ledger for a real-world ritual, not a public dice game or a betting product. It combines live turn-taking, a curated permanent record, retroactive/WhatsApp-era imports, and managed players in one history that belongs to one known circle.

## Operating Context

- One active session at a time; players join a lobby through invites, and the group plays together in person.
- Two modes: **Dado manual** (the host enters every player's rolls) and **Dado online** (each player rolls on their own turn).
- Three regular d6 rounds per player. The lowest sum loses; a tie is resolved with extra d6 until one loser remains.
- After the game, the loser — or the person who added them, or @itspx — records the amount spent. The result stays on the main screen until dismissed.
- Finished games feed **Quadro** (full history) and **Análises** (losses and spending by period).
- @itspx can add retroactive finished games, edit or delete them, and manage player profiles.
- Production is one Vercel app and one Supabase project. There is no staging; previews use production data. Pushes to `master` deploy the app, and migrations touching `supabase/**` run through GitHub Actions.
- Local development uses Supabase locally (`pnpm supabase:start`, `pnpm dev`).

## Capabilities and Constraints

- **Auth:** username + password only; email is an implementation detail of synthetic accounts. Managed profiles have no login. Registration can be gated by a group invite code (`REGISTRATION_INVITE_CODE`).
- **Game rules:** 3 regular rounds of d6; lowest total loses; tiebreaks use extra d6; the loser is persisted with the session.
- **History:** finished sessions store players, rolls, loser, and `loser_spent`; @itspx can create, edit, and delete them. A one-off SQL import brought historical WhatsApp games in as retroactive sessions; there is no import UI.
- **Analytics:** counts losses and sums spending per profile, filtered by finish date. Values are BRL.
- **Permissions:** editing the board and players is gated on the `itspx` username, not a role table.
- **Localization:** pt-BR, BRL, `dd/mm/yyyy`; no i18n layer.
- **Technical stack:** Next.js App Router, TypeScript strict, Tailwind CSS v4, Supabase (Postgres, Auth, Realtime), Vercel. Node 22.
- **Ritual constraint:** the loser's amount is real spending, not a payout to a winner. There is no debt-settlement or betting ledger.
- **Undecided:** pricing, monetization, and any multi-group tenancy. The product is built for one circle today.

## Brand Commitments

- Name: **Tenho Dado** 🎲, introduced on the login screen with **"Você tem dado?"**.
- Voice: informal, playful, teasing Brazilian Portuguese — "o otário da vez", "@fulano é o otário", "gasto do perdedor". The teasing targets the loss, not the person.
- The die is the product's central object; scores and rounds are represented with dice faces, never dice glyphs or emoji.

## Evidence on Hand

- The running app and its production history (finished sessions, profiles, spending) are the only real content.
- `docs/STYLE-GUIDE.md` records implementation and visual conventions; `docs/DEPLOY.md` records operations.
- Historical games came from WhatsApp through a one-off SQL import, which is why retroactive sessions and managed profiles exist.
- No testimonials, customer logos, benchmarks, pricing, or marketing claims exist. Future work must not fabricate them.

## Product Principles

1. **The record outlives the game.** Every live feature must leave a trustworthy history; the board and analyses are the lasting value.
2. **Build for one known group.** Optimize for this circle's rituals and names, not anonymous public users or multi-tenant scale.
3. **Keep the ritual intact.** Three dice, lowest sum loses, loser logs the spending. Do not turn it into a betting or payout product.
4. **Operator trust.** @itspx can correct history and players; destructive actions are explicit, and edits are intentional.
5. **Phone-first at the table.** The live flow works one-handed, fast, with minimal typing.

## Accessibility & Inclusion

No product-specific user need has been recorded. The shipped interface targets WCAG AA contrast (4.5:1), visible keyboard focus, and reduced-motion support, as documented in `docs/STYLE-GUIDE.md`.
