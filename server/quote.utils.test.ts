import { describe, expect, it } from "vitest";
import { formatBrl, normalizeQuoteItems, sanitizeProductName } from "../shared/quote";

describe("quote utilities", () => {
  it("removes supplier brand mentions without damaging the product name", () => {
    expect(sanitizeProductName("Grampo final 30mm alumínio BELENERGY")).toBe("Grampo final 30mm alumínio");
    expect(sanitizeProductName("Estrutura Belenus para laje")).toBe("Estrutura para laje");
  });

  it("normalizes item codes and keeps quantities intact", () => {
    const [item] = normalizeQuoteItems([
      { id: 0, name: " Cabo solar BELENERGY ", code: " cbsol-pt ", quantity: " 100 m " },
    ]);
    expect(item).toEqual({ id: 1, name: "Cabo solar", code: "CBSOL-PT", quantity: "100 m" });
  });

  it("formats proposal totals in Brazilian currency", () => {
    expect(formatBrl(61911.91)).toBe("R$ 61.911,91");
  });
});
