import { useEffect, useMemo, useState } from "react";
import TicketSearchPanel from "@/components/TicketSearchPanel";
import SLAIndicator from "@/components/SLAIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Ticket = {
  id: string;
  subject: string;
  status: "Active" | "Escalated" | "Resolved";
  priority: "High" | "Medium" | "Low";
  category: string;
  assignedToMe: boolean;
  firstResponseDueAt?: string;
  resolutionDueAt?: string;
};

export default function AgentDashboard() {
  const [scope, setScope] = useState<"my" | "team">("my");
  const [filters, setFilters] = useState<{ category?: string; sla?: string }>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const url = scope === "my" ? `${API}/agent/tickets/my` : `${API}/agent/tickets/team`;
        const { data } = await axios.get(url);
        const rows: any[] = data?.tickets || [];
        const me = profile?.id;
        const mapped: Ticket[] = rows.map((r) => {
          const backendStatus: string = r.status;
          let uiStatus: Ticket["status"];
          if (backendStatus === "resolved") uiStatus = "Resolved";
          else if (backendStatus === "escalated") uiStatus = "Escalated";
          else uiStatus = "Active";
          return {
            id: r.id,
            subject: r.subject,
            status: uiStatus,
            priority: (r.priority || "Low") as Ticket["priority"],
            category: r.predicted_category || "General",
            assignedToMe: !!me && r.assigned_to === me,
            firstResponseDueAt: r.first_response_due || undefined,
            resolutionDueAt: r.resolution_due || undefined,
          };
        });
        setTickets(mapped);
      } catch (_e) {
        setTickets([]);
      }
    })();
  }, [API, scope, profile?.id]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (scope === "my" && !t.assignedToMe) return false;
      if (filters.category && t.category !== filters.category) return false;
      return true;
    });
  }, [scope, filters, tickets]);

  const metrics = useMemo(() => {
    const pending = filtered.filter(t => t.status === "Active").length;
    const resolved = filtered.filter(t => t.status === "Resolved").length;
    const breached = filtered.filter(t => (t.firstResponseDueAt && new Date(t.firstResponseDueAt).getTime() < Date.now())).length;
    return { pending, resolved, breached };
  }, [filtered]);

  const byStatus = useMemo(() => {
    const groups: Record<string, Ticket[]> = { Active: [], Escalated: [], Resolved: [] } as any;
    for (const t of filtered) groups[t.status].push(t);
    return groups;
  }, [filtered]);

  const priorityClass = (p: Ticket["priority"]) => p === "High" ? "text-red-400" : p === "Medium" ? "text-orange-400" : "text-green-400";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Tickets assigned to you and your team</p>
        </div>
      </div>

      <TicketSearchPanel onSearch={() => {}} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card"><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.pending}</div></CardContent></Card>
        <Card className="glass-card"><CardHeader><CardTitle>Breached</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.breached}</div></CardContent></Card>
        <Card className="glass-card"><CardHeader><CardTitle>Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.resolved}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="my" onValueChange={(v: any) => setScope(v)}>
        <TabsList>
          <TabsTrigger value="my">My Queue</TabsTrigger>
          <TabsTrigger value="team">Team Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="my" />
        <TabsContent value="team" />
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(["Active","Escalated","Resolved"] as const).map((status) => (
          <div key={status} className="glass-card p-4">
            <h3 className="font-semibold mb-3">{status}</h3>
            <div className="space-y-3">
              {byStatus[status].map((t) => (
                <div key={t.id} className="glass-card p-3 cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/chat/tickets/${t.id}`)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.subject}</div>
                    <Badge className={priorityClass(t.priority)} variant="outline">{t.priority}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">#{t.id} • {t.category}</div>
                  <div className="mt-2">
                    <SLAIndicator firstResponseDueAt={t.firstResponseDueAt} resolutionDueAt={t.resolutionDueAt} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


