export function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: rounded % 1 === 0 ? 0 : 2,
  }).format(rounded);
  return `${formatted} ${currency}`;
}

export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
