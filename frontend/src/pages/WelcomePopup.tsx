import React from "react";
import { Link } from "react-router";

type WelcomePopupProps = {
  onContinue?: () => void;
  onClose?: () => void;
  show?: boolean;
};

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onContinue, onClose, show = true }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* centered card */}
      <div className="relative z-10 max-w-md w-full sm:max-w-lg bg-card border rounded-xl p-6 sm:p-10 text-center shadow-lg">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
          Hi there! I'm Carrie
        </h1>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-prose mx-auto">
          I am here to provide a safe, private space to talk. I am here to listen, and
          supports you — available whenever you need someone to talk to.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">

          <Link
            to="/auth"
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-2 border border-accent text-accent rounded-lg font-medium hover:bg-accent/10 transition-colors"
          >
            Sign In / Sign Up
          </Link>
        </div>

        <button
          aria-label="close"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;