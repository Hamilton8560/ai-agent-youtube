/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { Message, useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import { useSchematicFlag } from "@schematichq/schematic-react";
import { FeatureFlag } from "@/features/flags";
import {
  BotIcon,
  CheckIcon,
  CopyIcon,
  ImageIcon,
  LetterText,
  PenIcon,
  Send as PaperAirplaneIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useVideoTask } from "./VideoTaskContext";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  result?: Record<string, unknown>;
}

interface ToolPart {
  type: "tool-invocation";
  toolInvocation: ToolInvocation;
}

// This is our storage format compatible with Convex
interface StorableMessage {
  id: string;
  role: string;
  content?: string;
  createdAt: number;
  parts?: Array<
    | {
      type: "text";
      text: string;
    }
    | {
      type: "tool-invocation";
      toolInvocation: {
        toolCallId: string;
        toolName: string;
        result?: Record<string, unknown>;
      };
    }
  >;
}

const formatToolInvocation = (part: ToolPart) => {
  if (!part.toolInvocation) return "Unknown Tool";

  // Format based on tool type
  const toolName = part.toolInvocation.toolName;

  if (toolName === "dalleImageGeneration" || toolName.includes("image")) {
    return `🖼️ Image Generated`;
  }

  return `🔧 Tool Used: ${toolName}`;
};

// Convert AI SDK Message to Storable Message
const messageToStorable = (message: Message): StorableMessage => {
  console.log("Converting message to storable:", message);

  // Ensure createdAt is a number - extract timestamp if it's a Date object
  let createdAtTimestamp: number;
  if ((message as any).createdAt) {
    const createdAt = (message as any).createdAt;
    // Handle different formats of dates
    if (typeof createdAt === "number") {
      createdAtTimestamp = createdAt;
    } else if (createdAt instanceof Date) {
      createdAtTimestamp = createdAt.getTime();
    } else if (typeof createdAt === "string") {
      // Try to convert string date to timestamp
      createdAtTimestamp = new Date(createdAt).getTime();
    } else {
      // Fallback to current timestamp
      createdAtTimestamp = Date.now();
    }
  } else {
    // If no createdAt property, use current timestamp
    createdAtTimestamp = Date.now();
  }

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: createdAtTimestamp,
    // Use a more explicit type assertion for compatibility
    parts: message.parts
      ? (message.parts
        .map((part) => {
          if (part.type === "text") {
            return { type: "text", text: part.text } as const;
          } else if (part.type === "tool-invocation") {
            return {
              type: "tool-invocation",
              toolInvocation: {
                toolCallId: part.toolInvocation.toolCallId,
                toolName: part.toolInvocation.toolName,
                result: (part.toolInvocation as any).result as
                  | Record<string, unknown>
                  | undefined,
              },
            } as const;
          }
          // Handle any unknown part types by skipping them
          return null;
        })
        .filter(Boolean) as StorableMessage["parts"])
      : undefined,
  };
};

// Convert Storable Message to AI SDK Message
const storableToMessage = (storable: StorableMessage): Message => {
  console.log("Converting storable to message:", storable);

  // For simplicity and better compatibility with AI SDK
  // we'll just pass through most properties but convert createdAt
  // to ensure it's compatible with the AI SDK expectations

  return {
    id: storable.id,
    role: storable.role as "user" | "assistant" | "system" | "data",
    content: storable.content || "",
    parts: storable.parts,
    createdAt: new Date(storable.createdAt),
  } as unknown as Message;
};

function AiAgentChat({ videoId }: { videoId: string }) {
  // Scrolling to Bottom Logic
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Track which message is being copied (for button animation)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // For authentication
  const { userId, isSignedIn } = useAuth();

  // Access the video task context
  const { addMessageToSaved, setCurrentVideoId, addTask } = useVideoTask();

  // Convex functions for chat persistence
  const storeMessagesMutation = useMutation(api.chats.storeMessages);
  const storedChat = useQuery(
    api.chats.getChatByVideo,
    userId && videoId ? { videoId, userId } : "skip"
  );

  // Initial messages for the chat
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Setup chat with AI
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    status,
    setMessages,
  } = useChat({
    maxSteps: 5,
    initialMessages,
    body: {
      videoId,
    },
  });

  // Set the current video ID in the context
  useEffect(() => {
    setCurrentVideoId(videoId);
  }, [videoId, setCurrentVideoId]);

  // Load stored messages when component mounts
  useEffect(() => {
    console.log("Authentication state:", {
      userId,
      isSignedIn,
      hasStoredChat: !!storedChat,
      isInitialized,
    });

    // Always mark as initialized at the end of this effect
    const finishInitialization = () => {
      if (!isInitialized) {
        console.log("Setting isInitialized to true");
        setIsInitialized(true);
      }
    };

    if (!userId || !isSignedIn) {
      console.log("Not loading messages - not authenticated");
      finishInitialization();
      return;
    }

    // If there's a stored chat, load the messages
    if (storedChat && storedChat.messages && storedChat.messages.length > 0) {
      try {
        // Convert stored messages to AI SDK Message format
        const loadedMessages = (storedChat.messages as StorableMessage[]).map(
          storableToMessage
        );
        console.log("Loaded messages from storage:", loadedMessages.length);
        setInitialMessages(loadedMessages);
        setMessages(loadedMessages);
      } catch (error) {
        console.error("Error converting stored messages:", error);
      }
    } else {
      console.log("No stored chat found or empty messages");
    }

    // Always mark as initialized
    finishInitialization();
  }, [storedChat, userId, isSignedIn, isInitialized, setMessages]);

  // Add a ref to track which messages have been saved
  const savedMessageIdsRef = useRef<Set<string>>(new Set());

  // Manual save function for saving chat
  const saveChat = async () => {
    // Unique ID for this save operation to prevent multiple toasts
    const saveToastId = "save-chat-toast";

    console.log("Manual saveChat called", {
      userId,
      isSignedIn,
      messageCount: messages.length,
    });

    if (!userId || !isSignedIn || messages.length === 0) {
      toast.error("Cannot save chat", {
        id: saveToastId,
        description: isSignedIn
          ? "No messages to save"
          : "You must be signed in to save chats",
      });
      return null;
    }

    try {
      // Get the latest message ID for tracking
      const lastMessageId = messages[messages.length - 1].id;

      // If we've already saved this message set, don't save again
      // But still show a success toast to the user
      if (savedMessageIdsRef.current.has(lastMessageId)) {
        console.log(
          `Chat with last message ${lastMessageId} already saved, showing success toast`
        );
        toast.success("Chat already saved", {
          id: saveToastId,
          duration: 2000,
        });
        return true; // Return true to indicate success to the caller
      }

      // Convert AI SDK messages to storable format with proper timestamp handling
      const storableMessages = messages.map((msg) => {
        const storable = messageToStorable(msg);
        console.log(
          `Message ${msg.id} timestamp converted to:`,
          storable.createdAt
        );
        return storable;
      });

      toast.loading("Saving chat...", { id: saveToastId });
      console.log(
        "Manually saving chat with",
        storableMessages.length,
        "messages"
      );

      // Verify all messages have numeric timestamps before sending
      if (storableMessages.some((msg) => typeof msg.createdAt !== "number")) {
        throw new Error("Some messages have invalid timestamp formats");
      }

      const result = await storeMessagesMutation({
        videoId,
        userId,
        messages: storableMessages,
      });

      toast.success("Chat saved successfully", {
        id: saveToastId,
        duration: 2000,
      });

      // Mark this message set as saved
      savedMessageIdsRef.current.add(lastMessageId);

      console.log("Chat manually saved:", result);
      return result;
    } catch (error) {
      console.error("Error saving chat manually:", error);

      // Check for specific error types and provide friendly messages
      let errorMessage = "Failed to save chat";
      if (error instanceof Error) {
        if (
          error.message.includes("Date") &&
          error.message.includes("not a supported Convex type")
        ) {
          errorMessage = "Date format error. Please try again.";
        } else if (error.message.includes("invalid timestamp")) {
          errorMessage = "Invalid timestamp detected. Please try again.";
        }
      }

      toast.error(errorMessage, {
        id: saveToastId,
        duration: 3000,
      });
      return null;
    }
  };

  // Save messages to Convex when they change
  useEffect(() => {
    // We're removing auto-saving completely - this is just kept for logging
    console.log("Messages changed:", {
      userId,
      isSignedIn,
      messageCount: messages.length,
      isInitialized,
    });
  }, [messages, userId, isSignedIn, isInitialized]);

  const isScriptGenerationEnabled = useSchematicFlag(
    FeatureFlag.SCRIPT_GENERATION
  );
  const isImageGenerationEnabled = useSchematicFlag(
    FeatureFlag.IMAGE_GENERATION
  );
  const isTitleGenerationEnabled = useSchematicFlag(
    FeatureFlag.TITLE_GENERATIONS
  );

  // Function to copy text to clipboard
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show success toast
        toast.success("Copied to clipboard!", {
          duration: 2000,
          icon: <CheckIcon className="w-4 h-4" />,
        });

        // Set the copied message ID for animation
        setCopiedMessageId(messageId);

        // Reset after animation completes
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      },
      (err) => {
        toast.error("Failed to copy text", {
          duration: 2000,
        });
        console.error("Could not copy text: ", err);
      }
    );
  };

  useEffect(() => {
    if (bottomRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let toastId;

    switch (status) {
      case "submitted":
        toastId = toast("Agent is thinking...", {
          id: toastId,
          icon: <BotIcon className="w-4 h-4" />,
        });
        break;
      case "streaming":
        toastId = toast("Agent is replying...", {
          id: toastId,
          icon: <BotIcon className="w-4 h-4" />,
        });
        break;
      case "error":
        toastId = toast("Whoops! Something went wrong, please try again.", {
          id: toastId,
          icon: <BotIcon className="w-4 h-4" />,
        });
        break;
      case "ready":
        toast.dismiss(toastId);
        break;
    }
  }, [status]);

  // Function to save a message as a task
  const saveMessageAsTask = async (
    message: Message,
    type: "script" | "title" | "thumbnail" | "general"
  ) => {
    if (!message.content || !userId || !isSignedIn) return;

    // Add the message to saved messages
    addMessageToSaved(message);

    // Create a task in the database
    if (message.id) {
      await addTask({
        videoId,
        userId, // Use the actual user ID from Clerk
        messageId: message.id,
        content: message.content,
        type,
      });

      toast.success(`Saved as ${type} task!`, {
        duration: 2000,
        icon: <CheckIcon className="w-4 h-4" />,
      });
    }
  };

  const generateScript = async () => {
    const randomId = Math.random().toString(36).substring(2, 15);

    const userMessage: Message = {
      id: `generate-script-${randomId}`,
      role: "user",
      content:
        "Generate a step-by-step shooting script for this video that I can use on my own channel to produce a video that is similar to this one but original and unique, dont do any other steps such as generating a image, just generate the script only!",
    };

    // Save the current chat state first if authenticated
    if (isSignedIn && userId && messages.length > 0) {
      await saveChat();
    }

    append(userMessage);
  };

  const generateImage = async () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const userMessage: Message = {
      id: `generate-image-${randomId}`,
      role: "user",
      content: "Generate a thumbnail for this video",
    };

    // Save the current chat state first if authenticated
    if (isSignedIn && userId && messages.length > 0) {
      await saveChat();
    }

    append(userMessage);
  };

  const generateTitle = async () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const userMessage: Message = {
      id: `generate-title-${randomId}`,
      role: "user",
      content: "Generate a title for this video",
    };

    // Save the current chat state first if authenticated
    if (isSignedIn && userId && messages.length > 0) {
      await saveChat();
    }

    append(userMessage);
  };

  // Create a submit handler that will NOT auto-save
  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with input:", input);

    // Handle the regular submit - no auto-save afterward
    await handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="hidden lg:block px-4 pb-3 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">AI Agent</h2>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        ref={messagesContainerRef}
      >
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-gray-700">
                  Welcome to AI Agent Chat
                </h3>
                <p className="text-sm text-gray-500">
                  Ask any question about your video!
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] relative group ${m.role === "user" ? "bg-blue-500" : "bg-gray-100"
                  } rounded-2xl px-4 py-3`}
              >
                {/* Copy button - appears on hover */}
                <button
                  onClick={() => copyToClipboard(m.content || "", m.id)}
                  className={`absolute top-2 right-2 p-1 rounded-full cursor-pointer
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${m.role === "user" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 hover:bg-gray-300"}`}
                  title="Copy to clipboard"
                >
                  {copiedMessageId === m.id ? (
                    <CheckIcon
                      className={`w-3.5 h-3.5 ${m.role === "user" ? "text-white" : "text-gray-700"}`}
                    />
                  ) : (
                    <CopyIcon
                      className={`w-3.5 h-3.5 ${m.role === "user" ? "text-white" : "text-gray-700"}`}
                    />
                  )}
                </button>

                {/* Save to tasks button for assistant messages */}
                {m.role === "assistant" && m.content && (
                  <div className="absolute -right-1 top-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-md shadow-md border border-gray-200 p-1 flex flex-col gap-1">
                      <button
                        onClick={() => saveMessageAsTask(m, "script")}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-100 p-1 rounded"
                        title="Save as script"
                      >
                        <LetterText className="w-3 h-3" />
                        <span>Script</span>
                      </button>
                      <button
                        onClick={() => saveMessageAsTask(m, "title")}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-100 p-1 rounded"
                        title="Save as title"
                      >
                        <PenIcon className="w-3 h-3" />
                        <span>Title</span>
                      </button>
                      <button
                        onClick={() => saveMessageAsTask(m, "thumbnail")}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-100 p-1 rounded"
                        title="Save as thumbnail"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Thumbnail</span>
                      </button>
                      <button
                        onClick={() => saveMessageAsTask(m, "general")}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-100 p-1 rounded"
                        title="Save as task"
                      >
                        <BotIcon className="w-3 h-3" />
                        <span>Task</span>
                      </button>
                    </div>
                  </div>
                )}

                {m.parts && m.role === "assistant" ? (
                  // AI message
                  <div className="space-y-3">
                    {m.parts.map((part, i) =>
                      part.type === "text" ? (
                        <div key={i} className="prose prose-sm max-w-none">
                          <ReactMarkdown>{part.text}</ReactMarkdown>

                          {/* Add a copy button for this specific text part */}
                          <button
                            onClick={() =>
                              copyToClipboard(part.text, `${m.id}-part-${i}`)
                            }
                            className="mt-2 inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                          >
                            {copiedMessageId === `${m.id}-part-${i}` ? (
                              <CheckIcon className="w-3 h-3 mr-1" />
                            ) : (
                              <CopyIcon className="w-3 h-3 mr-1" />
                            )}
                            Copy this section
                          </button>
                        </div>
                      ) : part.type === "tool-invocation" ? (
                        <div
                          key={i}
                          className="bg-white/50 rounded-lg p-3 space-y-3 text-gray-800"
                        >
                          <div className="font-medium text-xs">
                            {formatToolInvocation(part as ToolPart)}
                          </div>
                          {(part as ToolPart).toolInvocation.result && (
                            <div>
                              {/* Special handling for image results */}
                              {((part as ToolPart).toolInvocation.toolName ===
                                "dalleImageGeneration" ||
                                (
                                  part as ToolPart
                                ).toolInvocation.toolName.includes("image")) &&
                                typeof (part as ToolPart).toolInvocation.result
                                  ?.imageUrl === "string" ? (
                                <div className="mt-2">
                                  <div className="relative w-full max-w-md aspect-video">
                                    <Image
                                      src={
                                        (part as ToolPart).toolInvocation.result
                                          ?.imageUrl as string
                                      }
                                      alt="Generated thumbnail"
                                      fill
                                      className="rounded-md object-contain border border-gray-100 shadow-sm"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <pre className="text-xs bg-white/75 p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(
                                    (part as ToolPart).toolInvocation.result,
                                    null,
                                    2
                                  )}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  // User message
                  <div className="prose prose-sm max-w-none text-white">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-100 p-4">
        <form onSubmit={handleChatSubmit} className="space-y-3">
          {/* Message input */}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={
                status === "streaming" || status === "submitted"
                  ? "AI is thinking..."
                  : "Ask me about your video..."
              }
              className={`w-full rounded-lg border ${status === "streaming" || status === "submitted"
                ? "bg-gray-50 border-gray-200"
                : "border-gray-200"
                } px-4 py-3 pr-16 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400`}
              disabled={status === "streaming" || status === "submitted"}
            />
            <div className="absolute right-2 top-2">
              {/* Buttons container */}
              <div className="flex items-center gap-2">
                {/* Submit button */}
                <button
                  type="submit"
                  className={`p-1.5 rounded-md transition-colors ${status === "streaming" || status === "submitted"
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    }`}
                  title={
                    status === "streaming" || status === "submitted"
                      ? "AI is thinking..."
                      : "Send message"
                  }
                  disabled={status === "streaming" || status === "submitted"}
                >
                  {status === "streaming" || status === "submitted" ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Loading indicator for AI response */}
          {(status === "streaming" || status === "submitted") && (
            <div className="flex items-center justify-start">
              <div className="text-xs text-gray-500 flex items-center">
                <div className="w-3 h-3 mr-2 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                AI is generating a response...
              </div>
            </div>
          )}

          {/* Actions under the input */}
          <div className="flex items-center justify-between space-x-2">
            {/* Left side: Save Chat button (better visibility) */}
            {messages.length > 0 && isSignedIn && (
              <button
                type="button"
                onClick={saveChat}
                className="text-sm px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center gap-1.5 transition-colors font-medium shadow-sm"
                disabled={status === "streaming" || status === "submitted"}
              >
                <CheckIcon className="w-3.5 h-3.5" />
                Save Chat
              </button>
            )}

            {/* Right side: Video-specific actions */}
            <div className="flex space-x-2 ml-auto">
              {isScriptGenerationEnabled && (
                <button
                  type="button"
                  onClick={generateScript}
                  className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${status === "streaming" || status === "submitted"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <PenIcon className="w-3.5 h-3.5" />
                  <span>Script</span>
                </button>
              )}
              {isTitleGenerationEnabled && (
                <button
                  type="button"
                  onClick={generateTitle}
                  className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${status === "streaming" || status === "submitted"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <LetterText className="w-3.5 h-3.5" />
                  <span>Title</span>
                </button>
              )}
              {isImageGenerationEnabled && (
                <button
                  type="button"
                  onClick={generateImage}
                  className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${status === "streaming" || status === "submitted"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Thumbnail</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AiAgentChat;
