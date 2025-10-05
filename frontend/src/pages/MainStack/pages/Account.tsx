import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PageWrapper from "../PageWrapper";

const Account: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    // The auth context will handle redirecting to login
  };

  const handleClearLocalData = () => {
    // Clear any additional cached data beyond auth tokens
    if (
      confirm(
        "Are you sure you want to clear all local data? This cannot be undone."
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      logout(); // Also logout to ensure clean state
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
          <p className="text-lg text-gray-600 mb-4">
            Please log in to view your account information.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Account Settings
          </h1>

          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded border">
                {user.id}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded border">
                {user.username}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition duration-200 shadow-md hover:shadow-lg"
              onClick={handleLogout}
            >
              Logout
            </button>

            <button
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition duration-200 shadow-md hover:shadow-lg"
              onClick={handleClearLocalData}
            >
              Clear All Local Data
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Logging out will clear your authentication tokens and redirect you
              to the login page.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Account;
