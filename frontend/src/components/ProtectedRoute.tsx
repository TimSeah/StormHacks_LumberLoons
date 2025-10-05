import type { ReactNode } from "react";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthPage from "../pages/AuthPage";
import ActivityIndicator from "./ActivityIndicator";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ActivityIndicator />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
