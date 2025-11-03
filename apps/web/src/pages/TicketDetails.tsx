import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SLAIndicator from "@/components/SLAIndicator";
import { formatDateTime } from "@/lib/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export type TicketLike = {
  id: string;
  subject: string;
  body: string;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  first_response_due?: string | null;
  resolution_due?: string | null;
  thread?: { from: string; text: string; at: string }[];
};

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function TicketDetails({ ticket: ticketProp }: { ticket?: TicketLike }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState<TicketLike | null>(null);
  const [replyDraft, setReplyDraft] = useState<string>("");
  useEffect(() => {
    async function fetchDetails() {
      if (ticketProp) return;
      if (!id) return;
      try {
        if (email) {
          const { data } = await axios.get(`${API}/tickets/${id}`, { params: { email } });
          setLoaded(data?.ticket as any);
          setReplyDraft((data?.ticket?.suggested_reply as string) || "");
        } else {
          const { data } = await axios.get(`${API}/tickets/staff/${id}`);
          setLoaded(data?.ticket as any);
          setReplyDraft((data?.ticket?.first_response_text as string) || (data?.ticket?.suggested_reply as string) || "");
        }
      } catch {}
    }
    fetchDetails();
  }, [ticketProp, id, email]);
  const ticket = (loaded || ticketProp) as any;
  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-sm text-muted-foreground">Loading ticket...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className={`px-2 py-0.5 rounded text-xs ${String(ticket.status).toLowerCase()==='resolved' || String(ticket.status).toLowerCase()==='active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{ticket.status}</span>
            <span className="text-muted-foreground">Created {formatDateTime(ticket.created_at)}</span>
          </div>
          <div className="glass-card p-4 text-sm">{ticket.body}</div>
          <div className="glass-card p-4 text-sm">
            <div className="font-medium mb-1">Staff reply</div>
            {(ticket.first_response_sent_at && ticket.first_response_text && String(ticket.first_response_text).trim().length > 0) ? (
              <div className="space-y-2">
                <div>Reply sent on {formatDateTime(ticket.first_response_sent_at)}.</div>
                {ticket.first_response_text && (
                  <div className="glass-card p-3 whitespace-pre-wrap">{ticket.first_response_text}</div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-muted-foreground">Compose your first response. The suggested reply is provided below; edit as needed.</div>
                <textarea
                  className="w-full rounded-md bg-muted/30 border border-border/50 p-3 min-h-[140px]"
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                />
                {ticket.suggested_reply && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Suggested reply (reference):</div>
                    <div className="glass-card p-3 whitespace-pre-wrap text-sm">{ticket.suggested_reply}</div>
                  </div>
                )}
                {!email && (
                  <Button onClick={async () => {
                    try {
                      await axios.patch(`${API}/tickets/${ticket.id}/first-response`, { text: replyDraft });
                      const { data } = await axios.get(`${API}/tickets/staff/${ticket.id}`);
                      setLoaded(data?.ticket as any);
                    } catch {}
                  }}>Send First Response</Button>
                )}
              </div>
            )}
          </div>
          <div className="text-sm">
            Resolved: {ticket.resolved_at ? <span className="text-green-400">Yes ({formatDateTime(ticket.resolved_at)})</span> : <span className="text-yellow-400">No</span>}
          </div>
          <div className="flex gap-2">
            {email ? (
              <Button variant="outline" onClick={() => navigate(`/tickets?email=${encodeURIComponent(email)}`)} className="mt-2">Back to tickets</Button>
            ) : (
              <Button variant="outline" onClick={() => navigate(`/chat/dashboard`)} className="mt-2">Back to dashboard</Button>
            )}
            {!email && String(ticket.status).toLowerCase() !== 'resolved' && (
              <Button className="mt-2" onClick={async () => {
                try {
                  await axios.patch(`${API}/tickets/${ticket.id}/resolve`);
                  const { data } = await axios.get(`${API}/tickets/staff/${ticket.id}`);
                  setLoaded(data?.ticket as any);
                } catch {}
              }}>Mark Resolved</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


