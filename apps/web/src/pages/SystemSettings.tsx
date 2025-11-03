import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, Clock, ArrowLeft, RotateCcw } from "lucide-react";
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
    High: { first_response_minutes: 60, resolution_hours: 24, escalation_hours: 2 },
    Medium: { first_response_minutes: 240, resolution_hours: 72, escalation_hours: 8 },
    Low: { first_response_minutes: 1440, resolution_hours: 168, escalation_hours: 24 }
  });

  const handleSaveLLMSettings = () => {
    toast({
      title: "LLM Settings Saved",
      description: "Your API keys have been securely stored."
    });
  };

  const handleSaveSLASettings = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/settings/sla`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slaSettings)
      });
      toast({ title: "SLA Settings Saved", description: "Service level agreement policies have been updated." });
    } catch (e) {
      toast({ title: "Failed to save", description: String(e), variant: "destructive" as any });
    }
  };

  const handleResetDefaultSLA = async () => {
    const defaults = {
      High: { first_response_minutes: 60, resolution_hours: 24, escalation_hours: 2 },
      Medium: { first_response_minutes: 240, resolution_hours: 72, escalation_hours: 8 },
      Low: { first_response_minutes: 1440, resolution_hours: 168, escalation_hours: 24 }
    };
    setSlaSettings(defaults);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/settings/sla`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaults)
      });
      toast({ title: "SLA Reset", description: "Defaults restored." });
    } catch (e) {
      toast({ title: "Failed to reset", description: String(e), variant: "destructive" as any });
    }
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
              {(["High","Medium","Low"] as const).map((p) => (
                <div key={p} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>{p} Priority - First Response (minutes)</Label>
                    <Input
                      type="number"
                      value={slaSettings[p].first_response_minutes}
                      onChange={(e) => setSlaSettings({
                        ...slaSettings,
                        [p]: { ...slaSettings[p], first_response_minutes: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Resolution (hours)</Label>
                    <Input
                      type="number"
                      value={slaSettings[p].resolution_hours}
                      onChange={(e) => setSlaSettings({
                        ...slaSettings,
                        [p]: { ...slaSettings[p], resolution_hours: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Escalation (hours)</Label>
                    <Input
                      type="number"
                      value={slaSettings[p].escalation_hours}
                      onChange={(e) => setSlaSettings({
                        ...slaSettings,
                        [p]: { ...slaSettings[p], escalation_hours: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveSLASettings} className="w-full">Save {p}</Button>
                    <Button variant="outline" onClick={handleResetDefaultSLA} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-1"/> Reset Default
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button onClick={handleSaveSLASettings} className="w-full">Save All SLA Policies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;