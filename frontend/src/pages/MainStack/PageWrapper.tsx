import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.95,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth feel
          opacity: { duration: 0.2 },
          scale: { duration: 0.3 },
        }}
        className="w-full h-full"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.2,
          }}
          className={`flex flex-col px-6 ${className} overflow-x-hidden overflow-y-auto min-h-screen pb-24`}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageWrapper;
