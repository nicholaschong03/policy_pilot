import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, MessageCircle, Upload, Shield, Users, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

type Citation = { doc: string; section: string; snippet: string };

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    email: ''
  });

  const [answer, setAnswer] = useState<string>('');
  const [answerCitations, setAnswerCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [ticketLoading, setTicketLoading] = useState<boolean>(false);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.email.trim() || !ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast({ title: 'Please fill in all fields' });
      return;
    }
    setTicketLoading(true);
    try {
      const payload = {
        email: ticketForm.email,
        subject: ticketForm.subject,
        body: ticketForm.description,
      };
      const { data } = await axios.post(`${API}/tickets`, payload);
      toast({ title: 'Ticket submitted', description: `ID: ${data?.ticket?.id ?? ''}` });
      setTicketForm({ subject: '', description: '', email: '' });
    } catch (err: any) {
      toast({ title: 'Ticket submission failed', description: err?.response?.data?.error || err?.message || '' });
    } finally {
      setTicketLoading(false);
    }
  };

  const fetchAnswer = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');
    setAnswerCitations([]);
    try {
      const { data } = await axios.post(`${API}/chat`, { query: q });
      setAnswer(data?.answer ?? '');
      setAnswerCitations(Array.isArray(data?.citations) ? data.citations : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnswer(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PolicyPilot
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/staff-login">
              <Button variant="outline" className="glass-card border-glass-border/50">
                <Users className="h-4 w-4 mr-2" />
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Get <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Instant Support
            </span> for Your Questions
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Submit tickets, search our knowledge base, and get AI-powered responses instantly
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-8">
          
          {/* Submit Ticket Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Submit a New Ticket</span>
              </CardTitle>
              <CardDescription>
                Describe your issue and we'll get back to you quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <Input
                  placeholder="Subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="input-glass"
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input-glass"
                />
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-glass min-h-[120px]"
                />
                <div className="flex items-center space-x-4">
                  <Button type="submit" className="btn-primary">
                    Submit Ticket
                  </Button>
                  <Button type="button" variant="outline" className="glass-card border-glass-border/50">
                    <Upload className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Knowledge Base Search */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-secondary" />
                <span>Search Knowledge Base</span>
              </CardTitle>
              <CardDescription>
                Get instant AI-powered answers to your questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <Input
                  placeholder="Ask any question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass"
                />
                <Button type="submit" disabled={loading} className="btn-primary w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Getting answer...' : 'Get AI Answer'}
                </Button>
              </form>
              {error && (
                <p className="text-sm text-red-400 mt-3">{error}</p>
              )}

              {answer && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Answer</h4>
                  <div className="glass-card p-4 text-sm leading-relaxed">
                    {answer}
                  </div>
                  {answerCitations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {answerCitations.map((c, idx) => {
                        const search = encodeURIComponent((c.snippet || '').slice(0, 50));
                        const href = `${API}/kb/files/${encodeURIComponent(c.doc)}#search=${search}`;
                        return (
                          <a
                            key={idx}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            title={c.snippet}
                            className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{`[${idx + 1}] ${c.doc}#${c.section}`}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
              {/* Sample FAQ */}
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Popular Questions:</h4>
                <div className="space-y-2">
                  <Badge
                    onClick={() => {
                      const q = 'How long can I get refund?';
                      setSearchQuery(q);
                      fetchAnswer(q);
                    }}
                    variant="outline"
                    className="glass-card border-glass-border/30 cursor-pointer hover:bg-glass/60"
                  >
                    How long can I get refund?
                  </Badge>
                  <Badge
                    onClick={() => {
                      const q = 'How do I reset my password?';
                      setSearchQuery(q);
                      fetchAnswer(q);
                    }}
                    variant="outline"
                    className="glass-card border-glass-border/30 cursor-pointer hover:bg-glass/60"
                  >
                    How do I reset my password?
                  </Badge>
                  <Badge
                    onClick={() => {
                      const q = 'What are your support hours?';
                      setSearchQuery(q);
                      fetchAnswer(q);
                    }}
                    variant="outline"
                    className="glass-card border-glass-border/30 cursor-pointer hover:bg-glass/60"
                  >
                    What are your support hours?
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Track Ticket Section */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-2xl">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-center">Track Your Ticket</CardTitle>
              <CardDescription className="text-center">
                Enter your email and ticket ID to check the status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input placeholder="Email address" className="input-glass" />
                <Input placeholder="Ticket ID" className="input-glass" />
                <Button className="btn-primary whitespace-nowrap">
                  Track Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-nav mt-20 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground">
            © 2024 PolicyPilot. Powered by AI for better customer support.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;