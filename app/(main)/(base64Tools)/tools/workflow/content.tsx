"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box, Button, Heading, Text, Input, VStack, HStack, SimpleGrid,
  Badge, Flex, useColorModeValue, useToast, Icon,
  InputGroup, InputLeftElement, Switch, IconButton,
  FormControl, FormLabel, Select, Drawer, DrawerBody,
  DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  useDisclosure, Tooltip, Divider, Collapse,
  AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
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

  if (n.includes("to pdf") || n.includes("topdf"))                                                     return "pdf";
  if (n.includes("to word") || n.includes("toword") || n.includes("to doc"))                           return "word";
  if (n.includes("to jpg") || n.includes("to jpeg") || n.includes("to png") || n.includes("to image") || n.includes("tojpg") || n.includes("toimage")) return "image";
  if (n.includes("to audio") || n.includes("toaudio"))                                                 return "audio";
  if (n.includes("to video") || n.includes("tovideo"))                                                 return "video";
  if (n.includes("to base64") || n.includes("tobase64"))                                               return "base64";
  if (n.includes("to hex") || n.includes("tohex"))                                                     return "hex";
  if (n.includes("to ascii") || n.includes("toascii"))                                                 return "ascii";
  if (n.includes("to binary") || n.includes("tobinary"))                                               return "binary";
  if (n.includes("to json") || n.includes("tojson"))                                                   return "json";
  if (n.includes("to csv") || n.includes("tocsv"))                                                     return "csv";
  if (n.includes("to excel") || n.includes("toexcel") || n.includes("to xlsx"))                        return "excel";
  if (n.includes("to html") || n.includes("tohtml"))                                                   return "html";
  if (n.includes("to zip") || n.includes("tozip") || (n.includes("compress") && n.includes("zip")))   return "zip";
  if (n.includes("to text") || n.includes("totext"))                                                   return "text";
  if (n.includes("to decimal") || n.includes("todecimal"))                                             return "text";
  if ((n.includes("qr") || n.includes("qrcode")) && (n.includes("generat") || n.includes("creat")))   return "qr";
  if (n.includes("barcode") && (n.includes("generat") || n.includes("creat")))                        return "barcode";
  if (n.includes("url") && n.includes("shorten"))                                                      return "url";
  if (n.includes("hash") || n.includes("md5") || n.includes("sha"))                                   return "hash";
  if (n.includes("jwt"))                                                                               return "jwt";
  if (n.includes("pdf edit") || n.includes("pdfedit"))                                                 return "pdf";
  if (n.includes("pdf merge") || n.includes("pdfmerge"))                                              return "pdf";
  if (n.includes("pdf split") || n.includes("pdfsplit"))                                              return "pdf";
  if (n.includes("pdf rotate") || n.includes("pdfrotate"))                                            return "pdf";
  if (n.includes("pdf sign") || n.includes("pdfsign"))                                                return "pdf";
  if (n.includes("pdf watermark") || n.includes("pdfwatermark"))                                      return "pdf";
  if (n.includes("pdf page") || n.includes("pdfpage"))                                                return "pdf";
  if (n.includes("pdf difference") || n.includes("pdfdiff"))                                          return "pdf";
  if (n.includes("image compressor") || n.includes("imagecom"))                                       return "image";
  if (n.includes("image edit") || n.includes("imageedit"))                                            return "image";
  if (n.includes("image type") || n.includes("imagetype"))                                            return "image";
  if (n.includes("bg remover") || n.includes("bgremov"))                                              return "image";
  if (n.includes("image extractor") || n.includes("imageextract"))                                    return "image";
  if (n.includes("color converter") || n.includes("colorconvert"))                                    return "text";
  if (n.includes("text case") || n.includes("textcase"))                                              return "text";
  if (n.includes("unix timestamp") || n.includes("unixtimestamp"))                                    return "text";
  if (n.includes("unit converter") || n.includes("unitconvert"))                                      return "text";
  if (n.includes("base converter") || n.includes("baseconvert"))                                      return "text";
  if (n.includes("speed converter") || n.includes("speedconvert"))                                    return "text";
  if (n.includes("currency converter") || n.includes("currencyconvert"))                              return "text";
  if (n.includes("time converter") || n.includes("timeconvert"))                                      return "text";
  if (n.includes("data size") || n.includes("datasize"))                                              return "text";
  if (n.includes("cv builder") || n.includes("cvbuilder"))                                            return "pdf";
  if (n.includes("regex") || n.includes("regextool"))                                                 return "text";
  if (n.includes("code formatter") || n.includes("codeformatter"))                                    return "text";
  if (n.includes("data visual") || n.includes("datavisual"))                                          return "image";
  if (n.includes("ai chatbot") || n.includes("aichatboat"))                                           return "text";
  if (n.includes("encrypt"))                                                                          return "any";
  if (n.includes("qr") && n.includes("read"))                                                         return "text";
  return "any";
}

function detectInputType(name: string, path: string): OutputType[] {
  const n = (name + " " + path)
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const inputs: OutputType[] = [];

  if (n.includes("pdf to") || n.includes("pdfto") || n.includes("pdf edit") || n.includes("pdfedit")
    || n.includes("pdf merge") || n.includes("pdf split") || n.includes("pdf rotate")
    || n.includes("pdf sign") || n.includes("pdf watermark") || n.includes("pdf page")
    || n.includes("pdf difference") || n.includes("pdfdiff"))                            inputs.push("pdf");
  if (n.includes("word to") || n.includes("wordto") || n.includes("docx"))               inputs.push("word");
  if (n.includes("excel to") || n.includes("excelto") || n.includes("xlsx to")
    || n.includes("csv to") || n.includes("csvto"))                                       inputs.push("excel", "csv");
  if (n.includes("image to") || n.includes("imageto") || n.includes("jpg to")
    || n.includes("png to") || n.includes("jpeg to") || n.includes("image compressor")
    || n.includes("imagecom") || n.includes("image edit") || n.includes("imageedit")
    || n.includes("image type") || n.includes("bg remover") || n.includes("bgremov")
    || n.includes("image extractor") || n.includes("imageextract"))                       inputs.push("image");
  if (n.includes("audio to") || n.includes("mp3 to") || n.includes("wav to"))            inputs.push("audio");
  if (n.includes("video to") || n.includes("mp4 to"))                                    inputs.push("video");
  if (n.includes("base64 to") || n.includes("base64to") || n.includes("jwt"))            inputs.push("base64");
  if (n.includes("ascii to base64") || n.includes("asciito"))                            inputs.push("ascii");
  if (n.includes("hex to base64") || n.includes("hexto"))                                inputs.push("hex");
  if (n.includes("audio to base64"))                                                      inputs.push("audio");
  if (n.includes("file to base64") || n.includes("filetob"))                             inputs.push("any");
  if (n.includes("url to base64"))                                                        inputs.push("url");
  if (n.includes("binary to") || n.includes("binaryto"))                                 inputs.push("binary");
  if (n.includes("text to binary"))                                                       inputs.push("text");
  if (n.includes("ascii to binary"))                                                      inputs.push("ascii");
  if (n.includes("hex to binary"))                                                        inputs.push("hex");
  if (n.includes("base64 to binary"))                                                     inputs.push("base64");
  if (n.includes("file to binary"))                                                       inputs.push("any");
  if (n.includes("decimal to binary"))                                                    inputs.push("text");
  if (n.includes("json to") || n.includes("jsonto") || n.includes("json format")
    || n.includes("json valid") || n.includes("json minif"))                              inputs.push("json");
  if (n.includes("zip to") || n.includes("decompress") || n.includes("unzip"))           inputs.push("zip");
  if (n.includes("files to zip") || n.includes("filestozip"))                            inputs.push("any");
  if (n.includes("text to") || n.includes("text format") || n.includes("text case")
    || n.includes("word count") || n.includes("string") || n.includes("lorem")
    || n.includes("regex") || n.includes("code format") || n.includes("color convert")
    || n.includes("unix timestamp") || n.includes("unit convert") || n.includes("base convert")
    || n.includes("speed convert") || n.includes("currency convert") || n.includes("time convert")
    || n.includes("data size") || n.includes("ai chatbot") || n.includes("aichatboat"))  inputs.push("text");
  if ((n.includes("qr") || n.includes("barcode")) && n.includes("read"))                 inputs.push("qr", "barcode");
  if ((n.includes("qr") || n.includes("barcode")) && (n.includes("generat") || n.includes("creat"))) inputs.push("text");
  if (n.includes("images to pdf") || n.includes("imagestopdf"))                          inputs.push("image");
  if (n.includes("encrypt"))                                                              inputs.push("any");
  if (n.includes("cv builder") || n.includes("cvbuilder"))                               inputs.push("text");
  if (n.includes("data visual") || n.includes("datavisual"))                             inputs.push("json", "csv", "excel");

  if (inputs.length === 0) inputs.push("any");
  return [...new Set(inputs)];
}

function isCompatible(outType: OutputType, inTypes: OutputType[]): boolean {
  if (outType === "any" || inTypes.includes("any")) return true;
  return inTypes.includes(outType);
}

function isStrictDrawerCompatible(outType: OutputType, inTypes: OutputType[]): boolean {
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
  if (payload === undefined) { console.log(`[WorkflowDebug][${time}] ${label}`); return; }
  console.log(`[WorkflowDebug][${time}] ${label}`, payload);
};

const WorkflowBuilderContent = () => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  // ── Delete confirmation dialog ──
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const [pendingDeleteWorkflow, setPendingDeleteWorkflow] = useState<SavedWorkflow | null>(null);
  const [isDeletingWorkflow, setIsDeletingWorkflow] = useState(false);

  const [view, setView] = useState<"list" | "edit">("list");
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTools, setShowAllTools] = useState(false);

  const getAuthHeaders = () => {
    const tokenKey = AUTH_TOKEN || "auth_token";
    const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Theme colors
  const pageBg        = useColorModeValue("gray.50",    "gray.900");
  const cardBg        = useColorModeValue("white",      "gray.800");
  const textColor     = useColorModeValue("gray.800",   "gray.100");
  const subTextColor  = useColorModeValue("gray.600",   "gray.400");
  const stepBorder    = useColorModeValue("gray.200",   "gray.700");
  const inputBg       = useColorModeValue("white",      "gray.700");
  const badgeBg       = useColorModeValue("blue.50",    "blue.900");
  const badgeColor    = useColorModeValue("blue.700",   "blue.100");
  const badgeBorder   = useColorModeValue("blue.100",   "blue.700");
  const timelineBg    = useColorModeValue("blue.500",   "blue.400");
  const filterBg      = useColorModeValue("gray.50",    "gray.700");
  const filterBorder  = useColorModeValue("gray.200",   "gray.600");
  const hoverBg       = useColorModeValue("blue.50",    "gray.700");
  const incompatBg    = useColorModeValue("red.50",     "red.950");
  const incompatBorder= useColorModeValue("red.200",    "red.800");
  const incompatColor = useColorModeValue("red.600",    "red.200");
  const warnBg        = useColorModeValue("yellow.50",  "yellow.950");
  const warnBorder    = useColorModeValue("yellow.200", "yellow.800");
  const warnColor     = useColorModeValue("yellow.700", "yellow.200");
  const stepCardBg    = useColorModeValue("gray.50",    "gray.750");
  const dialogBg      = useColorModeValue("white",      "gray.800");
  const dialogBorder  = useColorModeValue("gray.200",   "gray.700");

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
    workflowDebug("availableActions computed", { total: actions.length });
    return actions;
  }, []);

  const categorizedActions = useMemo(() => {
    const result: Record<string, WorkflowAction[]> = {};
    Object.entries(features).forEach(([category, list]: [string, any]) => {
      const filtered = list
        .filter((item: any) => item?.path && item?.name)
        .map((item: any) => availableActions.find((a) => a.id === item.path))
        .filter(Boolean) as WorkflowAction[];
      if (filtered.length > 0) result[category] = filtered;
    });
    return result;
  }, [availableActions]);

  const drawerFilterType = useMemo((): OutputType | null => {
    if (steps.length === 0 || showAllTools) return null;
    return steps[steps.length - 1].outputType;
  }, [steps, showAllTools]);

  const filteredCategorizedActions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result: Record<string, WorkflowAction[]> = {};
    Object.entries(categorizedActions).forEach(([category, list]) => {
      const matches = list.filter((action) => {
        const matchesSearch =
          !query ||
          action.name.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query);
        const matchesCompat =
          drawerFilterType === null ||
          isStrictDrawerCompatible(drawerFilterType, action.inputTypes);
        return matchesSearch && matchesCompat;
      });
      if (matches.length > 0) result[category] = matches;
    });
    return result;
  }, [categorizedActions, searchQuery, drawerFilterType]);

  const compatibleToolCount = useMemo(
    () => Object.values(filteredCategorizedActions).reduce((sum, list) => sum + list.length, 0),
    [filteredCategorizedActions]
  );

  const totalToolCount = useMemo(
    () => Object.values(categorizedActions).reduce((sum, list) => sum + list.length, 0),
    [categorizedActions]
  );

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const { data } = await axios.get("/workflows", { headers: getAuthHeaders() });
        setSavedWorkflows(data?.data || []);
      } catch {
        setSavedWorkflows([]);
      }
    };
    loadWorkflows();
  }, []);

  useEffect(() => {
    workflowDebug("steps changed", { totalSteps: steps.length });
  }, [steps]);

  // ── Delete: open confirm dialog ──
  const openDeleteConfirm = (workflow: SavedWorkflow) => {
    setPendingDeleteWorkflow(workflow);
    onDeleteOpen();
  };

  const closeDeleteConfirm = () => {
    if (isDeletingWorkflow) return;
    setPendingDeleteWorkflow(null);
    onDeleteClose();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteWorkflow) return;
    try {
      setIsDeletingWorkflow(true);
      await axios.delete(`/workflows/${pendingDeleteWorkflow.id}`, { headers: getAuthHeaders() });
      setSavedWorkflows((prev) => prev.filter((wf) => wf.id !== pendingDeleteWorkflow.id));
      toast({ status: "success", title: "Workflow deleted successfully.", duration: 2000 });
      setPendingDeleteWorkflow(null);
      onDeleteClose();
    } catch {
      toast({ status: "error", title: "Failed to delete workflow." });
    } finally {
      setIsDeletingWorkflow(false);
    }
  };

  const addStep = (action: WorkflowAction) => {
    let settings: Record<string, any> = {};
    const slug = action.path.split("/").pop()?.toLowerCase() || "";
    if (slug.includes("imagecom") || slug.includes("pdftojpg")) settings = { quality: 80 };
    if (slug.includes("pdfsplit"))     settings = { pageRange: "" };
    if (slug.includes("pdfrotate"))    settings = { angle: 90 };
    if (slug.includes("pdfwatermark")) settings = { watermarkText: "ToolSahayata" };

    setSteps((prev) => [...prev, { ...action, stepNumber: prev.length + 1, settings }]);
    onDrawerClose();
    setSearchQuery("");
    setShowAllTools(false);
    toast({ position: "bottom-right", title: `${action.name} added to workflow.`, status: "success", duration: 2000 });
  };

  const removeStep = (index: number) =>
    setSteps((prev) =>
      prev.filter((_, idx) => idx !== index).map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    setSteps((prev) => {
      const list = [...prev];
      [list[index], list[index - 1]] = [list[index - 1], list[index]];
      return list.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    });
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    setSteps((prev) => {
      const list = [...prev];
      [list[index], list[index + 1]] = [list[index + 1], list[index]];
      return list.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    });
  };

  const updateStepSetting = (index: number, key: string, value: any) =>
    setSteps((prev) =>
      prev.map((s, i) => i === index ? { ...s, settings: { ...s.settings, [key]: value } } : s)
    );

  const toggleWorkflowStatus = (id: string) => {
    const target = savedWorkflows.find((wf) => wf.id === id);
    if (!target) return;
    axios
      .put(`/workflows/${id}`, { isActive: !target.isActive }, { headers: getAuthHeaders() })
      .then(({ data }) => {
        setSavedWorkflows((prev) => prev.map((wf) => (wf.id === id ? data.data : wf)));
        toast({ status: "success", title: `Workflow ${!target.isActive ? "enabled" : "disabled"} successfully.`, duration: 2000 });
      })
      .catch(() => toast({ status: "error", title: "Failed to update workflow status." }));
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) { toast({ status: "error", title: "Workflow name is required." }); return null; }
    if (steps.length === 0)   { toast({ status: "error", title: "Add at least one step to save." }); return null; }

    const mappedSteps = steps.map(({ id, name, path, stepNumber, settings }) => ({ id, name, path, stepNumber, settings }));
    try {
      if (editingWorkflowId) {
        const { data } = await axios.put(
          `/workflows/${editingWorkflowId}`,
          { name: workflowName.trim(), description: workflowDescription.trim(), steps: mappedSteps },
          { headers: getAuthHeaders() }
        );
        setSavedWorkflows((prev) => prev.map((wf) => (wf.id === editingWorkflowId ? data.data : wf)));
        toast({ status: "success", title: "Workflow updated successfully." });
        return data.data;
      }
      const { data } = await axios.post(
        "/workflows",
        { name: workflowName.trim(), description: workflowDescription.trim(), steps: mappedSteps, isActive: true },
        { headers: getAuthHeaders() }
      );
      setSavedWorkflows((prev) => [data.data, ...prev]);
      toast({ status: "success", title: "Workflow created successfully." });
      return data.data;
    } catch {
      toast({ status: "error", title: "Failed to save workflow." });
      return null;
    }
  };

  const loadWorkflow = (workflow: SavedWorkflow) => {
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

  const clearBuilder = () => { setWorkflowName(""); setWorkflowDescription(""); setSteps([]); };

  const runWorkflowAction = (workflow: SavedWorkflow) => {
    if (!workflow.isActive) {
      toast({ status: "warning", title: "Workflow is disabled", description: "Please enable the status toggle to run this workflow." });
      return;
    }
    router.push(`/tools/workflow/run/${workflow.id}`);
  };

  const compatibilityIssues = useMemo(() => {
    const issues: Record<number, string> = {};
    for (let i = 0; i < steps.length - 1; i++) {
      const current = steps[i];
      const next = steps[i + 1];
      if (!isCompatible(current.outputType, next.inputTypes)) {
        issues[i + 1] = `Step ${i + 1} outputs '${current.outputType.toUpperCase()}', but Step ${i + 2} requires [${next.inputTypes.map((t) => t.toUpperCase()).join(", ")}]`;
      }
    }
    return issues;
  }, [steps]);

  const hasAnyIssues = Object.keys(compatibilityIssues).length > 0;

  const handleDrawerClose = () => {
    onDrawerClose();
    setSearchQuery("");
    setShowAllTools(false);
  };

  const renderSettingsUI = (step: WorkflowStep, index: number) => {
    const slug = step.path.split("/").pop()?.toLowerCase() || "";
    if (slug.includes("imagecom") || slug.includes("pdftojpg")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Compression quality:</Text>
          <Select size="xs" bg={inputBg} color={textColor} rounded="md" value={step.settings?.quality || 80}
            onChange={(e) => updateStepSetting(index, "quality", parseInt(e.target.value))}>
            <option value={90}>Low (Best Quality)</option>
            <option value={80}>Normal (Recommended)</option>
            <option value={50}>High (Smallest File)</option>
            <option value={20}>Extreme (Lowest Quality)</option>
          </Select>
        </VStack>
      );
    }
    if (slug.includes("pdfsplit")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Split range:</Text>
          <Input size="xs" bg={inputBg} color={textColor} rounded="md" placeholder="e.g. 1-3, 5-8"
            value={step.settings?.pageRange || ""}
            onChange={(e) => updateStepSetting(index, "pageRange", e.target.value)} />
        </VStack>
      );
    }
    if (slug.includes("pdfrotate")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Rotation angle:</Text>
          <Select size="xs" bg={inputBg} color={textColor} rounded="md" value={step.settings?.angle || 90}
            onChange={(e) => updateStepSetting(index, "angle", parseInt(e.target.value))}>
            <option value={90}>90° Clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° Clockwise</option>
          </Select>
        </VStack>
      );
    }
    if (slug.includes("pdfwatermark")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} w="full">
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Watermark text:</Text>
          <Input size="xs" bg={inputBg} color={textColor} rounded="md"
            value={step.settings?.watermarkText || ""}
            onChange={(e) => updateStepSetting(index, "watermarkText", e.target.value)} />
        </VStack>
      );
    }
    return null;
  };

  return (
    <Box minH="90vh" bg={pageBg} color={textColor} py={{ base: 6, md: 10 }} px={{ base: 4, md: 8, lg: 12 }}>

      {/* ═══════════════ LIST VIEW ═══════════════ */}
      {view === "list" && (
        <Box maxW="6xl" mx="auto">
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <VStack align="flex-start" spacing={1}>
              <Heading size="xl" fontWeight="extrabold" letterSpacing="tight"
                bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                Workflows
              </Heading>
              <Text color={subTextColor} fontSize="md">
                Automate your document processing pipeline by combining your favourite tools.
              </Text>
            </VStack>
            <Button
              bgGradient="linear(to-r, blue.500, purple.600)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, blue.600, purple.700)", transform: "translateY(-1px)", boxShadow: "lg" }}
              _active={{ transform: "translateY(0)" }}
              onClick={() => { clearBuilder(); setEditingWorkflowId(null); setView("edit"); }}
              size="md" fontWeight="bold" leftIcon={<FaPlusCircle />} transition="all 0.2s"
            >
              Create New Workflow
            </Button>
          </Flex>

          <VStack spacing={6} align="stretch">
            {savedWorkflows.length === 0 ? (
              <Box bg={cardBg} p={12} rounded="2xl" textAlign="center" borderWidth="1px" borderColor={stepBorder} shadow="sm">
                <Icon as={FaTools} boxSize={12} color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No workflows yet</Heading>
                <Text color={subTextColor} maxW="md" mx="auto" mb={6}>
                  Simplify tasks by connecting tools into one automated pipeline. Set up each step, fine-tune your settings, and save.
                </Text>
                <Button variant="outline" colorScheme="blue"
                  onClick={() => { clearBuilder(); setEditingWorkflowId(null); setView("edit"); }}>
                  Create your first workflow
                </Button>
              </Box>
            ) : (
              savedWorkflows.map((workflow) => (
                <Box key={workflow.id} bg={cardBg} p={{ base: 5, md: 6 }} rounded="2xl" shadow="sm"
                  borderWidth="1px" borderColor={stepBorder} transition="all 0.2s"
                  _hover={{ shadow: "md", borderColor: "blue.400" }}>
                  <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4} mb={4}>
                    <VStack align="flex-start" spacing={1} flex="1">
                      <HStack spacing={3}>
                        <Heading size="md" color={textColor} fontWeight="bold">{workflow.name}</Heading>
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
                        <Switch colorScheme="green" isChecked={workflow.isActive}
                          onChange={() => toggleWorkflowStatus(workflow.id)} size="sm" />
                      </HStack>
                      <Divider orientation="vertical" h="20px" borderColor={stepBorder} />
                      <HStack spacing={2}>
                        <Tooltip label="Run Workflow" hasArrow>
                          <IconButton aria-label="Run" icon={<FaPlay />} size="sm" colorScheme="green"
                            isDisabled={!workflow.isActive} onClick={() => runWorkflowAction(workflow)} rounded="lg" />
                        </Tooltip>
                        <Tooltip label="Edit" hasArrow>
                          <IconButton aria-label="Edit" icon={<FaEdit />} size="sm" variant="outline" colorScheme="blue"
                            onClick={() => { loadWorkflow(workflow); setEditingWorkflowId(workflow.id); setView("edit"); }} rounded="lg" />
                        </Tooltip>
                        <Tooltip label="Delete" hasArrow>
                          <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red"
                            onClick={() => openDeleteConfirm(workflow)} rounded="lg" />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  </Flex>

                  <Box pt={2} borderTopWidth="1px" borderColor={stepBorder}>
                    <Text fontSize="xs" fontWeight="bold" color={subTextColor} mb={3}>STEPS PIPELINE:</Text>
                    <Flex flexWrap="wrap" align="center" gap={3}>
                      {workflow.steps.map((step, idx) => {
                        const action = availableActions.find(
                          (a) => a.id === step.id || a.path === step.path || a.name === step.name
                        );
                        const stepIcon = action?.icon ?? FaTools;
                        return (
                          <React.Fragment key={step.id + "-" + idx}>
                            <HStack bg={stepCardBg} px={3} py={2} rounded="xl"
                              borderWidth="1px" borderColor={stepBorder} spacing={2.5} shadow="xs">
                              <Icon as={stepIcon} color="blue.500" boxSize={3.5} />
                              <VStack align="flex-start" spacing={0}>
                                <Text fontSize="xs" fontWeight="bold" noOfLines={1} maxW="150px">{step.name}</Text>
                                {step.settings && Object.keys(step.settings).length > 0 && (
                                  <Text fontSize="9px" color="gray.500">custom settings</Text>
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
              ))
            )}
          </VStack>
        </Box>
      )}

      {/* ═══════════════ EDIT VIEW ═══════════════ */}
      {view === "edit" && (
        <Box maxW="5xl" mx="auto">
          <Flex align="center" justify="space-between" mb={8} borderBottomWidth="1px" borderColor={stepBorder} pb={4}>
            <HStack spacing={3}>
              <Text fontSize="md" fontWeight="bold" color="blue.500" cursor="pointer"
                onClick={() => setView("list")} _hover={{ textDecoration: "underline" }}>
                Workflows
              </Text>
              <Icon as={FaChevronRight} color="gray.400" boxSize={3} />
              <Heading size="md" color={textColor} fontWeight="bold">
                {editingWorkflowId ? "Edit Workflow" : "New Workflow"}
              </Heading>
            </HStack>
            <HStack spacing={4}>
              <Button variant="ghost" onClick={() => setView("list")} size="sm">Cancel</Button>
              <Button colorScheme="blue"
                onClick={async () => { const saved = await saveWorkflow(); if (saved) setView("list"); }}
                px={6} size="sm" isDisabled={steps.length === 0}>
                Save Workflow
              </Button>
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            <VStack align="stretch" spacing={6}>
              <Box bg={cardBg} p={5} rounded="2xl" shadow="sm" borderWidth="1px" borderColor={stepBorder}>
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" mb={4} color="blue.500">
                  Workflow Info
                </Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">Name</FormLabel>
                    <Input bg={inputBg} color={textColor} value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g. Invoicing & Archiving Pipeline" size="sm" rounded="md" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">Description</FormLabel>
                    <Input bg={inputBg} color={textColor} value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Briefly describe what this workflow does…" size="sm" rounded="md" />
                  </FormControl>
                </VStack>
              </Box>

              <Box bg={cardBg} p={5} rounded="2xl" shadow="sm" borderWidth="1px" borderColor={stepBorder} textAlign="center">
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" mb={4} color="blue.500">
                  Add Pipeline Steps
                </Heading>
                <Text fontSize="xs" color={subTextColor} mb={4}>
                  {steps.length === 0
                    ? "Choose from any PDF converters, image tools, decoders, or utilities to build your chain."
                    : "Only tools compatible with the previous step's output will be shown."}
                </Text>
                <Button colorScheme="blue" variant="outline" leftIcon={<FaPlusCircle />}
                  onClick={onDrawerOpen} w="full" size="md" rounded="xl">
                  Select &amp; Add a Tool
                </Button>
              </Box>
            </VStack>

            <Box bg={cardBg} p={{ base: 5, md: 6 }} rounded="2xl" shadow="sm"
              borderWidth="1px" borderColor={stepBorder} gridColumn={{ base: "span 1", lg: "span 2" }}>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="sm" fontWeight="bold">Steps Pipeline ({steps.length})</Heading>
                {hasAnyIssues && (
                  <Badge colorScheme="red" px={2} py={1} rounded="md" display="flex" alignItems="center" gap={1}>
                    <Icon as={FaExclamationTriangle} /> Incompatibility warnings
                  </Badge>
                )}
              </Flex>

              {steps.length === 0 ? (
                <Flex flexDir="column" align="center" justify="center" py={12}
                  borderStyle="dashed" borderWidth="2px" borderColor={stepBorder} rounded="2xl">
                  <Icon as={FaTools} boxSize={8} color="gray.400" mb={3} />
                  <Text color={subTextColor} fontSize="sm">No steps added to this workflow pipeline.</Text>
                  <Button variant="link" color="blue.500" fontSize="xs" mt={2} onClick={onDrawerOpen}>
                    Click here to add the first step
                  </Button>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {steps.map((step, index) => {
                    const isStepIncompatible = compatibilityIssues[index];
                    const stepIcon = step.icon || FaTools;
                    return (
                      <VStack key={`${step.id}-${index}`} align="stretch" spacing={2}>
                        <Box p={4} rounded="xl" bg={stepCardBg} borderWidth="1px"
                          borderColor={isStepIncompatible ? "red.300" : stepBorder}
                          transition="all 0.15s"
                          _hover={{ borderColor: isStepIncompatible ? "red.400" : "blue.300" }}>
                          <Flex align="flex-start" gap={3}>
                            <Flex align="center" justify="center" w="24px" h="24px" rounded="full"
                              bg={timelineBg} color="white" fontWeight="bold" fontSize="xs" mt={0.5} flexShrink={0}>
                              {index + 1}
                            </Flex>
                            <VStack align="flex-start" spacing={1.5} flex="1">
                              <HStack spacing={2} flexWrap="wrap">
                                <Icon as={stepIcon} color="blue.500" boxSize={4} />
                                <Text fontWeight="bold" fontSize="sm">{step.name}</Text>
                                <Badge colorScheme="blue" variant="subtle" fontSize="9px" rounded="md">
                                  In: {step.inputTypes.join(", ").toUpperCase()}
                                </Badge>
                                <Icon as={FaArrowRight} boxSize={2} color="gray.400" />
                                <Badge colorScheme="purple" variant="subtle" fontSize="9px" rounded="md">
                                  Out: {step.outputType.toUpperCase()}
                                </Badge>
                              </HStack>
                              {renderSettingsUI(step, index)}
                            </VStack>
                            <HStack spacing={1}>
                              <IconButton aria-label="Move Up" icon={<FaArrowUp />} size="xs" variant="ghost"
                                isDisabled={index === 0} onClick={() => moveStepUp(index)} />
                              <IconButton aria-label="Move Down" icon={<FaArrowDown />} size="xs" variant="ghost"
                                isDisabled={index === steps.length - 1} onClick={() => moveStepDown(index)} />
                              <IconButton aria-label="Remove Step" icon={<FaTrash />} size="xs" variant="ghost"
                                colorScheme="red" onClick={() => removeStep(index)} />
                            </HStack>
                          </Flex>
                        </Box>

                        {isStepIncompatible && (
                          <Collapse in={true}>
                            <Box bg={incompatBg} px={4} py={2} rounded="lg" fontSize="xs"
                              borderWidth="1px" borderColor={incompatBorder} color={incompatColor}
                              display="flex" alignItems="center" gap={2}>
                              <Icon as={FaExclamationTriangle} color={incompatColor} />
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
                <Box bg={warnBg} p={4} rounded="xl" borderWidth="1px" borderColor={warnBorder}
                  color={warnColor} mt={6} fontSize="xs" display="flex" gap={2} alignItems="flex-start">
                  <Icon as={FaExclamationTriangle} mt={0.5} />
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="bold">Pipeline contains type compatibility issues</Text>
                    <Text>
                      Adjacent steps have incompatible output/input types. The workflow will still save, but processing may fail at runtime if formats do not match.
                    </Text>
                  </VStack>
                </Box>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      )}

      {/* ═══════════════ TOOL SELECTOR DRAWER ═══════════════ */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={handleDrawerClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg={cardBg} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={stepBorder}>
            <Heading size="md">Select a Tool to Add</Heading>
            <Text fontSize="xs" color={subTextColor} fontWeight="normal" mt={1}>
              {drawerFilterType
                ? `Showing tools that accept ${drawerFilterType.toUpperCase()} — matching the previous step's output.`
                : "Select from all active converters and formatters to append to your workflow."}
            </Text>
          </DrawerHeader>

          <DrawerBody px={4} py={6} display="flex" flexDirection="column" alignItems="center">
            <VStack spacing={4} align="stretch" maxW="md" width="100%">
              {steps.length > 0 && (
                <Flex bg={showAllTools ? filterBg : badgeBg} border="1px solid"
                  borderColor={showAllTools ? filterBorder : badgeBorder}
                  rounded="lg" px={3} py={2} align="center" justify="space-between" fontSize="xs">
                  <HStack spacing={2}>
                    <Icon as={showAllTools ? FaTools : FaCheckCircle}
                      color={showAllTools ? "gray.400" : "blue.500"} />
                    <Text color={showAllTools ? subTextColor : badgeColor} fontWeight="semibold">
                      {showAllTools
                        ? `Showing all tools (${totalToolCount} total)`
                        : `Filtered: accepts ${steps[steps.length - 1].outputType.toUpperCase()} · ${compatibleToolCount} tools`}
                    </Text>
                  </HStack>
                  {showAllTools ? (
                    <Button size="xs" variant="ghost" colorScheme="blue" leftIcon={<FaCheckCircle />}
                      onClick={() => setShowAllTools(false)}>Smart filter</Button>
                  ) : (
                    <Button size="xs" variant="ghost" colorScheme="gray" leftIcon={<FaUndo />}
                      onClick={() => setShowAllTools(true)}>Show all</Button>
                  )}
                </Flex>
              )}

              <InputGroup size="md">
                <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search by tool name or function…" bg={inputBg}
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  borderColor={stepBorder} _focus={{ borderColor: "blue.400" }} />
              </InputGroup>

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
                      <Button size="sm" variant="outline" colorScheme="blue" leftIcon={<FaUndo />}
                        onClick={() => setShowAllTools(true)}>Show all tools anyway</Button>
                    )}
                  </VStack>
                ) : (
                  Object.entries(filteredCategorizedActions).map(([category, list]) => (
                    <Box key={category}>
                      <Heading size="xs" textTransform="uppercase" color="blue.500"
                        letterSpacing="wide" mb={2}>{category}</Heading>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
                        {list.map((action) => {
                          const actionIcon = action.icon || FaTools;
                          return (
                            <Box key={action.id} p={3} rounded="lg" borderWidth="1px"
                              borderColor={stepBorder} cursor="pointer" transition="all 0.15s"
                              _hover={{ borderColor: "blue.400", bg: hoverBg, transform: "translateY(-1px)" }}
                              onClick={() => addStep(action)}>
                              <HStack spacing={3}>
                                <Icon as={actionIcon} color="blue.500" boxSize={4} />
                                <VStack align="flex-start" spacing={0} flex="1">
                                  <Text fontSize="xs" fontWeight="bold" noOfLines={1}>{action.name}</Text>
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

      {/* ═══════════════ DELETE CONFIRMATION DIALOG ═══════════════ */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={closeDeleteConfirm}
        isCentered
        closeOnOverlayClick={!isDeletingWorkflow}
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <AlertDialogContent
          bg={dialogBg}
          color={textColor}
          borderRadius="xl"
          border="1px solid"
          borderColor={dialogBorder}
          boxShadow="0 24px 80px rgba(0,0,0,0.3)"
          mx={4}
        >
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            borderBottomWidth="1px"
            borderColor={dialogBorder}
            px={6}
            py={4}
          >
            <HStack spacing={3}>
              {/* <Flex align="center" justify="center" w="36px" h="36px" rounded="lg"
                bg="red.500" color="white" flexShrink={0}>
                <Icon as={FaTrash} boxSize={4} />
              </Flex> */}
              <Text>Delete Workflow</Text>
            </HStack>
          </AlertDialogHeader>

          <AlertDialogBody px={6} py={5} color={subTextColor} fontSize="sm">
            Are you sure you want to delete
            {pendingDeleteWorkflow?.name
              ? <Text as="span" fontWeight="bold" color={textColor}> "{pendingDeleteWorkflow.name}"</Text>
              : " this workflow"}?
            {" "}This action cannot be undone and all pipeline steps will be permanently removed.
          </AlertDialogBody>

          <AlertDialogFooter
            px={6}
            py={4}
            borderTopWidth="1px"
            borderColor={dialogBorder}
            gap={3}
            flexDirection={{ base: "column-reverse", sm: "row" }}
          >
            <Button
              ref={deleteCancelRef}
              variant="ghost"
              onClick={closeDeleteConfirm}
              isDisabled={isDeletingWorkflow}
              w={{ base: "full", sm: "auto" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDelete}
              isLoading={isDeletingWorkflow}
              loadingText="Deleting..."
              w={{ base: "full", sm: "auto" }}
              minW="120px"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Box>
  );
};

export default WorkflowBuilderContent;