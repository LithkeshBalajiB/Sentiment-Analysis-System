/**
 * Lightweight client-side sentiment analyzer.
 * Lexicon-based with negation handling, intensifiers, and emoji support.
 * Mirrors the preprocessing logic of the Python NLTK pipeline at a high level.
 */

const POSITIVE_WORDS: Record<string, number> = {
  love: 3, loved: 3, loving: 3, lovely: 2, amazing: 3, awesome: 3, fantastic: 3,
  excellent: 3, perfect: 3, perfectly: 3, brilliant: 3, wonderful: 3, superb: 3,
  great: 2, good: 2, best: 3, better: 2, nice: 2, beautiful: 3, gorgeous: 3,
  happy: 2, happiest: 3, glad: 2, delighted: 3, delightful: 3, pleased: 2,
  enjoy: 2, enjoyed: 2, enjoying: 2, fun: 2, exciting: 2, excited: 2,
  recommend: 2, recommended: 2, satisfied: 2, satisfying: 2, impressive: 3,
  impressed: 3, incredible: 3, outstanding: 3, exceptional: 3, fabulous: 3,
  flawless: 3, smooth: 2, fast: 1, quick: 1, easy: 2, comfortable: 2,
  stylish: 2, premium: 2, quality: 1, durable: 2, worth: 2, affordable: 2,
  cheap: 1, helpful: 2, friendly: 2, polite: 2, kind: 2, thanks: 1,
  thank: 1, appreciate: 2, appreciated: 2, win: 2, winning: 2, success: 2,
  successful: 2, top: 2, stunning: 3, magnificent: 3, marvelous: 3,
  cool: 1, neat: 1, solid: 1, works: 1, working: 1, worked: 1,
  positive: 2, yes: 1, yay: 2, woohoo: 3, wow: 2,
};

const NEGATIVE_WORDS: Record<string, number> = {
  hate: 3, hated: 3, hating: 3, terrible: 3, awful: 3, horrible: 3, horrid: 3,
  worst: 3, worse: 2, bad: 2, poor: 2, poorly: 2, sad: 2, angry: 3,
  furious: 3, mad: 2, annoying: 2, annoyed: 2, frustrated: 3, frustrating: 3,
  disappointed: 3, disappointing: 3, disappointment: 3, useless: 3, garbage: 3,
  trash: 3, junk: 2, broken: 2, broke: 2, breaks: 2, breaking: 2,
  defective: 3, faulty: 3, ugly: 2, slow: 2, laggy: 2, buggy: 2,
  crash: 2, crashes: 2, crashed: 2, crashing: 2, fail: 2, failed: 2,
  failure: 2, fails: 2, failing: 2, regret: 3, regretted: 3,
  refund: 2, scam: 3, fake: 2, lie: 2, lied: 2, lying: 2, liar: 3,
  rude: 2, painful: 2, pain: 2, suck: 2, sucks: 2, sucked: 2,
  damaged: 2, damage: 2, dead: 2, died: 2, dies: 2, dying: 2,
  expensive: 1, overpriced: 2, waste: 2, wasted: 2, wasting: 2,
  pointless: 2, stupid: 2, dumb: 2, ridiculous: 2, pathetic: 3,
  uncomfortable: 2, unhappy: 2, dissatisfied: 3,
  problem: 1, problems: 1, issue: 1, issues: 1, error: 1, errors: 1,
  hard: 1, difficult: 1, never: 1, nothing: 1,
  negative: 2, miserable: 3, depressing: 3, depressed: 3,
};

const POSITIVE_EMOJI = ["😊","😀","😁","😂","😍","🥰","😘","🤩","😎","👍","❤️","💖","🔥","✨","🎉","🙌","💯","🥳","😇","😄"];
const NEGATIVE_EMOJI = ["😞","😢","😭","😡","🤬","👎","💔","😠","😤","🙄","😒","😩","😫","😖","😣","🤮","💩","😨","😰","😱"];

const NEGATIONS = new Set(["not","no","never","none","nobody","nothing","neither","nor","cannot","can't","won't","wouldn't","shouldn't","don't","doesn't","didn't","isn't","aren't","wasn't","weren't","ain't","hadn't","hasn't","haven't"]);
const INTENSIFIERS: Record<string, number> = {
  very: 1.5, really: 1.5, extremely: 2, absolutely: 2, totally: 1.8,
  completely: 1.8, super: 1.6, so: 1.3, too: 1.3, quite: 1.2, highly: 1.6,
  incredibly: 2, insanely: 2,
};
const DIMINISHERS: Record<string, number> = {
  slightly: 0.5, somewhat: 0.6, kind: 0.7, sort: 0.7, barely: 0.4,
  hardly: 0.4, little: 0.6,
};

export interface SentimentToken {
  token: string;
  score: number;
  polarity: "positive" | "negative" | "neutral";
  negated: boolean;
}

export interface SentimentResult {
  label: "positive" | "negative" | "neutral";
  score: number;          // raw signed score
  confidence: number;     // 0..1
  positiveCount: number;
  negativeCount: number;
  cleaned: string;
  tokens: SentimentToken[];
}

const STOPWORDS = new Set(["a","an","the","is","are","was","were","be","been","being","am","i","me","my","mine","you","your","yours","he","she","it","its","we","us","our","they","them","their","this","that","these","those","of","to","in","on","at","by","for","with","from","as","and","or","but","if","then","than","because","while","about","into","over","under","again","further","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","only","own","same","s","t","will","just","should","now","d","ll","m","o","re","ve","y","have","has","had","do","does","did","doing","would","could","might","must","shall","may"]);

function stripUrls(s: string) {
  return s.replace(/https?:\/\/\S+|www\.\S+/gi, " ");
}

function extractEmojiScore(s: string): { score: number; pos: number; neg: number } {
  let score = 0, pos = 0, neg = 0;
  for (const e of POSITIVE_EMOJI) {
    const matches = s.split(e).length - 1;
    if (matches) { score += 2 * matches; pos += matches; }
  }
  for (const e of NEGATIVE_EMOJI) {
    const matches = s.split(e).length - 1;
    if (matches) { score -= 2 * matches; neg += matches; }
  }
  return { score, pos, neg };
}

export function preprocessText(input: string): string {
  let s = stripUrls(input).toLowerCase();
  s = s.replace(/@\w+/g, " ").replace(/#/g, " ");
  // Keep apostrophes for contractions like don't
  s = s.replace(/[^a-z'\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function analyzeSentiment(input: string): SentimentResult {
  const emoji = extractEmojiScore(input);
  const cleaned = preprocessText(input);
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);

  const tokens: SentimentToken[] = [];
  let score = emoji.score;
  let pos = emoji.pos;
  let neg = emoji.neg;

  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i];
    if (STOPWORDS.has(t) && !NEGATIONS.has(t)) continue;

    // Look back up to 3 tokens for negation/intensifier
    let multiplier = 1;
    let negated = false;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      const prev = rawTokens[j];
      if (NEGATIONS.has(prev)) negated = !negated;
      if (INTENSIFIERS[prev]) multiplier *= INTENSIFIERS[prev];
      if (DIMINISHERS[prev]) multiplier *= DIMINISHERS[prev];
    }

    let base = 0;
    let polarity: SentimentToken["polarity"] = "neutral";
    if (POSITIVE_WORDS[t]) { base = POSITIVE_WORDS[t]; polarity = "positive"; }
    else if (NEGATIVE_WORDS[t]) { base = -NEGATIVE_WORDS[t]; polarity = "negative"; }
    else continue;

    let contrib = base * multiplier;
    if (negated) { contrib = -contrib; polarity = polarity === "positive" ? "negative" : "positive"; }

    score += contrib;
    if (contrib > 0) pos += 1;
    else if (contrib < 0) neg += 1;

    tokens.push({ token: t, score: contrib, polarity, negated });
  }

  // Determine label & confidence
  let label: SentimentResult["label"] = "neutral";
  if (score > 0.5) label = "positive";
  else if (score < -0.5) label = "negative";

  // Confidence: scaled tanh of |score| with a floor when neutral
  const magnitude = Math.abs(score);
  const confidence = label === "neutral"
    ? 0.5
    : Math.min(0.99, 0.55 + Math.tanh(magnitude / 4) * 0.44);

  return { label, score, confidence, positiveCount: pos, negativeCount: neg, cleaned, tokens };
}
