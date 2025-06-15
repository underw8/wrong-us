import { describe, it, expect } from "@jest/globals";

interface RedirectRule {
  sourceUrl: string;
  targetUrl: string;
}

interface TextRule {
  sourceText: string;
  targetText: string;
}

describe("Rules", () => {
  describe("Redirect Rules", () => {
    it("should validate redirect rule structure", () => {
      const rule: RedirectRule = {
        sourceUrl: "https://example.com",
        targetUrl: "https://redirected.com",
      };

      expect(rule).toHaveProperty("sourceUrl");
      expect(rule).toHaveProperty("targetUrl");
      expect(typeof rule.sourceUrl).toBe("string");
      expect(typeof rule.targetUrl).toBe("string");
    });
  });

  describe("Text Rules", () => {
    it("should validate text rule structure", () => {
      const rule: TextRule = {
        sourceText: "Hello",
        targetText: "Hi",
      };

      expect(rule).toHaveProperty("sourceText");
      expect(rule).toHaveProperty("targetText");
      expect(typeof rule.sourceText).toBe("string");
      expect(typeof rule.targetText).toBe("string");
    });

    it("should replace text correctly", () => {
      const rule: TextRule = {
        sourceText: "Hello",
        targetText: "Hi",
      };

      const text = "Hello World";
      const expected = "Hi World";
      const result = text.replace(
        new RegExp(rule.sourceText, "g"),
        rule.targetText
      );

      expect(result).toBe(expected);
    });
  });
});
