"use client";

import { createOrGetVideo } from "@/actions/createOrGetVideo";
import AiAgentChat from "@/components/AiAgentChat";
import FeatureFlagDebug from "@/components/FeatureFlagDebug";
import ThumbnailGeneration from "@/components/ThumbnailGeneration";
import TitleGenerations from "@/components/TitleGenerations";
import Transcription from "@/components/Transcription";
import Usage from "@/components/Usage";
import YoutubeVideoDetails from "@/components/YoutubeVideoDetails";
import VideoTaskManager from "@/components/VideoTaskManager";
import { Doc } from "@/convex/_generated/dataModel";
import { FeatureFlag } from "@/features/flags";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, CheckSquare, ShieldAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function AnalysisPage() {
  const params = useParams<{ videoId: string }>();
  const { videoId } = params;
  const { user, isSignedIn, isLoaded } = useUser();
  const [video, setVideo] = useState<Doc<"videos"> | null | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<"chat" | "tasks">("chat");

  // Authentication status message
  useEffect(() => {
    console.log("Auth state on analysis page:", {
      isSignedIn,
      isLoaded,
      userId: user?.id,
    });

    if (isLoaded && !isSignedIn) {
      toast.error("Authentication required", {
        description:
          "You need to sign in to save chats and tasks. Your data will be lost on page refresh.",
        duration: 5000,
        icon: <ShieldAlert className="w-4 h-4" />,
      });
    }
  }, [isSignedIn, isLoaded, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      console.log("User not authenticated - video data won't be persisted");
      return;
    }

    const fetchVideo = async () => {
      console.log("Fetching video data for:", { videoId, userId: user.id });
      // Analyse the video (add video to db here)
      const response = await createOrGetVideo(videoId as string, user.id);
      if (!response.success) {
        console.error("Error fetching video:", response.error);
        // toast.error("Error creating or getting video", {
        //   description: response.error,
        //   duration: 10000,
        // });
      } else {
        console.log("Video data fetched successfully");
        setVideo(response.data!);
      }
    };

    fetchVideo();
  }, [videoId, user]);

  const VideoTranscriptionStatus =
    video === undefined ? (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-sm text-gray-700">Loading...</span>
      </div>
    ) : !video ? (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        <p className="text-sm text-amber-700">
          This is your first time analyzing this video. <br />
          <span className="font-semibold">
            (1 Analysis token is being used!)
          </span>
        </p>
      </div>
    ) : (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <p className="text-sm text-green-700">
          Analysis exists for this video - no additional tokens needed in future
          calls! <br />
        </p>
      </div>
    );

  return (
    <div className="xl:container mx-auto px-4 md:px-0">
      <FeatureFlagDebug />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side */}
        <div className="order-2 lg:order-1 flex flex-col gap-4 bg-white lg:border-r border-gray-200 p-6">
          {/* Analysis Section */}
          <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-xl">
            <Usage
              featureFlag={FeatureFlag.ANALYSE_VIDEO}
              title="Analyse Video"
            />

            {/* Video Transcription status */}
            {VideoTranscriptionStatus}
          </div>

          {/* Youtube video details */}
          <YoutubeVideoDetails videoId={videoId} />

          {/* Thumbnail Generation */}
          <ThumbnailGeneration videoId={videoId} />

          {/* Title Generation */}
          <TitleGenerations videoId={videoId} />

          {/* Transcription */}
          <Transcription videoId={videoId} />
        </div>

        {/* Right Side */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 h-[500px] md:h-[calc(100vh-6rem)] flex flex-col">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium flex-1 ${
                activeTab === "chat"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </button>
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium flex-1 ${
                activeTab === "tasks"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("tasks")}
            >
              <CheckSquare className="w-4 h-4" />
              Video Tasks
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" ? (
              <AiAgentChat videoId={videoId} />
            ) : (
              <VideoTaskManager videoId={videoId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;
