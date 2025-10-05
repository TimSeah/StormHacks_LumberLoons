import { motion } from "motion/react";
import React from "react";
import { Link, useLocation } from "react-router";
// Note: You'll need to install lucide-react: npm install lucide-react
import { HouseSimpleIcon, NotebookIcon, UserIcon } from "@phosphor-icons/react";
import { Panda } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/home",
      icon: HouseSimpleIcon,
      label: "Home",
    },
    {
      path: "/history",
      icon: NotebookIcon,
      label: "History",
    },
    {
      path: "/account",
      icon: UserIcon,
      label: "Account",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 py-4 px-8 flex-row flex z-50 bg-gradient-to-t from-white from-80% to-transparent
                 lg:top-0 lg:bottom-auto lg:bg-gradient-to-b lg:from-white lg:from-80% lg:to-transparent lg:items-center justify-center mx-auto max-w-[500px] lg:max-w-none"
    >
      <Link to="/home" className=" items-center lg:flex hidden">
        <Panda size={36} className="rotate-[10deg]  mr-3" />
        <h2 className=" text-3xl font-semibold mr-8">Carrie</h2>
      </Link>

      {/* Navigation items */}
      <div className="flex flex-1 items-center px-2 py-2 rounded-full bg-surface relative lg:flex-initial">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center flex-1 rounded-full px-2 py-2 relative z-10
                          lg:flex-row lg:px-4 lg:py-2 lg:mr-2 lg:flex-initial ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground "
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
              <Icon
                size={24}
                className="mb-1 lg:mb-0 lg:mr-2 lg:w-5 lg:h-5"
                weight={isActive ? "fill" : "regular"}
              />
              <span className="text-sm font-medium lg:text-base">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Carrie section - shown on left for large screens */}
      <motion.div
        className="ml-4"
        whileHover={{ scale: 1.05, rotate: -10 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link
          to="/carrie"
          className="flex lg:hidden aspect-square justify-center flex-col items-center py-2 px-4 h-full rounded-full transition-colors border-primary border-2"
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
