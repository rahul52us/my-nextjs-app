"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Text,
  Input,
  Select,
  VStack,
  HStack,
  SimpleGrid,
  Stack,
  Badge,
  Flex,
  Divider,
  useColorModeValue,
  useToast,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaTrash,
  FaSave,
  FaPlay,
  FaFolderOpen,
  FaTools,
} from "react-icons/fa";
import { features } from "../../../layoutComponent/utils/constant";

const WORKFLOW_STORAGE_KEY = "toolsWorkflowBuilder_savedWorkflows";

type WorkflowAction = {
  id: string;
  name: string;
  path: string;
  icon?: any;
};

type WorkflowStep = WorkflowAction & {
  stepNumber: number;
};

type SavedWorkflow = {
  id: string;
  name: string;
  description: string;
  steps: Omit<WorkflowStep, "icon">[];
  savedAt: string;
};

const WorkflowBuilderContent = () => {
  const router = useRouter();
  const toast = useToast();

  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedActionId, setSelectedActionId] = useState("");
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [builderHighlighted, setBuilderHighlighted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // ✅ All color mode values at top level — no conditional hook calls
  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const accentColor = useColorModeValue("teal.600", "teal.300");
  const stepBg = useColorModeValue("gray.50", "gray.700");
  const stepBorder = useColorModeValue("gray.200", "gray.600");
  const previewBg = useColorModeValue("white", "gray.800");
  const highlightBorder = useColorModeValue("teal.400", "teal.200");

  const availableActions: WorkflowAction[] = useMemo(() => {
    return Object.values(features)
      .flat()
      .filter((item: any) => item?.path && item?.name)
      .map((item: any) => ({
        id: item.path,
        name: item.name,
        path: item.path,
        icon: item.icon,
      }));
  }, []);

  // Set default selected action once actions are available
  useEffect(() => {
    if (!selectedActionId && availableActions.length > 0) {
      setSelectedActionId(availableActions[0].id);
    }
  }, [availableActions, selectedActionId]);

  // Load saved workflows from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (raw) {
      try {
        const parsed: SavedWorkflow[] = JSON.parse(raw);
        setSavedWorkflows(parsed);
      } catch (error) {
        console.warn("Unable to load saved workflows", error);
      }
    }
  }, []);

  const persistWorkflows = (workflows: SavedWorkflow[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
  };

  const addStep = () => {
    const action = availableActions.find((item) => item.id === selectedActionId);
    if (!action) {
      toast({ status: "error", title: "Please select a valid step." });
      return;
    }
    setSteps((prev) => [
      ...prev,
      { ...action, stepNumber: prev.length + 1 },
    ]);
    toast({ status: "success", title: "Step added to workflow." });
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    });
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
  };

  const saveWorkflow = () => {
    if (!workflowName.trim()) {
      toast({ status: "error", title: "Workflow name is required." });
      return;
    }
    if (steps.length === 0) {
      toast({ status: "error", title: "Add at least one step to save." });
      return;
    }

    const newWorkflow: SavedWorkflow = {
      id: `${Date.now()}`,
      name: workflowName.trim(),
      description: workflowDescription.trim(),
      steps: steps.map(({ id, name, path, stepNumber }) => ({
        id,
        name,
        path,
        stepNumber,
      })),
      savedAt: new Date().toISOString(),
    };

    const updated = [newWorkflow, ...savedWorkflows];
    setSavedWorkflows(updated);
    persistWorkflows(updated);
    toast({ status: "success", title: "Workflow saved successfully." });
  };

  const loadWorkflow = (workflow: SavedWorkflow) => {
    // Reset first to force re-render
    setSteps([]);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);

    const restoredSteps: WorkflowStep[] = workflow.steps.map((step) => {
      const action = availableActions.find(
        (item) =>
          item.id === step.id ||
          item.path === step.path ||
          item.name === step.name
      );
      return {
        id: step.id,
        name: step.name,
        path: step.path,
        stepNumber: step.stepNumber,
        icon: action?.icon ?? FaTools,
      };
    });

    setTimeout(() => {
      setSteps(restoredSteps);
      // Highlight builder panel briefly so user notices it updated
      setBuilderHighlighted(true);
      setTimeout(() => setBuilderHighlighted(false), 2000);
    }, 0);

    toast({
      status: "success",
      title: `✅ Workflow loaded: ${workflow.name}`,
      description: `${restoredSteps.length} step(s) restored in the builder above.`,
      duration: 3000,
    });

    // Scroll to top so user sees the builder panel
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteWorkflow = (workflowId: string) => {
    const updated = savedWorkflows.filter((wf) => wf.id !== workflowId);
    setSavedWorkflows(updated);
    persistWorkflows(updated);
    toast({ status: "success", title: "Workflow removed." });
  };

  const clearBuilder = () => {
    setWorkflowName("");
    setWorkflowDescription("");
    setSteps([]);
    toast({ status: "info", title: "Workflow cleared." });
  };

  const runWorkflow = () => {
    if (steps.length === 0) {
      toast({ status: "error", title: "Add at least one step before running." });
      return;
    }

    // Store workflow in sessionStorage for step navigation
    const workflowSession = {
      name: workflowName || "Untitled Workflow",
      steps: steps.map(({ id, name, path, stepNumber }) => ({
        id,
        name,
        path,
        stepNumber,
      })),
      currentStepIndex: 0,
      totalSteps: steps.length,
    };
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "workflowSession",
        JSON.stringify(workflowSession)
      );
    }

    setIsRunning(true);
    toast({
      status: "success",
      title: "Starting workflow...",
      description: `Opening step 1 of ${steps.length}`,
    });

    // Navigate to first step after a brief delay
    setTimeout(() => {
      router.push(steps[0].path);
    }, 500);
  };

  return (
    <Box minH="80vh" bg={pageBg} color={textColor} p={{ base: 4, md: 8 }}>
      <Heading size="2xl" mb={3} color={accentColor}>
        Workflow Builder
      </Heading>
      <Text mb={6} maxW="3xl">
        Build custom workflows by selecting the tools you need, ordering steps,
        and saving ready-to-use workflows. Use this panel to create your own
        automation flow the way you want.
      </Text>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
        {/* ── Left Panel: Builder ── */}
        <Box
          bg={cardBg}
          rounded="3xl"
          p={6}
          shadow="lg"
          borderWidth="2px"
          borderColor={builderHighlighted ? highlightBorder : "transparent"}
          transition="border-color 0.4s ease"
          id="workflow-builder-panel"
        >
          <Heading size="md" mb={4}>
            Build Your Workflow
          </Heading>
          <VStack spacing={4} align="stretch">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name"
              size="lg"
            />
            <Input
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Description (optional)"
              size="lg"
            />
            <Select
              value={selectedActionId}
              onChange={(e) => setSelectedActionId(e.target.value)}
              size="lg"
            >
              {availableActions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.name}
                </option>
              ))}
            </Select>
            <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={addStep}>
              Add Step
            </Button>

            <Box>
              <Heading size="sm" mb={3}>
                Workflow Steps
              </Heading>
              {steps.length === 0 ? (
                <Text color="gray.500">
                  No steps added yet. Choose a tool and click Add Step.
                </Text>
              ) : (
                <Stack spacing={3}>
                  {steps.map((step, index) => (
                    <Box
                      key={`${step.id}-${index}`}
                      p={4}
                      bg={stepBg}
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor={stepBorder}
                    >
                      <Flex align="center" justify="space-between" gap={3}>
                        <HStack spacing={3} align="center">
                          <Icon
                            as={step.icon || FaTools}
                            boxSize={5}
                            color={accentColor}
                          />
                          <Box>
                            <Text fontWeight="semibold">
                              {step.stepNumber}. {step.name}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {step.path}
                            </Text>
                          </Box>
                        </HStack>
                        <HStack spacing={1}>
                          <Tooltip label="Move up">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveStep(index, -1)}
                              isDisabled={index === 0}
                              aria-label="Move step up"
                            >
                              <FaArrowUp />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Move down">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveStep(index, 1)}
                              isDisabled={index === steps.length - 1}
                              aria-label="Move step down"
                            >
                              <FaArrowDown />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Remove step">
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeStep(index)}
                              aria-label="Remove step"
                            >
                              <FaTrash />
                            </Button>
                          </Tooltip>
                        </HStack>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <HStack spacing={3} wrap="wrap">
              <Button
                leftIcon={<FaSave />}
                colorScheme="teal"
                onClick={saveWorkflow}
              >
                Save Workflow
              </Button>
              <Button variant="outline" onClick={clearBuilder}>
                Clear
              </Button>
              <Button
                leftIcon={<FaPlay />}
                colorScheme="green"
                onClick={runWorkflow}
              >
                Finalize
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* ── Right Panel: Saved Workflows + Preview ── */}
        <Box bg={cardBg} rounded="3xl" p={6} shadow="lg">
          <Heading size="md" mb={4}>
            Saved Workflows
          </Heading>
          {savedWorkflows.length === 0 ? (
            <Text color="gray.500">
              No saved workflows yet. Save a workflow to see it here.
            </Text>
          ) : (
            <Stack spacing={4}>
              {savedWorkflows.map((workflow) => (
                <Box
                  key={workflow.id}
                  p={4}
                  bg={stepBg}
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor={stepBorder}
                >
                  <Flex align="center" justify="space-between" mb={3}>
                    <Box>
                      <Text fontWeight="bold">{workflow.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {workflow.description || "No description provided."}
                      </Text>
                    </Box>
                    <Badge colorScheme="green">
                      {workflow.steps.length} step(s)
                    </Badge>
                  </Flex>
                  <Text fontSize="xs" color="gray.500" mb={3}>
                    Saved on {new Date(workflow.savedAt).toLocaleString()}
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => loadWorkflow(workflow)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => deleteWorkflow(workflow.id)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Box>
              ))}
            </Stack>
          )}

          <Divider my={6} />

          <Box>
            <Heading size="sm" mb={3}>
              Workflow Preview
            </Heading>
            {steps.length === 0 ? (
              <Text color="gray.500">
                Add steps to see the workflow preview here.
              </Text>
            ) : (
              <Stack spacing={3}>
                {steps.map((step) => (
                  <Flex
                    key={`preview-${step.id}-${step.stepNumber}`}
                    align="center"
                    justify="space-between"
                    p={3}
                    bg={previewBg}
                    rounded="2xl"
                    borderWidth="1px"
                    borderColor={stepBorder}
                  >
                    <HStack spacing={3}>
                      <Icon
                        as={step.icon || FaTools}
                        boxSize={5}
                        color={accentColor}
                      />
                      <Box>
                        <Text fontWeight="semibold">
                          {step.stepNumber}. {step.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {step.path}
                        </Text>
                      </Box>
                    </HStack>
                    <Tooltip label="Open step">
                      <Button
                        size="sm"
                        leftIcon={<FaFolderOpen />}
                        onClick={() => router.push(step.path)}
                      >
                        Open
                      </Button>
                    </Tooltip>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

// ─ Floating Workflow Guide Component ─
// This component is placed in a layout wrapper so it appears on all pages
export const WorkflowGuide = () => {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [session, setSession] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load session from sessionStorage on mount and when pathname changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMounted(true);
    
    const raw = window.sessionStorage.getItem("workflowSession");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed);
      } catch (error) {
        console.warn("Unable to load workflow session", error);
      }
    }
  }, [pathname]);

  if (!isMounted || !session) return null;

  const currentStep = session.steps[session.currentStepIndex];
  const isLastStep = session.currentStepIndex === session.steps.length - 1;

  const handleNextStep = () => {
    // If last step, complete the workflow
    if (isLastStep) {
      handleEndWorkflow();
      return;
    }
    
    const nextIndex = session.currentStepIndex + 1;
    const nextStep = session.steps[nextIndex];
    
    if (!nextStep) {
      toast({ status: "error", title: "Error: Next step not found." });
      return;
    }

    const updated = { ...session, currentStepIndex: nextIndex };
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("workflowSession", JSON.stringify(updated));
    }
    
    toast({
      status: "success",
      title: `Moving to Step ${nextIndex + 1} of ${session.totalSteps}`,
      description: `Opening ${nextStep.name}...`,
      duration: 2000,
    });
    
    // Navigate after a small delay to ensure sessionStorage is updated
    setTimeout(() => {
      router.push(nextStep.path);
    }, 100);
  };

  const handleEndWorkflow = () => {
    // Immediately hide the popup
    setSession(null);
    
    // Clean up sessionStorage
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("workflowSession");
    }
    
    // Show completion message
    toast({
      status: "success",
      title: "✅ Workflow completed!",
      description: `Finished all ${session.totalSteps} step(s).`,
      duration: 3000,
    });
    
    // Navigate back to workflow builder
    setTimeout(() => {
      router.push("/tools/workflow");
    }, 300);
  };

  const handleCancelWorkflow = () => {
    // Immediately hide the popup
    setSession(null);
    
    // Clean up sessionStorage
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("workflowSession");
    }
    
    // Show cancellation message
    toast({
      status: "info",
      title: "Workflow cancelled",
      description: "Workflow has been stopped.",
      duration: 2000,
    });
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("teal.200", "teal.600");
  const accentColor = useColorModeValue("teal.600", "teal.300");

  return (
    <Box
      position="fixed"
      bottom={6}
      right={6}
      bg={bgColor}
      borderWidth="2px"
      borderColor={borderColor}
      rounded="2xl"
      p={4}
      shadow="2xl"
      maxW="350px"
      zIndex={50}
    >
      <HStack spacing={2} mb={3} justify="space-between">
        <VStack spacing={1} align="flex-start" flex={1}>
          <Text fontSize="sm" fontWeight="bold" color={accentColor}>
            Workflow: {session.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Step {session.currentStepIndex + 1} of {session.totalSteps}
          </Text>
          <Text fontSize="sm" fontWeight="semibold">
            {currentStep?.name}
          </Text>
        </VStack>
        <Box fontSize="2xl" fontWeight="bold" color={accentColor} minW="40px" textAlign="center">
          {session.currentStepIndex + 1}/{session.totalSteps}
        </Box>
      </HStack>
      <HStack spacing={2}>
        <Button
          size="sm"
          colorScheme={isLastStep ? "green" : "teal"}
          onClick={handleNextStep}
          width="full"
        >
          {isLastStep ? "✓ Complete" : "Next Step"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          onClick={handleCancelWorkflow}
        >
          End
        </Button>
      </HStack>
    </Box>
  );
};

export default WorkflowBuilderContent;
