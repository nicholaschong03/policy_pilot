import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Doc = { id: string; title: string; type: string; uploadDate: string; size: number };

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function AgentKB() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<{ files: Doc[] }>(`${API}/kb/files`);
        setDocs(data.files);
      } catch {}
    })();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
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
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Search and read policy documents</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between glass-card p-3">
                <div>
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.type} • {d.uploadDate}</div>
                </div>
                <a className="text-primary text-sm" href={`${API}/kb/files/${encodeURIComponent(d.id)}`} target="_blank" rel="noreferrer">Open</a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


