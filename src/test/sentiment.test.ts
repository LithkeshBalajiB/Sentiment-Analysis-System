import { describe, it, expect } from "vitest";
import { analyzeSentiment, preprocessText } from "../lib/sentiment";

describe("Sentiment Analysis Engine (analyzeSentiment)", () => {
  describe("Core Classification & Neutral Fallback", () => {
    it("returns neutral with zero score and 0.5 confidence for empty input", () => {
      const res = analyzeSentiment("");
      expect(res.label).toBe("neutral");
      expect(res.score).toBe(0);
      expect(res.confidence).toBe(0.5);
      expect(res.tokens).toEqual([]);
    });

    it("returns neutral for whitespace-only input", () => {
      const res = analyzeSentiment("     \t \n  ");
      expect(res.label).toBe("neutral");
      expect(res.score).toBe(0);
      expect(res.confidence).toBe(0.5);
    });

    it("returns neutral for neutral factual statements without emotional polarity", () => {
      const res = analyzeSentiment("The package arrived on Tuesday at noon.");
      expect(res.label).toBe("neutral");
      expect(res.score).toBe(0);
    });

    it("classifies simple positive statement correctly", () => {
      const res = analyzeSentiment("The quality is good and works well");
      expect(res.label).toBe("positive");
      expect(res.score).toBeGreaterThan(0);
      expect(res.positiveCount).toBeGreaterThanOrEqual(1);
    });

    it("classifies simple negative statement correctly", () => {
      const res = analyzeSentiment("The quality is terrible and poor");
      expect(res.label).toBe("negative");
      expect(res.score).toBeLessThan(0);
      expect(res.negativeCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Negation Handling", () => {
    it("tests that 'not good' scores negative", () => {
      const res = analyzeSentiment("not good");
      expect(res.score).toBeLessThan(0);
      expect(res.label).toBe("negative");
      expect(res.tokens.some((t) => t.token === "good" && t.negated)).toBe(true);
    });

    it("tests that 'not bad' flips negative valence to positive", () => {
      const res = analyzeSentiment("The food was not bad at all");
      expect(res.score).toBeGreaterThan(0);
      expect(res.label).toBe("positive");
      expect(res.tokens.some((t) => t.token === "bad" && t.negated)).toBe(true);
    });

    it("supports negation with up to 3-token lookback window", () => {
      // 'not' -> 'was' -> 'very' -> 'good' (window lookback captures 'not')
      const res = analyzeSentiment("It was not very good");
      expect(res.score).toBeLessThan(0);
      expect(res.label).toBe("negative");
    });

    it("handles contraction negations like 'don't' and 'can't'", () => {
      const res = analyzeSentiment("I don't enjoy this product");
      expect(res.score).toBeLessThan(0);
      expect(res.tokens.some((t) => t.token === "enjoy" && t.negated)).toBe(true);
    });
  });

  describe("Intensifiers & Diminishers Scaling", () => {
    it("tests that 'very good' scores higher than 'good'", () => {
      const baseGood = analyzeSentiment("This is good");
      const veryGood = analyzeSentiment("This is very good");

      expect(veryGood.score).toBeGreaterThan(baseGood.score);
      expect(veryGood.score).toBeCloseTo(baseGood.score * 1.5, 1);
    });

    it("tests that 'extremely amazing' scores higher than 'amazing'", () => {
      const base = analyzeSentiment("This is amazing");
      const boosted = analyzeSentiment("This is extremely amazing");

      expect(boosted.score).toBeGreaterThan(base.score);
    });

    it("tests that diminishers reduce the magnitude of polarity", () => {
      const base = analyzeSentiment("The screen is good");
      const diminished = analyzeSentiment("The screen is slightly good");

      expect(diminished.score).toBeLessThan(base.score);
      expect(diminished.score).toBeGreaterThan(0);
    });
  });

  describe("Emoji Polarity & Counts", () => {
    it("correctly counts and scores positive emojis", () => {
      const res = analyzeSentiment("Great camera! 😍😍");
      expect(res.positiveCount).toBeGreaterThanOrEqual(3); // 'great' + 2 emojis
      expect(res.score).toBeGreaterThan(3);
    });

    it("correctly counts and scores negative emojis", () => {
      const res = analyzeSentiment("Defective and broke 😡👎");
      expect(res.negativeCount).toBeGreaterThanOrEqual(4); // 'defective', 'broke' + 2 emojis
      expect(res.score).toBeLessThan(-3);
    });

    it("properly extracts emoji signals even without text", () => {
      const res = analyzeSentiment("🔥✨🎉");
      expect(res.label).toBe("positive");
      expect(res.positiveCount).toBe(3);
      expect(res.score).toBe(6);
    });
  });

  describe("URL & Noise Filtering", () => {
    it("tests that URLs are ignored and do not affect sentiment scores", () => {
      const clean = analyzeSentiment("The software is excellent");
      const withUrl = analyzeSentiment("The software is excellent https://example.com/bad/terrible/ugly");

      expect(withUrl.score).toBe(clean.score);
      expect(withUrl.negativeCount).toBe(0);
      expect(withUrl.tokens.some((t) => t.token === "bad" || t.token === "ugly" || t.token === "terrible")).toBe(false);
    });

    it("ignores 'www' domain URLs in preprocessing", () => {
      const res = analyzeSentiment("Fantastic phone www.broken-scam-trash.com");
      expect(res.label).toBe("positive");
      expect(res.negativeCount).toBe(0);
    });

    it("strips social handles and hashtag symbols properly", () => {
      const cleaned = preprocessText("@elonmusk #awesome update!");
      expect(cleaned).toBe("awesome update");
    });
  });

  describe("Confidence & Output Contract", () => {
    it("clamps confidence between 0.5 and 0.99", () => {
      const mild = analyzeSentiment("good");
      const strong = analyzeSentiment("absolutely incredible, magnificent, superb, fantastic, flawless!");
      
      expect(mild.confidence).toBeGreaterThanOrEqual(0.5);
      expect(mild.confidence).toBeLessThanOrEqual(0.99);

      expect(strong.confidence).toBeGreaterThanOrEqual(0.9);
      expect(strong.confidence).toBeLessThanOrEqual(0.99);
    });

    it("provides full token attribution with polarity, score, and negation status", () => {
      const res = analyzeSentiment("Really great screen but terrible battery");
      expect(res.tokens.length).toBe(2);
      
      const greatToken = res.tokens.find((t) => t.token === "great");
      expect(greatToken).toBeDefined();
      expect(greatToken?.polarity).toBe("positive");
      expect(greatToken?.score).toBeGreaterThan(0);

      const terribleToken = res.tokens.find((t) => t.token === "terrible");
      expect(terribleToken).toBeDefined();
      expect(terribleToken?.polarity).toBe("negative");
      expect(terribleToken?.score).toBeLessThan(0);
    });
  });
});
