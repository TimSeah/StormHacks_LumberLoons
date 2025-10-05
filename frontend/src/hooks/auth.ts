import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook to check authentication status and provide user information
 */
export const useAuthUser = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    isGuest: !isAuthenticated && !isLoading,
  };
};

/**
 * Hook to automatically redirect if not authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not authenticated, the ProtectedRoute component
      // will handle the redirect to login
      console.log("User not authenticated");
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook for logout functionality with optional callback
 */
export const useLogout = (onLogout?: () => void) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  return handleLogout;
};
