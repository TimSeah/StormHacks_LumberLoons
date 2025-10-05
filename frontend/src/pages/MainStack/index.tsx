import React from "react";
import { Route, Routes } from "react-router";
import BottomNavigation from "./BottomNavigation";
import Account from "./pages/Account";
import History from "./pages/History";
import Home from "./pages/Home";

const MainStack: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="">
        <Routes>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="account" element={<Account />} />
        </Routes>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default MainStack;
