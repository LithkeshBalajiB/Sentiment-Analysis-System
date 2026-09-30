import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Award, CheckCircle2, TrendingUp, Terminal, Cpu } from "lucide-react";

const BENCHMARK_DATA = [
  { name: "Majority Class", accuracy: 50.0, f1: 50.0, fill: "hsl(240, 5%, 45%)", note: "Naive Baseline" },
  { name: "Rule-Based Lexicon", accuracy: 75.0, f1: 74.2, fill: "hsl(35, 90%, 60%)", note: "VADER-style (Client-side)" },
  { name: "Naive Bayes (TF-IDF)", accuracy: 84.0, f1: 84.0, fill: "hsl(200, 85%, 55%)", note: "+9.0% over Lexicon" },
  { name: "Logistic Regression", accuracy: 84.8, f1: 84.8, fill: "hsl(152, 70%, 50%)", note: "+9.8% over Lexicon (0.93 AUC)" },
];

const TOP_POS_FEATURES = ["excellent", "perfect", "superb", "loved", "wonderful", "amazing", "favorite", "brilliant"];
const TOP_NEG_FEATURES = ["worst", "awful", "waste", "terrible", "poor", "boring", "horrible", "avoid"];

export const BenchmarkComparison: React.FC = () => {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/60 p-6 shadow-card md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <Cpu className="h-3.5 w-3.5" /> Empirical NLP Benchmark
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
            Model Evaluation on 2,500 IMDb Reviews
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Benchmarked against balanced ground truth with stratified 80/20 train-test split.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background/60 border border-border/60 rounded-xl px-3 py-2">
          <Terminal className="h-4 w-4 text-accent" />
          <span>npm run benchmark</span>
        </div>
      </div>

      {/* RECHARTS BENCHMARK BAR CHART */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-background/50 p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">Test Set Accuracy (%)</span>
          <span className="text-[11px]">Evaluated on 500 held-out test reviews</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={BENCHMARK_DATA}
              layout="vertical"
              margin={{ top: 8, right: 30, left: 24, bottom: 8 }}
            >
              <XAxis
                type="number"
                domain={[40, 100]}
                unit="%"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-lg">
                        <div className="font-semibold text-foreground">{d.name}</div>
                        <div className="mt-1 text-emerald-400 font-mono font-bold text-sm">
                          Accuracy: {d.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground font-mono">
                          Macro F1: {d.f1.toFixed(1)}%
                        </div>
                        <div className="mt-1.5 text-[11px] text-accent">
                          {d.note}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                {BENCHMARK_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* METRIC HIGHLIGHTS CARDS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Accuracy Gain
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-emerald-400">+9.8%</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Logistic Regression (84.8%) over Lexicon baseline (75.0%)
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Award className="h-4 w-4 text-accent" />
            ROC-AUC Score
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-accent">0.9305</div>
          <p className="mt-1 text-xs text-muted-foreground">
            High discrimination capability on 5,000 TF-IDF n-gram features
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-positive" />
            Throughput
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-foreground">8,300+</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reviews / sec for client-side lexicon inference (0.3s for 2.5k reviews)
          </p>
        </div>
      </div>

      {/* TOP LEARNED N-GRAM FEATURES */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
          Top Learned ML Discriminative Coefficients (TF-IDF + LogReg)
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <span className="text-xs text-emerald-400 font-medium">Strongest Positive Signals:</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TOP_POS_FEATURES.map((feat) => (
                <span key={feat} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-300">
                  +{feat}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-rose-400 font-medium">Strongest Negative Signals:</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TOP_NEG_FEATURES.map((feat) => (
                <span key={feat} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-mono text-rose-300">
                  −{feat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
