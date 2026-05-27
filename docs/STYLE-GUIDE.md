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
  --color-ink-600   #3d3d3d
  --color-ink-400   #737373
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
    --text-secondary: #a3a3a3;
    --text-muted: #525252;
    --text-disabled: #3d3d3d;

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
    --radius-xl: 24px;
    --radius-pill: 9999px;

    /* ── Sombras ── */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.6);
    --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.7);
    --shadow-glow-red: 0 0 24px rgba(239, 68, 68, 0.25);
    --shadow-glow-gold: 0 0 24px rgba(251, 191, 36, 0.25);

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

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#111111",
          800: "#1c1c1c",
          700: "#2a2a2a",
          600: "#3d3d3d",
          400: "#737373",
          200: "#c4c4c4",
          50: "#f5f5f5",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "rgba(239,68,68,0.15)",
          bg: "#1f0b0b",
          strong: "#dc2626",
        },
        victory: {
          DEFAULT: "#fbbf24",
          muted: "rgba(251,191,36,0.15)",
          bg: "#1c1200",
          bright: "#fcd34d",
        },
        ok: {
          DEFAULT: "#22c55e",
          bg: "#071d0f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "glow-red": "var(--shadow-glow-red)",
        "glow-gold": "var(--shadow-glow-gold)",
      },
      transitionDuration: {
        fast: "120",
        base: "220",
        slow: "380",
      },
    },
  },
  plugins: [],
};

export default config;
```

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

```tsx
// components/ui/button/button.tsx
import clsx from "clsx";

type Variant = "primary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: React.ReactNode;
}

// Classes reutilizáveis extraídas para evitar strings enormes inline
const variantClasses: Record<Variant, string> = {
  primary: "bg-ink-50 text-ink-950 hover:bg-ink-200 active:scale-[0.97]",
  danger: "bg-danger text-ink-50 hover:bg-danger-strong active:scale-[0.97] shadow-glow-red",
  ghost: "bg-transparent text-ink-200 hover:bg-ink-800",
  outline: "border border-ink-700 text-ink-200 hover:border-ink-400 hover:text-ink-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-11 px-5 text-base rounded-lg",
  lg: "h-14 px-7 text-lg rounded-xl",
};

function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-body font-semibold",
        "transition-all duration-fast select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && "opacity-40 pointer-events-none",
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span
            className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
```

### Regras de Componente

- Props opcionais sempre com **valor padrão** na desestruturação
- `className` aceitável em primitivos `ui/` para extensibilidade, proibido em `features/`
- Usar `clsx` para toda composição de classes — nunca template literals manuais
- Funções declaradas com `function Component` em vez de `const Component: React.FC`

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

Defina no `globals.css` via `@keyframes` e referencie como classes Tailwind:

```css
/* globals.css */
@keyframes dice-shake {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  20% {
    transform: rotate(-8deg) scale(1.05);
  }
  40% {
    transform: rotate(8deg) scale(1.08);
  }
  60% {
    transform: rotate(-5deg) scale(1.05);
  }
  80% {
    transform: rotate(5deg) scale(1.02);
  }
}

@keyframes flash-red {
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(239, 68, 68, 0.2);
  }
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  70% {
    transform: scale(1.04);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

```ts
// tailwind.config.ts → theme.extend.animation
animation: {
  "dice-shake": "dice-shake 0.5s ease-in-out",
  "flash-red":  "flash-red 0.4s ease",
  "pop-in":     "pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
}
```

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

### Componente Feature — PlayerScoreCard

```tsx
// components/features/player-score-card/player-score-card.tsx
import clsx from "clsx";
import Badge from "@/components/ui/badge/badge";
import type { Player, DiceRoll } from "@/types/game";

export interface PlayerScoreCardProps {
  player: Player;
  roll?: DiceRoll;
  isLoser?: boolean;
  isWinner?: boolean;
}

function PlayerScoreCard({ player, roll, isLoser = false, isWinner = false }: PlayerScoreCardProps) {
  return (
    <article
      className={clsx(
        "rounded-xl border p-4 transition-all duration-base",
        "bg-ink-900",
        isLoser && "border-danger shadow-glow-red animate-flash-red",
        isWinner && "border-victory shadow-glow-gold",
        !isLoser && !isWinner && "border-ink-800",
      )}
      aria-label={`Jogador ${player.name}`}
    >
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-body font-semibold text-ink-50 truncate">{player.name}</h3>
        <div className="flex items-center gap-1.5">
          {player.lives > 0 && (
            <Badge variant="victory" aria-label={`${player.lives} vidas`}>
              ❤️ {player.lives}
            </Badge>
          )}
          {player.extraDays > 0 && (
            <Badge variant="danger" aria-label={`${player.extraDays} dias extras`}>
              💀 {player.extraDays}d
            </Badge>
          )}
        </div>
      </header>

      {/* Dados */}
      {roll ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 justify-center" aria-label="Resultados dos dados">
            {roll.values.map((value, index) => (
              <span
                key={index}
                className={clsx(
                  "size-10 flex items-center justify-center rounded-md",
                  "font-display text-xl border",
                  value === 6 && "bg-victory-bg border-victory text-victory",
                  value === 1 && "bg-danger-bg border-danger text-danger",
                  value > 1 && value < 6 && "bg-ink-800 border-ink-700 text-ink-50",
                )}
                aria-label={`Dado ${index + 1}: ${value}`}
              >
                {value}
              </span>
            ))}
          </div>

          <p className="text-center font-display text-3xl text-ink-50">{roll.total}</p>

          {roll.critical === "critical-hit" && (
            <Badge variant="victory" className="mx-auto">
              🏆 Acerto Crítico!
            </Badge>
          )}
          {roll.critical === "critical-miss" && (
            <Badge variant="danger" className="mx-auto">
              💀 Erro Crítico!
            </Badge>
          )}
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center">
          <p className="text-ink-400 text-sm font-body">Aguardando rolagem…</p>
        </div>
      )}
    </article>
  );
}

export default PlayerScoreCard;
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
