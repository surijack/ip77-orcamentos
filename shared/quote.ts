export type QuoteItem = {
  id: number;
  name: string;
  code: string;
  quantity: string;
};

const supplierBrandPattern = /\b(?:BELENERGY|BELENUS)\b/gi;

export function sanitizeProductName(name: string): string {
  return name
    .replace(supplierBrandPattern, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .trim();
}

export function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function normalizeQuoteItems(items: QuoteItem[]): QuoteItem[] {
  return items.map((item, index) => ({
    ...item,
    id: item.id || index + 1,
    name: sanitizeProductName(item.name),
    code: item.code.trim().toUpperCase(),
    quantity: item.quantity.trim(),
  }));
}
