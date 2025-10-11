import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string; email: string } | null>(null);

  const [agents, setAgents] = useState<Array<{ id: string; name: string; email: string; role: string; createdAt?: string }>>([]);

  const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  const loadAgents = useCallback(async () => {
    try {
      const { data } = await axios.get<{ agents: { id: string; email: string; role: string; full_name?: string; created_at?: string }[] }>(
        `${API}/agent`
      );
      const mapped = data.agents.map((a) => ({
        id: a.id,
        name: a.full_name || "",
        email: a.email,
        role: a.role,
        createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString() : undefined,
      }));
      setAgents(mapped);
    } catch (err: any) {
      toast({
        title: "Failed to load agents",
        description: err?.response?.data?.error || "",
        variant: "destructive",
      });
    }
  }, [API]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleAddAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      const { error } = await signUp(email, password, fullName, 'agent');

      if (error) {
        toast({
          title: "Failed to add agent",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Agent added successfully",
          description: `${fullName} has been registered as an agent.`,
        });
        await loadAgents();
        setIsAddUserOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAgent = (agent: { id: string; name: string; email: string }) => {
    setAgentToDelete(agent);
    setIsDeleteOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      await axios.delete(`${API}/agent/${agentToDelete.id}`);
      toast({
        title: "Agent removed",
        description: `${agentToDelete.email} has been removed.`,
      });
      await loadAgents();
    } catch (err: any) {
      toast({
        title: "Failed to delete agent",
        description: err?.response?.data?.error || "",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setAgentToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage support agents and their access</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Create a new support agent account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  required
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  required
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="Enter temporary password"
                  required
                  className="glass-input"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="glass-button">
                  {isLoading ? "Adding..." : "Add Agent"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Support Agents
          </CardTitle>
          <CardDescription>
            Manage support agent accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{agent.role}</Badge>
                  </TableCell>
                  <TableCell>{agent.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDeleteAgent(agent)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              {agentToDelete ? `Are you sure you want to delete ${agentToDelete.email}? This action cannot be undone.` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="glass-button bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteAgent}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;