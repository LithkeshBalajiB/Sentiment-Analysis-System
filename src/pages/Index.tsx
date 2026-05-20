import { useMemo, useState } from "react";
import { Sparkles, Github, ArrowRight, Brain, Zap, BarChart3, Code2 } from "lucide-react";
import { analyzeSentiment, type SentimentResult } from "@/lib/sentiment";
import heroImg from "@/assets/hero-waves.jpg";

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

  const analyze = (input?: string) => {
    const value = (input ?? text).trim();
    if (!value) return;
    if (input) setText(input);
    setAnalyzing(true);
    // Tiny delay so the UI feels responsive
    setTimeout(() => {
      setResult(analyzeSentiment(value));
      setAnalyzing(false);
    }, 250);
  };

  const meta = useMemo(() => {
    if (!result) return null;
    const pct = (result.confidence * 100).toFixed(1);
    return { pct };
  }, [result]);

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="border-b border-border/40">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent/40 shadow-glow">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none">Sentiment Insight</div>
              <div className="text-xs text-muted-foreground">Sentiment AI · Demo</div>
            </div>
          </div>
          <a
            href="#analyzer"
            className="hidden items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" /> Try it now
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container relative grid gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div className="relative z-10 animate-fade-up">
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-balance md:text-6xl lg:text-7xl">
              Reading the <em className="gradient-text not-italic">emotion</em> in every tweet & review.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-balance">
              An end-to-end NLP system that classifies text as positive or negative — built with TF-IDF,
              Naive Bayes & Logistic Regression, served through a polished web interface.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#analyzer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-glow transition hover:scale-[1.02]"
              >
                Try the analyzer <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#stack"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium transition hover:border-foreground/40"
              >
                <Code2 className="h-4 w-4" /> Tech stack
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
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold md:text-5xl">Live Analyzer</h2>
            <p className="mt-3 text-muted-foreground">
              Paste a tweet, review, or any sentence. The classifier processes it instantly in your browser.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="glass rounded-3xl border border-border/60 p-6 shadow-card md:p-8">
              <label htmlFor="textInput" className="mb-2 block text-sm font-medium text-muted-foreground">
                Your text
              </label>
              <textarea
                id="textInput"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="e.g. This product completely changed my routine — absolutely love it!"
                className="w-full resize-none rounded-2xl border border-border bg-background/60 p-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => analyze(s)}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent hover:text-foreground"
                  >
                    {s.length > 48 ? s.slice(0, 48) + "…" : s}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  {text.length} chars · runs locally, no data leaves your browser
                </p>
                <button
                  onClick={() => analyze()}
                  disabled={!text.trim() || analyzing}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {analyzing ? "Analyzing…" : "Analyze sentiment"}
                  <Zap className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RESULT */}
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
                  <Stat label="Polarity score" value={result.score.toFixed(2)} />
                </div>

                {result.tokens.length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Detected terms</div>
                    <div className="mt-3 flex flex-wrap gap-2">
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
                          {t.negated && <span className="opacity-60">¬</span>}
                          {t.token}
                          <span className="opacity-60">{t.score > 0 ? `+${t.score.toFixed(1)}` : t.score.toFixed(1)}</span>
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

      {/* TECH */}
      <section id="stack" className="border-t border-border/40">
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold md:text-5xl">How it's built</h2>
            <p className="mt-3 text-muted-foreground">
              The full Python project ships with everything below — this page is the live demo.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            <Feature
              icon={<Brain className="h-5 w-5" />}
              title="NLP Preprocessing"
              desc="Lowercasing, URL & emoji stripping, stopword removal, lemmatization with NLTK."
            />
            <Feature
              icon={<BarChart3 className="h-5 w-5" />}
              title="TF-IDF + ML"
              desc="Naive Bayes & Logistic Regression compared on accuracy, confusion matrix & F1."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Flask Web UI"
              desc="Single-text analyzer, batch CSV upload, and a dashboard with word clouds."
            />
          </div>

        </div>
      </section>

      <footer className="border-t border-border/40 py-10 text-center text-sm text-muted-foreground" />
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
