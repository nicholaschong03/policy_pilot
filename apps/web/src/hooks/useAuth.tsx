import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'agent' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: string | null; // JWT access token
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; role?: UserRole }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const setAuthToken = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get<UserProfile>(`${API}/auth/me`);
      setProfile(data);
      setUser(data);
    } catch (error) {
      setProfile(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setSession(token);
      setAuthToken(token);
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await axios.post<{ access_token: string; role: UserRole }>(
        `${API}/auth/login`,
        { email, password }
      );
      const token = data.access_token;
      localStorage.setItem('token', token);
      setSession(token);
      setAuthToken(token);
      await fetchProfile();
      return { error: null, role: data.role };
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.error || 'Login failed',
        variant: 'destructive',
      });
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    // Client-side guard for clearer UX before hitting the API
    if (!password || password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return { error: new Error('Password must be at least 6 characters') };
    }
    try {
      // Admin-only in API: requires current token
      await axios.post(`${API}/auth/register`, { email, password, role, fullName });
      toast({
        title: 'Success',
        description: 'User registered successfully.',
      });
      return { error: null };
    } catch (err: any) {
      const serverError = err?.response?.data?.error as string | undefined;
      const friendly =
        serverError?.toLowerCase().includes('at least') || serverError?.toLowerCase().includes('min')
          ? 'Password must be at least 6 characters.'
          : serverError || 'Registration failed';
      toast({
        title: 'Error',
        description: friendly,
        variant: 'destructive',
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      if (session) {
        await axios.post(`${API}/auth/logout`);
      }
    } catch {}
    finally {
      localStorage.removeItem('token');
      setAuthToken(null);
      setSession(null);
      setUser(null);
      setProfile(null);
      toast({
        title: 'Success',
        description: 'Signed out successfully',
      });
    }
  };

  const hasRole = (role: UserRole) => {
    return profile?.role === role;
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};