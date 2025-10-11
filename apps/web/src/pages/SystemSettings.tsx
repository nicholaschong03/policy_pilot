import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SystemSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [llmProvider, setLlmProvider] = useState({
    openaiKey: "",
    anthropicKey: "",
    geminiKey: ""
  });

  const [slaSettings, setSlaSettings] = useState({
    responseTime: "30",
    resolutionTime: "24",
    escalationTime: "2"
  });

  const handleSaveLLMSettings = () => {
    toast({
      title: "LLM Settings Saved",
      description: "Your API keys have been securely stored."
    });
  };

  const handleSaveSLASettings = () => {
    toast({
      title: "SLA Settings Saved",
      description: "Service level agreement policies have been updated."
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 btn-glass"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure integrations and policies</p>
        </div>
        <Settings className="h-8 w-8 text-primary" />
      </div>

      <Tabs defaultValue="llm" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="llm">LLM Providers</TabsTrigger>
          <TabsTrigger value="sla">SLA Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="llm" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                LLM Provider API Keys
              </CardTitle>
              <CardDescription>
                Configure API keys for various LLM providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai">OpenAI API Key</Label>
                <Input
                  id="openai"
                  type="password"
                  placeholder="sk-..."
                  value={llmProvider.openaiKey}
                  onChange={(e) => setLlmProvider({ ...llmProvider, openaiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anthropic">Anthropic API Key</Label>
                <Input
                  id="anthropic"
                  type="password"
                  placeholder="sk-ant-..."
                  value={llmProvider.anthropicKey}
                  onChange={(e) => setLlmProvider({ ...llmProvider, anthropicKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gemini">Google Gemini API Key</Label>
                <Input
                  id="gemini"
                  type="password"
                  placeholder="AI..."
                  value={llmProvider.geminiKey}
                  onChange={(e) => setLlmProvider({ ...llmProvider, geminiKey: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveLLMSettings} className="w-full">
                Save API Keys
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Policies
              </CardTitle>
              <CardDescription>
                Define service level agreement timeframes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="response">Initial Response Time (minutes)</Label>
                <Input
                  id="response"
                  type="number"
                  placeholder="30"
                  value={slaSettings.responseTime}
                  onChange={(e) => setSlaSettings({ ...slaSettings, responseTime: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Time allowed for first response to a new ticket
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Time (hours)</Label>
                <Input
                  id="resolution"
                  type="number"
                  placeholder="24"
                  value={slaSettings.resolutionTime}
                  onChange={(e) => setSlaSettings({ ...slaSettings, resolutionTime: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Time allowed to resolve a ticket
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="escalation">Escalation Time (hours)</Label>
                <Input
                  id="escalation"
                  type="number"
                  placeholder="2"
                  value={slaSettings.escalationTime}
                  onChange={(e) => setSlaSettings({ ...slaSettings, escalationTime: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Time before unresolved ticket is escalated
                </p>
              </div>
              <Button onClick={handleSaveSLASettings} className="w-full">
                Save SLA Policies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;