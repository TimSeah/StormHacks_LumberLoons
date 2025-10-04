import { Panda } from "lucide-react";
import React from "react";
import "./ActivityIndicator.css";

interface ActivityIndicatorProps {
  size?: number;
  className?: string;
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 48,
  className = "",
}) => {
  return (
    <div className={`activity-indicator ${className}`}>
      <Panda size={size} className="bouncing-panda" />
    </div>
  );
};

export default ActivityIndicator;
