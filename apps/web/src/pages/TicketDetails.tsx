import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SLAIndicator from "@/components/SLAIndicator";

export default function TicketDetails() {
  const { id } = useParams();
  // Mock data; replace with API fetch
  const ticket = {
    id,
    subject: "Login not working",
    body: "User reports cannot log in after password reset",
    category: "Account",
    priority: "High",
    status: "Open",
    firstResponseDueAt: new Date(Date.now() + 30*60*1000).toISOString(),
    resolutionDueAt: new Date(Date.now() + 4*60*60*1000).toISOString(),
    thread: [
      { from: "customer", text: "I can't log in", at: new Date().toISOString() },
      { from: "agent", text: "Acknowledged, checking.", at: new Date().toISOString() },
    ],
  } as any;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>#{ticket.id} – {ticket.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">{ticket.category} • Priority: {ticket.priority}</div>
          <SLAIndicator firstResponseDueAt={ticket.firstResponseDueAt} resolutionDueAt={ticket.resolutionDueAt} />
          <div className="glass-card p-4 text-sm">{ticket.body}</div>
          <div className="space-y-2">
            {ticket.thread.map((m: any, i: number) => (
              <div key={i} className="glass-card p-3">
                <div className="text-xs text-muted-foreground">{m.from} • {new Date(m.at).toLocaleString()}</div>
                <div className="text-sm">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Mark In Progress</Button>
            <Button className="btn-primary">Resolve</Button>
            <Button variant="outline">Escalate</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


