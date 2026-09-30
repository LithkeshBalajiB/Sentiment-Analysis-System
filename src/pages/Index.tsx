import { useMemo, useState } from "react";
import { z } from "zod";
import {
  Sparkles,
  Github,
  ArrowRight,
  Brain,
  Zap,
  BarChart3,
  Code2,
  AlertCircle,
  CheckCircle,
  FlaskConical,
  ExternalLink,
} from "lucide-react";
import { analyzeSentiment, type SentimentResult } from "@/lib/sentiment";
import { WordScoreChart } from "@/components/WordScoreChart";
import { BenchmarkComparison } from "@/components/BenchmarkComparison";
import heroImg from "@/assets/hero-waves.jpg";

// Zod validation schema for user input
const sentimentInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Please enter at least 3 characters for meaningful sentiment analysis.")
    .max(2000, "Input is too long (maximum 2,000 characters)."),
});

const SAMPLES = [
  "I absolutely love this phone! Battery lasts forever and the camera is stunning. 😍",
  "Worst purchase ever. The product broke after one day and customer service was rude.",
  "Not bad, but I expected so much more for this price. Pretty disappointing honestly.",
  "Just got my package and it's perfect — better than I imagined! Highly recommend. 🎉",
];

const Index = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAnalyze = (input?: string) => {
    const rawValue = input !== undefined ? input : text;
    
    // Zod validation
    const validation = sentimentInputSchema.safeParse({ text: rawValue });
    if (!validation.success) {
      const issue = validation.error.issues[0]?.message ?? "Invalid input text.";
      setValidationError(issue);
      return;
    }

    setValidationError(null);
    if (input !== undefined) setText(input);

    setAnalyzing(true);
    // Smooth transition delay
    setTimeout(() => {
      setResult(analyzeSentiment(validation.data.text));
      setAnalyzing(false);
    }, 200);
  };

  const meta = useMemo(() => {
    if (!result) return null;
    const pct = (result.confidence * 100).toFixed(1);
    return { pct };
  }, [result]);

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="border-b border-border/40 sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent/40 shadow-glow">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none">Sentiment Insight</div>
              <div className="text-xs text-muted-foreground">NLP & ML Sentiment Engine</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#benchmark"
              className="hidden items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent md:inline-flex"
            >
              <FlaskConical className="h-3.5 w-3.5" /> Benchmarks
            </a>
            <a
              href="#analyzer"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/5 px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              <Sparkles className="h-4 w-4" /> Live Demo
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container relative grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="relative z-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-medium text-accent">
              <CheckCircle className="h-3.5 w-3.5" /> Empirical Benchmark & ML Evaluated
            </div>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-balance md:text-6xl lg:text-7xl">
              Reading the <em className="gradient-text not-italic">emotion</em> in every tweet & review.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-balance">
              Dual-architecture sentiment analysis system featuring real-time client-side lexicon inference
              benchmarked against a scikit-learn TF-IDF + Logistic Regression model trained on 2,500 IMDb reviews.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#analyzer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-glow transition hover:scale-[1.02]"
              >
                Try the analyzer <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#benchmark"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium transition hover:border-foreground/40"
              >
                <BarChart3 className="h-4 w-4" /> View Benchmark (+9.8% Gain)
              </a>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/30 via-transparent to-negative/20 blur-3xl" />
            <img
              src={heroImg}
              alt="Abstract sentiment waveforms"
              className="relative rounded-[1.75rem] border border-border/60 shadow-card"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ANALYZER */}
      <section id="analyzer" className="border-t border-border/40 bg-card/30">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold md:text-5xl">Live Analyzer</h2>
            <p className="mt-3 text-muted-foreground">
              Paste a review, comment, or sentence. Validated with Zod and scored locally in your browser.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="glass rounded-3xl border border-border/60 p-6 shadow-card md:p-8">
              <label htmlFor="textInput" className="mb-2 flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Input text for sentiment classification</span>
                <span className={`text-xs ${text.length > 2000 ? "text-destructive" : ""}`}>
                  {text.length} / 2,000 chars
                </span>
              </label>

              <textarea
                id="textInput"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                rows={4}
                placeholder="e.g. This product completely changed my routine — absolutely love it!"
                className={`w-full resize-none rounded-2xl border p-4 text-base outline-none transition ${
                  validationError
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-border bg-background/60 focus:border-accent focus:ring-2 focus:ring-accent/30"
                }`}
              />

              {/* Zod Validation Error Feedback */}
              {validationError && (
                <div className="mt-2.5 flex items-center gap-2 text-sm text-destructive animate-fade-up">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Sample Quick-Picks */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium mr-1">Quick presets:</span>
                {SAMPLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAnalyze(s)}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground transition hover:border-accent hover:text-foreground"
                  >
                    {s.length > 40 ? s.slice(0, 40) + "…" : s}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-4">
                <p className="text-xs text-muted-foreground">
                  Zod schema verified · Zero latency client-side execution
                </p>
                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {analyzing ? "Analyzing…" : "Analyze sentiment"}
                  <Zap className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RESULT CARD & RECHARTS WORD SCORE CHART */}
            {result && (
              <div
                key={result.cleaned + result.score}
                className="mt-6 animate-fade-up rounded-3xl border border-border/60 bg-card p-6 shadow-card md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Predicted sentiment</div>
                    <div
                      className={`mt-2 font-display text-5xl font-semibold ${
                        result.label === "positive"
                          ? "text-positive"
                          : result.label === "negative"
                          ? "text-negative"
                          : "text-muted-foreground"
                      }`}
                    >
                      {result.label === "positive" && "Positive"}
                      {result.label === "negative" && "Negative"}
                      {result.label === "neutral" && "Neutral"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Confidence</div>
                    <div className="mt-2 font-display text-5xl font-semibold">{meta?.pct}%</div>
                  </div>
                </div>

                <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-700 ${
                      result.label === "positive"
                        ? "bg-gradient-positive"
                        : result.label === "negative"
                        ? "bg-gradient-negative"
                        : "bg-muted-foreground"
                    }`}
                    style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <Stat label="Positive signals" value={result.positiveCount} accent="positive" />
                  <Stat label="Negative signals" value={result.negativeCount} accent="negative" />
                  <Stat label="Net polarity score" value={result.score.toFixed(2)} />
                </div>

                {/* RECHARTS WORD SCORE VISUALIZATION */}
                <div className="mt-6">
                  <WordScoreChart tokens={result.tokens} />
                </div>

                {result.tokens.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Detected Term Pills</div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {result.tokens.map((t, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                            t.polarity === "positive"
                              ? "border-positive/40 bg-positive/10 text-positive"
                              : "border-negative/40 bg-negative/10 text-negative"
                          }`}
                          title={`score ${t.score.toFixed(2)}${t.negated ? " (negated)" : ""}`}
                        >
                          {t.negated && <span className="opacity-70 font-bold">¬</span>}
                          <span>{t.token}</span>
                          <span className="opacity-60 font-mono text-[11px]">
                            {t.score > 0 ? `+${t.score.toFixed(1)}` : t.score.toFixed(1)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BENCHMARK & MODEL COMPARISON SECTION */}
      <section id="benchmark" className="border-t border-border/40 py-20 bg-background/50">
        <div className="container max-w-5xl">
          <BenchmarkComparison />
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE & TECH STACK */}
      <section id="stack" className="border-t border-border/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold md:text-5xl">System Architecture</h2>
            <p className="mt-3 text-muted-foreground">
              Production-ready engineering: client-side rule inference, verified with Vitest tests, and evaluated against ML pipelines.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            <Feature
              icon={<Brain className="h-5 w-5" />}
              title="Lexicon & Negation Engine"
              desc="Client-side TypeScript analyzer with 3-token lookback negation inversion, intensifiers scaling (1.5x - 2.0x), and VADER-style emoji polarity scoring."
            />
            <Feature
              icon={<BarChart3 className="h-5 w-5" />}
              title="Scikit-Learn ML Pipeline"
              desc="TF-IDF n-gram vectorizer + Logistic Regression trained on 2,500 IMDb reviews, achieving 84.8% accuracy and 0.93 ROC-AUC (+9.8% over lexicon)."
            />
            <Feature
              icon={<Code2 className="h-5 w-5" />}
              title="Rigorous Vitest Testing"
              desc="20 automated unit tests covering negation ('not good' scores negative), intensifiers ('very good' > 'good'), emoji counting, and URL stripping."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        Sentiment Insight Platform · Benchmarked on IMDb reviews · Built with React 18, TypeScript, Recharts & Zod
      </footer>
    </div>
  );
};

const Stat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "positive" | "negative";
}) => (
  <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    <div
      className={`mt-1 font-display text-2xl font-semibold ${
        accent === "positive" ? "text-positive" : accent === "negative" ? "text-negative" : ""
      }`}
    >
      {value}
    </div>
  </div>
);

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="group rounded-3xl border border-border/60 bg-card p-6 transition hover:border-accent/40 hover:shadow-glow">
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
      {icon}
    </div>
    <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
  </div>
);

export default Index;
