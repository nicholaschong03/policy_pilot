export type DecisionInput = {
    priority: "High" | "Medium" | "Low" | null | undefined;
    confidence: number | null | undefined;
    riskFlags?: string[] | null | undefined;
};

export type Decision = "AUTO_ACK_ONLY" | "AUTO_RESOLVE" | "ESCALATE";

export function decide(input: DecisionInput): Decision {
    const priority = input.priority || "Low";
    const confidence = Number(input.confidence || 0);
    const riskFlags = (input.riskFlags || []).map((r) => String(r).toLowerCase());

    if (priority === "High" || riskFlags.includes("security") || riskFlags.includes("privacy")) {
        return "ESCALATE";
    }
    if (confidence >= 0.8 && priority === "Low") {
        return "AUTO_RESOLVE";
    }
    return "AUTO_ACK_ONLY";
}


