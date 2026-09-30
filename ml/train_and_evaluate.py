"""
Machine Learning Sentiment Analysis Pipeline & Benchmark Comparison
--------------------------------------------------------------------
Trains TF-IDF + Logistic Regression and Naive Bayes models on labeled IMDb reviews,
and benchmarks them against the Lexicon Baseline and Majority Class Baseline.
"""

import os
import re
import json
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
import joblib

def clean_text(text: str) -> str:
    """Preprocess text: strip HTML tags, URLs, and non-alphanumeric noise."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = text.lower()
    text = re.sub(r"[^a-z'\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# Lexicon word lists matching src/lib/sentiment.ts for direct comparison
POSITIVE_WORDS = {
    "love": 3, "loved": 3, "loving": 3, "lovely": 2, "amazing": 3, "awesome": 3, "fantastic": 3,
    "excellent": 3, "perfect": 3, "perfectly": 3, "brilliant": 3, "wonderful": 3, "superb": 3,
    "great": 2, "good": 2, "best": 3, "better": 2, "nice": 2, "beautiful": 3, "gorgeous": 3,
    "happy": 2, "happiest": 3, "glad": 2, "delighted": 3, "delightful": 3, "pleased": 2,
    "enjoy": 2, "enjoyed": 2, "enjoying": 2, "fun": 2, "exciting": 2, "excited": 2,
    "recommend": 2, "recommended": 2, "satisfied": 2, "satisfying": 2, "impressive": 3,
    "impressed": 3, "incredible": 3, "outstanding": 3, "exceptional": 3, "fabulous": 3,
    "flawless": 3, "smooth": 2, "fast": 1, "quick": 1, "easy": 2, "comfortable": 2,
    "stylish": 2, "premium": 2, "quality": 1, "durable": 2, "worth": 2, "affordable": 2,
    "cheap": 1, "helpful": 2, "friendly": 2, "polite": 2, "kind": 2, "thanks": 1,
    "thank": 1, "appreciate": 2, "appreciated": 2, "win": 2, "winning": 2, "success": 2,
    "successful": 2, "top": 2, "stunning": 3, "magnificent": 3, "marvelous": 3,
    "cool": 1, "neat": 1, "solid": 1, "works": 1, "working": 1, "worked": 1,
    "positive": 2, "yes": 1, "yay": 2, "woohoo": 3, "wow": 2,
}

NEGATIVE_WORDS = {
    "hate": 3, "hated": 3, "hating": 3, "terrible": 3, "awful": 3, "horrible": 3, "horrid": 3,
    "worst": 3, "worse": 2, "bad": 2, "poor": 2, "poorly": 2, "sad": 2, "angry": 3,
    "furious": 3, "mad": 2, "annoying": 2, "annoyed": 2, "frustrated": 3, "frustrating": 3,
    "disappointed": 3, "disappointing": 3, "disappointment": 3, "useless": 3, "garbage": 3,
    "trash": 3, "junk": 2, "broken": 2, "broke": 2, "breaks": 2, "breaking": 2,
    "defective": 3, "faulty": 3, "ugly": 2, "slow": 2, "laggy": 2, "buggy": 2,
    "crash": 2, "crashes": 2, "crashed": 2, "crashing": 2, "fail": 2, "failed": 2,
    "failure": 2, "fails": 2, "failing": 2, "regret": 3, "regretted": 3,
    "refund": 2, "scam": 3, "fake": 2, "lie": 2, "lied": 2, "lying": 2, "liar": 3,
    "rude": 2, "painful": 2, "pain": 2, "suck": 2, "sucks": 2, "sucked": 2,
    "damaged": 2, "damage": 2, "dead": 2, "died": 2, "dies": 2, "dying": 2,
    "expensive": 1, "overpriced": 2, "waste": 2, "wasted": 2, "wasting": 2,
    "pointless": 2, "stupid": 2, "dumb": 2, "ridiculous": 2, "pathetic": 3,
    "uncomfortable": 2, "unhappy": 2, "dissatisfied": 3,
    "problem": 1, "problems": 1, "issue": 1, "issues": 1, "error": 1, "errors": 1,
    "hard": 1, "difficult": 1, "never": 1, "nothing": 1,
    "negative": 2, "miserable": 3, "depressing": 3, "depressed": 3,
}

NEGATIONS = {"not","no","never","none","nobody","nothing","neither","nor","cannot","can't","won't","wouldn't","shouldn't","don't","doesn't","didn't","isn't","aren't","wasn't","weren't","ain't","hadn't","hasn't","haven't"}

def predict_lexicon(text: str) -> str:
    cleaned = clean_text(text)
    tokens = cleaned.split()
    score = 0.0
    for i, t in enumerate(tokens):
        negated = False
        start = max(0, i - 3)
        for prev in tokens[start:i]:
            if prev in NEGATIONS:
                negated = not negated
        base = POSITIVE_WORDS.get(t, -NEGATIVE_WORDS.get(t, 0.0))
        if base == 0.0:
            continue
        contrib = -base if negated else base
        score += contrib
    return "positive" if score >= 0 else "negative"

def run_pipeline():
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "imdb_reviews_sample.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    df["clean_review"] = df["review"].apply(clean_text)
    
    # Map labels: negative -> 0, positive -> 1
    df["label"] = df["sentiment"].map({"negative": 0, "positive": 1})

    # Train / Test split (80/20 stratified)
    X_train, X_test, y_train, y_test, text_train, text_test = train_test_split(
        df["clean_review"],
        df["label"],
        df["review"],
        test_size=0.20,
        random_state=42,
        stratify=df["label"]
    )

    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 1. Baseline: Majority Class
    majority_pred = [1] * len(y_test)
    majority_acc = accuracy_score(y_test, majority_pred)

    # 2. Baseline: Lexicon Rule-Based
    lexicon_preds_raw = [predict_lexicon(t) for t in text_test]
    lexicon_preds = [1 if p == "positive" else 0 for p in lexicon_preds_raw]
    lex_acc = accuracy_score(y_test, lexicon_preds)
    lex_prec, lex_rec, lex_f1, _ = precision_recall_fscore_support(y_test, lexicon_preds, average="macro")

    # 3. Model: TF-IDF + Multinomial Naive Bayes
    nb_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
        ("nb", MultinomialNB(alpha=1.0))
    ])
    nb_pipeline.fit(X_train, y_train)
    nb_preds = nb_pipeline.predict(X_test)
    nb_acc = accuracy_score(y_test, nb_preds)
    nb_prec, nb_rec, nb_f1, _ = precision_recall_fscore_support(y_test, nb_preds, average="macro")

    # 4. Model: TF-IDF + Logistic Regression
    lr_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
        ("clf", LogisticRegression(C=1.5, max_iter=1000, random_state=42))
    ])
    
    t0 = time.time()
    lr_pipeline.fit(X_train, y_train)
    train_time = time.time() - t0

    lr_preds = lr_pipeline.predict(X_test)
    lr_probs = lr_pipeline.predict_proba(X_test)[:, 1]
    
    lr_acc = accuracy_score(y_test, lr_preds)
    lr_prec, lr_rec, lr_f1, _ = precision_recall_fscore_support(y_test, lr_preds, average="macro")
    lr_auc = roc_auc_score(y_test, lr_probs)
    cm = confusion_matrix(y_test, lr_preds).tolist()

    improvement_over_baseline = (lr_acc - majority_acc) * 100
    improvement_over_lexicon = (lr_acc - lex_acc) * 100

    print("\n" + "=" * 65)
    print("      SENTIMENT BENCHMARK & MODEL COMPARISON REPORT      ")
    print("=" * 65)
    print(f"{'Method / Model':<32} | {'Accuracy':<10} | {'Macro F1':<10} | {'Gain vs Lex':<10}")
    print("-" * 65)
    print(f"{'1. Majority Class Baseline':<32} | {majority_acc*100:>8.2f}% | {'N/A':>10} | {'N/A':>10}")
    print(f"{'2. Rule-Based Lexicon (VADER-style)':<32} | {lex_acc*100:>8.2f}% | {lex_f1*100:>8.2f}% | {'--':>10}")
    print(f"{'3. Naive Bayes (TF-IDF + MNB)':<32} | {nb_acc*100:>8.2f}% | {nb_f1*100:>8.2f}% | {f'+{(nb_acc-lex_acc)*100:.2f}%':>10}")
    print(f"{'4. Logistic Regression (TF-IDF)':<32} | {lr_acc*100:>8.2f}% | {lr_f1*100:>8.2f}% | {f'+{improvement_over_lexicon:.2f}%':>10}")
    print("=" * 65)
    print(f"\nLogistic Regression ROC-AUC: {lr_auc:.4f}")
    print(f"Confusion Matrix (TN, FP, FN, TP): {cm}")
    print(f"Training time: {train_time:.2f}s on {len(X_train)} samples")
    print(f"Key Resume Bullet: 'Trained a TF-IDF + Logistic Regression pipeline, achieving {lr_acc*100:.1f}% accuracy (+{improvement_over_lexicon:.1f}% over lexicon baseline) on IMDb reviews.'")

    # Save models
    os.makedirs(os.path.join(os.path.dirname(__file__), "models"), exist_ok=True)
    model_save_path = os.path.join(os.path.dirname(__file__), "models", "sentiment_pipeline.joblib")
    joblib.dump(lr_pipeline, model_save_path)
    print(f"\nModel artifact saved to: {model_save_path}")

    # Export top weighted features (top positive & top negative n-grams) for transparency & web UI
    tfidf = lr_pipeline.named_steps["tfidf"]
    clf = lr_pipeline.named_steps["clf"]
    feature_names = np.array(tfidf.get_feature_names_out())
    coefs = clf.coef_[0]

    top_pos_idx = np.argsort(coefs)[-25:][::-1]
    top_neg_idx = np.argsort(coefs)[:25]

    top_features = {
        "top_positive": [{"term": feature_names[i], "weight": round(float(coefs[i]), 3)} for i in top_pos_idx],
        "top_negative": [{"term": feature_names[i], "weight": round(float(coefs[i]), 3)} for i in top_neg_idx],
    }

    feature_json_path = os.path.join(os.path.dirname(__file__), "models", "top_model_features.json")
    with open(feature_json_path, "w", encoding="utf-8") as f:
        json.dump(top_features, f, indent=2)

    # Save benchmark summary
    benchmark_summary = {
        "dataset": "IMDb 2,500 Labeled Reviews (80% train / 20% test)",
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "models": {
            "majority_baseline": {
                "accuracy": round(majority_acc * 100, 2),
            },
            "lexicon_rule_based": {
                "accuracy": round(lex_acc * 100, 2),
                "macro_f1": round(lex_f1 * 100, 2),
            },
            "multinomial_nb": {
                "accuracy": round(nb_acc * 100, 2),
                "macro_f1": round(nb_f1 * 100, 2),
                "accuracy_gain_over_lexicon": round((nb_acc - lex_acc) * 100, 2),
            },
            "logistic_regression": {
                "accuracy": round(lr_acc * 100, 2),
                "macro_f1": round(lr_f1 * 100, 2),
                "roc_auc": round(lr_auc, 4),
                "accuracy_gain_over_lexicon": round(improvement_over_lexicon, 2),
                "accuracy_gain_over_majority": round(improvement_over_baseline, 2),
            }
        },
        "resume_story": f"Trained a scikit-learn TF-IDF + Logistic Regression model reaching {lr_acc*100:.1f}% accuracy ({lr_f1*100:.1f}% Macro F1), outperforming the lexicon baseline by {improvement_over_lexicon:.1f} percentage points."
    }

    results_path = os.path.join(os.path.dirname(__file__), "ml_benchmark_results.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(benchmark_summary, f, indent=2)
    print(f"Benchmark summary saved to: {results_path}")

if __name__ == "__main__":
    run_pipeline()
