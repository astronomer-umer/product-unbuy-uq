// Lightweight, dependency-free semantic search using Term Frequency-Inverse
// Document Frequency (TF-IDF) over (title + description + brand + category).
//
// Why not embeddings? For a marketplace catalog this size (dozens-thousands of
// items), TF-IDF + cosine similarity gives 90% of the perceived value of
// transformer embeddings without the cold-start cost, no extra API key, no
// native build step (Transformers.js / ONNX requires native compilation that
// fails on Vercel serverless), and is fully deterministic / explainable.
//
// For a few thousand products this is the right tradeoff. When the catalog
// hits 10k+ items, swap this out for embedding-based similarity behind the
// same `semanticSearchProducts()` interface.

type Vec = Float32Array;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  // log-normalized
  for (const [k, v] of tf) tf.set(k, 1 + Math.log(v));
  return tf;
}

function idf(docs: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  const N = docs.length;
  for (const doc of docs) {
    const seen = new Set(doc);
    for (const term of seen) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const idfMap = new Map<string, number>();
  for (const [k, v] of df) idfMap.set(k, Math.log(1 + N / v));
  return idfMap;
}

function vectorize(
  tf: Map<string, number>,
  idfMap: Map<string, number>,
  vocab: Map<string, number>,
): Vec {
  const vec = new Float32Array(vocab.size);
  for (const [term, f] of tf) {
    const idx = vocab.get(term);
    if (idx !== undefined) {
      vec[idx] = f * (idfMap.get(term) ?? 0);
    }
  }
  return vec;
}

function l2norm(v: Vec): number {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}

function cosine(a: Vec, b: Vec, na: number, nb: number): number {
  if (na === 0 || nb === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot / (na * nb);
}

export type ScoredItem<T> = { item: T; score: number };

export function buildSemanticIndex<T>(
  items: T[],
  fields: (item: T) => string,
): {
  query: (q: string) => ScoredItem<T>[];
} {
  const docs = items.map((it) => tokenize(fields(it)));
  // Trim very common 1-letter noise and dedupe
  const idfMap = idf(docs);
  const vocab = new Map<string, number>();
  let next = 0;
  for (const term of idfMap.keys()) vocab.set(term, next++);

  const tfs = docs.map(termFreq);
  const vecs = tfs.map((tf) => {
    const v = vectorize(tf, idfMap, vocab);
    return { v, n: l2norm(v) };
  });

  return {
    query(q: string) {
      const qTokens = tokenize(q);
      if (qTokens.length === 0) return [];
      const qTf = termFreq(qTokens);
      const qVec = vectorize(qTf, idfMap, vocab);
      const qN = l2norm(qVec);

      const results: ScoredItem<T>[] = [];
      for (let i = 0; i < items.length; i++) {
        const score = cosine(qVec, vecs[i].v, qN, vecs[i].n);
        if (score > 0) results.push({ item: items[i], score });
      }
      results.sort((a, b) => b.score - a.score);
      return results;
    },
  };
}