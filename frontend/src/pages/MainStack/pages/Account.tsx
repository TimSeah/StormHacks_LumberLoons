import { FireSimpleIcon } from "@phosphor-icons/react";
import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PageWrapper from "../PageWrapper";

const Account: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    // The auth context will handle redirecting to login
  };

  if (!isAuthenticated || !user) {
    return;
  }

  return (
    <PageWrapper>
      <div className="py-20">
        <div className="flex flex-row gap-2 items-center justify-between w-full mb-7">
          <div className="flex flex-row gap-2 items-center">
            <div
              className="flex items-center justify-center relative"
              style={{ width: 44, height: 44 }}
            >
              <FireSimpleIcon
                size={52}
                className="absolute"
                weight="fill"
                color="#f97316"
              />
              <p className="pt-2 font-bold text-xl text-white z-10">1</p>
            </div>
            <h1 className="text-4xl font-bold">{user.username}</h1>
          </div>
          <button
            className="px-6 py-3 bg-surface rounded-full text-muted-foreground"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <p className="text-lg">Been with carrie for 10 days!</p>
      </div>
    </PageWrapper>
  );
};

export default Account;
