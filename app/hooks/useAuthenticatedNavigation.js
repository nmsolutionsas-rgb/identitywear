import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook to handle navigation that requires authentication.
 * If user is authenticated, it navigates immediately.
 * If not, it shows a login modal and stores the intended destination.
 */
export const useAuthenticatedNavigation = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [intendedDestination, setIntendedDestination] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navigateIfAuthenticated = useCallback((path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      setIntendedDestination(path);
      setShowLoginModal(true);
    }
  }, [isAuthenticated, navigate]);

  const closeModal = useCallback(() => {
    setShowLoginModal(false);
    setIntendedDestination(null);
  }, []);

  return {
    navigateIfAuthenticated,
    showLoginModal,
    setShowLoginModal,
    closeModal,
    intendedDestination
  };
};

/**
 * Hook alias as requested by task 10 to include useProtectedNavigation
 */
export const useProtectedNavigation = useAuthenticatedNavigation;

export default useAuthenticatedNavigation;