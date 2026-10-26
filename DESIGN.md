---
name: Tenho Dado
description: A dark, high-contrast dice table for one group's live games and permanent record.
colors:
  ink-950: "#0a0a0a"
  ink-900: "#111111"
  ink-800: "#1c1c1c"
  ink-700: "#2a2a2a"
  ink-600: "#3d3d3d"
  ink-500: "#808080"
  ink-400: "#8f8f8f"
  ink-200: "#c4c4c4"
  ink-50: "#f5f5f5"
  danger: "#ef4444"
  danger-bg: "#1f0b0b"
  victory: "#fbbf24"
  victory-bg: "#1c1200"
  success: "#22c55e"
typography:
  display:
    fontFamily: "Bebas Neue, Impact, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.025em"
  display-sm:
    fontFamily: "Bebas Neue, Impact, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.025em"
  headline:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  data:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  kpi:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.1
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink-50}"
    textColor: "{colors.ink-950}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "48px"
  button-primary-sm:
    backgroundColor: "{colors.ink-50}"
    textColor: "{colors.ink-950}"
    typography: "{typography.meta}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-200}"
    typography: "{typography.meta}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "44px"
  input:
    backgroundColor: "{colors.ink-800}"
    textColor: "{colors.ink-50}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.ink-50}"
    rounded: "{rounded.lg}"
    padding: "16px"
  report-tab-active:
    backgroundColor: "{colors.ink-800}"
    textColor: "{colors.ink-50}"
    typography: "{typography.meta}"
    rounded: "{rounded.md}"
    height: "44px"
  badge-victory:
    backgroundColor: "{colors.victory-bg}"
    textColor: "{colors.victory}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: Tenho Dado

## Overview

**Creative North Star: "A Mesa de Boteco"**

Tenho Dado looks like the table after the dice have landed: near-black, lit by a single warm amber, with the loser's name written in red. It is a working surface, not a stage. The page frame is quiet; the score rows are dense and exact. Numbers, names, dates, and amounts are set in DM Sans with tabular figures, because the group reads this board to settle a debt and settle an argument. Bebas Neue appears only when the table announces something — the page title or the loser.

The system is tonal and flat. Depth comes from three near-black surfaces and a 1px border, never from a shadow. Amber is the light: money, the current turn, a win, the focus ring. Red is the loss: the loser's name, the loss count, a destructive action. Green is rare and means resolved. Motion is reserved for the dice and the arrival of a sheet; everything else changes color and position without choreography.

**Key Characteristics:**

- Near-black tonal surfaces (`ink-950` → `ink-900` → `ink-800`), no shadows.
- Hairline 1px borders instead of elevation; rows instead of nested cards.
- One warm accent for money and state; one red for loss.
- Bebas Neue for announcements, DM Sans for every readable value.
- Tabular numerals everywhere a column must stay still.
- Phone-first at the table, wider report columns on desktop.
- 44px touch controls and reflow down to 320px.

## Colors

The palette is a warm amber and a red receipt on charcoal. There is no blue, no gradient, and no decorative saturation.

### Primary

- **Mesa Amber** (#fbbf24): the product accent. Money, the current player, victory, the focus ring, the active state. It appears on small marks and values, not as a page field.

### Secondary

- **Derrota Red** (#ef4444): the loser's name, loss figures, destructive text, validation errors. It marks a consequence, never the interface chrome.

### Tertiary

- **Acerto Green** (#22c55e): success and resolved states; used sparingly, mostly in badges and confirmations.

### Neutral

- **Carvão 950** (#0a0a0a): app background and the table.
- **Carvão 900** (#111111): cards, panels, and report surfaces.
- **Carvão 800** (#1c1c1c): inputs, raised cells, tracks, and the active tab.
- **Carvão 700 / 600** (#2a2a2a / #3d3d3d): borders and disabled structure.
- **Carvão 500 / 400** (#808080 / #8f8f8f): secondary and metadata text. Never use below the 4.5:1 floor on `ink-900`.
- **Carvão 200 / 50** (#c4c4c4 / #f5f5f5): primary secondary text and primary text.

### Named Rules

**The One Accent Rule.** Amber marks money and state. It occupies a small share of any screen; its rarity is what makes it read as the table light, not a brand wash.

**The Red Name Rule.** Red belongs to the loser, the loss, and the destructive action. It is never used for decoration, headings, or an inactive control.

## Typography

**Display Font:** Bebas Neue (with Impact, sans-serif fallback)
**Body Font:** DM Sans (with system-ui fallback)
**Label/Mono Font:** none; DM Sans carries labels and data.

**Character:** A condensed scoreboard voice against a calm grotesque. The display face announces; the body face records. The pairing is deliberately narrow: one face for the title, one for everything else.

### Hierarchy

- **Display** (400, 2rem mobile / 2.25rem from `sm`, line-height 1, tracking 0.025em, uppercase): page titles and the result announcement. Never numbers, names, dates, or amounts.
- **Headline** (600, 0.9375rem, line-height 1.375): card titles, the per-game result, section heads.
- **Body** (400, 1rem, line-height 1.5): instructions, prose, and form text. Keep prose within a comfortable measure; the app frame is 28–48rem.
- **Meta** (400, 0.8125rem, line-height 1.4): dates, player counts, supporting detail, "por partida com gasto".
- **Label** (600, 0.6875rem, line-height 1.2, tracking 0.05em, uppercase): stat labels and badges. Quiet, never competing with the value.
- **Data** (600, 1.125rem, line-height 1, tabular): row totals, dice sums, per-player amounts.
- **KPI** (600, 1.25rem, line-height 1.1, tabular): the four report summary values.

### Named Rules

**The Display Is Not Data Rule.** Bebas Neue is for announcements. Every number, name, date, amount, and table cell is DM Sans. If a value must be compared down a column, it is tabular and it is not display type.

**The Label Is a Whisper Rule.** Labels are small, uppercase, tracked, and `ink-400`. They name the value; they never repeat it or shout over it.

**The Two-Line Player Rule.** A player row has a name line and a meta line. The name is primary; "criador · você · gerido" and "o otário da vez" are secondary. Never merge them into one line.

## Layout

Mobile-first, phone at the table. The page shell is `max-w-md` (28rem) on phones, `md:max-w-2xl` (42rem) on tablets, and `lg:max-w-3xl` (48rem) on desktop, with `px-4` and `py-6`/`py-8`. Sections sit in a `gap-4`/`gap-5` column.

The report reading order is fixed: page header → report tabs → period → summary → rankings, with the footnote last. The board is toolbar → game cards, one column on phones and two at `lg`. Grids that gain a second column at a breakpoint declare `grid-cols-1` first; an unconstrained auto column is a reflow bug, not a layout.

Spacing follows a 4/8/12/16/24/32 rhythm. Cards use 16px padding; rows use 12px vertical padding; related labels sit 4–8px from their value, and distinct groups separate by 16px or more. The report tabs and action buttons are 44px high. The page frame is generous; the score rows are dense.

At 320px the content must reflow without horizontal scrolling, and text scaling must not collapse a name column. Long names truncate in rows and wrap in the game headline. Amounts wrap at a space before they clip.

## Elevation & Depth

Flat by default. Depth is tonal: `ink-950` behind, `ink-900` for a surface, `ink-800` for a raised cell or input. A 1px `ink-800`/`ink-700` border declares the edge once. No box shadows are used anywhere in the product; the modal is separated by a dark overlay and a short blur, not by a lifted shadow.

Rows inside a card are separated by a 1px border, not by nested cards. The game card, the report filter, and each ranking are single surfaces. The modal is the only overlay: bottom sheet on phones, centered panel at `sm`, with `--bg-overlay` and `backdrop-blur-sm`.

### Named Rules

**The One Border Rule.** Declare elevation once. A surface gets a border or a shadow, never both; this system chooses the border. Zero-offset halos and glow shadows are not part of the world.

**The No-Nested-Cards Rule.** If a card needs cards inside it, the hierarchy is wrong. Use rows separated by borders.

## Shapes

A gently rounded rectangle language: 6px for the smallest marks, 10px for inline controls and tabs, 16px for cards, inputs, and primary buttons, 20px for large buttons, and full pills for badges and period presets. Dice faces use a tighter 6–8px radius to read as objects, not pills.

No square cards, no double borders, no colored left/right rails. The modal's top corners are rounded on phones and all four corners round at `sm`. Form fields share the 16px card radius so the filter reads as one surface.

## Components

### Buttons

- **Shape:** 16px radius (`--radius-lg`); 20px for the large size.
- **Primary:** `ink-50` field with `ink-950` text, 16px text; 48px tall at `md`, 44px at `sm`.
- **Outline:** transparent field, 1px `ink-700`, `ink-200` text; hover raises the border to `ink-600` and text to `ink-50`.
- **Ghost:** no field, `ink-400` text; hover uses `ink-800` and `ink-50`.
- **Danger:** no field, red text; hover uses the red-tinted surface.
- **Hover / Focus:** color transitions at 150ms; focus is a 2px amber ring with a 2px `ink-950` offset. Loading replaces the label with a spinner and a specific verb ("Rolando…").
- **Rule:** every sm control is 44px tall. Icon-only controls need an accessible name.

### Inputs / Fields

- **Style:** `ink-800` field, 1px `ink-700`, 16px radius, 44px height, 16px text and `ink-50`.
- **Focus:** amber border plus a 1px amber ring.
- **Error:** red message below the field; the field carries `aria-invalid` and points at the message. The error never moves focus on its own.
- **Disabled:** 40% opacity, no pointer events.
- **Dates:** native control with `color-scheme: dark`; two compact columns for a range.

### Cards / Containers

- **Corner Style:** 16px radius.
- **Background:** `ink-900` on `ink-950`; raised cells use `ink-800`.
- **Shadow Strategy:** none; see Elevation.
- **Border:** 1px `ink-800` (a stronger `ink-700` for controls).
- **Internal Padding:** 16px; report summary cells 14px.
- **Behavior:** no nesting. A list inside a card is a border-separated stack.

### Navigation

- **Page header:** a 44px circular back control (`ink-900`, 1px `ink-700`, amber on hover) and a Bebas page title with a 1.5 meta subtitle.
- **Report tabs:** a two-up segmented control inside a 1px `ink-800` track; 44px high; the active tab is `ink-800` with `ink-50` text and `aria-current="page"`. Inactive tabs are `ink-400`.
- **Game hub top nav:** pill shortcuts to Quadro and Análises; same 44px rule.

### Player Score Row (signature)

- **Structure:** name and meta on the left; three dice and a tabular sum on the right.
- **State:** the loser row uses `danger-bg/60` with red text; the current player uses `victory-bg/50`. Never both.
- **Responsive:** the right group wraps below the name at large text or narrow widths; the name column has a 7rem minimum so it does not collapse to one character.
- **Sum:** the number is DM Sans 1.125rem, tabular, with a 12px "soma" caption. Screen readers hear "Soma: N".
- **Dice:** CSS pips, not glyphs or emoji. Tones are neutral, victory, danger, and muted.

### Report Tabs (signature)

- **Shape:** full-width two-up track, 16px radius, 4px padding, 1px `ink-800`.
- **Type:** 14px semibold; active `ink-50`, inactive `ink-400`.
- **Behavior:** `aria-current="page"` on the active tab; the whole tab is the target, not just the label.

### Stats and Rankings

- **Summary cells:** 2×2 on phones, 4-up from `md`; uppercase 11px labels, 20px DM Sans values, 12px detail. Values break rather than truncate; money never disappears.
- **Rankings:** rank number, 14px name, right-aligned 14px value; an 8px track with amber for spending and red for losses. A zero value shows an empty track, not a dot. Fill changes with a transform (not width) and stops transitioning under reduced motion.
- **Empty:** one sentence naming the absence and, when useful, the next action.

### Dice Face

- **Shape:** 28px at `sm`, 36px at `md`, 48px at `lg`; 6–8px radius; 1px border.
- **Pips:** CSS grid of dots, never `⚀`–`⚅` or emoji.
- **Tone:** neutral (`ink-800`/`ink-50`), victory (amber field), danger (red field), muted (dashed empty).
- **Motion:** the only authored movement in the product is the 3D dice roll and landing; it is driven by the server result and respects `prefers-reduced-motion` with an instant final face.

## Do's and Don'ts

### Do:

- **Do** use `ink-*` tokens for every surface, border, and text tone; the app is dark-only by product decision.
- **Do** use DM Sans with `tabular-nums` for every value that can be compared down a column.
- **Do** lead a game card with the loser and the amount; that is the result, not the footer.
- **Do** keep all touch controls at 44px, including tabs, presets, back, and inline actions.
- **Do** declare `grid-cols-1` before a `md:grid-cols-*` or `lg:grid-cols-*` breakpoint.
- **Do** let long names truncate in rows and wrap in the game headline; never shrink a name to one character per line.
- **Do** keep amber for money/state and red for loss/destructive action.
- **Do** use one border, one radius family, and no shadow.
- **Do** keep the 320px reflow and the 200% text path usable.

### Don't:

- **Don't** set Bebas Neue on numbers, names, dates, amounts, or table cells. It is display only.
- **Don't** use `text-[13px]`-style fixed pixels for durable roles; use rem so user font settings apply.
- **Don't** nest cards or add a second surface to a card to create hierarchy.
- **Don't** add box shadows, glow, gradient text, or colored left rails.
- **Don't** use amber for non-money/non-state decoration or red for chrome.
- **Don't** animate width, height, or margins for bars; use transforms.
- **Don't** use emoji or Unicode dice as functional icons. The brand mark and the result reaction are the only intentional emoji.
- **Don't** rely on color alone: pair a loss with the loser's name and a spend with a currency value.
- **Don't** switch the app to a light theme or introduce a second accent without a product decision.
