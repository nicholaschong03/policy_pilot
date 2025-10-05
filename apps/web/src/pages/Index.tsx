import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, MessageCircle, Upload, Shield, Users } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    email: ''
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement ticket submission
    console.log('Ticket submitted:', ticketForm);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement knowledge base search with RAG
    console.log('Searching:', searchQuery);
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
                <Button type="submit" className="btn-primary w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Get AI Answer
                </Button>
              </form>
              
              {/* Sample FAQ */}
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Popular Questions:</h4>
                <div className="space-y-2">
                  <Badge variant="outline" className="glass-card border-glass-border/30 cursor-pointer hover:bg-glass/60">
                    How do I reset my password?
                  </Badge>
                  <Badge variant="outline" className="glass-card border-glass-border/30 cursor-pointer hover:bg-glass/60">
                    What are your support hours?
                  </Badge>
                  <Badge variant="outline" className="glass-card border-glass-border/30 cursor-pointer hover:bg-glass/60">
                    How do I update my account?
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