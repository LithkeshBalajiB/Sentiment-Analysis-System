# 🧠 Sentiment Analysis System & Empirical NLP Benchmark

> A production-grade, dual-architecture sentiment analysis platform featuring a real-time client-side lexicon analyzer and a scikit-learn ML pipeline, empirically evaluated and benchmarked on 2,500 IMDb movie reviews.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?logo=vercel&logoColor=white)](https://sentiment-analysis-system-lithkesh.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Vitest](https://img.shields.io/badge/Unit_Tests-26_Passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Data_Viz-Recharts-22b5bf)](https://recharts.org/)

---


## 📊 Empirical Benchmark Results (IMDb 2,500 Reviews)

Evaluated on a balanced, stratified test set (80% train / 20% test, 500 held-out test reviews). Run it locally at any time via `npm run benchmark` or `python ml/train_and_evaluate.py`.

| Method / Architecture | Model Type | Accuracy | Macro F1 | ROC-AUC | Gain vs. Lexicon |
|---|---|---|---|---|---|
| **Majority Class Baseline** | Heuristic | 50.00% | N/A | 0.5000 | Baseline |
| **Rule-Based Lexicon** | VADER-style (Client-side) | **75.00%** | **74.22%** | N/A | Reference |
| **Multinomial Naive Bayes** | TF-IDF + MNB | **84.00%** | **83.99%** | 0.9120 | **+9.00%** |
| **Logistic Regression** | TF-IDF (1-2 ngrams) + LogReg | **84.80%** | **84.80%** | **0.9305** | **+9.80%** |

> **Key Takeaway**: Lexicon methods offer instant zero-latency processing (~8,300 reviews/sec), while the trained TF-IDF + Logistic Regression model delivers higher contextual accuracy, gaining **+9.8 percentage points** over the lexicon baseline.

---

## ✨ System Architecture & Key Features

### 1. Client-Side Rule-Based Lexicon Engine (`src/lib/sentiment.ts`)
- **Zero latency**: Executes 100% in-browser with no server roundtrips.
- **Negation handling**: Multi-token backward lookback (up to 3 tokens) inversions (e.g., *"not good"*, *"don't like"*, *"was not very happy"*).
- **Intensifiers & Diminishers**: Modulates valence dynamically (`"very"` 1.5x, `"extremely"` 2.0x, `"slightly"` 0.5x).
- **Emoji polarity extraction**: Weighted scoring for both positive (`😍`, `🔥`, `🎉`) and negative (`😡`, `👎`, `💔`) emojis.
- **URL & Handle Sanitization**: Strips URLs, domain links, hashtags, and social handles before scoring.

### 2. Machine Learning Training & Evaluation Pipeline (`ml/train_and_evaluate.py`)
- Automated stratified train/test split on 2,500 IMDb reviews.
- Sublinear TF-IDF vectorization with unigrams and bigrams (`max_features=5000`).
- Trained Logistic Regression and Naive Bayes classifiers.
- Discriminative feature extraction (top positive & negative n-gram coefficients).
- Model artifact serialization with `joblib`.

### 3. Interactive Data Visualization with Recharts (`src/components/`)
- **Per-Word Polarity Bar Chart** (`WordScoreChart.tsx`): Dynamic bar chart showing signed impact of each emotional token with negation markers and custom tooltips.
- **Benchmark Comparison Bar Chart** (`BenchmarkComparison.tsx`): Live visual comparison of Accuracy and Macro F1 across all evaluated models.

### 4. Robust Form Validation with Zod (`src/pages/Index.tsx`)
- Validates text length constraints (minimum 3 characters, maximum 2,000 characters).
- Provides immediate visual feedback and error messaging for invalid inputs.

### 5. Rigorous Automated Unit Testing (`src/test/`)
- **26 tests passing in Vitest**:
  - `sentiment.test.ts`: Verifies `"not good"` scores negative, `"very good"` > `"good"`, emoji counts, URL stripping, empty input fallback, and confidence limits.
  - `validation.test.ts`: Verifies Zod schema boundaries and validation error states.
  - `WordScoreChart.test.tsx`: Verifies Recharts component rendering with empty and active token payloads.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend UI | [React 18](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) |
| Build Tool | [Vite 5](https://vitejs.dev/) with SWC |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Data Visualization | [Recharts 2](https://recharts.org/) |
| Schema Validation | [Zod 3](https://zod.dev/) |
| Machine Learning | [scikit-learn](https://scikit-learn.org/), [pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) |
| Testing | [Vitest 3](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| Deployment | [Vercel](https://vercel.com/) / [Cloudflare Pages](https://pages.cloudflare.com/) |

---

## 🚀 Quickstart & Commands

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9 (for the ML pipeline)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/LithkeshBalajiB/Sentiment-Analysis-System.git
cd Sentiment-Analysis-System

# Install Node dependencies
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run the Unit Test Suite (26 Tests)
```bash
npm test
```

### 4. Run the Lexicon Benchmark
```bash
npm run benchmark
```
Outputs strict accuracy, binary accuracy, precision, recall, F1, throughput, and saves `benchmark_results.json`.

### 5. Train & Benchmark the ML Models (Python)
```bash
# Optional: install Python dependencies if needed
pip install scikit-learn pandas numpy joblib

npm run benchmark:ml
# or: python ml/train_and_evaluate.py
```

### 6. Build for Production
```bash
npm run build
npm run preview
```

---

## 🌐 Live Deployment Guide

This project is preconfigured for zero-configuration deployment to **Vercel** or **Cloudflare Pages**.

### Deploy to Vercel (Recommended)
1. Fork or push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import this repository. The included `vercel.json` automatically configures Vite single-page routing:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your app will be live at `https://sentiment-analysis-system-lithkesh.vercel.app` (or your chosen domain).

### Deploy via Vercel CLI
```bash
npx vercel
```

---

## 📂 Project Structure

```
Sentiment-Analysis-System/
├── data/
│   └── imdb_reviews_sample.csv  # 2,500 balanced IMDb reviews for benchmarking
├── ml/
│   ├── train_and_evaluate.py    # scikit-learn TF-IDF + Logistic Regression & MNB pipeline
│   ├── ml_benchmark_results.json# Serialized benchmark comparison metrics
│   └── models/                  # Serialized model artifacts (.joblib) & top coefficients
├── scripts/
│   └── benchmark.ts             # Automated TypeScript benchmark runner for analyzeSentiment
├── src/
│   ├── components/
│   │   ├── WordScoreChart.tsx   # Recharts per-word polarity attribution bar chart
│   │   └── BenchmarkComparison.tsx # Recharts empirical model comparison chart
│   ├── lib/
│   │   ├── sentiment.ts         # Rule-based lexicon analyzer with negation & intensifiers
│   │   └── utils.ts             # Utility functions
│   ├── pages/
│   │   └── Index.tsx            # Main application with Zod validation & live analysis
│   └── test/
│       ├── sentiment.test.ts    # 20 tests: negation, intensifiers, emoji, URLs, neutral
│       ├── validation.test.ts   # 4 tests: Zod schema bounds & error cases
│       ├── WordScoreChart.test.tsx # 2 tests: Recharts container & token rendering
│       └── setup.ts             # Vitest test setup and ResizeObserver mock
├── vercel.json                  # Production Vercel deployment configuration
├── vitest.config.ts             # Vitest test runner configuration
└── package.json                 # Scripts and dependencies
```

---

## 📄 License

MIT License. Feel free to use this codebase for learning, research, or portfolio demonstration.
