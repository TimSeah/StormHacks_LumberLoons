import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneDisconnectIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from "@phosphor-icons/react";
import type { Room } from "livekit-client";
import { Panda } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import liveKitApi from "../api/livekit";
import ActivityIndicator from "../components/ActivityIndicator";
import { useAuth } from "../contexts/AuthContext";

const Call: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const { user } = useAuth();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const connectToLiveKit = async () => {
      if (!user) {
        setConnectionError("User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setConnectionError(null);

        // Connect to LiveKit room
        const connectedRoom = await liveKitApi.connectToRoom({
          identity: user.username || `user-${user.id}`,
          roomName: "session-1", // You can make this dynamic based on your needs
          enableAudio: true,
          enableVideo: true,
        });

        setRoom(connectedRoom);
        console.log("Successfully connected to LiveKit");
      } catch (error) {
        console.error("Failed to connect to LiveKit:", error);
        setConnectionError(
          error instanceof Error ? error.message : "Failed to connect to call"
        );
      } finally {
        setIsLoading(false);
      }
    };

    connectToLiveKit();

    // Cleanup on unmount
    return () => {
      if (room) {
        liveKitApi.disconnectFromRoom();
      }
    };
  }, [user]);

  // Effect to setup microphone audio detection
  useEffect(() => {
    const setupAudioDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStreamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
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

    if (room && liveKitApi.isConnected()) {
      setupAudioDetection();
    }

    return () => {
      // Cleanup audio detection
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [room]);

  // Effect to setup video when room is connected
  useEffect(() => {
    const setupVideo = async () => {
      if (room && liveKitApi.isConnected() && videoRef.current) {
        // Small delay to ensure video track is published
        setTimeout(() => {
          const videoElement = liveKitApi.getLocalVideoElement();
          if (videoElement && videoRef.current) {
            // Copy the video stream to our ref element
            videoRef.current.srcObject = videoElement.srcObject;
            videoRef.current.play().catch(console.error);
          }
        }, 1000);
      }
    };

    setupVideo();
  }, [room]);

  // Effect to sync initial audio/video state with LiveKit
  useEffect(() => {
    if (room && liveKitApi.isConnected()) {
      // Sync initial state after a short delay to allow track publishing
      setTimeout(() => {
        setIsAudioEnabled(!liveKitApi.isAudioMuted());
        setIsVideoEnabled(!liveKitApi.isVideoMuted());
      }, 1500);
    }
  }, [room]);

  // Control button handlers
  const toggleAudio = async () => {
    try {
      const newState = await liveKitApi.toggleAudio();
      setIsAudioEnabled(newState);
    } catch (error) {
      console.error("Failed to toggle audio:", error);
    }
  };

  const toggleVideo = async () => {
    try {
      const newState = await liveKitApi.toggleVideo();
      setIsVideoEnabled(newState);
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  const endCall = () => {
    if (room) {
      liveKitApi.disconnectFromRoom();
    }
    navigate("/home");
  };

  return (
    <div className="w-full h-screen p-6 relative overflow-hidden">
      <div className="w-full h-full bg-surface rounded-3xl flex relative justify-center items-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <ActivityIndicator />
            <p className="text-gray-600">Connecting to call...</p>
          </div>
        ) : connectionError ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-red-500 text-center">
              <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
              <p className="text-sm">{connectionError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : room && liveKitApi.isConnected() ? (
          <>
            {/* Main Center Text */}
            <div className="flex flex-col items-center justify-center">
              <Panda size={64} className="mb-4" />
              <h1 className="text-4xl font-medium text-gray-800">
                {isListening ? "Carrie is listening" : "Carrie"}
              </h1>
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
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 z-0">
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <ActivityIndicator />
            <p className="text-gray-600">Setting up call...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Call;
