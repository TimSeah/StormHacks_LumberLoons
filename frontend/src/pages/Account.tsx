import React from "react";
import PageWrapper from "../components/PageWrapper";

const Account: React.FC = () => {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
        <p className="text-lg">
          Manage your account details and preferences here.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Account;
