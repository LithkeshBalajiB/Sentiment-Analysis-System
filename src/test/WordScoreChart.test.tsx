import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { WordScoreChart } from "../components/WordScoreChart";
import type { SentimentToken } from "../lib/sentiment";

describe("WordScoreChart Component", () => {
  it("renders empty state message when no tokens are provided", () => {
    render(<WordScoreChart tokens={[]} />);
    expect(screen.getByText(/no sentiment-bearing words detected/i)).toBeInTheDocument();
  });

  it("renders chart container and legend when tokens are present", () => {
    const tokens: SentimentToken[] = [
      { token: "good", score: 2.0, polarity: "positive", negated: false },
      { token: "terrible", score: -3.0, polarity: "negative", negated: false },
    ];
    render(<WordScoreChart tokens={tokens} />);
    expect(screen.getByText(/per-word polarity contribution/i)).toBeInTheDocument();
    expect(screen.getByText(/positive \(\+\)/i)).toBeInTheDocument();
    expect(screen.getByText(/negative \(−\)/i)).toBeInTheDocument();
  });
});
