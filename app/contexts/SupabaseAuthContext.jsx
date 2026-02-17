import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to centralize session state updates
  const handleSession = useCallback((currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    
    // Debug log for session verification
    if (currentSession) {
      console.log('[Auth] Session active:', currentSession.user.email);
    } else {
      console.log('[Auth] No active session');
    }
  }, []);

  // Task 2: Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing...');
        // Check for existing session in storage
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          handleSession(initialSession);
        }
      } catch (error) {
        console.error('[Auth] Error checking initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [handleSession]);

  // Task 3: Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[Auth] State change event:', event);
        
        // Update local state with the new session
        handleSession(currentSession);
        
        // Ensure loading is cleared on any auth event
        setLoading(false);

        if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT') {
           console.log('[Auth] User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  // Task 4: Proactive token refresh timer (5 minutes before expiration)
  useEffect(() => {
    if (!session) return;

    const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds
    const CHECK_INTERVAL = 60 * 1000; // Check every minute

    const checkTokenExpiration = async () => {
      if (!session?.expires_at) return;

      // session.expires_at is in seconds, convert to milliseconds
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiration = expiresAt - now;

      // If token is about to expire within the buffer window, refresh it
      if (timeUntilExpiration < REFRESH_BUFFER) {
        console.log('[Auth] Token expiring soon (< 5 mins), proactively refreshing...');
        
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('[Auth] Error refreshing token:', error);
          // If refresh fails (e.g., network error), we rely on Supabase's auto-refresh retry
          // or eventually the user will need to re-login if session dies.
        } else if (data.session) {
          console.log('[Auth] Manual refresh successful');
          handleSession(data.session);
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, CHECK_INTERVAL);
    
    // Clean up interval on unmount or session change
    return () => clearInterval(intervalId);
  }, [session, handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong during sign up.",
      });
      return { error };
    }

    // Attempt to send welcome email if signup was successful
    if (data?.user) {
      try {
        const userName = options?.data?.full_name || options?.data?.name || '';
        
        const { error: funcError } = await supabase.functions.invoke('send-welcome-email', {
          body: { 
            email: data.user.email, 
            name: userName 
          }
        });

        if (funcError) {
          console.error('Failed to send welcome email:', funcError);
        }
      } catch (err) {
        console.error('Error invoking welcome email function:', err);
      }
    }

    return { data, error };
  }, [toast]);

  const login = useCallback(async (email, password) => {
    // Validate inputs before making the request
    if (!email || !password) {
      const error = { message: "Email and password are required." };
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      return { error };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      return { data, error: null };
    } catch (err) {
      console.error('[Auth] Unexpected login error:', err);
      return { error: err };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong while signing out.",
      });
    }

    // Explicitly clear state on manual sign out
    setSession(null);
    setUser(null);

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    login,
    signOut,
    isAuthenticated: !!user,
    currentUser: user // Alias for compatibility
  }), [user, session, loading, signUp, login, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};