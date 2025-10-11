import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import StaffAuth from "./pages/StaffAuth";
import Chat from "./pages/Chat";
import Triage from "./pages/Triage";
import KB from "./pages/KB";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import SystemSettings from "./pages/SystemSettings";
import Analytics from "./pages/Analytics";
import AgentDashboard from "./pages/AgentDashboard";
import TicketDetails from "./pages/TicketDetails";
import AgentKB from "./pages/AgentKB";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/" element={<Index />} />

            {/* Staff authentication */}
            <Route path="/staff-login" element={<StaffAuth />} />

            {/* Protected staff routes */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Chat />} />
              <Route path="dashboard" element={<AgentDashboard />} />
              <Route path="tickets/:id" element={<TicketDetails />} />
              <Route path="triage" element={<Triage />} />
              <Route path="knowledge-base" element={
                <ProtectedRoute adminOnly>
                  <KB />
                </ProtectedRoute>
              } />
              <Route path="kb" element={<AgentKB />} />
            </Route>

            {/* Protected admin route */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Protected admin users route */}
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Protected admin settings route */}
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly>
                <SystemSettings />
              </ProtectedRoute>
            } />

            {/* Protected admin analytics route */}
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly>
                <Analytics />
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;