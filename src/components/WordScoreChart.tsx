import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import type { SentimentToken } from "@/lib/sentiment";

interface WordScoreChartProps {
  tokens: SentimentToken[];
}

export const WordScoreChart: React.FC<WordScoreChartProps> = ({ tokens }) => {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-4 text-center text-sm text-muted-foreground">
        No sentiment-bearing words detected. Try adding words like &quot;amazing&quot;, &quot;broken&quot;, or &quot;not good&quot;.
      </div>
    );
  }

  const chartData = tokens.map((t) => ({
    word: t.negated ? `¬${t.token}` : t.token,
    score: Number(t.score.toFixed(2)),
    polarity: t.polarity,
    negated: t.negated,
    rawScore: t.score,
  }));

  return (
    <div className="rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider">Per-Word Polarity Contribution</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Positive (+)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Negative (−)
          </span>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -16, bottom: 20 }}
          >
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="word"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-2.5 text-xs shadow-lg">
                      <div className="font-semibold text-foreground">
                        Word: &ldquo;{data.word}&rdquo;
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span>Polarity:</span>
                        <span
                          className={`font-semibold capitalize ${
                            data.polarity === "positive"
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {data.polarity}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Score impact:{" "}
                        <span className="font-mono font-bold text-foreground">
                          {data.score > 0 ? `+${data.score}` : data.score}
                        </span>
                      </div>
                      {data.negated && (
                        <div className="mt-1 text-[11px] text-amber-500">
                          ⚠️ Polarity inverted via negation
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.score >= 0
                      ? "hsl(152, 70%, 50%)"
                      : "hsl(350, 85%, 60%)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
