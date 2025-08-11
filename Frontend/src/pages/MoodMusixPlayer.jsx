import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../api/axiosInstance.js";
import {
  Play,
  Pause,
  Camera,
  Music,
  Heart,
  Smile,
  Frown,
  Meh,
  Volume2,
} from "lucide-react";

const MoodMusicPlayer = () => {
  // Responsive threshold for marquee
  const getTitleThreshold = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 15 : 25;
    }
    return 25; // fallback for SSR
  };
  const [titleThreshold, setTitleThreshold] = useState(getTitleThreshold());

  useEffect(() => {
    const handleResize = () => {
      setTitleThreshold(getTitleThreshold());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [userMood, setUserMood] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [songsByMood, setSongsByMood] = useState([]);
  const [isSongsLoading, setIsSongsLoading] = useState(false);
  const [audioTime, setAudioTime] = useState({ current: 0, duration: 0 });
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // Load Models
  const loadModels = async () => {
    if (modelsLoaded) return;

    try {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    } catch (error) {
      console.error("Error loading models:", error);
     toast.error("Failed to load AI models. Please refresh the page.");
    }
  };

  const moods = {
    happy: { icon: Smile, color: "text-yellow-500", bg: "bg-yellow-100" },
    sad: { icon: Frown, color: "text-blue-500", bg: "bg-blue-100" },
    neutral: { icon: Meh, color: "text-gray-500", bg: "bg-gray-100" },
    surprised: { icon: Heart, color: "text-pink-500", bg: "bg-pink-100" },
    angry: { icon: Frown, color: "text-red-500", bg: "bg-red-100" },
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
      streamRef.current = null;
    }
  };

  const detectMood = async () => {
    if (!modelsLoaded) {
      await loadModels();
    }

    if (!isCameraOn || !videoRef.current) {
      await loadModels();
      await startCamera();
      // Wait a moment for camera to start
      await new Promise(res => setTimeout(res, 500));
    }
    setIsDetecting(true);

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();
      if (detections.length === 0) {
        toast.error("No Mood detected. Please ensure your face is clearly visible and well-lit.");
        setIsDetecting(false);
        // Try to reset camera for next attempt
        if (streamRef.current) {
          videoRef.current.srcObject = null;
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        await startCamera();
        return;
      }
      const faceExpressions = detections[0].expressions;

      const mood = Object.keys(faceExpressions).reduce((a, b) =>
        faceExpressions[a] > faceExpressions[b] ? a : b
      );
      setUserMood(mood);

      setIsDetecting(false);
    } catch (error) {
      console.error("Detection error:", error);
      setIsDetecting(false);
  toast.error("An error occurred during detection. Please reload the page or check your camera.");
      // Try to reset camera
      if (streamRef.current) {
        videoRef.current.srcObject = null;
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      await startCamera();
    }
  };

  const togglePlayPause = (song) => {
    if (currentSong?._id === song._id) {

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (currentSong && isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentSong]);

  const fetchSongsByMood = async () => {
    setIsSongsLoading(true);
    try {
      const response = await axios.get(`/songs?mood=${userMood}`);
      setSongsByMood(response.data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsSongsLoading(false);
    }
  };

  useEffect(() => {
    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (userMood) {
      fetchSongsByMood();
    }
  }, [userMood]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateTime = () => {
        setAudioTime({
          current: audio.currentTime,
          duration: audio.duration || 0,
        });
      };

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", updateTime);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateTime);
      };
    }
  }, [currentSong, isPlaying]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <audio
          src={currentSong?.audio}
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        ></audio>
        {/* Header */}
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              MoodTunes AI
            </h1>
            <p className="text-gray-300 text-lg">
            AI-powered music for your mood
          </p>
        </div>

        {/* Webcam Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex flex-col items-center space-y-4">
              {/* Video Container */}
              <div className="relative w-full max-w-md aspect-video bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20">
                {!isCameraOn && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isCameraOn && (
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={stopCamera}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
                    >
                      Stop Camera
                    </button>
                  </div>
                )}

                {/* Mood Indicator */}
                {userMood && (
                  <div
                    className={`absolute top-4 right-4 ${moods[userMood]?.bg} rounded-full p-3`}
                  >
                    {React.createElement(moods[userMood]?.icon, {
                      className: `w-6 h-6 ${moods[userMood]?.color}`,
                    })}
                  </div>
                )}
              </div>

              {/* Detect Button */}
              <button
                onClick={detectMood}
                disabled={isDetecting}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                {isDetecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Detecting Mood...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>
                      {isCameraOn ? "Detect Mood" : "Start Camera & Detect"}
                    </span>
                  </>
                )}
              </button>

              {/* Mood Result */}
              {userMood && (
                <div className="text-center">
                  <p className="text-gray-300">Detected Mood:</p>
                  <p
                    className={`text-2xl font-bold capitalize ${moods[userMood]?.color}`}
                  >
                    {userMood}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Music Section */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center space-x-2">
              <Music className="w-8 h-8" />
              <span>
                {userMood
                  ? `${
                      userMood.charAt(0).toUpperCase() + userMood.slice(1)
                    } Songs`
                  : "All Songs"}
              </span>
            </h2>
            <div className="text-gray-400">{songsByMood.length} songs</div>
          </div>

          <div className="grid gap-4">
            {isSongsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Loading songs...</p>
              </div>
            ) : songsByMood.length > 0 ? (
              songsByMood.map((song, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <Music className="w-8 h-8 text-white" />
                    </div>

                    {/* Song Info */}
                    <div className="flex-grow min-w-0">
                      {song.title.length > titleThreshold ? (
                        <div className="overflow-x-auto whitespace-nowrap" style={{maxWidth: '100%'}}>
                          <marquee behavior="scroll" direction="left" scrollamount="4">
                            <span className="font-bold text-lg md:text-xl">{song.title}</span>
                          </marquee>
                        </div>
                      ) : (
                        <h3 className="font-bold text-lg md:text-xl truncate">
                          {song.title}
                        </h3>
                      )}
                      <p className="text-gray-300 truncate">{song.artist}</p>
                    </div>

                    <button
                      onClick={() => togglePlayPause(song)}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 md:p-4 transition-all duration-300 transform hover:scale-110 flex-shrink-0"
                    >
                      {currentSong?._id === song._id && isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </button>
                  </div>
                  {/* this code is for Progress Bar  */}
                  {currentSong?._id === song._id && (
                    <div className="mt-4 flex items-center space-x-3">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <div className="flex-grow bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-400 to-purple-400 h-full rounded-full transition-all duration-300"
                          style={{
                            width: audioTime.duration
                              ? `${
                                  (audioTime.current / audioTime.duration) * 100
                                }%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatTime(audioTime.current)} /{" "}
                        {formatTime(audioTime.duration)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No songsByMood found for this mood
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default MoodMusicPlayer;
