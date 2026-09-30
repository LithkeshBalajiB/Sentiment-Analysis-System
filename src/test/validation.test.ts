import { describe, it, expect } from "vitest";
import { z } from "zod";

const sentimentInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Please enter at least 3 characters for meaningful sentiment analysis.")
    .max(2000, "Input is too long (maximum 2,000 characters)."),
});

describe("Zod Input Validation Schema", () => {
  it("rejects input with fewer than 3 characters", () => {
    const res = sentimentInputSchema.safeParse({ text: "ok" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("at least 3 characters");
    }
  });

  it("rejects whitespace-only strings that trim to empty", () => {
    const res = sentimentInputSchema.safeParse({ text: "    " });
    expect(res.success).toBe(false);
  });

  it("accepts valid text inputs", () => {
    const res = sentimentInputSchema.safeParse({ text: "Great product!" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.text).toBe("Great product!");
    }
  });

  it("rejects inputs that exceed 2000 characters", () => {
    const longString = "a".repeat(2001);
    const res = sentimentInputSchema.safeParse({ text: longString });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("maximum 2,000 characters");
    }
  });
});
