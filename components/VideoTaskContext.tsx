"use client";

import { Message } from "@ai-sdk/react";
import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Define the shape of a task
export interface Task {
  _id?: Id<"tasks">;
  videoId: string;
  userId: string;
  messageId: string;
  content: string;
  type: "script" | "title" | "thumbnail" | "general";
  completed: boolean;
  createdAt: number;
}

// Define the context shape
interface VideoTaskContextType {
  // Chat messages
  savedMessages: Message[];
  addMessageToSaved: (message: Message) => void;
  removeMessageFromSaved: (messageId: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (
    task: Omit<Task, "_id" | "completed" | "createdAt">
  ) => Promise<Id<"tasks"> | undefined>;
  toggleTaskCompletion: (
    taskId: Id<"tasks">,
    completed: boolean
  ) => Promise<void>;
  deleteTask: (taskId: Id<"tasks">) => Promise<void>;

  // Current video
  currentVideoId: string | null;
  setCurrentVideoId: (videoId: string | null) => void;
}

// Create the context
const VideoTaskContext = createContext<VideoTaskContextType | undefined>(
  undefined
);

// Create the provider component
export function VideoTaskProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // Convex mutations and queries for tasks
  const createTaskMutation = useMutation(api.tasks.createTask);
  const updateTaskStatusMutation = useMutation(api.tasks.updateTaskStatus);
  const deleteTaskMutation = useMutation(api.tasks.deleteTask);

  // Get tasks for the current video from Convex
  const convexTasks = useQuery(
    api.tasks.getTasksByVideo,
    currentVideoId && userId ? { videoId: currentVideoId, userId } : "skip"
  );

  // Create derived tasks state from Convex data
  const tasks = (convexTasks || []) as Task[];

  // Add a message to saved messages
  const addMessageToSaved = (message: Message) => {
    // Check if message already exists
    if (!savedMessages.some((m) => m.id === message.id)) {
      setSavedMessages((prev) => [...prev, message]);
    }
  };

  // Remove a message from saved messages
  const removeMessageFromSaved = (messageId: string) => {
    setSavedMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Add a task to the database
  const addTask = async (
    task: Omit<Task, "_id" | "completed" | "createdAt">
  ) => {
    console.log("Adding task:", {
      task,
      userId,
      isSignedIn,
      currentVideoId,
    });

    if (!userId || !isSignedIn) {
      console.error("Cannot add task - not authenticated", {
        userId,
        isSignedIn,
      });
      return;
    }

    try {
      console.log("Calling createTaskMutation with:", {
        videoId: task.videoId,
        userId: task.userId || userId, // Use the userId from auth as fallback
        messageId: task.messageId,
        content: task.content,
        type: task.type,
      });

      const result = await createTaskMutation({
        videoId: task.videoId,
        userId: task.userId || userId, // Use the userId from auth as fallback
        messageId: task.messageId,
        content: task.content,
        type: task.type,
      });

      console.log("Task created successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (
    taskId: Id<"tasks">,
    completed: boolean
  ) => {
    console.log("Toggling task completion:", { taskId, completed });

    try {
      const result = await updateTaskStatusMutation({
        taskId,
        completed,
      });

      console.log("Task status updated successfully:", result);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: Id<"tasks">) => {
    console.log("Deleting task:", { taskId });

    try {
      const result = await deleteTaskMutation({
        taskId,
      });

      console.log("Task deleted successfully:", result);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Create the context value
  const contextValue: VideoTaskContextType = {
    savedMessages,
    addMessageToSaved,
    removeMessageFromSaved,
    tasks,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    currentVideoId,
    setCurrentVideoId,
  };

  return (
    <VideoTaskContext.Provider value={contextValue}>
      {children}
    </VideoTaskContext.Provider>
  );
}

// Create a hook to use the context
export function useVideoTask() {
  const context = useContext(VideoTaskContext);
  if (context === undefined) {
    throw new Error("useVideoTask must be used within a VideoTaskProvider");
  }
  return context;
}
