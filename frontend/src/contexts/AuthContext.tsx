import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../api/auth";
import type { AuthUser, SigninRequest, SignupRequest } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (data: SignupRequest) => Promise<void>;
  signin: (data: SigninRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = AuthService.getUser();
        const isAuth = AuthService.isAuthenticated();

        if (isAuth && storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        AuthService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signup = async (data: SignupRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.signup(data);
      setUser({ id: response.id, username: response.username });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (data: SigninRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.signin(data);
      setUser({ id: response.id, username: response.username });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signin failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    AuthService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    signin,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
