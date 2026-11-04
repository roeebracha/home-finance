import { describe, expect, it } from "vitest";
import { normalizePathname, sectionForPath, sections } from "./sections";

describe("section registry", () => {
  it("keeps finance on the original paths", () => {
    const finance = sections.find((section) => section.id === "finance");
    expect(finance.routes.map((route) => route.path)).toEqual([
      "/",
      "/expenses",
      "/groceries",
      "/apartment",
      "/settings",
    ]);
    expect(finance.prefix).toBeUndefined();
  });

  it("resolves finance and garden without swallowing nearby paths", () => {
    for (const path of ["/", "/expenses", "/groceries", "/apartment", "/settings"]) {
      expect(sectionForPath(path)?.id).toBe("finance");
    }
    expect(sectionForPath("/garden")?.id).toBe("garden");
    expect(sectionForPath("/garden/")?.id).toBe("garden");
    expect(sectionForPath("/garden/beds")?.id).toBe("garden");
    expect(sectionForPath("/gardening")).toBeNull();
    expect(sectionForPath("/login")).toBeNull();
    expect(sectionForPath("/nope")).toBeNull();
  });

  it("normalizes a trailing slash and ignores a query", () => {
    expect(normalizePathname("/expenses/")).toBe("/expenses");
    expect(normalizePathname("/")).toBe("/");
    expect(sectionForPath("/expenses/?x=1")?.id).toBe("finance");
  });

  it("gives every section a unique id, a label, and a route that resolves to it", () => {
    const ids = sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of sections) {
      expect(section.label).toBeTruthy();
      expect(section.to.startsWith("/")).toBe(true);
      expect(section.routes.length).toBeGreaterThan(0);
      expect(sectionForPath(section.to)?.id).toBe(section.id);
    }
  });
});
