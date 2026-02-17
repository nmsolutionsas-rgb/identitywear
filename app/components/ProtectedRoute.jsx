import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import LoginPromptModal from '@/components/LoginPromptModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <span className="sr-only">Loading authentication status...</span>
      </div>
    );
  }

  // If not authenticated, show the login modal over a placeholder instead of redirecting immediately
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50/50">
        <div className="text-center p-8 max-w-md">
           <h2 className="text-2xl font-oswald uppercase mb-4">Access Restricted</h2>
           <p className="text-gray-500 mb-8">Please sign in to view this page.</p>
        </div>
        <LoginPromptModal 
          isOpen={true} 
          onClose={() => navigate('/')} 
          destination={location.pathname}
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;