import { Panda } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const TopNavigation: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed top-0 sm:top-4 left-0 right-0 z-50 bg-surface sm:max-w-[800px] sm:mx-auto shadow-background shadow-lg sm:rounded-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <Panda size={32} className="rotate-[10deg]" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              Carrie
            </span>
          </Link>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:block text-sm text-muted-foreground">
                  Hi {user?.username}!
                </span>
                <Link
                  to="/home"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-foreground"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/auth"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-3 sm:px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
