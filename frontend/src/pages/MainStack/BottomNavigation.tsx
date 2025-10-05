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
              className={`flex flex-col items-center flex-1 rounded-full px-2 py-2 relative z-10 ${
                isActive ? "text-foreground" : "text-muted-foreground "
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-elevated rounded-full -z-10"
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
      <motion.div
        className="ml-4"
        whileHover={{ scale: 1.05, rotate: -10 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link
          to="/carrie"
          className="flex aspect-square justify-center flex-col items-center py-2 px-4 h-full rounded-full transition-colors border-primary border-2"
          style={{
            boxShadow: "inset 0 0 10px var(--color-primary)",
          }}
        >
          <Panda size={48} className="rotate-[10deg]" />
        </Link>
      </motion.div>
    </nav>
  );
};

export default BottomNavigation;
