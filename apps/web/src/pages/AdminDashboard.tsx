import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { Users, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [activeTicketsCount, setActiveTicketsCount] = useState<number | null>(null);
  const [avgFirstResponseMinutes, setAvgFirstResponseMinutes] = useState<number | null>(null);
  const [resolutionRatePercent, setResolutionRatePercent] = useState<number | null>(null);
  const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<{ count: number }>(`${API}/agent/count`);
        setAgentCount(data.count);
        const el = document.getElementById("total-agents-count");
        if (el) el.textContent = String(data.count);
      } catch {}
    })();
    (async () => {
      try {
        const { data } = await axios.get<{ count: number }>(`${API}/tickets/admin/count/active`);
        setActiveTicketsCount(data.count);
      } catch {}
    })();
    (async () => {
      try {
        const { data } = await axios.get<{ avg_first_response_minutes: number | null; resolution_rate_percent: number }>(`${API}/tickets/admin/stats`);
        setAvgFirstResponseMinutes(data.avg_first_response_minutes);
        setResolutionRatePercent(data.resolution_rate_percent);
      } catch {}
    })();
  }, [API]);
  const { signOut } = useAuth();
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system performance and metrics</p>
        </div>
        <div>
          <Button
            variant="outline"
            className="glass-button"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Fetched from API */}
              <span id="total-agents-count">--</span>
            </div>
            <p className="text-xs text-muted-foreground">Total registered agents</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTicketsCount ?? '--'}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFirstResponseMinutes !== null ? `${avgFirstResponseMinutes.toFixed(1)}m` : '--'}</div>
            <p className="text-xs text-muted-foreground">-8% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRatePercent !== null ? `${resolutionRatePercent.toFixed(0)}%` : '--'}</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Admin Features</CardTitle>
          <CardDescription>Access all administrative functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/admin/users" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">User Management</p>
                  <p className="text-xs text-muted-foreground">Create agents/admins, reset passwords</p>
                </div>
              </Card>
            </Link>

            <Link to="/chat/knowledge-base" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">Knowledge Base</p>
                  <p className="text-xs text-muted-foreground">Upload & manage documents</p>
                </div>
              </Card>
            </Link>

            <Link to="/admin/settings" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">System Settings</p>
                  <p className="text-xs text-muted-foreground">LLM keys & SLA policies</p>
                </div>
              </Card>
            </Link>

            <Link to="/admin/analytics" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">Ticket volume & resolution metrics</p>
                </div>
              </Card>
            </Link>

            <Link to="/chat/dashboard" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">Handle Tickets</p>
                  <p className="text-xs text-muted-foreground">Go to Team/My queues</p>
                </div>
              </Card>
            </Link>

            <Link to="/chat" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">AI Chat</p>
                  <p className="text-xs text-muted-foreground">AI Policy Assistant</p>
                </div>
              </Card>
            </Link>

            <Link to="/chat/triage" className="block">
              <Card className="p-6 hover:bg-muted/50 cursor-pointer transition-colors h-full">
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">Triage</p>
                  <p className="text-xs text-muted-foreground">Prioritize & assign tickets</p>
                </div>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;