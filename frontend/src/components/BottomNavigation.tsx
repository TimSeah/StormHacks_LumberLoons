import { motion } from "motion/react";
import React from "react";
import { Link, useLocation } from "react-router";
// Note: You'll need to install lucide-react: npm install lucide-react
import { History, Home, Panda, User } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
    },
    {
      path: "/history",
      icon: History,
      label: "History",
    },
    {
      path: "/account",
      icon: User,
      label: "Account",
    },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-background pb-4 px-12 flex-row flex">
      <div className="flex flex-1 items-center px-2 py-2 rounded-full border-border bg-surface relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center flex-1 rounded-full px-2 py-2 transition-colors relative z-10 ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-elevated rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={24} className="mb-1" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <Link
        to="/new"
        className="flex aspect-square ml-4 justify-center flex-col items-center py-2 px-4 h-full rounded-full transition-colors border-border border-1"
      >
        <Panda size={48} className="rotate-[10deg]" />
      </Link>
    </nav>
  );
};

export default BottomNavigation;
