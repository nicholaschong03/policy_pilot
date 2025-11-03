import axios from "axios";
import { retrieve } from "./retrieval.service";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-latest";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function buildPrompt(query: string, contexts: { text: string }[]) {
  const maxChars = 12000; // keep prompt within safe size
  const joined = contexts
    .map((c, i) => `Source ${i + 1} (verbatim excerpt):\n${c.text}`)
    .join("\n\n---\n\n");
  const contextBlock = joined.length > maxChars ? joined.slice(0, maxChars) : joined;
  return `You are a helpful assistant answering questions about company policies.
Use ONLY the provided sources. If the answer is not in the sources, say "I don't know".

Question:
${query}

Sources:
${contextBlock}

Instructions:
- Cite the most relevant sources using their source numbers.
- If multiple sources conflict, state the safest compliant interpretation.
- Keep the answer concise and specific.`;
}

export async function answerQuery(queryText: string, topK = 8): Promise<{
    answer: string;
    citations: { doc: string; section: string; snippet: string }[];
    confidence: number;
    unanswerable: boolean;
  }> {
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not set");
    let hits;
    try {
      hits = await retrieve(queryText, topK);
    } catch (e: any) {
      throw new Error(`Embedding/search failed: ${e?.message || e}`);
    }
    // Log top scores for debugging relevance
    try { console.log("retrieval scores:", hits.map(h => h.score.toFixed(3))); } catch {}
    if (!hits || hits.length === 0) {
      return { answer: "I don't know.", citations: [], confidence: 0, unanswerable: true };
    }
    const prompt = buildPrompt(queryText, hits);

    async function generateWithGemini(text: string): Promise<string> {
      const key = GOOGLE_API_KEY as string;
      const modelEnv = GEMINI_MODEL;
      const attempts: { ver: "v1" | "v1beta"; model: string }[] = [
        { ver: "v1", model: modelEnv },
        { ver: "v1beta", model: modelEnv.replace("-latest", "") },
      ];
      for (const { ver, model } of attempts) {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${key}`;
        try {
          const { data } = await axios.post(
            url,
            { contents: [{ parts: [{ text }] }] },
            { timeout: 60_000 }
          );
          return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        } catch (err: any) {
          const apiMsg = err?.response?.data?.error?.message || err?.message || String(err);
          // If model not found for this API version, try next attempt
          if (String(apiMsg).includes("not found for API version")) {
            continue;
          }
          throw new Error(`Gemini (${ver}/${model}) failed: ${apiMsg}`);
        }
      }
      throw new Error(
        `Gemini generate failed: model/version not supported by your key. ` +
          `Set GEMINI_MODEL to a supported model (e.g., gemini-pro) or use v1beta-compatible names.`
      );
    }

    const answer: string = await generateWithGemini(prompt);

    const citations = hits.map(h => ({
      doc: h.doc_id,
      section: String(h.chunk_index),
      snippet: (h.text || "").slice(0, 160)
    }));
    const confidence = hits[0]?.score ?? 0;
    const unanswerable = !answer?.trim();

    return { answer, citations, confidence, unanswerable };
  }