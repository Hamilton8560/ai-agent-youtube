"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { getVideoDetails } from "@/actions/getVideoDetails";
import { VideoDetails } from "@/types/types";
import Link from "next/link";
import { ArrowRight, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PastVideosPage() {
  const { user } = useUser();
  const userId = user?.id;

  // Fetch videos for the user
  const videos = useQuery(
    api.videos.getAllVideosForUser,
    userId ? { userId } : "skip"
  );

  const [videoDetails, setVideoDetails] = useState<{
    [key: string]: VideoDetails | null;
  }>({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videos || !userId) return;

    const fetchVideoDetails = async () => {
      setIsLoading(true);
      const details: { [key: string]: VideoDetails | null } = {};

      for (const video of videos) {
        const videoDetail = await getVideoDetails(video.videoId);
        details[video.videoId] = videoDetail;
      }

      setVideoDetails(details);
      setIsLoading(false);
    };

    fetchVideoDetails();
  }, [videos, userId]);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your past videos.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading your videos...</p>
      </div>
    );
  }

  if (videos && videos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">No Videos Found</h1>
          <p className="text-gray-600 mb-6">
            You haven&apos;t analyzed any videos yet. Go to the homepage to get
            started.
          </p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent">
          Your Past Videos
        </h1>
        <p className="text-gray-600 mt-2">
          Access and analyze your previously processed YouTube videos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos?.map((video) => {
          const details = videoDetails[video.videoId];
          return (
            <Link
              href={`/video/${video.videoId}/analysis`}
              key={video.videoId}
              className="group"
            >
              <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative">
                  {details?.thumbnail ? (
                    <img
                      src={details.thumbnail}
                      alt={details.title || "Video thumbnail"}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <div className="flex items-center justify-between text-white">
                        <span>View Analysis</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                    {details?.title || `Video ${video.videoId}`}
                  </h3>
                  {details?.channel && (
                    <div className="flex items-center mt-auto pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {details.channel.thumbnail && (
                          <img
                            src={details.channel.thumbnail}
                            alt={details.channel.title}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm text-gray-600">
                          {details.channel.title}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
