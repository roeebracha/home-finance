import { describe, expect, it } from "vitest";
import { formatExact, formatSummary } from "./money";

describe("formatExact", () => {
  it("prints the receipt example with a thousands comma and two decimals", () => {
    expect(formatExact(216857)).toBe("₪2,168.57");
  });

  it("keeps two decimals below one shekel and on round amounts", () => {
    expect(formatExact(0)).toBe("₪0.00");
    expect(formatExact(5)).toBe("₪0.05");
    expect(formatExact(100)).toBe("₪1.00");
    expect(formatExact(100000)).toBe("₪1,000.00");
  });

  it("puts the minus before the shekel sign", () => {
    expect(formatExact(-216857)).toBe("-₪2,168.57");
    expect(formatExact(-5)).toBe("-₪0.05");
    expect(formatExact(-0)).toBe("₪0.00");
  });
});

describe("formatSummary", () => {
  it("rounds to the nearest shekel", () => {
    expect(formatSummary(216857)).toBe("₪2,169");
    expect(formatSummary(216849)).toBe("₪2,168");
    expect(formatSummary(150)).toBe("₪2");
    expect(formatSummary(149)).toBe("₪1");
    expect(formatSummary(50)).toBe("₪1");
    expect(formatSummary(49)).toBe("₪0");
    expect(formatSummary(0)).toBe("₪0");
    expect(formatSummary(100000)).toBe("₪1,000");
  });

  it("rounds negatives away from zero and hides a signed zero", () => {
    expect(formatSummary(-216857)).toBe("-₪2,169");
    expect(formatSummary(-50)).toBe("-₪1");
    expect(formatSummary(-49)).toBe("₪0");
  });
});

describe("agorot guard", () => {
  it("refuses values that are not integer agorot", () => {
    expect(() => formatExact(1.5)).toThrow(/אגורות/);
    expect(() => formatSummary("216857")).toThrow(TypeError);
    expect(() => formatExact(Number.NaN)).toThrow(TypeError);
    expect(() => formatSummary(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});
