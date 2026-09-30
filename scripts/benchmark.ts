import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeSentiment } from "../src/lib/sentiment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCsv(csvText: string): { review: string; sentiment: string }[] {
  const lines = csvText.split("\n");
  const records: { review: string; sentiment: string }[] = [];
  
  // Simple CSV parser handling quotes
  let insideQuote = false;
  let currentField = "";
  let currentRow: string[] = [];

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && insideQuote && nextChar === '"') {
      currentField += '"';
      i++; // Skip escaped quote
    } else if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.length >= 2) {
        records.push({
          review: currentRow[0].trim(),
          sentiment: currentRow[1].trim().toLowerCase(),
        });
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  // Remove header if present
  if (records.length > 0 && records[0].review.toLowerCase() === "review") {
    records.shift();
  }

  return records;
}

export async function runBenchmark() {
  const datasetPath = path.resolve(__dirname, "../data/imdb_reviews_sample.csv");
  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found at ${datasetPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(datasetPath, "utf-8");
  const records = parseCsv(rawData);
  console.log(`Loaded ${records.length} reviews from ${path.basename(datasetPath)}`);

  const startTime = Date.now();
  let correctStrict = 0;
  let correctBinary = 0;
  let neutralCount = 0;

  let tp = 0; // predicted pos, actual pos
  let fp = 0; // predicted pos, actual neg
  let tn = 0; // predicted neg, actual neg
  let fn = 0; // predicted neg, actual pos

  let posActual = 0;
  let negActual = 0;

  for (const record of records) {
    if (record.sentiment === "positive") posActual++;
    else if (record.sentiment === "negative") negActual++;

    const res = analyzeSentiment(record.review);
    const predStrict = res.label;
    
    // Strict comparison
    if (predStrict === record.sentiment) {
      correctStrict++;
    }
    if (predStrict === "neutral") {
      neutralCount++;
    }

    // Binary mapping: score > 0 -> positive, score < 0 -> negative, score === 0 -> tie/neutral
    let predBinary = predStrict;
    if (predBinary === "neutral") {
      predBinary = res.score > 0 ? "positive" : res.score < 0 ? "negative" : "positive"; // default tie
    }

    if (predBinary === record.sentiment) {
      correctBinary++;
    }

    if (predBinary === "positive") {
      if (record.sentiment === "positive") tp++;
      else fp++;
    } else {
      if (record.sentiment === "negative") tn++;
      else fn++;
    }
  }

  const elapsedSec = (Date.now() - startTime) / 1000;
  const total = records.length;
  const majorityBaseline = Math.max(posActual, negActual) / total;

  const strictAccuracy = (correctStrict / total) * 100;
  const binaryAccuracy = (correctBinary / total) * 100;

  const precisionPos = tp / (tp + fp || 1);
  const recallPos = tp / (tp + fn || 1);
  const f1Pos = (2 * precisionPos * recallPos) / (precisionPos + recallPos || 1);

  const precisionNeg = tn / (tn + fn || 1);
  const recallNeg = tn / (tn + fp || 1);
  const f1Neg = (2 * precisionNeg * recallNeg) / (precisionNeg + recallNeg || 1);

  const macroF1 = ((f1Pos + f1Neg) / 2) * 100;

  const report = {
    dataset: "IMDb Movie Reviews (Clean Subsample)",
    sampleCount: total,
    distribution: { positive: posActual, negative: negActual },
    majorityBaseline: (majorityBaseline * 100).toFixed(2) + "%",
    lexiconStrictAccuracy: strictAccuracy.toFixed(2) + "%",
    lexiconBinaryAccuracy: binaryAccuracy.toFixed(2) + "%",
    neutralPredictions: neutralCount,
    precisionPositive: (precisionPos * 100).toFixed(2) + "%",
    recallPositive: (recallPos * 100).toFixed(2) + "%",
    f1Positive: (f1Pos * 100).toFixed(2) + "%",
    precisionNegative: (precisionNeg * 100).toFixed(2) + "%",
    recallNegative: (recallNeg * 100).toFixed(2) + "%",
    f1Negative: (f1Neg * 100).toFixed(2) + "%",
    macroF1: macroF1.toFixed(2) + "%",
    confusionMatrix: { TP: tp, FP: fp, TN: tn, FN: fn },
    executionTimeSeconds: elapsedSec.toFixed(2),
    throughputReviewsPerSec: Math.round(total / elapsedSec),
  };

  console.log("\n=======================================================");
  console.log("   SENTIMENT LEXICON BENCHMARK RESULTS (IMDb 2,500)   ");
  console.log("=======================================================");
  console.log(`Samples Evaluated      : ${total} (50% positive / 50% negative)`);
  console.log(`Majority Class Baseline: ${(majorityBaseline * 100).toFixed(2)}%`);
  console.log(`-------------------------------------------------------`);
  console.log(`Lexicon Strict Accuracy: ${strictAccuracy.toFixed(2)}% (${correctStrict}/${total})`);
  console.log(`Lexicon Binary Accuracy: ${binaryAccuracy.toFixed(2)}% (${correctBinary}/${total})`);
  console.log(`Neutral Fallbacks      : ${neutralCount} (${((neutralCount / total) * 100).toFixed(1)}%)`);
  console.log(`Macro F1 Score         : ${macroF1.toFixed(2)}%`);
  console.log(`Positive F1            : ${(f1Pos * 100).toFixed(2)}% (Precision: ${(precisionPos * 100).toFixed(2)}%, Recall: ${(recallPos * 100).toFixed(2)}%)`);
  console.log(`Negative F1            : ${(f1Neg * 100).toFixed(2)}% (Precision: ${(precisionNeg * 100).toFixed(2)}%, Recall: ${(recallNeg * 100).toFixed(2)}%)`);
  console.log(`Throughput             : ${Math.round(total / elapsedSec)} reviews/sec (${elapsedSec.toFixed(2)}s total)`);
  console.log("=======================================================\n");

  fs.writeFileSync(
    path.resolve(__dirname, "../benchmark_results.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
  console.log("Results saved to benchmark_results.json");
}

runBenchmark();
