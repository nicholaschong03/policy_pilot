import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function CustomerTickets() {
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  async function lookup() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/tickets/by-email`, { params: { email } });
      setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
    } finally {
      setLoading(false);
    }
  }

  function openDetails(id: string) {
    navigate(`/tickets/${id}?email=${encodeURIComponent(email)}`);
  }

  useEffect(() => {
    if (initialEmail) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate("/")} className="glass-card border-glass-border/50">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <CardTitle>Find My Tickets</CardTitle>
            <div />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={lookup} disabled={loading} className="btn-primary">{loading ? "Loading..." : "Refresh"}</Button>
            <Input placeholder="Search tickets by title keyword" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {tickets.length > 0 && (
            <div className="overflow-hidden rounded border border-glass-border/40">
              <div className="grid grid-cols-6 bg-glass/60 px-3 py-2 text-xs text-muted-foreground">
                <div className="col-span-2">Title</div>
                <div>Status</div>
                <div>Created</div>
                <div>Resolved</div>
                <div>Action</div>
              </div>
              <div className="divide-y divide-glass-border/40">
                {tickets
                  .filter((t) => !query.trim() || String(t.subject || "").toLowerCase().includes(query.toLowerCase()))
                  .map((t) => (
                  <div key={t.id} className="grid grid-cols-6 items-center px-3 py-2 text-sm">
                    <div className="col-span-2 truncate" title={t.subject}>{t.subject}</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-xs ${String(t.status).toLowerCase()==='active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{t.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(t.created_at)}</div>
                    <div>
                      {t.resolved_at ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">Yes</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">No</span>
                      )}
                    </div>
                    <div>
                      <Button size="sm" variant="secondary" onClick={() => openDetails(t.id)}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


