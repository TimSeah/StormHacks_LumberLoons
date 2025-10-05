import { useCreateConversation } from "@/hooks/history";
import { useConversation } from "@elevenlabs/react";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PaperPlaneTiltIcon,
  PhoneDisconnectIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from "@phosphor-icons/react";
import { Panda } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import ElevenLabsApi from "../api/elevenlabs";
import ActivityIndicator from "../components/ActivityIndicator";
import { useAuth } from "../contexts/AuthContext";

interface ConversationMessage {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
}

const Call: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // ElevenLabs conversation state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [conversationError, setConversationError] = useState<string | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const { user } = useAuth();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  // ElevenLabs conversation hook
  const conversation = useConversation({
    micMuted: !isAudioEnabled,
    onConnect: () => {
      const systemMessage: ConversationMessage = {
        id: `system-${Date.now()}`,
        type: "system",
        content: "Connected to ElevenLabs agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      setConversationError(null);
    },

    onDisconnect: () => {
      const systemMessage: ConversationMessage = {
        id: `system-${Date.now()}`,
        type: "system",
        content: "Disconnected from ElevenLabs agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    },

    onMessage: (message) => {
      const messageType = message.source === "user" ? "user" : "agent";
      const conversationMessage: ConversationMessage = {
        id: `${messageType}-${Date.now()}-${Math.random()}`,
        type: messageType,
        content: message.message || "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, conversationMessage]);
    },

    onError: (errorEvent) => {
      console.error("ElevenLabs conversation error:", errorEvent);
      setConversationError("Conversation error occurred");
    },
  });

  // Conversation helper functions
  const handleSendMessage = async () => {
    if (!textInput.trim() || conversation.status !== "connected") return;

    try {
      conversation.sendUserMessage(textInput);

      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: textInput,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setTextInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Derived state
  const isConversationConnected = conversation.status === "connected";
  const isConversationListening =
    conversation.isSpeaking === false && isConversationConnected;
  const lastUserMessage = messages
    .filter((m) => m.type === "user")
    .slice(-1)[0];
  const lastAgentMessage = messages
    .filter((m) => m.type === "agent")
    .slice(-1)[0];

  useEffect(() => {
    const setupMediaDevices = async () => {
      if (!user) {
        setConnectionError("User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setConnectionError(null);

        // Get user media for video and audio
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        videoStreamRef.current = stream;
        micStreamRef.current = stream;

        // Setup video
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }

        console.log("Successfully setup media devices");
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to access media devices:", error);
        setConnectionError(
          error instanceof Error
            ? error.message
            : "Failed to access camera/microphone"
        );
        setIsLoading(false);
      }
    };

    setupMediaDevices();

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up media streams...");
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        micStreamRef.current &&
        micStreamRef.current !== videoStreamRef.current
      ) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [user]);

  // Effect to setup microphone audio detection
  useEffect(() => {
    const setupAudioDetection = async () => {
      try {
        if (!micStreamRef.current) return;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(
          micStreamRef.current
        );
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.8;

        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);

        const checkAudioLevel = () => {
          if (analyzerRef.current) {
            analyzerRef.current.getByteFrequencyData(dataArray);
            const average =
              dataArray.reduce((sum, value) => sum + value, 0) /
              dataArray.length;
            const threshold = 80; // Adjust this threshold as needed

            setIsListening(average > threshold);
          }
          requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
      } catch (error) {
        console.error("Error setting up audio detection:", error);
      }
    };

    if (micStreamRef.current && !isLoading) {
      setupAudioDetection();
    }

    return () => {
      // Cleanup audio detection
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isLoading]);

  // Effect to capture and send video frames to emotion detector
  useEffect(() => {
    let intervalId: number | undefined;

    const captureAndSendFrame = async () => {
      if (!videoRef.current || !isVideoEnabled) return;

      try {
        // Create a canvas to capture the current video frame
        const canvas = document.createElement("canvas");
        const video = videoRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          return; // Video not ready yet
        }

        // Resize to max 640px width for faster processing and smaller payload
        const maxWidth = 640;
        const scale = Math.min(1, maxWidth / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw current video frame to canvas (scaled down)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64 with lower quality for smaller payload
        const frameData = canvas.toDataURL("image/jpeg", 0.6);

        // Send frame to backend
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/emotion/process-frame`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ frame: frameData }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("Emotion detected:", result.emotion);
        }
      } catch (error) {
        console.error("Error sending video frame:", error);
      }
    };

    // Start capturing frames every 2 seconds when video is enabled
    if (!isLoading && isVideoEnabled && videoStreamRef.current) {
      // Initial capture
      captureAndSendFrame();

      // Set up interval for continuous capture
      intervalId = window.setInterval(() => {
        // Check video status before each capture
        if (isVideoEnabled && videoStreamRef.current) {
          captureAndSendFrame();
        } else {
          console.log("Skipping frame capture - video disabled");
        }
      }, 2000);
    }

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, isVideoEnabled]);

  // Auto-start ElevenLabs conversation when media is ready
  useEffect(() => {
    const startConversation = async () => {
      if (
        !isLoading &&
        videoStreamRef.current &&
        micStreamRef.current &&
        conversation.status !== "connected"
      ) {
        try {
          const conversationToken = await ElevenLabsApi.getConversationToken();
          await conversation.startSession({
            conversationToken,
            connectionType: "webrtc",
          });
        } catch (error) {
          console.error("Failed to start ElevenLabs conversation:", error);
          setConversationError("Failed to connect to AI agent");
        }
      }
    };

    // Start conversation after a short delay to ensure everything is ready
    if (!isLoading && videoStreamRef.current && micStreamRef.current) {
      const timeoutId = setTimeout(startConversation, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, conversation]);

  // Control button handlers
  const toggleAudio = async () => {
    try {
      if (micStreamRef.current) {
        const audioTracks = micStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsAudioEnabled(!isAudioEnabled);
      }
    } catch (error) {
      console.error("Failed to toggle audio:", error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (videoStreamRef.current) {
        const videoTracks = videoStreamRef.current.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsVideoEnabled(!isVideoEnabled);
      }
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  const endCall = async () => {
    // Stop video tracks
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Create chat history entry
    try {
      const payload = {
        userId: user?.id?.toString(),
        callSuccessful: true,
        callStart: new Date().toISOString(),
        messages: messages.map((msg) => ({
          role: msg.type,
          text: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
        summary: lastAgentMessage?.content || "Call ended",
        raw: {
          metadata: {
            topic: "Conversation with Carrie",
            duration:
              Date.now() - (messages[0]?.timestamp?.getTime() || Date.now()),
          },
        },
      };

      console.log(payload);

      await createConversation.mutateAsync(payload);
      console.log("Successfully created chat history entry");
    } catch (error) {
      console.error("Failed to create chat history entry:", error);
    }

    // Navigate back home
    navigate("/home");
  };

  return (
    <div className="w-full h-screen p-6 relative overflow-hidden">
      <div className="w-full h-full bg-surface rounded-3xl flex relative justify-center items-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <ActivityIndicator />
            <p className="text-gray-600">Setting up camera and microphone...</p>
          </div>
        ) : connectionError ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-red-500 text-center">
              <h3 className="text-lg font-semibold mb-2">Setup Failed</h3>
              <p className="text-sm">{connectionError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Main Center Text */}
            <div className="flex flex-col items-center justify-center">
              <Panda size={64} className="mb-4" />
              <h1 className="text-4xl font-medium text-gray-800">
                {isConversationConnected
                  ? isConversationListening
                    ? "Carrie is listening..."
                    : "Carrie"
                  : "Connecting to Carrie..."}
              </h1>
              {/* Show latest agent message */}
              {lastAgentMessage && (
                <div className="mt-4 max-w-md text-center">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    "{lastAgentMessage.content}"
                  </p>
                </div>
              )}
              {/* Show connection status */}
              {conversationError && (
                <div className="mt-2 text-red-500 text-sm">
                  {conversationError}
                </div>
              )}
            </div>

            {/* Draggable Video Mirror */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{ height: "320px" }}
              ref={constraintsRef}
            >
              <motion.div
                ref={videoContainerRef}
                className={`absolute bg-gray-900 rounded-2xl overflow-hidden shadow-2xl cursor-move select-none`}
                style={{
                  width: "240px",
                  height: "320px",
                }}
                drag="x"
                dragElastic={0.1}
                dragConstraints={constraintsRef}
              >
                {isVideoEnabled ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <VideoCameraSlashIcon size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  You
                </div>
              </motion.div>
            </div>

            {/* Control Buttons - Background Layer */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              {/* Last User Message - Above Input */}
              <div className="mb-4 flex justify-center">
                <AnimatePresence mode="wait">
                  {lastUserMessage && (
                    <motion.div
                      key={lastUserMessage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-accent text-accent-foreground px-4 py-2 rounded-full max-w-md text-center shadow-lg"
                    >
                      {lastUserMessage.content}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Conversation Controls */}
              <div className="mb-4 relative">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full p-4 pr-16 rounded-full focus:outline-none bg-elevated"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!textInput.trim()}
                  className="absolute right-2 top-2 bottom-2 px-8 bg-accent rounded-full disabled:opacity-50 flex items-center justify-center opacity-50"
                >
                  <PaperPlaneTiltIcon size={20} weight="fill" />
                </button>
              </div>

              {/* Call Controls */}
              <div className="flex flex-row w-full justify-center items-center gap-6">
                {/* Microphone Toggle */}
                <button
                  onClick={toggleAudio}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    isAudioEnabled
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isAudioEnabled ? (
                    <MicrophoneIcon size={24} weight="fill" />
                  ) : (
                    <MicrophoneSlashIcon size={24} />
                  )}
                </button>

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="w-20 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
                >
                  <PhoneDisconnectIcon size={24} weight="fill" />
                </button>

                {/* Video Toggle */}
                <button
                  onClick={toggleVideo}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    isVideoEnabled
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isVideoEnabled ? (
                    <VideoCameraIcon size={24} weight="fill" />
                  ) : (
                    <VideoCameraSlashIcon size={24} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;
