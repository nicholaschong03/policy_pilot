import axios from "axios";
import dotenv from "dotenv";
import { retrieve, type RetrievedChunk } from "./retrieval.service";

dotenv.config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-latest";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function buildReplyPrompt(subject: string, body: string, contexts: { text: string }[]) {
    const ticketText = `Subject: ${subject}\nBody: ${body}`;
    const maxChars = 12000;
    const joined = contexts
        .map((c, i) => `Source ${i + 1} (verbatim excerpt):\n${c.text}`)
        .join("\n\n---\n\n");
    const contextBlock = joined.length > maxChars ? joined.slice(0, maxChars) : joined;
    return `You are a senior support agent. Draft a professional, ready-to-send reply to the customer.\n\nConstraints:\n- Use ONLY the provided policy sources. If not covered, say you will check internally or ask for clarification.\n- Be concise (6-10 sentences).\n- Use compliant, empathetic tone.\n- If steps are needed, include a short numbered list.\n- Do not include raw citations; integrate policy guidance naturally.\n\nCustomer Ticket:\n${ticketText}\n\nPolicy Sources:\n${contextBlock}`;
}

async function generateWithGemini(text: string): Promise<string> {
    if (!GOOGLE_API_KEY) {
        return "Thanks for reaching out. We are reviewing your request against our policy and will follow up shortly with specific guidance.";
    }
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

export async function generateSuggestedReply(
    input: { subject: string; body: string },
    topK = 5
): Promise<{ reply: string; contexts: RetrievedChunk[] }> {
    const queryText = `${input.subject}\n${input.body}`;
    const hits = await retrieve(queryText, topK);
    const prompt = buildReplyPrompt(input.subject, input.body, hits);
    const reply = await generateWithGemini(prompt);
    return { reply: reply?.trim() || "", contexts: hits };
}

export async function generateSuggestedReplyFromChunks(
    input: { subject: string; body: string },
    chunks: RetrievedChunk[]
): Promise<string> {
    const prompt = buildReplyPrompt(input.subject, input.body, chunks);
    const reply = await generateWithGemini(prompt);
    return reply?.trim() || "";
}


