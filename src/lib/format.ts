const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatSessionDate(iso: string | null): string {
  if (!iso) return "Sem data";

  return dateFormatter.format(new Date(iso));
}

export function toDateInputValue(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateInputToISO(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export function toMoneyInputValue(value: number | null): string {
  if (value === null) return "";

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Máscara de moeda: o valor anda em centavos conforme se digita.
 * "4" -> "0,04" · "4250" -> "42,50" · "123456" -> "1.234,56"
 * Zeros à esquerda são descartados, então apagar volta naturalmente ao vazio.
 */
export function maskMoneyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11);

  if (!digits) return "";

  return (Number(digits) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBRL(value: number | null): string {
  if (value === null) return "—";

  return brlFormatter.format(value);
}

/**
 * Aceita "10", "10,50", "10.50" e "1.234,56".
 * Retorna null quando o texto não representa um número válido.
 */
export function parseMoneyInput(raw: string): number | null {
  let normalized = raw.trim().replace(/[^\d.,-]/g, "");

  if (!normalized) return null;

  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  }

  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
}
