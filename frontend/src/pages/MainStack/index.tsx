import React from "react";
import { useLocation } from "react-router";
import BottomNavigation from "./BottomNavigation";
import Account from "./pages/Account";
import History from "./pages/History";
import Home from "./pages/Home";

const MainStack: React.FC = () => {
  const location = useLocation();

  const renderPage = () => {
    switch (location.pathname) {
      case "/home":
        return <Home />;
      case "/history":
        return <History />;
      case "/account":
        return <Account />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {renderPage()}
      <BottomNavigation />
    </div>
  );
};

export default MainStack;
