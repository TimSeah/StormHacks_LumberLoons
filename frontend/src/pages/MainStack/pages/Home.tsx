import { MessageCircleHeart, Panda, Video } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Link } from "react-router";
import PageWrapper from "../PageWrapper";

const Home: React.FC = () => {
  return (
    <PageWrapper className="items-center justify-center ">
      <div className="flex h-min flex-col p-10 bg-surface w-full rounded-4xl">
        <div className="flex flex-row gap-2 items-end mb-6">
          <Panda size={32} />
          <MessageCircleHeart size={48} className="mb-2" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Hi, User!</h1>
        <p className="text-lg mb-8">
          I'm here to listen and help. How are you today?
        </p>
      </div>
      <div className="flex flex-row sm:flex-row gap-4 mt-4 w-full">
        <Link to="/carrie" className="flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 bg-accent text-accent-foreground px-6 py-4 rounded-2xl font-medium transition-colors hover:bg-accent/90 w-full"
          >
            <Video size={20} />
            Talk with Carrie
          </motion.button>
        </Link>

        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-3 bg-secondary text-secondary-foreground px-6 py-4 rounded-2xl font-medium transition-colors hover:bg-secondary/90 w-full"
        >
          <Mic size={20} />
          Chat with me
        </motion.button> */}
      </div>
    </PageWrapper>
  );
};

export default Home;
