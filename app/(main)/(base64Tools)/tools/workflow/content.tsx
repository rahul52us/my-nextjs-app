"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box, Button, Heading, Text, Input, VStack, HStack, SimpleGrid,
  Badge, Flex, useColorModeValue, useToast, Icon,
  InputGroup, InputLeftElement, Switch, IconButton,
  FormControl, FormLabel, Select, Drawer, DrawerBody,
  DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  useDisclosure, Tooltip, Divider, Collapse
} from "@chakra-ui/react";
import {
  FaTrash, FaPlay, FaTools, FaSearch, FaArrowRight, FaEdit,
  FaArrowUp, FaArrowDown, FaPlusCircle, FaExclamationTriangle,
  FaTimes, FaChevronRight, FaFileAlt, FaCheckCircle, FaUndo
} from "react-icons/fa";
import { features } from "../../../layoutComponent/utils/constant";
import { AUTH_TOKEN } from "../../../../config/utils/variables";

type OutputType =
  | "pdf" | "word" | "image" | "audio" | "video"
  | "text" | "base64" | "hex" | "ascii" | "binary"
  | "json" | "csv" | "excel" | "html" | "zip"
  | "qr" | "barcode" | "url" | "hash" | "jwt" | "any";

function detectOutputType(name: string, path: string): OutputType {
  const n = (name + " " + path)
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (n.includes("to pdf") || n.includes("-to-pdf")) return "pdf";
  if (n.includes("to word") || n.includes("to doc") || n.includes("-to-word") || n.includes("-to-doc")) return "word";
  if (n.includes("to image") || n.includes("to jpg") || n.includes("to png") || n.includes("to jpeg") || n.includes("to webp") || n.includes("to svg") || n.includes("-to-image") || n.includes("-to-jpg") || n.includes("-to-png")) return "image";
  if (n.includes("to audio") || n.includes("to mp3") || n.includes("to wav") || n.includes("-to-audio")) return "audio";
  if (n.includes("to video") || n.includes("to mp4") || n.includes("-to-video")) return "video";
  if (n.includes("to base64") || n.includes("-to-base64")) return "base64";
  if (n.includes("to hex") || n.includes("-to-hex")) return "hex";
  if (n.includes("to ascii") || n.includes("-to-ascii")) return "ascii";
  if (n.includes("to binary") || n.includes("-to-binary")) return "binary";
  if (n.includes("to json") || n.includes("-to-json")) return "json";
  if (n.includes("to csv") || n.includes("-to-csv")) return "csv";
  if (n.includes("to excel") || n.includes("to xlsx") || n.includes("-to-excel")) return "excel";
  if (n.includes("to html") || n.includes("-to-html")) return "html";
  if (n.includes("to zip") || n.includes("to tar") || n.includes("-to-zip")) return "zip";
  if (n.includes("to text") || n.includes("-to-text")) return "text";
  if (n.includes("qr") && (n.includes("generat") || n.includes("creat"))) return "qr";
  if (n.includes("barcode") && (n.includes("generat") || n.includes("creat"))) return "barcode";
  if (n.includes("url") && n.includes("shorten")) return "url";
  if (n.includes("hash") || n.includes("md5") || n.includes("sha")) return "hash";
  if (n.includes("jwt")) return "jwt";
  return "any";
}

function detectInputType(name: string, path: string): OutputType[] {
  const n = (name + " " + path)
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const inputs: OutputType[] = [];

  if (n.startsWith("pdf") || n.includes("pdf to") || n.includes("compress pdf") || n.includes("merge pdf") || n.includes("split pdf") || n.includes("rotate pdf") || n.includes("watermark pdf")) inputs.push("pdf");
  if (n.includes("word to") || n.includes("doc to") || n.includes("docx")) inputs.push("word");
  if (n.includes("image to") || n.includes("jpg to") || n.includes("png to") || n.includes("jpeg to") || n.includes("webp to") || n.includes("svg to") || n.includes("compress image") || n.includes("resize image") || n.includes("crop image")) inputs.push("image");
  if (n.includes("audio to") || n.includes("mp3 to") || n.includes("wav to")) inputs.push("audio");
  if (n.includes("video to") || n.includes("mp4 to")) inputs.push("video");
  if (n.includes("base64 to") || n.startsWith("base64")) inputs.push("base64");
  if (n.includes("hex to")) inputs.push("hex");
  if (n.includes("ascii to")) inputs.push("ascii");
  if (n.includes("binary to")) inputs.push("binary");
  if (n.includes("json to") || n.includes("json format") || n.includes("json valid") || n.includes("json minif")) inputs.push("json");
  if (n.includes("csv to") || n.includes("excel to") || n.includes("xlsx to")) inputs.push("csv", "excel");
  if (n.includes("html to") || n.includes("html format") || n.includes("html minif")) inputs.push("html");
  if (n.includes("text to") || n.includes("txt to") || n.includes("case convert") || n.includes("word count") || n.includes("string") || n.includes("lorem")) inputs.push("text");
  if (n.includes("hash") || n.includes("md5") || n.includes("sha")) inputs.push("text", "hash");
  if (n.includes("jwt")) inputs.push("jwt", "text");
  if ((n.includes("qr") || n.includes("barcode")) && n.includes("read")) inputs.push("qr", "barcode");
  if (n.includes("url decode") || n.includes("url encode")) inputs.push("url", "text");
  if (n.includes("unzip") || n.includes("extract zip") || n.includes("zip to")) inputs.push("zip");

  if (inputs.length === 0) inputs.push("any");
  return inputs;
}

function isCompatible(outType: OutputType, inTypes: OutputType[]): boolean {
  if (outType === "any" || inTypes.includes("any")) return true;
  return inTypes.includes(outType);
}

function isStrictDrawerCompatible(outType: OutputType, inTypes: OutputType[]): boolean {
  // Drawer me sirf exact type match show karo; "any" ko include mat karo.
  if (outType === "any") return false;
  return inTypes.includes(outType);
}

type WorkflowAction = {
  id: string;
  name: string;
  path: string;
  icon?: any;
  outputType: OutputType;
  inputTypes: OutputType[];
};

type WorkflowStep = WorkflowAction & {
  stepNumber: number;
  settings?: Record<string, any>;
};

type SavedWorkflow = {
  id: string;
  name: string;
  description: string;
  steps: (Omit<WorkflowStep, "icon" | "outputType" | "inputTypes"> & { settings?: Record<string, any> })[];
  savedAt: string;
  isActive?: boolean;
};

const isWorkflowDebugEnabled = () => {
  if (typeof window === "undefined") return false;
  const queryFlag = new URLSearchParams(window.location.search).get("workflowDebug");
  const storageFlag = localStorage.getItem("workflow_debug");
  return queryFlag === "1" || storageFlag === "1";
};

const workflowDebug = (label: string, payload?: unknown) => {
  if (!isWorkflowDebugEnabled()) return;
  const time = new Date().toISOString();
  if (payload === undefined) {
    console.log(`[WorkflowDebug][${time}] ${label}`);
    return;
  }
  console.log(`[WorkflowDebug][${time}] ${label}`, payload);
};

const WorkflowBuilderContent = () => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const [view, setView] = useState<"list" | "edit">("list");
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── NEW: override to show all tools ignoring compatibility filter ──
  const [showAllTools, setShowAllTools] = useState(false);

  const getAuthHeaders = () => {
    const tokenKey = AUTH_TOKEN || "auth_token";
    const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Theme colors
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const stepBorder = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("white", "gray.700");
  const badgeBg = useColorModeValue("blue.50", "blue.900");
  const badgeColor = useColorModeValue("blue.700", "blue.100");
  const badgeBorder = useColorModeValue("blue.100", "blue.700");
  const timelineBg = useColorModeValue("blue.500", "blue.400");

  const availableActions: WorkflowAction[] = useMemo(() => {
    const actions = Object.values(features)
      .flat()
      .filter((item: any) => item?.path && item?.name)
      .map((item: any) => ({
        id: item.path,
        name: item.name,
        path: item.path,
        icon: item.icon,
        outputType: detectOutputType(item.name, item.path),
        inputTypes: detectInputType(item.name, item.path),
      }));
    workflowDebug("availableActions computed", {
      total: actions.length,
      sample: actions.slice(0, 20).map((a) => ({
        name: a.name,
        path: a.path,
        outputType: a.outputType,
        inputTypes: a.inputTypes,
      })),
    });
    return actions;
  }, []);

  // Organize actions by categories from features object
  const categorizedActions = useMemo(() => {
    const result: Record<string, WorkflowAction[]> = {};
    Object.entries(features).forEach(([category, list]: [string, any]) => {
      const filtered = list
        .filter((item: any) => item?.path && item?.name)
        .map((item: any) => {
          const action = availableActions.find((a) => a.id === item.path);
          return action;
        })
        .filter(Boolean) as WorkflowAction[];

      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    workflowDebug("categorizedActions computed", {
      categories: Object.keys(result).length,
      counts: Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length])),
    });
    return result;
  }, [availableActions]);

  // ── NEW: output type of the last added step (null = no steps yet) ──
  const drawerFilterType = useMemo((): OutputType | null => {
    if (steps.length === 0 || showAllTools) return null;
    return steps[steps.length - 1].outputType;
  }, [steps, showAllTools]);

  // Filter actions: by search query AND (when steps exist) by compatibility
  const filteredCategorizedActions = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const result: Record<string, WorkflowAction[]> = {};
    Object.entries(categorizedActions).forEach(([category, list]) => {
      const matches = list.filter((action) => {
        // 1. Search filter
        const matchesSearch =
          !query ||
          action.name.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query);

        // 2. Compatibility filter — only when drawerFilterType is set
        const matchesCompat =
          drawerFilterType === null ||
          isStrictDrawerCompatible(drawerFilterType, action.inputTypes);

        return matchesSearch && matchesCompat;
      });
      if (matches.length > 0) {
        result[category] = matches;
      }
    });
    workflowDebug("filteredCategorizedActions computed", {
      query,
      drawerFilterType,
      showAllTools,
      totalAfterFilter: Object.values(result).reduce((sum, list) => sum + list.length, 0),
      perCategory: Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length])),
      first20: Object.values(result)
        .flat()
        .slice(0, 20)
        .map((a) => ({
          name: a.name,
          path: a.path,
          outputType: a.outputType,
          inputTypes: a.inputTypes,
        })),
    });
    return result;
  }, [categorizedActions, searchQuery, drawerFilterType]);

  // Total compatible tool count (for empty-state messaging)
  const compatibleToolCount = useMemo(() => {
    return Object.values(filteredCategorizedActions).reduce((sum, list) => sum + list.length, 0);
  }, [filteredCategorizedActions]);

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const { data } = await axios.get("/workflows", { headers: getAuthHeaders() });
        setSavedWorkflows(data?.data || []);
        workflowDebug("loadWorkflows success", {
          count: Array.isArray(data?.data) ? data.data.length : 0,
        });
      } catch {
        setSavedWorkflows([]);
        workflowDebug("loadWorkflows failed");
      }
    };
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (!isWorkflowDebugEnabled()) return;
    workflowDebug("debug mode enabled", {
      path: typeof window !== "undefined" ? window.location.pathname : "",
      search: typeof window !== "undefined" ? window.location.search : "",
      featureCategories: Object.keys(features).length,
      tokenKey: AUTH_TOKEN || "auth_token",
      hasToken: typeof window !== "undefined" ? Boolean(localStorage.getItem(AUTH_TOKEN || "auth_token")) : false,
    });
  }, []);

  useEffect(() => {
    workflowDebug("steps changed", {
      totalSteps: steps.length,
      steps: steps.map((s) => ({
        stepNumber: s.stepNumber,
        name: s.name,
        path: s.path,
        outputType: s.outputType,
        inputTypes: s.inputTypes,
      })),
    });
  }, [steps]);

  useEffect(() => {
    workflowDebug("drawer filter changed", {
      drawerFilterType,
      showAllTools,
      searchQuery,
      compatibleToolCount,
    });
  }, [drawerFilterType, showAllTools, searchQuery, compatibleToolCount]);

  const addStep = (action: WorkflowAction) => {
    let settings = {};
    const slug = action.path.split("/").pop()?.toLowerCase() || "";
    if (slug.includes("compression") || slug.includes("pdf-to-jpg")) settings = { quality: 80 };
    if (slug.includes("split")) settings = { pageRange: "" };
    if (slug.includes("rotate")) settings = { angle: 90 };
    if (slug.includes("watermark")) settings = { watermarkText: "ToolSahayata" };

    setSteps((prev) => [...prev, { ...action, stepNumber: prev.length + 1, settings }]);
    workflowDebug("addStep", {
      added: {
        name: action.name,
        path: action.path,
        outputType: action.outputType,
        inputTypes: action.inputTypes,
      },
      previousLastStepOutput: steps.length > 0 ? steps[steps.length - 1].outputType : null,
    });
    onDrawerClose();
    setSearchQuery("");
    setShowAllTools(false); // reset override after adding
    toast({
      position: "bottom-right",
      title: `${action.name} added to workflow.`,
      status: "success",
      duration: 2000,
    });
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev.filter((_, idx) => idx !== index).map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    setSteps((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    });
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    setSteps((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    });
  };

  const updateStepSetting = (index: number, key: string, value: any) => {
    setSteps((prev) => prev.map((s, i) => i === index ? { ...s, settings: { ...s.settings, [key]: value } } : s));
  };

  const toggleWorkflowStatus = (id: string) => {
    const updateStatus = async () => {
      const target = savedWorkflows.find((wf) => wf.id === id);
      if (!target) return;
      try {
        const { data } = await axios.put(
          `/workflows/${id}`,
          { isActive: !target.isActive },
          { headers: getAuthHeaders() }
        );
        setSavedWorkflows((prev) => prev.map((wf) => (wf.id === id ? data.data : wf)));
        toast({
          status: "success",
          title: `Workflow ${!target.isActive ? "enabled" : "disabled"} successfully.`,
          duration: 2000,
        });
      } catch {
        toast({ status: "error", title: "Failed to update workflow status." });
      }
    };
    updateStatus();
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) { toast({ status: "error", title: "Workflow name is required." }); return null; }
    if (steps.length === 0) { toast({ status: "error", title: "Add at least one step to save." }); return null; }

    const mappedSteps = steps.map(({ id, name, path, stepNumber, settings }) => ({ id, name, path, stepNumber, settings }));

    try {
      if (editingWorkflowId) {
        const { data } = await axios.put(
          `/workflows/${editingWorkflowId}`,
          { name: workflowName.trim(), description: workflowDescription.trim(), steps: mappedSteps },
          { headers: getAuthHeaders() }
        );
        const updatedWorkflow = data.data;
        setSavedWorkflows((prev) => prev.map((wf) => (wf.id === editingWorkflowId ? updatedWorkflow : wf)));
        toast({ status: "success", title: "Workflow updated successfully." });
        return updatedWorkflow;
      }

      const { data } = await axios.post(
        "/workflows",
        { name: workflowName.trim(), description: workflowDescription.trim(), steps: mappedSteps, isActive: true },
        { headers: getAuthHeaders() }
      );
      const createdWorkflow = data.data;
      setSavedWorkflows((prev) => [createdWorkflow, ...prev]);
      toast({ status: "success", title: "Workflow created successfully." });
      return createdWorkflow;
    } catch {
      toast({ status: "error", title: "Failed to save workflow." });
      return null;
    }
  };

  const loadWorkflow = (workflow: SavedWorkflow) => {
    setSteps([]);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description || "");
    const restoredSteps: WorkflowStep[] = workflow.steps.map((step) => {
      const action = availableActions.find(
        (item) => item.id === step.id || item.path === step.path || item.name === step.name
      );
      return {
        id: step.id, name: step.name, path: step.path, stepNumber: step.stepNumber,
        icon: action?.icon ?? FaTools,
        outputType: action?.outputType ?? "any",
        inputTypes: action?.inputTypes ?? ["any"],
        settings: step.settings,
      };
    });
    setSteps(restoredSteps);
  };

  const deleteWorkflow = (workflowId: string) => {
    const deleteAction = async () => {
      try {
        await axios.delete(`/workflows/${workflowId}`, { headers: getAuthHeaders() });
        setSavedWorkflows((prev) => prev.filter((wf) => wf.id !== workflowId));
        toast({ status: "success", title: "Workflow removed." });
      } catch {
        toast({ status: "error", title: "Failed to delete workflow." });
      }
    };
    deleteAction();
  };

  const clearBuilder = () => {
    setWorkflowName(""); setWorkflowDescription(""); setSteps([]);
  };

  const runWorkflowAction = (workflow: SavedWorkflow) => {
    if (!workflow.isActive) {
      toast({ status: "warning", title: "Workflow is disabled", description: "Please enable the status toggle to run this workflow." });
      return;
    }
    router.push(`/tools/workflow/run/${workflow.id}`);
  };

  // Check if steps have compatibility issues
  const compatibilityIssues = useMemo(() => {
    const issues: Record<number, string> = {};
    const debugPairs: Array<Record<string, unknown>> = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const current = steps[i];
      const next = steps[i + 1];
      const compatible = isCompatible(current.outputType, next.inputTypes);
      debugPairs.push({
        fromStep: i + 1,
        fromName: current.name,
        out: current.outputType,
        toStep: i + 2,
        toName: next.name,
        in: next.inputTypes,
        compatible,
      });
      if (!compatible) {
        issues[i + 1] = `Step ${i + 1} outputs '${current.outputType.toUpperCase()}', but Step ${i + 2} requires [${next.inputTypes.map(t => t.toUpperCase()).join(", ")}]`;
      }
    }
    workflowDebug("compatibilityIssues computed", {
      totalIssues: Object.keys(issues).length,
      pairs: debugPairs,
    });
    return issues;
  }, [steps]);

  const hasAnyIssues = Object.keys(compatibilityIssues).length > 0;

  const renderSettingsUI = (step: WorkflowStep, index: number) => {
    const slug = step.path.split("/").pop()?.toLowerCase() || "";

    if (slug.includes("compression") || slug.includes("pdf-to-jpg")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Compression quality:</Text>
          <Select size="xs" bg={inputBg} color={textColor} rounded="md" value={step.settings?.quality || 80} onChange={(e) => updateStepSetting(index, "quality", parseInt(e.target.value))}>
            <option value={90}>Low (Best Quality)</option>
            <option value={80}>Normal (Recommended)</option>
            <option value={50}>High (Smallest File)</option>
            <option value={20}>Extreme (Lowest Quality)</option>
          </Select>
        </VStack>
      );
    }

    if (slug.includes("split")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Split range:</Text>
          <Input size="xs" bg={inputBg} color={textColor} rounded="md" placeholder="e.g. 1-3, 5-8" value={step.settings?.pageRange || ""} onChange={(e) => updateStepSetting(index, "pageRange", e.target.value)} />
        </VStack>
      );
    }

    if (slug.includes("rotate")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Rotation angle:</Text>
          <Select size="xs" bg={inputBg} color={textColor} rounded="md" value={step.settings?.angle || 90} onChange={(e) => updateStepSetting(index, "angle", parseInt(e.target.value))}>
            <option value={90}>90° Clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° Clockwise</option>
          </Select>
        </VStack>
      );
    }

    if (slug.includes("watermark")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Watermark text:</Text>
          <Input size="xs" bg={inputBg} color={textColor} rounded="md" value={step.settings?.watermarkText || ""} onChange={(e) => updateStepSetting(index, "watermarkText", e.target.value)} />
        </VStack>
      );
    }

    return null;
  };

  // ── helper: reset drawer state when it closes ──
  const handleDrawerClose = () => {
    onDrawerClose();
    setSearchQuery("");
    setShowAllTools(false);
  };

  return (
    <Box minH="90vh" bg={pageBg} color={textColor} py={{ base: 6, md: 10 }} px={{ base: 4, md: 8, lg: 12 }}>
      {view === "list" && (
        <Box maxW="6xl" mx="auto">
          {/* Header */}
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <VStack align="flex-start" spacing={1}>
              <Heading size="xl" fontWeight="extrabold" letterSpacing="tight" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                Workflows
              </Heading>
              <Text color={subTextColor} fontSize="md">
                Automate your document processing pipeline by combining your favorite tools.
              </Text>
            </VStack>
            <Button
              bgGradient="linear(to-r, blue.500, purple.600)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, blue.600, purple.700)", transform: "translateY(-1px)", boxShadow: "lg" }}
              _active={{ transform: "translateY(0)" }}
              onClick={() => { clearBuilder(); setEditingWorkflowId(null); setView("edit"); }}
              size="md"
              fontWeight="bold"
              leftIcon={<FaPlusCircle />}
              transition="all 0.2s"
            >
              Create New Workflow
            </Button>
          </Flex>

          {/* Workflow Cards */}
          <VStack spacing={6} align="stretch">
            {savedWorkflows.length === 0 ? (
              <Box bg={cardBg} p={12} rounded="2xl" textAlign="center" borderWidth="1px" borderColor={stepBorder} shadow="sm">
                <Icon as={FaTools} boxSize={12} color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No workflows yet</Heading>
                <Text color={subTextColor} maxW="md" mx="auto" mb={6}>
                  Simplify tasks by connecting tools into one automated pipeline. Set up each step, fine-tune your settings, and save.
                </Text>
                <Button variant="outline" colorScheme="blue" onClick={() => { clearBuilder(); setEditingWorkflowId(null); setView("edit"); }}>
                  Create your first workflow
                </Button>
              </Box>
            ) : (
              savedWorkflows.map((workflow) => {
                return (
                  <Box
                    key={workflow.id}
                    bg={cardBg}
                    p={{ base: 5, md: 6 }}
                    rounded="2xl"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor={stepBorder}
                    transition="all 0.2s"
                    _hover={{ shadow: "md", borderColor: "blue.400" }}
                    position="relative"
                    overflow="hidden"
                  >
                    <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4} mb={4}>
                      <VStack align="flex-start" spacing={1} flex="1">
                        <HStack spacing={3}>
                          <Heading size="md" color={textColor} fontWeight="bold">
                            {workflow.name}
                          </Heading>
                          <Badge colorScheme={workflow.isActive ? "green" : "gray"} rounded="full" px={2} py={0.5} fontSize="10px">
                            {workflow.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </HStack>
                        <Text color={subTextColor} fontSize="sm">
                          {workflow.description || "No description provided."}
                        </Text>
                      </VStack>

                      <HStack spacing={3} align="center">
                        <HStack spacing={1}>
                          <Text fontSize="xs" fontWeight="semibold" color={subTextColor}>Status:</Text>
                          <Switch colorScheme="green" isChecked={workflow.isActive} onChange={() => toggleWorkflowStatus(workflow.id)} size="sm" />
                        </HStack>
                        <Divider orientation="vertical" h="20px" borderColor={stepBorder} />
                        <HStack spacing={2}>
                          <Tooltip label="Run Workflow" hasArrow>
                            <IconButton
                              aria-label="Run"
                              icon={<FaPlay />}
                              size="sm"
                              colorScheme="green"
                              isDisabled={!workflow.isActive}
                              onClick={() => runWorkflowAction(workflow)}
                              rounded="lg"
                            />
                          </Tooltip>
                          <Tooltip label="Edit" hasArrow>
                            <IconButton
                              aria-label="Edit"
                              icon={<FaEdit />}
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => { loadWorkflow(workflow); setEditingWorkflowId(workflow.id); setView("edit"); }}
                              rounded="lg"
                            />
                          </Tooltip>
                          <Tooltip label="Delete" hasArrow>
                            <IconButton
                              aria-label="Delete"
                              icon={<FaTrash />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => deleteWorkflow(workflow.id)}
                              rounded="lg"
                            />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    </Flex>

                    {/* Timeline visualization of workflow steps */}
                    <Box pt={2} borderTopWidth="1px" borderColor={stepBorder}>
                      <Text fontSize="xs" fontWeight="bold" color={subTextColor} mb={3}>
                        STEPS PIPELINE:
                      </Text>
                      <Flex flexWrap="wrap" align="center" gap={3}>
                        {workflow.steps.map((step, idx) => {
                          const action = availableActions.find((a) => a.id === step.id || a.path === step.path || a.name === step.name);
                          const stepIcon = action?.icon ?? FaTools;

                          return (
                            <React.Fragment key={step.id + "-" + idx}>
                              <HStack
                                bg={useColorModeValue("gray.50", "gray.750")}
                                px={3}
                                py={2}
                                rounded="xl"
                                borderWidth="1px"
                                borderColor={stepBorder}
                                spacing={2.5}
                                shadow="xs"
                              >
                                <Icon as={stepIcon} color="blue.500" boxSize={3.5} />
                                <VStack align="flex-start" spacing={0}>
                                  <Text fontSize="xs" fontWeight="bold" noOfLines={1} maxW="150px">
                                    {step.name}
                                  </Text>
                                  {step.settings && Object.keys(step.settings).length > 0 && (
                                    <Text fontSize="9px" color="gray.500">
                                      custom settings
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                              {idx < workflow.steps.length - 1 && (
                                <Icon as={FaArrowRight} boxSize={3.5} color="blue.400" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </Flex>
                    </Box>
                  </Box>
                );
              })
            )}
          </VStack>
        </Box>
      )}

      {view === "edit" && (
        <Box maxW="5xl" mx="auto">
          {/* Header */}
          <Flex align="center" justify="space-between" mb={8} borderBottomWidth="1px" borderColor={stepBorder} pb={4}>
            <HStack spacing={3}>
              <Text
                fontSize="md"
                fontWeight="bold"
                color="blue.500"
                cursor="pointer"
                onClick={() => setView("list")}
                _hover={{ textDecoration: "underline" }}
              >
                Workflows
              </Text>
              <Icon as={FaChevronRight} color="gray.400" boxSize={3} />
              <Heading size="md" color={textColor} fontWeight="bold">
                {editingWorkflowId ? "Edit Workflow" : "New Workflow"}
              </Heading>
            </HStack>
            <HStack spacing={4}>
              <Button variant="ghost" onClick={() => setView("list")} size="sm">
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={async () => {
                  const saved = await saveWorkflow();
                  if (saved) setView("list");
                }}
                px={6}
                size="sm"
                isDisabled={steps.length === 0}
              >
                Save Workflow
              </Button>
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            {/* Left Column: Metadata Details */}
            <VStack align="stretch" spacing={6}>
              <Box bg={cardBg} p={5} rounded="2xl" shadow="sm" borderWidth="1px" borderColor={stepBorder}>
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" mb={4} color="blue.500">
                  Workflow Info
                </Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">Name</FormLabel>
                    <Input
                      bg={inputBg}
                      color={textColor}
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g. Invoicing & Archiving Pipeline"
                      size="sm"
                      rounded="md"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">Description</FormLabel>
                    <Input
                      bg={inputBg}
                      color={textColor}
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Briefly describe what this workflow does..."
                      size="sm"
                      rounded="md"
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Add Tool Trigger Card */}
              <Box
                bg={cardBg}
                p={5}
                rounded="2xl"
                shadow="sm"
                borderWidth="1px"
                borderColor={stepBorder}
                textAlign="center"
              >
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" mb={4} color="blue.500">
                  Add Pipeline Steps
                </Heading>
                <Text fontSize="xs" color={subTextColor} mb={4}>
                  {steps.length === 0
                    ? "Choose from any PDF converters, image tools, decoders, or utilities to build your chain."
                    : `Only tools compatible with the previous step's output will be shown.`}
                </Text>
                <Button
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<FaPlusCircle />}
                  onClick={onDrawerOpen}
                  w="full"
                  size="md"
                  rounded="xl"
                >
                  Select & Add a Tool
                </Button>
              </Box>
            </VStack>

            {/* Right Column: Steps Pipeline preview and Reordering */}
            <Box bg={cardBg} p={{ base: 5, md: 6 }} rounded="2xl" shadow="sm" borderWidth="1px" borderColor={stepBorder} gridColumn={{ base: "span 1", lg: "span 2" }}>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="sm" fontWeight="bold">
                  Steps Pipeline ({steps.length})
                </Heading>
                {hasAnyIssues && (
                  <Badge colorScheme="red" px={2} py={1} rounded="md" display="flex" alignItems="center" gap={1}>
                    <Icon as={FaExclamationTriangle} /> Incompatibility warnings
                  </Badge>
                )}
              </Flex>

              {steps.length === 0 ? (
                <Flex flexDir="column" align="center" justify="center" py={12} borderStyle="dashed" borderWidth="2px" borderColor={stepBorder} rounded="2xl">
                  <Icon as={FaTools} boxSize={8} color="gray.400" mb={3} />
                  <Text color={subTextColor} fontSize="sm">No steps added to this workflow pipeline.</Text>
                  <Button variant="link" color="blue.500" fontSize="xs" mt={2} onClick={onDrawerOpen}>
                    Click here to add the first step
                  </Button>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={4} position="relative">
                  {steps.map((step, index) => {
                    const isStepIncompatible = compatibilityIssues[index];
                    const stepIcon = step.icon || FaTools;

                    return (
                      <VStack key={`${step.id}-${index}`} align="stretch" spacing={2}>
                        {/* Step Card */}
                        <Box
                          p={4}
                          rounded="xl"
                          bg={useColorModeValue("gray.50", "gray.750")}
                          borderWidth="1px"
                          borderColor={isStepIncompatible ? "red.300" : stepBorder}
                          position="relative"
                          transition="all 0.15s"
                          _hover={{ borderColor: isStepIncompatible ? "red.400" : "blue.300" }}
                        >
                          <Flex align="flex-start" gap={3}>
                            {/* Step Number Badge */}
                            <Flex
                              align="center"
                              justify="center"
                              w="24px"
                              h="24px"
                              rounded="full"
                              bg={timelineBg}
                              color="white"
                              fontWeight="bold"
                              fontSize="xs"
                              mt={0.5}
                              flexShrink={0}
                            >
                              {index + 1}
                            </Flex>

                            {/* Core Step Details */}
                            <VStack align="flex-start" spacing={1.5} flex="1">
                              <HStack spacing={2} flexWrap="wrap">
                                <Icon as={stepIcon} color="blue.500" boxSize={4} />
                                <Text fontWeight="bold" fontSize="sm">{step.name}</Text>
                                <Badge colorScheme="blue" variant="subtle" fontSize="9px" rounded="md">
                                  In: {step.inputTypes.join(", ").toUpperCase()}
                                </Badge>
                                <Icon as={FaArrowRight} boxSize={2} color="gray.400" />
                                <Badge colorScheme="purple" variant="subtle" fontSize="9px" rounded="md">
                                  Output: {step.outputType.toUpperCase()}
                                </Badge>
                              </HStack>

                              {/* Settings */}
                              {renderSettingsUI(step, index)}
                            </VStack>

                            {/* Actions: Move Up, Move Down, Delete */}
                            <HStack spacing={1}>
                              <IconButton
                                aria-label="Move Up"
                                icon={<FaArrowUp />}
                                size="xs"
                                variant="ghost"
                                isDisabled={index === 0}
                                onClick={() => moveStepUp(index)}
                              />
                              <IconButton
                                aria-label="Move Down"
                                icon={<FaArrowDown />}
                                size="xs"
                                variant="ghost"
                                isDisabled={index === steps.length - 1}
                                onClick={() => moveStepDown(index)}
                              />
                              <IconButton
                                aria-label="Remove Step"
                                icon={<FaTrash />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => removeStep(index)}
                              />
                            </HStack>
                          </Flex>
                        </Box>

                        {/* Incompatibility Warning */}
                        {isStepIncompatible && (
                          <Collapse in={true}>
                            <Box
                              bg={useColorModeValue("red.50", "red.950")}
                              px={4}
                              py={2}
                              rounded="lg"
                              fontSize="xs"
                              borderWidth="1px"
                              borderColor={useColorModeValue("red.200", "red.800")}
                              color={useColorModeValue("red.600", "red.200")}
                              display="flex"
                              alignItems="center"
                              gap={2}
                            >
                              <Icon as={FaExclamationTriangle} color={useColorModeValue("red.500", "red.400")} />
                              <Text fontWeight="semibold">{isStepIncompatible}</Text>
                            </Box>
                          </Collapse>
                        )}
                      </VStack>
                    );
                  })}
                </VStack>
              )}

              {hasAnyIssues && (
                <Box
                  bg={useColorModeValue("yellow.50", "yellow.950")}
                  p={4}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor={useColorModeValue("yellow.200", "yellow.800")}
                  color={useColorModeValue("yellow.700", "yellow.200")}
                  mt={6}
                  fontSize="xs"
                  display="flex"
                  gap={2}
                  alignItems="flex-start"
                >
                  <Icon as={FaExclamationTriangle} color={useColorModeValue("yellow.500", "yellow.400")} mt={0.5} />
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="bold">Pipeline contains type compatibility issues</Text>
                    <Text>
                      Adjacent steps have incompatible output/input types. The workflow will still save, but processing files may fail or crash when running if formats do not match at runtime.
                    </Text>
                  </VStack>
                </Box>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      )}

      {/* ── Categorized Tool Selector Drawer ── */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={handleDrawerClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg={cardBg} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={stepBorder}>
            <Heading size="md">Select a Tool to Add</Heading>
            {/* ── Dynamic subtitle based on filter state ── */}
            <Text fontSize="xs" color={subTextColor} fontWeight="normal" mt={1}>
              {drawerFilterType
                ? `Showing tools that accept ${drawerFilterType.toUpperCase()} — matching the previous step's output.`
                : "Select from all active converters and formatters to append to your workflow."}
            </Text>
          </DrawerHeader>

          <DrawerBody px={4} py={6} display="flex" flexDirection="column" alignItems="center">
            <VStack spacing={4} align="stretch" maxW="md" width="100%">

              {/* ── Filter badge with "Show all tools" override ── */}
              {steps.length > 0 && (
                <Flex
                  bg={showAllTools
                    ? useColorModeValue("gray.50", "gray.700")
                    : badgeBg}
                  border="1px solid"
                  borderColor={showAllTools
                    ? useColorModeValue("gray.200", "gray.600")
                    : badgeBorder}
                  rounded="lg"
                  px={3}
                  py={2}
                  align="center"
                  justify="space-between"
                  fontSize="xs"
                >
                  <HStack spacing={2}>
                    <Icon
                      as={showAllTools ? FaTools : FaCheckCircle}
                      color={showAllTools ? "gray.400" : "blue.500"}
                    />
                    <Text
                      color={showAllTools
                        ? subTextColor
                        : badgeColor}
                      fontWeight="semibold"
                    >
                      {showAllTools
                        ? `Showing all tools (${Object.values(categorizedActions).reduce((s, l) => s + l.length, 0)} total)`
                        : `Filtered: accepts ${steps[steps.length - 1].outputType.toUpperCase()} input · ${compatibleToolCount} tools`}
                    </Text>
                  </HStack>

                  {showAllTools ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<FaCheckCircle />}
                      onClick={() => setShowAllTools(false)}
                    >
                      Smart filter
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="gray"
                      leftIcon={<FaUndo />}
                      onClick={() => setShowAllTools(true)}
                    >
                      Show all
                    </Button>
                  )}
                </Flex>
              )}

              {/* Search Bar */}
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by tool name or function..."
                  bg={inputBg}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderColor={stepBorder}
                  _focus={{ borderColor: "blue.400" }}
                />
              </InputGroup>

              {/* Categorized List */}
              <VStack spacing={5} align="stretch" overflowY="auto" maxH="calc(100vh - 260px)" pr={1}>
                {Object.keys(filteredCategorizedActions).length === 0 ? (
                  <VStack py={10} spacing={3}>
                    <Icon as={FaTools} boxSize={8} color="gray.300" />
                    <Text color={subTextColor} fontSize="sm" textAlign="center">
                      {searchQuery
                        ? "No tools match your search."
                        : `No compatible tools found for ${steps[steps.length - 1]?.outputType.toUpperCase()} output.`}
                    </Text>
                    {!showAllTools && steps.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        leftIcon={<FaUndo />}
                        onClick={() => setShowAllTools(true)}
                      >
                        Show all tools anyway
                      </Button>
                    )}
                  </VStack>
                ) : (
                  Object.entries(filteredCategorizedActions).map(([category, list]) => (
                    <Box key={category}>
                      <Heading size="xs" textTransform="uppercase" color="blue.500" letterSpacing="wide" mb={2}>
                        {category}
                      </Heading>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
                        {list.map((action) => {
                          const actionIcon = action.icon || FaTools;
                          return (
                            <Box
                              key={action.id}
                              p={3}
                              rounded="lg"
                              borderWidth="1px"
                              borderColor={stepBorder}
                              cursor="pointer"
                              transition="all 0.15s"
                              _hover={{ borderColor: "blue.400", bg: useColorModeValue("blue.50", "gray.700"), transform: "translateY(-1px)" }}
                              onClick={() => addStep(action)}
                            >
                              <HStack spacing={3}>
                                <Icon as={actionIcon} color="blue.500" boxSize={4} />
                                <VStack align="flex-start" spacing={0} flex="1">
                                  <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                    {action.name}
                                  </Text>
                                  <HStack spacing={1}>
                                    <Badge colorScheme="blue" variant="subtle" fontSize="7px" px={1} rounded="sm">
                                      {action.inputTypes[0].toUpperCase()}
                                    </Badge>
                                    <Icon as={FaArrowRight} boxSize={1.5} color="gray.500" />
                                    <Badge colorScheme="purple" variant="subtle" fontSize="7px" px={1} rounded="sm">
                                      {action.outputType.toUpperCase()}
                                    </Badge>
                                  </HStack>
                                </VStack>
                              </HStack>
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                      <Divider mt={4} borderColor={stepBorder} />
                    </Box>
                  ))
                )}
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default WorkflowBuilderContent;
