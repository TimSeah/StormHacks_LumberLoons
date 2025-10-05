import { AnimatePresence, motion, type MotionProps } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

type ExpandingButtonProps = {
  expandClassName?: string;
  animateFromCircle?: boolean;
  children: ReactNode;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
} & MotionProps;

export default function ExpandingButton({
  expandClassName,
  animateFromCircle = false,
  children,
  onPress,
  ...props
}: ExpandingButtonProps) {
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsExpanding(true);
  };

  const handleAnimationComplete = () => {
    onPress();
    // Reset animation after a short delay to allow exit animation
    setTimeout(() => {
      setIsExpanding(false);
      setButtonRect(null);
    }, 1500);
  };

  return (
    <>
      <motion.button {...props} onClick={handleClick} ref={buttonRef}>
        {children}
      </motion.button>
      <AnimatePresence>
        {isExpanding && buttonRect && (
          <motion.div
            initial={{
              position: "fixed",
              top: buttonRect.top,
              left: buttonRect.left,
              width: buttonRect.width,
              height: buttonRect.height,
              opacity: 0,
              zIndex: 9999,
              borderRadius: animateFromCircle ? "500px" : undefined,
            }}
            animate={{
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              opacity: 1,
              borderRadius: animateFromCircle ? "0" : undefined,
            }}
            className={`bg-surface ${expandClassName}`}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            }}
            transition={{
              opacity: { duration: 0.1, ease: "linear" },
              default: { duration: 0.5, ease: "circInOut" },
            }}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
