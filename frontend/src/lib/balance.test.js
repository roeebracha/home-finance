import { describe, expect, it } from "vitest";
import { balanceSentence } from "./balance";

describe("balanceSentence", () => {
  it("follows the sheet wording and keeps the agora", () => {
    expect(balanceSentence(-217403)).toBe("רועי חייב לאביב ₪2,174.03");
    expect(balanceSentence(217403)).toBe("אביב חייבת לרועי ₪2,174.03");
    expect(balanceSentence(0)).toBe("מאוזן — ₪0.00");
  });
});
