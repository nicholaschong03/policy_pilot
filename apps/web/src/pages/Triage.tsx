import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, Target, Tag, MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface TriageResult {
  category: string;
  priority: "Low" | "Medium" | "High";
  suggestedReply: string;
  slaInfo: {
    firstResponse: string;
    resolution: string;
  };
  recommendedAction: string;
}

const Triage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Please fill in both subject and body", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const mockResult: TriageResult = {
        category: "Account Access",
        priority: Math.random() > 0.5 ? "High" : Math.random() > 0.3 ? "Medium" : "Low",
        suggestedReply: `Thank you for contacting us regarding "${subject}". I understand your concern about ${body.toLowerCase().slice(0, 50)}... Based on our policy guidelines, here's how we can help resolve this issue for you.`,
        slaInfo: {
          firstResponse: "2 hours",
          resolution: "24 hours",
        },
        recommendedAction: "Auto-Acknowledge"
      };
      setResult(mockResult);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "Low": return "priority-low";
      case "Medium": return "priority-medium";
      case "High": return "priority-high";
      default: return "priority-low";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/chat/dashboard')}
            className="flex items-center gap-2 btn-glass"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Ticket Triage
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered ticket classification and response drafting for efficient support workflow.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Submit Ticket for Analysis</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <Input
              placeholder="Enter ticket subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Body
            </label>
            <Textarea
              placeholder="Enter ticket body/description..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="input-glass resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analyzing Ticket...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Analyze Ticket
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="glass-card p-6 space-y-6 glow-primary">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            Triage Results
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Category & Priority */}
            <div className="space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center mb-2">
                  <Tag className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-medium">Predicted Category</span>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {result.category}
                </Badge>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center mb-2">
                  <Target className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-medium">Priority Level</span>
                </div>
                <span className={getPriorityClass(result.priority)}>
                  {result.priority}
                </span>
              </div>
            </div>

            {/* SLA Timeline */}
            <div className="glass-card p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span className="font-medium">SLA Information</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Response:</span>
                  <span className="font-medium text-foreground">{result.slaInfo.firstResponse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span className="font-medium text-foreground">{result.slaInfo.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommended Action:</span>
                  <span className="font-medium text-green-400">{result.recommendedAction}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Reply */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                <span className="font-medium">Suggested Reply</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(result.suggestedReply)}
                className="hover:bg-primary/10 text-primary"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed border border-border/50">
              {result.suggestedReply}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Triage;