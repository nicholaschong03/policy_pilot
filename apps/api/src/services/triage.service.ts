import axios from "axios";

type Category = "General" | "Billing" | "Account_Access" | "Technical" | "Security" | "Product" | "Feedback";
type Priority = "High" | "Medium" | "Low";

export type ClassificationResult = {
  category: Category;
  priority: Priority;
  confidence: number; // 0..1
  riskFlags: string[];
};

const SECURITY_STRONG = [
  "security", "breach", "hacked", "unauthorized", "compromise", "phishing", "leak", "ransomware"
];
const BILLING_STRONG = ["chargeback"];
const BILLING_WEAK = ["refund", "billing", "invoice", "payment failed", "duplicate charge", "payment"];
const ACCESS_WEAK = ["login", "password", "reset", "2fa", "mfa", "locked", "access denied"];
const TECH_WEAK = ["bug", "error", "crash", "down", "not loading", "performance", "timeout"];
const PRODUCT_WEAK = ["feature", "roadmap", "integration", "api", "pricing plan"];
const FEEDBACK_WEAK = ["suggestion", "feedback", "survey", "rating", "review"];

function containsAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(p));
}

function ruleBasedClassify(subject: string, body: string): ClassificationResult | null {
  const text = `${subject} ${body}`.toLowerCase();
  // Security (strong)
  if (containsAny(text, SECURITY_STRONG)) {
    return { category: "Security", priority: "High", confidence: 0.92, riskFlags: ["security"] };
  }
  // Billing
  if (containsAny(text, BILLING_STRONG)) {
    return { category: "Billing", priority: "High", confidence: 0.9, riskFlags: ["billing"] };
  }
  if (containsAny(text, BILLING_WEAK)) {
    return { category: "Billing", priority: "Medium", confidence: 0.75, riskFlags: ["billing"] };
  }
  // Account Access
  if (containsAny(text, ACCESS_WEAK)) {
    return { category: "Account_Access", priority: "Medium", confidence: 0.75, riskFlags: ["access"] };
  }
  // Technical
  if (containsAny(text, TECH_WEAK)) {
    return { category: "Technical", priority: "Medium", confidence: 0.7, riskFlags: ["technical"] };
  }
  // Product
  if (containsAny(text, PRODUCT_WEAK)) {
    return { category: "Product", priority: "Low", confidence: 0.65, riskFlags: ["product"] };
  }
  // Feedback
  if (containsAny(text, FEEDBACK_WEAK)) {
    return { category: "Feedback", priority: "Low", confidence: 0.65, riskFlags: ["feedback"] };
  }
  return null;
}

async function llmClassify(subject: string, body: string): Promise<ClassificationResult | null> {
  const key = process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-latest";
  if (!key) return null;
  const labels = ["General","Billing","Account_Access","Technical","Security","Product","Feedback"];
  const prompt = `Classify the following ticket into one of the labels ${labels.join(", ")}.\nReturn strict JSON: {"category":"<label>","priority":"High|Medium|Low","confidence":0.0-1.0}.\nSubject: ${subject}\nBody: ${body}`;
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 20_000 }
    );
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const json = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (labels.includes(json.category) && ["High","Medium","Low"].includes(json.priority)) {
      return {
        category: json.category as Category,
        priority: json.priority as Priority,
        confidence: Math.max(0, Math.min(1, Number(json.confidence) || 0.6)),
        riskFlags: json.category === "Security" ? ["security"] : [],
      };
    }
  } catch (_e) {
    // ignore; fallback to rules only
  }
  return null;
}

export async function classifyTicket(input: { subject: string; body: string }): Promise<ClassificationResult> {
  const rule = ruleBasedClassify(input.subject, input.body);
  const llm = await llmClassify(input.subject, input.body);

  if (rule && llm) {
    const agree = rule.category === llm.category;
    let confidence = Math.max(rule.confidence, llm.confidence);
    if (agree) confidence = Math.min(0.98, confidence + 0.1);
    return {
      category: agree ? rule.category : llm.category,
      priority: rule.priority === "High" || llm.priority === "High" ? "High" : (rule.priority || llm.priority),
      confidence,
      riskFlags: Array.from(new Set([...(rule.riskFlags || []), ...(llm.riskFlags || [])])),
    } as ClassificationResult;
  }

  if (rule) return rule;
  if (llm) return llm;
  return { category: "General", priority: "Low", confidence: 0.5, riskFlags: [] };
}


