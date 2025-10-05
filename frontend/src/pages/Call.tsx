import { useState } from "react";
import ActivityIndicator from "../components/ActivityIndicator";

const Call: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full h-screen p-6">
      <div className="w-full h-full bg-surface rounded-3xl flex items-center justify-center">
        {isLoading ? <ActivityIndicator /> : <></>}
      </div>
    </div>
  );
};

export default Call;
