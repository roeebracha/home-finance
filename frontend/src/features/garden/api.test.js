import { describe, expect, it } from "vitest";
import { normalizeGardenApiUrl } from "./api";

describe("normalizeGardenApiUrl", () => {
  it("treats missing and blank values as unset", () => {
    expect(normalizeGardenApiUrl(undefined)).toBe("");
    expect(normalizeGardenApiUrl(null)).toBe("");
    expect(normalizeGardenApiUrl("")).toBe("");
    expect(normalizeGardenApiUrl("   ")).toBe("");
  });

  it("trims whitespace and a trailing slash", () => {
    expect(normalizeGardenApiUrl("  https://garden.example/api/  ")).toBe(
      "https://garden.example/api",
    );
    expect(normalizeGardenApiUrl("https://garden.example/api///")).toBe(
      "https://garden.example/api",
    );
  });
});
