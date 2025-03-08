"use client";

import { useState, useEffect } from "react";
import { useVideoTask, Task } from "./VideoTaskContext";
import ReactMarkdown from "react-markdown";
import {
  CheckCircle,
  Circle,
  Trash,
  ClipboardList,
  Film,
  ImageIcon,
  PenLine,
  Copy,
  CheckIcon,
  ListOrdered,
  Sparkles,
  Loader2,
  Lightbulb,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import OrganizedTaskChecklist from "./OrganizedTaskChecklist";
import {
  organizeTasksWithAI,
  OrganizedTask,
} from "@/actions/organizeTasksWithAI";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function VideoTaskManager({ videoId }: { videoId: string }) {
  const { tasks, toggleTaskCompletion, deleteTask, setCurrentVideoId } =
    useVideoTask();
  const [filter, setFilter] = useState<string | null>(null);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "filtered" | "checklist">(
    "all"
  );
  const [organizedTasks, setOrganizedTasks] = useState<OrganizedTask[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [organizationNote, setOrganizationNote] = useState<string | null>(null);
  const [isLoadedFromLocalStorage, setIsLoadedFromLocalStorage] =
    useState(false);

  // Add Convex query and mutation hooks - use the new simpler approach
  const saveOrganizedTasksMutation = useMutation(
    api.tasks.saveOrganizedTaskItems
  );
  const savedOrganizedItems = useQuery(
    api.tasks.getOrganizedTaskItems,
    tasks.length > 0 ? { videoId, userId: tasks[0].userId } : "skip"
  );

  // Set current video ID when component mounts
  useEffect(() => {
    setCurrentVideoId(videoId);

    // Try to load from localStorage when the component mounts
    const localStorageKey = `organizedTasks_${videoId}`;
    const savedTasks = localStorage.getItem(localStorageKey);

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as OrganizedTask[];
        console.log(
          "Loaded organized tasks from localStorage:",
          parsedTasks.length
        );
        setOrganizedTasks(parsedTasks);
        setActiveTab("checklist");
        setIsLoadedFromLocalStorage(true);
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
      }
    }
  }, [videoId, setCurrentVideoId]);

  // Load saved organized tasks when component mounts or when the savedOrganizedItems query returns data
  useEffect(() => {
    if (
      savedOrganizedItems &&
      savedOrganizedItems.length > 0 &&
      !isLoadedFromLocalStorage
    ) {
      // Convert from the flatter db structure to our app's OrganizedTask structure
      console.log(
        "Loading saved organized tasks from Convex:",
        savedOrganizedItems.length
      );

      // Convert the flat structure to our organized tasks structure
      const convertedTasks: OrganizedTask[] = savedOrganizedItems.map(
        (item) => ({
          id: item.taskId,
          content: item.content,
          type: item.type,
          order: item.order,
          reason: item.reason,
          isParent: item.isParent,
          parentId: item.parentId,
        })
      );

      setOrganizedTasks(convertedTasks);
      setActiveTab("checklist");

      // Also save to localStorage as a backup
      const localStorageKey = `organizedTasks_${videoId}`;
      localStorage.setItem(localStorageKey, JSON.stringify(convertedTasks));
    }
  }, [savedOrganizedItems, videoId, isLoadedFromLocalStorage]);

  // Save the organized tasks to the database using the new approach
  const handleSaveOrganizedTasks = async () => {
    if (organizedTasks.length === 0) {
      toast.error("No organized tasks to save");
      return;
    }

    // We need a userId to save the tasks
    if (tasks.length === 0) {
      toast.error("Cannot save: No user identified");
      return;
    }

    const userId = tasks[0].userId;

    try {
      setIsSaving(true);
      toast.info("Saving your checklist...");

      // ALWAYS save to localStorage first as a reliable backup
      const localStorageKey = `organizedTasks_${videoId}`;
      localStorage.setItem(localStorageKey, JSON.stringify(organizedTasks));
      console.log("Saved to localStorage successfully");

      // Log the size of the data we're trying to save
      const dataSize = JSON.stringify(organizedTasks).length;
      console.log("Saving organized tasks to Convex:", {
        count: organizedTasks.length,
        videoId,
        userId,
        dataSize: `${Math.round(dataSize / 1024)} KB`,
      });

      // Simplify tasks for storage - remove expandedSteps which can be very large
      const simplifiedTasks = organizedTasks.map((task) => ({
        id: task.id,
        content: task.content,
        type: task.type,
        order: task.order,
        reason: task.reason,
        isParent: task.isParent,
        parentId: task.parentId,
      }));

      try {
        // Save using the new item-based approach
        const result = await saveOrganizedTasksMutation({
          videoId,
          userId,
          tasks: simplifiedTasks,
        });

        console.log("Convex save result:", result);
        toast.success(
          `Checklist saved successfully (${simplifiedTasks.length} items)`
        );
      } catch (convexError) {
        console.error("Error saving to Convex:", convexError);
        // Even if Convex fails, we've already saved to localStorage
        toast.success("Checklist saved locally (Convex save failed)");
      }
    } catch (error) {
      console.error("Error in save operation:", error);

      // Try localStorage as a last resort
      try {
        const localStorageKey = `organizedTasks_${videoId}`;
        localStorage.setItem(localStorageKey, JSON.stringify(organizedTasks));
        toast.success("Checklist saved locally (fallback)");
      } catch (localStorageError) {
        console.error("Even localStorage failed:", localStorageError);
        toast.error("Failed to save checklist anywhere");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filter tasks based on selected filter and current video
  const filteredTasks = tasks.filter(
    (task) =>
      task.videoId === videoId && (filter === null || task.type === filter)
  );

  // Log task information for debugging
  useEffect(() => {
    console.log("VideoTaskManager state:", {
      videoId,
      totalTasks: tasks.length,
      filteredTasks: filteredTasks.length,
      currentFilter: filter,
    });
  }, [tasks, filteredTasks, filter, videoId]);

  // Handle task completion toggle
  const handleToggleCompletion = (task: Task) => {
    if (task._id) {
      console.log("Toggling task completion:", task._id);
      toggleTaskCompletion(task._id, !task.completed);
    }
  };

  // Handle task deletion
  const handleDeleteTask = (task: Task) => {
    if (task._id) {
      console.log("Deleting task:", task._id);
      deleteTask(task._id);
    }
  };

  // Copy task content to clipboard
  const copyToClipboard = (text: string, taskId: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show success toast
        toast.success("Copied to clipboard!");

        // Set the copied task ID for animation
        setCopiedTaskId(taskId);

        // Reset after animation completes
        setTimeout(() => {
          setCopiedTaskId(null);
        }, 2000);
      },
      (err) => {
        toast.error("Failed to copy text");
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Get icon for task type
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "script":
        return <Film className="w-4 h-4" />;
      case "title":
        return <PenLine className="w-4 h-4" />;
      case "thumbnail":
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  // Get label for task type
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "script":
        return "Script";
      case "title":
        return "Title";
      case "thumbnail":
        return "Thumbnail";
      default:
        return "General";
    }
  };

  // Organize tasks using AI
  const handleOrganizeTasks = async () => {
    if (filteredTasks.length === 0) {
      toast.error("No tasks to organize");
      return;
    }

    setIsOrganizing(true);
    setOrganizationNote(null);

    try {
      console.log("Starting task organization with tasks:", filteredTasks);

      const result = await organizeTasksWithAI(videoId, filteredTasks);

      console.log("Task organization result:", result);

      if (result.error) {
        console.error("Organization error:", result.error);
        toast.error(`Failed to organize tasks: ${result.error}`);
        return;
      }

      if (result.organizedTasks && result.organizedTasks.length > 0) {
        setOrganizedTasks(result.organizedTasks);

        // If there's a note about partial processing, show it
        if (result.note) {
          setOrganizationNote(result.note);
        }

        // Switch to the checklist tab
        setActiveTab("checklist");
        toast.success("Tasks organized successfully");
      } else {
        console.error("No organized tasks returned:", result);
        toast.error("Could not organize tasks");
      }
    } catch (error) {
      console.error("Error organizing tasks:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to organize tasks"
      );
    } finally {
      setIsOrganizing(false);
    }
  };

  // Determine if filtered view has any tasks
  const hasFilteredTasks = filter !== null && filteredTasks.length > 0;

  // Render the task list
  const renderTaskList = (tasks: Task[]) => {
    if (tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <ClipboardList className="w-10 h-10 mb-2" />
          <p className="text-sm">
            {filter
              ? `No ${filter} tasks found`
              : "No tasks yet. Save some information from the chat!"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task._id ? task._id : task.messageId}
            className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group"
          >
            <div className="flex items-start gap-3">
              {/* Completion checkbox */}
              <button
                onClick={() => handleToggleCompletion(task)}
                className="mt-1 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                )}
              </button>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      task.type === "script"
                        ? "bg-blue-100 text-blue-700"
                        : task.type === "title"
                          ? "bg-purple-100 text-purple-700"
                          : task.type === "thumbnail"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center">
                      {getTaskTypeIcon(task.type)}
                      <span className="ml-1">
                        {getTaskTypeLabel(task.type)}
                      </span>
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(task.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 space-y-1" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal pl-5 space-y-1"
                          {...props}
                        />
                      ),
                      li: ({ node, children, ...props }) => {
                        // Check if this is a checkbox item by examining the content
                        if (node?.children?.[0]?.type === "text") {
                          const content = (node.children[0] as any).value || "";
                          const isCheckbox =
                            content.trim().startsWith("[ ]") ||
                            content.trim().startsWith("[x]");

                          if (isCheckbox) {
                            const isChecked = content.trim().startsWith("[x]");
                            const textContent = content
                              .replace(/\[\s?\]|\[x\]/, "")
                              .trim();

                            return (
                              <li className="flex items-start gap-2" {...props}>
                                <div className="mt-0.5 flex-shrink-0">
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Square className="w-4 h-4 text-gray-300" />
                                  )}
                                </div>
                                <span>{textContent}</span>
                                {children}
                              </li>
                            );
                          }
                        }

                        // Regular list item
                        return (
                          <li className="my-1" {...props}>
                            {children}
                          </li>
                        );
                      },
                    }}
                  >
                    {task.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Task actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      task.content,
                      task._id ? task._id.toString() : task.messageId
                    )
                  }
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy to clipboard"
                >
                  {copiedTaskId ===
                  (task._id ? task._id.toString() : task.messageId) ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteTask(task)}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete task"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Task Manager</h2>

        {/* Organization button on the right */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleOrganizeTasks}
          disabled={isOrganizing || filteredTasks.length === 0}
        >
          {isOrganizing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          Organize with AI
        </Button>
      </div>

      {/* Main tabs for All, Filtered, and Checklist views */}
      <Tabs
        value={activeTab}
        onValueChange={(v: string) =>
          setActiveTab(v as "all" | "filtered" | "checklist")
        }
        className="flex flex-col flex-grow overflow-hidden"
      >
        <div className="px-4 pt-3 pb-0">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="filtered"
              className="text-xs"
              disabled={!hasFilteredTasks}
            >
              <Film className="w-3.5 h-3.5 mr-1.5" />
              {filter ? `${getTaskTypeLabel(filter)}` : "Filtered"}
            </TabsTrigger>
            <TabsTrigger
              value="checklist"
              className="text-xs"
              disabled={organizedTasks.length === 0}
            >
              <ListOrdered className="w-3.5 h-3.5 mr-1.5" />
              AI Checklist
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter buttons - only show in All Tasks tab */}
        {activeTab === "all" && (
          <div className="p-3 border-b border-t border-gray-100 flex flex-wrap gap-2 mt-3">
            <Button
              variant={filter === null ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilter(null);
                setActiveTab("all");
              }}
            >
              <ClipboardList className="w-3 h-3 mr-1" />
              All Types
            </Button>
            <Button
              variant={filter === "script" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilter("script");
                setActiveTab("filtered");
              }}
            >
              <Film className="w-3 h-3 mr-1" />
              Scripts
            </Button>
            <Button
              variant={filter === "title" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilter("title");
                setActiveTab("filtered");
              }}
            >
              <PenLine className="w-3 h-3 mr-1" />
              Titles
            </Button>
            <Button
              variant={filter === "thumbnail" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilter("thumbnail");
                setActiveTab("filtered");
              }}
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Thumbnails
            </Button>
          </div>
        )}

        {/* Tab contents */}
        <TabsContent
          value="all"
          className="flex-1 overflow-y-auto p-4 mt-0 h-[calc(100%-130px)]"
        >
          {renderTaskList(tasks.filter((task) => task.videoId === videoId))}
        </TabsContent>

        <TabsContent
          value="filtered"
          className="flex-1 overflow-y-auto p-4 mt-0 h-[calc(100%-130px)]"
        >
          {renderTaskList(filteredTasks)}
        </TabsContent>

        <TabsContent
          value="checklist"
          className="flex-1 overflow-y-auto p-4 mt-0 h-[calc(100%-130px)]"
        >
          {organizedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ListOrdered className="w-10 h-10 mb-2" />
              <p className="text-sm">
                No organized tasks yet. Click &quot;Organize with AI&quot; to
                create a workflow.
              </p>
            </div>
          ) : (
            <>
              {/* Actions bar with save button */}
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {isLoadedFromLocalStorage
                    ? "Checklist loaded from local storage"
                    : savedOrganizedItems && savedOrganizedItems.length > 0
                      ? `Saved checklist loaded (${savedOrganizedItems.length} items)`
                      : "Unsaved checklist"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleSaveOrganizedTasks}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckIcon className="w-3.5 h-3.5" />
                  )}
                  Save Checklist
                </Button>
              </div>

              {/* Note about partial processing if applicable */}
              {organizationNote && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{organizationNote}</p>
                  </div>
                </div>
              )}

              <OrganizedTaskChecklist
                tasks={tasks.filter((task) => task.videoId === videoId)}
                organizedTasks={organizedTasks}
                onReorganizeTasks={handleOrganizeTasks}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
