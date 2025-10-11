import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, MessageSquare, Bot, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();
  const ticketVolumeData = [
    { day: "Mon", tickets: 45 },
    { day: "Tue", tickets: 52 },
    { day: "Wed", tickets: 38 },
    { day: "Thu", tickets: 61 },
    { day: "Fri", tickets: 55 },
    { day: "Sat", tickets: 23 },
    { day: "Sun", tickets: 18 }
  ];

  const categoryData = [
    { name: "Technical", value: 35, color: "hsl(var(--primary))" },
    { name: "Billing", value: 25, color: "hsl(var(--secondary))" },
    { name: "Account", value: 20, color: "hsl(var(--accent))" },
    { name: "General", value: 20, color: "hsl(var(--muted))" }
  ];

  const resolutionData = [
    { day: "Mon", ai: 32, human: 13 },
    { day: "Tue", ai: 38, human: 14 },
    { day: "Wed", ai: 28, human: 10 },
    { day: "Thu", ai: 45, human: 16 },
    { day: "Fri", ai: 40, human: 15 },
    { day: "Sat", ai: 18, human: 5 },
    { day: "Sun", ai: 14, human: 4 }
  ];

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
            <div className="text-2xl font-bold">292</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Resolution Rate</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Human Handoff Rate</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27%</div>
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
