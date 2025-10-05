import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { SignupRequest } from "../types/auth";

interface SignupPageProps {
  onSwitchToLogin?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
  const { signup, error, isLoading, clearError } = useAuth();
  const [formData, setFormData] = useState<SignupRequest>({
    username: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev: SignupRequest) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      // You might want to add a local error state for this
      alert("Passwords don't match");
      return;
    }

    try {
      await signup(formData);
      // Redirect will be handled by auth state change
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Choose a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </div>

          {onSwitchToLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-accent hover:text-accent"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
