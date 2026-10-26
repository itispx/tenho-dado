# Style Guide — Tenho Dado 🎲

## Stack

- **Next.js 15** (App Router)
- **TypeScript** strict
- **Tailwind CSS v4** (mobile-first)
- **clsx** para composição de classes
- **Supabase** para banco de dados e autenticação

---

### Paleta de Cores

```
Neutros (base escura)
  --color-ink-950   #0a0a0a   (fundo principal)
  --color-ink-900   #111111
  --color-ink-800   #1c1c1c
  --color-ink-700   #2a2a2a
  --color-ink-600   #3d3d3d   (apenas bordas)
  --color-ink-500   #808080   (texto secundário — 4.8:1 em ink-900)
  --color-ink-400   #8f8f8f   (texto secundário — 5.9:1 em ink-900)
  --color-ink-200   #c4c4c4
  --color-ink-50    #f5f5f5

Vermelho (derrota / erro crítico / perigo)
  --color-red-600   #dc2626
  --color-red-500   #ef4444
  --color-red-400   #f87171
  --color-red-950   #1f0b0b   (fundo de alerta)

Âmbar / Dourado (acerto crítico / vidas / vitória)
  --color-gold-500  #f59e0b
  --color-gold-400  #fbbf24
  --color-gold-300  #fcd34d
  --color-gold-950  #1c1200   (fundo de destaque)

Verde (empate resolvido / confirmação)
  --color-green-500 #22c55e
  --color-green-400 #4ade80
  --color-green-950 #071d0f
```

---

## Design Tokens (CSS Custom Properties)

Declare em `src/styles/globals.css`. São usados via `var(--token)` e mapeados no
`tailwind.config.ts` para classes utilitárias.

```css
/* src/styles/globals.css */

@layer base {
  :root {
    /* ── Superfícies ── */
    --bg-app: #0a0a0a;
    --bg-surface: #111111;
    --bg-elevated: #1c1c1c;
    --bg-overlay: rgba(0, 0, 0, 0.7);
    --bg-hover: rgba(255, 255, 255, 0.04);
    --bg-active: rgba(255, 255, 255, 0.08);

    /* ── Texto ── */
    --text-primary: #f5f5f5;
    --text-secondary: #b4b4b4;
    --text-muted: #8f8f8f;
    --text-disabled: #5c5c5c;

    /* ── Semânticas ── */
    --color-danger: #ef4444;
    --color-danger-bg: #1f0b0b;
    --color-danger-muted: rgba(239, 68, 68, 0.15);

    --color-victory: #fbbf24;
    --color-victory-bg: #1c1200;
    --color-victory-muted: rgba(251, 191, 36, 0.15);

    --color-success: #22c55e;
    --color-success-bg: #071d0f;

    /* ── Bordas ── */
    --border-subtle: #1c1c1c;
    --border-default: #2a2a2a;
    --border-strong: #3d3d3d;

    /* ── Raios ── */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --radius-pill: 9999px;

    /* ── Sombras ── */
    /* Elevação é declarada uma vez: borda OU sombra, nunca as duas. */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.6);
    --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.7);

    /* ── Tipografia ── */
    --font-display: "Bebas Neue", "Impact", sans-serif;
    --font-body: "DM Sans", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", monospace;

    /* ── Transições ── */
    --transition-fast: 120ms ease;
    --transition-base: 220ms ease;
    --transition-slow: 380ms ease;
    --transition-spring: 320ms cubic-bezier(0.34, 1.56, 0.64, 1);

    /* ── Z-index ── */
    --z-base: 0;
    --z-raised: 10;
    --z-sticky: 100;
    --z-overlay: 200;
    --z-modal: 300;
    --z-toast: 400;
  }
}
```

---

## Configuração Tailwind

Tailwind v4 não usa `tailwind.config.ts`: o tema é declarado em `src/styles/globals.css`
com `@theme inline`, apontando para as custom properties do `:root`.

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme inline {
  /* cores */
  --color-ink-950: var(--ink-950);
  --color-ink-900: var(--ink-900);
  --color-ink-800: var(--ink-800);
  --color-ink-700: var(--ink-700);
  --color-ink-600: var(--ink-600);
  --color-ink-500: var(--ink-500);
  --color-ink-400: var(--ink-400);
  --color-ink-200: var(--ink-200);
  --color-ink-50: var(--ink-50);

  /* semânticas */
  --color-danger: var(--color-danger);
  --color-danger-bg: var(--color-danger-bg);
  --color-danger-muted: var(--color-danger-muted);
  --color-victory: var(--color-victory);
  --color-victory-bg: var(--color-victory-bg);
  --color-victory-muted: var(--color-victory-muted);
  --color-ok: var(--color-success);
  --color-ok-bg: var(--color-success-bg);

  /* tipografia, raios, sombras */
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --radius-lg: var(--radius-lg);
  --radius-pill: var(--radius-pill);
  --shadow-md: var(--shadow-md);

  /* easing autoral — nada de bounce/elastic */
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
}
```

> **Atenção:** uma classe cujo token não existe (`text-ink-500` sem `--color-ink-500`)
> não gera CSS e falha em silêncio. Ao usar um tom novo, declare-o no `@theme`.

Duração de transição usa a escala padrão do Tailwind (`duration-150`, `duration-200`),
não nomes inventados.

---

## Nomenclatura

| Item                     | Convenção                                       | Exemplo                           |
| ------------------------ | ----------------------------------------------- | --------------------------------- |
| Arquivos                 | **lowercase com hífens**                        | `player-card.tsx`, `use-dice.ts`  |
| Componentes              | **Sempre default export**, nunca named export   | `export default PlayerCard`       |
| Interface de props       | `NomeDoComponenteProps` (named export, sem `I`) | `export interface DiceProps`      |
| Tipos locais de variante | Declarados dentro do próprio arquivo            | `type Variant = "primary" \| ...` |
| Barrel files             | **Proibidos** em pastas internas                | Não criar `index.ts`              |
| Classes Tailwind longas  | Extrair para `const cn` com `clsx`              | ver exemplo abaixo                |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Redirect → /game ou /login
│   ├── (auth)/
│   │   └── login/page.tsx
│   └── (game)/
│       ├── layout.tsx              # Shell com bottom nav
│       ├── game/page.tsx           # Tela principal de jogo
│       ├── history/page.tsx        # Histórico de rodadas
│       └── players/page.tsx        # Gerenciar jogadores
│
├── components/
│   ├── ui/                         # Primitivos reutilizáveis
│   │   ├── button/
│   │   │   └── button.tsx
│   │   ├── badge/
│   │   │   └── badge.tsx
│   │   ├── card/
│   │   │   └── card.tsx
│   │   ├── dialog/
│   │   │   └── dialog.tsx
│   │   └── bottom-nav/
│   │       └── bottom-nav.tsx
│   └── features/                   # Componentes de domínio
│       ├── dice-roller/
│       │   └── dice-roller.tsx
│       ├── player-score-card/
│       │   └── player-score-card.tsx
│       ├── round-result/
│       │   └── round-result.tsx
│       └── lives-display/
│           └── lives-display.tsx
│
├── hooks/
│   ├── use-game.ts
│   ├── use-dice-roll.ts
│   └── use-players.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── game-logic.ts               # Funções puras de regras
│
├── styles/
│   └── globals.css
│
└── types/
    ├── game.ts
    └── database.ts
```

> **Melhoria sugerida:** o agrupamento `(auth)` e `(game)` em Route Groups do Next.js
> permite layouts distintos sem afetar a URL — login usa layout minimalista, jogo usa
> o shell com bottom navigation.

---

## Estrutura do Componente

A referência é o componente real em `src/components/ui/button/button.tsx`.

```tsx
type ButtonVariant = "solid" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loadingLabel?: string;
}
```

- `solid` é a ação principal (fundo `ink-50`, texto `ink-950`), `outline` a secundária,
  `ghost` a terciária e `danger` a destrutiva (texto vermelho, sem fundo).
- `size="sm"` (`h-9`) para ações inline, `size="md"` (`h-12`) para a ação da tela.
- `fullWidth` é `true` por padrão; use `fullWidth={false}` em ações inline.
- `loadingLabel` nomeia o que está acontecendo (`"Rolando…"`) em vez do genérico
  "Carregando...".

### Regras de Componente

- Props opcionais sempre com **valor padrão** na desestruturação
- `className` aceitável em primitivos `ui/` para extensibilidade, proibido em `features/`
- Usar `clsx` para toda composição de classes — nunca template literals manuais
- Funções declaradas com `function Component` em vez de `const Component: React.FC`

### Primitivos disponíveis

| Componente     | Arquivo                              | Uso                                                       |
| -------------- | ------------------------------------ | --------------------------------------------------------- |
| `Button`       | `ui/button/button.tsx`               | toda ação clicável com texto                              |
| `Card`         | `ui/card/card.tsx`                   | superfície de seção (`as`, `tone`)                        |
| `Badge`        | `ui/badge/badge.tsx`                 | rótulo de estado (`neutral`, `victory`, `danger`, `ok`)   |
| `Input`        | `ui/input/input.tsx`                 | campo com label, erro e olho de senha                     |
| `Select`       | `ui/select/select.tsx`               | select nativo com chevron desenhado                       |
| `Modal`        | `ui/modal/modal.tsx`                 | overlay com Escape, clique fora, scroll lock e foco preso |
| `DiceFace`     | `ui/dice-face/dice-face.tsx`         | todo dado da interface                                    |
| `ErrorMessage` | `ui/error-message/error-message.tsx` | erro de ação                                              |
| `Title`        | `ui/title/title.tsx`                 | cabeçalho das telas de autenticação                       |

Regras que valem para todos:

- **Nada de emoji ou glifo Unicode como ícone.** O dado é o `DiceFace` (pintas em CSS);
  ícones são SVG desenhado, no mesmo traço de 2px.
- **Nunca aninhe cards.** Se um card precisa de cards dentro, a hierarquia está errada:
  use linhas separadas por borda de 1px.
- **Elevação declarada uma vez:** borda ou sombra. Não use as duas no mesmo elemento.
- **Foco sempre visível**, com `focus-visible:ring-2 ring-victory` e offset `ink-950`.
- Ações destrutivas passam por confirmação inline (`Cancelar` + `Confirmar`), não por
  `confirm()`.
- Estruturas repetidas (modal, select, badge) usam o primitivo; nunca copie o markup.

```tsx
// ❌ Evitar
className={`bg-ink-900 ${isActive ? "border-victory" : ""} ${disabled ? "opacity-40" : ""}`}

// ✅ Correto
className={clsx("bg-ink-900", isActive && "border-victory", disabled && "opacity-40")}
```

---

## Convenções de Uso do Tailwind

### 1. Classes longas → objeto de mapa ou `cn` helper

```ts
// lib/cn.ts  (re-exporta clsx com alias curto)
import clsx, { type ClassValue } from "clsx";
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
```

```tsx
// ✅ Mapa para variantes — legível e type-safe
const statusClasses: Record<RoundStatus, string> = {
  idle: "border-ink-700 text-ink-400",
  playing: "border-ink-400 text-ink-50",
  win: "border-victory text-victory shadow-glow-gold",
  lose: "border-danger text-danger shadow-glow-red",
};
```

### 2. Responsividade — mobile-first

```tsx
// Sempre mobile primeiro, depois sm: md: lg:
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
```

### 3. Animações customizadas

Existe **um** momento autoral de movimento: a queda do dado. O resto é transição de
cor e um slide curto para modais. Defina no `globals.css` e use como utility:

```css
/* globals.css */
@keyframes dice-roll {
  0% {
    transform: rotate(-14deg) scale(0.94);
  }
  35% {
    transform: rotate(11deg) scale(1.06);
  }
  65% {
    transform: rotate(-6deg) scale(1.02);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

@layer utilities {
  .animate-dice-roll {
    animation: dice-roll 520ms var(--ease-out-quint) both;
  }
  .animate-sheet-in {
    animation: sheet-in 260ms var(--ease-out-quint) both;
  }
  .animate-fade-in {
    animation: fade-in 180ms ease-out both;
  }
}
```

Regras:

- **Nada de bounce ou elastic.** `cubic-bezier` com overshoot (0.34, 1.56, ...) envelhece
  a interface; use `--ease-out-quint`.
- Não invente uma entrada para cada seção — uma animação por tela, no máximo.
- `prefers-reduced-motion` já é respeitado globalmente; não duplique a regra.
- Durante a rolagem, o dado troca de face a cada 70ms e mostra a quinta face ao assentar.
  O resultado real chega do servidor, nunca é inventado no cliente.

---

## Banco de Dados (Supabase)

### Nomenclatura de Tabelas

Todas as tabelas usam **singular** — o nome descreve uma linha, não uma coleção.

| ❌ Evitar (plural) | ✅ Correto (singular) |
| ------------------ | --------------------- |
| `profiles`         | `profile`             |
| `games`            | `game`                |
| `game_players`     | `game_player`         |
| `rounds`           | `round`               |
| `rolls`            | `roll`                |

Isso impacta diretamente os joins no Supabase client — o nome da relação no `.select()` deve bater exatamente com o nome da tabela:

```ts
// ❌ Erro — tabela se chama "profile", não "profiles"
supabase.from("game_player").select("*, profiles(username)");

// ✅ Correto
supabase.from("game_player").select("*, profile(username)");
```

### Tipos de Banco

`src/types/database.ts` é **gerado automaticamente** pelo CLI do Supabase. Nunca edite manualmente.

```bash
# Regenerar após qualquer mudança no schema:
npm run types:generate
# equivale a: npx supabase gen types typescript --local > src/types/database.ts
```

Tipos de linha ficam em `src/types/game.ts`, usando o helper `Tables<>` exportado pelo arquivo gerado — isso garante que os tipos se atualizam automaticamente ao regenerar:

```ts
// src/types/game.ts
import type { Tables } from "./database";

// ✅ Usa Tables<> — sobrevive à regeneração
export type Profile = Tables<"profile">;
export type Game = Tables<"game">;
export type GamePlayer = Tables<"game_player">;
export type Round = Tables<"round">;
export type Roll = Tables<"roll">;

// ❌ Evitar — quebra se o Database type mudar de forma
export type Game = Database["public"]["Tables"]["game"]["Row"];
```

Tipos enriquecidos (joins, shapes calculados) também ficam em `game.ts`:

```ts
// src/types/game.ts

/** game_player com username do profile — resultado de join */
export interface LobbyMember {
  id: GamePlayer["id"];
  gameId: GamePlayer["game_id"];
  playerId: GamePlayer["player_id"];
  lives: GamePlayer["lives"];
  extraDays: GamePlayer["extra_days"];
  joinedAt: GamePlayer["joined_at"];
  username: Profile["username"]; // campo adicional do join
}
```

### Regra geral

| O que                      | Onde                           |
| -------------------------- | ------------------------------ |
| Tipos brutos de linha      | `types/game.ts` via `Tables<>` |
| Tipos enriquecidos / joins | `types/game.ts`                |
| Tipo `Database` completo   | `types/database.ts` (gerado)   |

---

## TypeScript

### Convenções de Nomenclatura

| Construto            | Convenção             | Exemplo                                |
| -------------------- | --------------------- | -------------------------------------- |
| `type`               | PascalCase            | `type RoundStatus`, `type DiceResult`  |
| `interface` de props | PascalCase, sem `I`   | `interface PlayerCardProps`            |
| `enum`               | PascalCase nas chaves | `enum CriticalEvent { Hit, Miss }`     |
| Função / hook        | camelCase             | `function useGame()`, `const rollDice` |
| Variável local       | camelCase             | `const isRolling`, `const playerScore` |
| Nomes                | Palavras completas    | `button` não `btn`, `player` não `p`   |

### Tipos de Domínio

```ts
// types/game.ts

export type PlayerId = string;

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export type CriticalEvent =
  | "critical-hit" // três 6s → +1 vida
  | "critical-miss" // três 1s → +1 dia extra
  | null;

export interface DiceRoll {
  values: [DiceValue, DiceValue, DiceValue];
  total: number;
  critical: CriticalEvent;
}

export type RoundStatus = "idle" | "rolling" | "resolved";

export interface Player {
  id: PlayerId;
  name: string;
  lives: number;
  extraDays: number; // débito de dias acumulado por erros críticos
}

export interface Round {
  id: string;
  players: PlayerId[];
  rolls: Record<PlayerId, DiceRoll>;
  loserId: PlayerId | null;
  status: RoundStatus;
  createdAt: string;
}
```

---

## Acessibilidade

### Regras Obrigatórias

```tsx
// Focus sempre visível e estilizado
// Nunca remover outline sem substituir
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950">

// Ícone decorativo
<DiceIcon aria-hidden="true" />

// Ícone funcional (sem texto visível)
<button aria-label="Rolar dados">
  <DiceIcon aria-hidden="true" />
</button>

// Estado de loading
<button aria-busy={isRolling} aria-disabled={isRolling} disabled={isRolling}>
  {isRolling ? "Rolando..." : "Rolar dados"}
</button>

// Região de placar atualizada em tempo real
<section aria-live="polite" aria-label="Placar da rodada">
  {/* pontuações */}
</section>

// Dialog / modal
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Resultado da Rodada</h2>
</div>
```

### Checklist por Componente

- [ ] Elementos `<button>` e `<a>` semânticos; `<div>` clicável apenas com `role` + `tabIndex`
- [ ] Focus acessível via teclado (`Tab`, `Enter`, `Escape`)
- [ ] `aria-label` em todos os ícones sem texto visível
- [ ] `aria-live="polite"` em regiões de placar e resultado
- [ ] Contraste mínimo 4.5:1 texto normal, 3:1 texto grande
- [ ] Animações respeitam `prefers-reduced-motion`

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Exemplos Completos

### Componente UI — Badge

```tsx
// components/ui/badge/badge.tsx
import clsx from "clsx";

type BadgeVariant = "neutral" | "danger" | "victory" | "ok";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-ink-800 text-ink-200 border border-ink-700",
  danger: "bg-danger-bg text-danger border border-danger/30",
  victory: "bg-victory-bg text-victory border border-victory/30",
  ok: "bg-ok-bg text-ok border border-ok/30",
};

function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-pill",
        "text-xs font-semibold font-body tracking-wide uppercase",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
```

### Componente Feature — linha de placar

A referência é `src/components/features/session/player-score.tsx`.

Regras que a linha de placar segue:

- **Sem card.** A linha é uma `<article>` com `border-b border-ink-800`; a lista inteira
  forma a tabela. Card dentro de card é proibido.
- **Um único sinal por estado.** Jogador da vez recebe `bg-victory-bg/50`; o perdedor
  recebe `bg-danger-bg/60` e o total em `text-danger`. Nunca borda + glow ao mesmo tempo.
- **Os dados são `DiceFace`**, nunca glifos `⚀`–`⚅` nem emoji. O tom (`neutral`,
  `victory`, `danger`) comunica o estado, não o valor da face.
- **Totais em `tabular-nums`** para as colunas não dançarem a cada rodada.
- Nome e metadados em duas linhas (`@usuario` + `criador · você · gerido`), com
  `truncate` para aguentar username longo em 390px.

```tsx
<article className="flex items-center gap-3 border-b border-ink-800 px-1 py-2.5 last:border-b-0">
  <div className="min-w-0 flex-1">
    <p className="truncate text-sm font-semibold text-ink-50">@{score.player.username}</p>
    <p className="truncate text-[11px] text-ink-400">{meta}</p>
  </div>

  <div className="flex items-center gap-1.5">
    {[1, 2, 3].map((round) => (
      <DiceFace key={round} value={valueFor(round)} size="sm" tone={isLoser ? "danger" : "neutral"} />
    ))}
  </div>

  <p className="w-7 text-right font-display text-2xl tabular-nums">{score.total}</p>
</article>
```

---

## Melhorias Sugeridas em Relação ao Style Guide Original

| #   | Original                | Sugerido / Motivo                                                                                                         |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Desktop-first           | **Mobile-first** — jogo é jogado com celular na mão; breakpoints Tailwind são naturalmente mobile-first                   |
| 2   | Sass Modules            | **Tailwind** — elimina contexto de troca entre `.tsx` e `.module.scss`, co-localiza estilos e lógica                      |
| 3   | `clsx` puro             | **`cn` helper** — wrapper leve sobre `clsx` que pode integrar `tailwind-merge` para resolver conflitos de classe          |
| 4   | Sem barrel files        | Mantido — continua válido com Tailwind                                                                                    |
| 5   | Tema via `[data-theme]` | **Apenas dark theme** — jogo com clima noturno/competitivo; simplifica manutenção                                         |
| 6   | Variáveis genéricas     | **Variáveis semânticas** — `--color-danger`, `--color-victory` ao invés de só tons neutros; mapeia para conceitos do jogo |
| 7   | Sem menção a motion     | **`prefers-reduced-motion`** explícito — rolagem de dados usa animações, deve respeitar preferência do SO                 |
| 8   | Sem tipos de domínio    | Adicionada seção de **tipos de domínio** (`DiceRoll`, `Player`, `Round`) — central para um jogo com estado complexo       |
| 9   | Tabelas no plural       | **Tabelas no singular** — o nome descreve uma linha, não uma coleção; impacta joins no Supabase client                    |
