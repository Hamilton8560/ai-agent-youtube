"use client";

import { useState } from "react";
import { OrganizedTask } from "@/actions/organizeTasksWithAI";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Indent,
  ChevronRight,
} from "lucide-react";
import { Task } from "./VideoTaskContext";
import { useVideoTask } from "./VideoTaskContext";
import { Transition } from "@headlessui/react";
import { Id } from "@/convex/_generated/dataModel";

interface OrganizedTaskChecklistProps {
  tasks: Task[];
  organizedTasks: OrganizedTask[];
  onReorganizeTasks: () => void;
}

export default function OrganizedTaskChecklist({
  tasks,
  organizedTasks,
  onReorganizeTasks,
}: OrganizedTaskChecklistProps) {
  const { toggleTaskCompletion } = useVideoTask();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(
    new Set()
  );

  // Find the task by ID
  const getTaskById = (id: string) => {
    return tasks.find((task) => task._id && task._id.toString() === id);
  };

  // Check if all previous tasks are completed
  const canProceedToStep = (order: number) => {
    if (order === 1) return true;

    const previousTasks = organizedTasks
      .filter((t) => t.order < order)
      .map((t) => getTaskById(t.id));

    return previousTasks.every((task) => task?.completed);
  };

  // Move to the next step
  const goToNextStep = () => {
    const nextStep = organizedTasks
      .filter((t) => t.order > currentStep)
      .sort((a, b) => a.order - b.order)[0]?.order;

    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  // Move to the previous step
  const goToPreviousStep = () => {
    const prevStep = organizedTasks
      .filter((t) => t.order < currentStep)
      .sort((a, b) => b.order - a.order)[0]?.order;

    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  // Handle task toggle with null check
  const handleToggleTask = async (
    taskId: Id<"tasks"> | undefined,
    completed: boolean
  ) => {
    if (!taskId) return;

    await toggleTaskCompletion(taskId, completed);

    // If task was completed and it's the current step, move to next step
    if (completed) {
      const currentTask = organizedTasks.find((t) => t.order === currentStep);
      if (currentTask && currentTask.id === taskId.toString()) {
        goToNextStep();
      }
    }
  };

  // Toggle task explanation visibility
  const toggleExpandTask = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  // Toggle parent task expansion
  const toggleParentExpansion = (parentId: string) => {
    const newExpandedParents = new Set(expandedParentIds);
    if (newExpandedParents.has(parentId)) {
      newExpandedParents.delete(parentId);
    } else {
      newExpandedParents.add(parentId);
    }
    setExpandedParentIds(newExpandedParents);
  };

  // Check if a task is a child of an expanded parent
  const isVisibleChild = (task: OrganizedTask) => {
    return task.parentId && expandedParentIds.has(task.parentId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">AI-Organized Workflow</h3>
        <button
          onClick={onReorganizeTasks}
          className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
        >
          Reorganize
        </button>
      </div>

      <div className="p-2 flex-1 overflow-hidden flex flex-col">
        {/* Step indicator */}
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Step {currentStep} of {organizedTasks.length}
          </div>
          <button
            onClick={goToNextStep}
            disabled={currentStep === organizedTasks.length}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pb-4">
          {organizedTasks
            .sort((a, b) => a.order - b.order)
            .filter((orgTask) => orgTask.isParent || isVisibleChild(orgTask)) // Only display parent tasks and visible children
            .map((orgTask) => {
              const task = getTaskById(orgTask.id);
              const isCurrentStep = orgTask.order === currentStep;
              const canProceed = canProceedToStep(orgTask.order);
              const isExpanded = expandedTaskId === orgTask.id;
              const isParent = orgTask.isParent;
              const isChild = !!orgTask.parentId;
              const isExpandedParent =
                isParent && expandedParentIds.has(orgTask.id);

              if (!task && !isChild) return null; // If it's a parent, we need a task

              return (
                <div
                  key={orgTask.id}
                  className={`border rounded-md overflow-hidden transition-all ${
                    isCurrentStep
                      ? "border-blue-200 bg-blue-50"
                      : task?.completed
                        ? "border-green-100 bg-green-50"
                        : "border-gray-100"
                  } ${!canProceed && task && !task.completed ? "opacity-60" : ""} ${
                    isChild ? "ml-8 border-l-4 border-l-blue-200" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {task ? (
                        <button
                          onClick={() =>
                            canProceed &&
                            handleToggleTask(task._id, !task.completed)
                          }
                          disabled={!canProceed}
                          className="focus:outline-none"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle
                              className={`w-5 h-5 ${canProceed ? "text-gray-300 hover:text-gray-400" : "text-gray-200"}`}
                            />
                          )}
                        </button>
                      ) : isChild ? (
                        // Child steps that don't have tasks yet
                        <Indent className="w-5 h-5 text-blue-300" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-sm font-medium ${task?.completed ? "text-green-600 line-through" : isParent ? "text-gray-800" : "text-gray-700"}`}
                        >
                          {orgTask.order}. {orgTask.content}
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              orgTask.type === "script"
                                ? "bg-blue-100 text-blue-700"
                                : orgTask.type === "title"
                                  ? "bg-purple-100 text-purple-700"
                                  : orgTask.type === "thumbnail"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {orgTask.type}
                          </span>

                          {isParent && (
                            <button
                              onClick={() => toggleParentExpansion(orgTask.id)}
                              className="p-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                              title={
                                isExpandedParent
                                  ? "Collapse subtasks"
                                  : "Expand subtasks"
                              }
                            >
                              {isExpandedParent ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => toggleExpandTask(orgTask.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            {isExpanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <Transition
                        show={isExpanded}
                        enter="transition-all duration-200 ease-out"
                        enterFrom="max-h-0 opacity-0"
                        enterTo="max-h-[800px] opacity-100"
                        leave="transition-all duration-150 ease-in"
                        leaveFrom="max-h-[800px] opacity-100"
                        leaveTo="max-h-0 opacity-0"
                      >
                        <div className="overflow-y-auto mt-2 text-xs text-gray-600 bg-white/80 p-2 rounded flex flex-col gap-2">
                          {/* Reason for this task's position */}
                          <div className="flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium">
                                Why this step:
                              </span>{" "}
                              {orgTask.reason}
                            </div>
                          </div>

                          {/* Expanded steps if available - only show for parent tasks that are not already expanded */}
                          {isParent &&
                            orgTask.expandedSteps &&
                            orgTask.expandedSteps.length > 0 &&
                            !isExpandedParent && (
                              <div className="mt-2 max-h-[400px] overflow-y-auto pr-2">
                                <div className="font-medium mb-1 text-gray-700 flex items-center">
                                  <span>Expanded Steps:</span>
                                  <button
                                    onClick={() =>
                                      toggleParentExpansion(orgTask.id)
                                    }
                                    className="ml-2 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1 hover:bg-blue-100"
                                  >
                                    <ChevronDown size={12} /> Show as tasks
                                  </button>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                  {orgTask.expandedSteps.map((step, idx) => (
                                    <li key={idx} className="text-gray-600">
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
