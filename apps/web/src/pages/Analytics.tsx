import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, MessageSquare, Bot, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const Analytics = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const [loading, setLoading] = useState(true);
  const [volumeByDay, setVolumeByDay] = useState<{ date: string; count: number }[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<{ name: string; count: number }[]>([]);
  const [resolutionByDay, setResolutionByDay] = useState<{ date: string; ai: number; human: number }[]>([]);
  const [resolutionTotals, setResolutionTotals] = useState<{ total: number; ai: number; human: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/tickets/admin/analytics`);
        setVolumeByDay(data.volume_by_day || []);
        setCategoryDistribution(data.category_distribution || []);
        setResolutionByDay(data.resolution_by_day || []);
        setResolutionTotals(data.resolution_totals || null);
      } catch {}
      finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const ticketVolumeData = useMemo(() => {
    return volumeByDay.map(v => ({ day: v.date.slice(5), tickets: v.count }));
  }, [volumeByDay]);

  const categoryData = useMemo(() => {
    const palette = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "#7c3aed", "#22c55e", "#eab308"];
    return categoryDistribution.map((c, i) => ({ name: c.name, value: c.count, color: palette[i % palette.length] }));
  }, [categoryDistribution]);

  const resolutionData = useMemo(() => {
    return resolutionByDay.map(r => ({ day: r.date.slice(5), ai: r.ai, human: r.human }));
  }, [resolutionByDay]);

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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Ticket metrics and resolution insights</p>
        </div>
        <TrendingUp className="h-8 w-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets (7d)</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketVolumeData.reduce((s, d) => s + d.tickets, 0)}</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Resolution Rate</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionTotals && resolutionTotals.total > 0 ? Math.round((resolutionTotals.ai / resolutionTotals.total) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Human Handoff Rate</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionTotals && resolutionTotals.total > 0 ? Math.round((resolutionTotals.human / resolutionTotals.total) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">-5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Ticket Volume Trend</CardTitle>
            <CardDescription>Daily ticket counts for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              tickets: { label: "Tickets", color: "hsl(var(--primary))" }
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="tickets" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Ticket Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              technical: { label: "Technical", color: "hsl(var(--primary))" },
              billing: { label: "Billing", color: "hsl(var(--secondary))" },
              account: { label: "Account", color: "hsl(var(--accent))" },
              general: { label: "General", color: "hsl(var(--muted))" }
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>AI vs Human Resolution</CardTitle>
          <CardDescription>Comparison of ticket resolution methods</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            ai: { label: "AI Resolved", color: "hsl(var(--primary))" },
            human: { label: "Human Resolved", color: "hsl(var(--secondary))" }
          }} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ai" fill="hsl(var(--primary))" />
                <Bar dataKey="human" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
