"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { PlusIcon, VideoIcon, UploadIcon, CheckCircleIcon, PlayIcon, Loader2Icon } from "lucide-react";
import CreateIdeaModal from "@/components/CreateIdeaModal";
import { toast } from "sonner";

import { Id } from "@/convex/_generated/dataModel";

interface Idea {
    _id: Id<"videoIdeas">;
    _creationTime: number;
    userId: string;
    title: string;
    description?: string;
    status: string;
    storageId?: Id<"_storage">;
    createdAt: number;
}

export default function IdeasPage() {
    const { userId } = useAuth();
    const ideas = useQuery(api.ideas.getIdeas, userId ? { userId } : "skip") as Idea[] | undefined;
    const updateStatus = useMutation(api.ideas.updateIdeaStatus);
    const generateUploadUrl = useMutation(api.ideas.generateUploadUrl);
    const saveVideoStorageId = useMutation(api.ideas.saveVideoStorageId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const handleStatusChange = async (ideaId: Id<"videoIdeas">, newStatus: string) => {
        try {
            await updateStatus({ ideaId, status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleFileUpload = async (ideaId: Id<"videoIdeas">, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(ideaId);
        try {
            // Step 1: Get a short-lived upload URL
            const postUrl = await generateUploadUrl();

            // Step 2: POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // Step 3: Save the newly allocated storage id to the database
            await saveVideoStorageId({ ideaId, storageId });

            toast.success("Video uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload video");
        } finally {
            setUploadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "idea": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "scripting": return "bg-blue-100 text-blue-800 border-blue-200";
            case "filming": return "bg-purple-100 text-purple-800 border-purple-200";
            case "filmed": return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "uploaded": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Please sign in to manage your video ideas.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Video Ideas</h1>
                    <p className="text-gray-500 mt-1">Manage your content pipeline from idea to upload</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Idea
                </button>
            </div>

            {!ideas ? (
                <div className="flex justify-center py-12">
                    <Loader2Icon className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : ideas.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No ideas yet</h3>
                    <p className="text-gray-500 mt-1 mb-6">Start by creating your first video concept</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                    >
                        Create an idea
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map((idea) => (
                        <div key={idea._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(idea.status)}`}>
                                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(idea.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{idea.title}</h3>
                                {idea.description && (
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{idea.description}</p>
                                )}
                            </div>

                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                                {idea.status === "uploaded" ? (
                                    <div className="flex items-center text-green-600 text-sm font-medium">
                                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                        Ready
                                    </div>
                                ) : (
                                    <select
                                        value={idea.status}
                                        onChange={(e) => handleStatusChange(idea._id, e.target.value)}
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1 px-2"
                                    >
                                        <option value="idea">Idea</option>
                                        <option value="scripting">Scripting</option>
                                        <option value="filming">Filming</option>
                                        <option value="filmed">Filmed</option>
                                    </select>
                                )}

                                {(idea.status === "filming" || idea.status === "filmed") && !idea.storageId && (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFileUpload(idea._id, e)}
                                            className="hidden"
                                            id={`file-${idea._id}`}
                                            disabled={uploadingId === idea._id}
                                        />
                                        <label
                                            htmlFor={`file-${idea._id}`}
                                            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${uploadingId === idea._id
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                }`}
                                        >
                                            {uploadingId === idea._id ? (
                                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UploadIcon className="w-4 h-4" />
                                            )}
                                            {uploadingId === idea._id ? "Uploading..." : "Upload"}
                                        </label>
                                    </div>
                                )}

                                {idea.storageId && (
                                    <div className="flex items-center text-blue-600 text-sm font-medium">
                                        <PlayIcon className="w-4 h-4 mr-1.5" />
                                        Video
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateIdeaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
