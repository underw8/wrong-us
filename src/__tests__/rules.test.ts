import { describe, it, expect } from "@jest/globals";
import { UrlRule, TextRule } from "../types/index.js";

describe("Rules", () => {
  describe("URL Redirect Rules", () => {
    it("should validate URL rule structure", () => {
      const rule: UrlRule = {
        from: "https://example.com",
        to: "https://redirected.com",
      };

      expect(rule).toHaveProperty("from");
      expect(rule).toHaveProperty("to");
      expect(typeof rule.from).toBe("string");
      expect(typeof rule.to).toBe("string");
    });

    it("should handle wildcard patterns", () => {
      const rule: UrlRule = {
        from: "*example.com*",
        to: "https://redirected.com",
      };

      expect(rule.from).toContain("*");
      expect(rule.to).toBe("https://redirected.com");
    });

    it("should handle regex patterns", () => {
      const rule: UrlRule = {
        from: "^https://example\\.com.*",
        to: "https://redirected.com",
      };

      expect(rule.from).toMatch(/[\[\](){}.*+?^$|\\]/);
      expect(rule.to).toBe("https://redirected.com");
    });
  });

  describe("Text Rules", () => {
    it("should validate text rule structure", () => {
      const rule: TextRule = {
        from: "Hello",
        to: "Hi",
      };

      expect(rule).toHaveProperty("from");
      expect(rule).toHaveProperty("to");
      expect(typeof rule.from).toBe("string");
      expect(typeof rule.to).toBe("string");
    });

    it("should replace text correctly", () => {
      const rule: TextRule = {
        from: "Hello",
        to: "Hi",
      };

      const text = "Hello World";
      const expected = "Hi World";
      const result = text.replace(
        new RegExp(rule.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        rule.to
      );

      expect(result).toBe(expected);
    });

    it("should handle special characters in text replacement", () => {
      const rule: TextRule = {
        from: "Hello (World)",
        to: "Hi [Universe]",
      };

      const text = "Hello (World) is great";
      const expected = "Hi [Universe] is great";
      const result = text.replace(
        new RegExp(rule.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        rule.to
      );

      expect(result).toBe(expected);
    });
  });
});
