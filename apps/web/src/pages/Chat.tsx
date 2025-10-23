import { useState } from "react";
import { Send, Copy, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  citations?: { doc: string; section: string; snippet: string }[];
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm PolicyPilot AI. I can help you with questions about company policies, procedures, and support documentation. What would you like to know?",
      citations: [
        { doc: "Welcome.pdf", section: "0", snippet: "Welcome to PolicyPilot" },
        { doc: "Handbook.pdf", section: "1", snippet: "Employee guidelines" },
      ],
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/chat`, { query: userMessage.content });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data?.answer ?? "",
        citations: Array.isArray(data?.citations) ? data.citations : [],
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e: any) {
      toast({ title: "Chat failed", description: e?.message || "" });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I couldn't fetch an answer right now.",
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Message copied to clipboard" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
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
          PolicyPilot – Chat
        </h1>
        <p className="text-muted-foreground mt-2">
          Ask questions about policies, procedures, and get AI-powered answers with citations.
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-card p-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-primary/20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[85%] space-y-2">
                <div
                  className={message.type === "user" ? "chat-user" : "chat-ai"}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.type === "ai" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMessage(message.content)}
                      className="mt-2 h-6 px-2 text-xs hover:bg-white/10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>

                {/* Citations */}
                {message.citations && (
                  <div className="flex flex-wrap gap-2 ml-2">
                    {message.citations.map((c, index) => {
                      const search = encodeURIComponent((c.snippet || "").slice(0, 50));
                      const href = `${API}/kb/files/${encodeURIComponent(c.doc)}#search=${search}`;
                      return (
                        <a
                          key={index}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          title={c.snippet}
                          className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors glow-primary"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{`[${index + 1}] ${c.doc}#${c.section}`}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex space-x-3">
          <Input
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-glass flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
            className="btn-primary px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;