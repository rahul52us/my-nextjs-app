"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Text,
  Input,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  InputLeftElement,
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
  FaChevronDown,
  FaSearch,
  FaLightbulb,
} from "react-icons/fa";
import { features } from "../../../layoutComponent/utils/constant";

const WORKFLOW_STORAGE_KEY = "toolsWorkflowBuilder_savedWorkflows";

// ─────────────────────────────────────────────
// OUTPUT TYPE DETECTION
// Detects what file/data type a tool OUTPUTS
// ─────────────────────────────────────────────
type OutputType =
  | "pdf" | "word" | "image" | "audio" | "video"
  | "text" | "base64" | "hex" | "ascii" | "binary"
  | "json" | "csv" | "excel" | "html" | "zip"
  | "qr" | "barcode" | "url" | "hash" | "jwt" | "any";

function detectOutputType(name: string, path: string): OutputType {
  const n = (name + " " + path).toLowerCase();
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
  const n = (name + " " + path).toLowerCase();
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
  if ((n.includes("qr") || n.includes("barcode")) && n.includes("read")) inputs.push("qr", "barcode", "image");
  if (n.includes("url decode") || n.includes("url encode")) inputs.push("url", "text");
  if (n.includes("unzip") || n.includes("extract zip") || n.includes("zip to")) inputs.push("zip");

  if (inputs.length === 0) inputs.push("any");
  return inputs;
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
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
};

type SavedWorkflow = {
  id: string;
  name: string;
  description: string;
  steps: Omit<WorkflowStep, "icon" | "outputType" | "inputTypes">[];
  savedAt: string;
};

// Badge color per output type
const TYPE_COLOR: Record<string, string> = {
  pdf: "red", word: "blue", image: "purple", audio: "orange",
  video: "pink", base64: "cyan", hex: "yellow", ascii: "green",
  binary: "teal", json: "messenger", csv: "whatsapp", excel: "green",
  html: "orange", text: "gray", zip: "yellow", qr: "teal",
  hash: "purple", jwt: "blue", url: "cyan", any: "gray",
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const WorkflowBuilderContent = () => {
  const router = useRouter();
  const toast = useToast();

  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedActionId, setSelectedActionId] = useState("");
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [builderHighlighted, setBuilderHighlighted] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [smartFilter, setSmartFilter] = useState(true);

  // Color tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const accentColor = useColorModeValue("teal.600", "teal.300");
  const stepBg = useColorModeValue("gray.50", "gray.700");
  const stepBorder = useColorModeValue("gray.200", "gray.600");
  const previewBg = useColorModeValue("white", "gray.800");
  const highlightBorder = useColorModeValue("teal.400", "teal.200");
  const menuBg = useColorModeValue("white", "gray.700");
  const menuHoverBg = useColorModeValue("teal.50", "teal.800");
  const menuSelectedBg = useColorModeValue("teal.100", "teal.700");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const smartBannerBg = useColorModeValue("teal.50", "teal.900");
  const sectionDividerBg = useColorModeValue("gray.100", "gray.750");

  // Build full action list with type metadata
  const availableActions: WorkflowAction[] = useMemo(() => {
    return Object.values(features)
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
  }, []);

  // Last step output type — drives smart filtering
  const lastStepOutputType: OutputType | null = useMemo(() => {
    if (steps.length === 0) return null;
    return steps[steps.length - 1].outputType;
  }, [steps]);

  // Partition actions into compatible and other
  const { compatibleActions, otherActions } = useMemo(() => {
    const searchLower = dropdownSearch.toLowerCase();
    const matchesSearch = (a: WorkflowAction) =>
      !searchLower || a.name.toLowerCase().includes(searchLower);

    const isCompatible = (a: WorkflowAction) => {
      if (!smartFilter || !lastStepOutputType) return true;
      return a.inputTypes.includes(lastStepOutputType) || a.inputTypes.includes("any");
    };

    const compatible: WorkflowAction[] = [];
    const others: WorkflowAction[] = [];
    availableActions.forEach((a) => {
      if (!matchesSearch(a)) return;
      if (isCompatible(a)) compatible.push(a);
      else others.push(a);
    });
    return { compatibleActions: compatible, otherActions: others };
  }, [availableActions, lastStepOutputType, dropdownSearch, smartFilter]);

  // Set default selected action
  useEffect(() => {
    if (!selectedActionId && availableActions.length > 0) {
      setSelectedActionId(availableActions[0].id);
    }
  }, [availableActions, selectedActionId]);

  // Auto-select first compatible action when last step changes
  useEffect(() => {
    if (compatibleActions.length > 0) {
      setSelectedActionId(compatibleActions[0].id);
    }
  }, [lastStepOutputType]);

  // Load saved workflows
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (raw) {
      try { setSavedWorkflows(JSON.parse(raw)); } catch {}
    }
  }, []);

  const persistWorkflows = (workflows: SavedWorkflow[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
  };

  const addStep = () => {
    const action = availableActions.find((item) => item.id === selectedActionId);
    if (!action) { toast({ status: "error", title: "Please select a valid step." }); return; }
    setSteps((prev) => [...prev, { ...action, stepNumber: prev.length + 1 }]);
    toast({ status: "success", title: `"${action.name}" added.` });
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
      prev.filter((_, idx) => idx !== index).map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
  };

  const saveWorkflow = () => {
    if (!workflowName.trim()) { toast({ status: "error", title: "Workflow name is required." }); return; }
    if (steps.length === 0) { toast({ status: "error", title: "Add at least one step to save." }); return; }
    const newWorkflow: SavedWorkflow = {
      id: `${Date.now()}`,
      name: workflowName.trim(),
      description: workflowDescription.trim(),
      steps: steps.map(({ id, name, path, stepNumber }) => ({ id, name, path, stepNumber })),
      savedAt: new Date().toISOString(),
    };
    const updated = [newWorkflow, ...savedWorkflows];
    setSavedWorkflows(updated);
    persistWorkflows(updated);
    toast({ status: "success", title: "Workflow saved successfully." });
    return newWorkflow;
  };

  const saveAndGetWorkflow = () => {
    if (!workflowName.trim()) { toast({ status: "error", title: "Workflow name is required." }); return null; }
    if (steps.length === 0) { toast({ status: "error", title: "Add at least one step before running." }); return null; }

    const existing = savedWorkflows.find((wf) => {
      if (wf.name !== workflowName.trim() || wf.steps.length !== steps.length) return false;
      return wf.steps.every((step, index) => step.id === steps[index].id && step.path === steps[index].path);
    });

    if (existing) return existing;
    return saveWorkflow();
  };

  const loadWorkflow = (workflow: SavedWorkflow) => {
    setSteps([]);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);
    const restoredSteps: WorkflowStep[] = workflow.steps.map((step) => {
      const action = availableActions.find(
        (item) => item.id === step.id || item.path === step.path || item.name === step.name
      );
      return {
        id: step.id, name: step.name, path: step.path, stepNumber: step.stepNumber,
        icon: action?.icon ?? FaTools,
        outputType: action?.outputType ?? "any",
        inputTypes: action?.inputTypes ?? ["any"],
      };
    });
    setTimeout(() => {
      setSteps(restoredSteps);
      setBuilderHighlighted(true);
      setTimeout(() => setBuilderHighlighted(false), 2000);
    }, 0);
    toast({ status: "success", title: `✅ Loaded: ${workflow.name}`, description: `${restoredSteps.length} step(s) restored.`, duration: 3000 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteWorkflow = (workflowId: string) => {
    const updated = savedWorkflows.filter((wf) => wf.id !== workflowId);
    setSavedWorkflows(updated);
    persistWorkflows(updated);
    toast({ status: "success", title: "Workflow removed." });
  };

  const clearBuilder = () => {
    setWorkflowName(""); setWorkflowDescription(""); setSteps([]);
    toast({ status: "info", title: "Workflow cleared." });
  };

  const runWorkflow = () => {
    const workflow = saveAndGetWorkflow();
    if (!workflow) return;

    toast({ status: "success", title: "Starting workflow...", description: `Opening upload screen for ${workflow.name}` });
    setTimeout(() => router.push(`/tools/workflow/run/${workflow.id}`), 500);
  };

  const selectedActionName =
    availableActions.find((a) => a.id === selectedActionId)?.name || "Select a tool";

  return (
    <Box minH="80vh" bg={pageBg} color={textColor} p={{ base: 4, md: 8 }}>
      <Heading size="2xl" mb={3} color={accentColor}>Workflow Builder</Heading>
      <Text mb={6} maxW="3xl">
        Build custom workflows by selecting the tools you need, ordering steps,
        and saving ready-to-use workflows.
      </Text>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
        {/* ── Left Panel ── */}
        <Box
          bg={cardBg} rounded="3xl" p={6} shadow="lg"
          borderWidth="2px"
          borderColor={builderHighlighted ? highlightBorder : "transparent"}
          transition="border-color 0.4s ease"
          id="workflow-builder-panel"
        >
          <Heading size="md" mb={4}>Build Your Workflow</Heading>
          <VStack spacing={4} align="stretch">
            <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Workflow name" size="lg" />
            <Input value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)} placeholder="Description (optional)" size="lg" />

            {/* ── Smart Filter Banner ── */}
            {lastStepOutputType && smartFilter && (
              <Flex align="center" justify="space-between" px={4} py={2} bg={smartBannerBg} rounded="xl" borderWidth="1px" borderColor="teal.300">
                <HStack spacing={2}>
                  <Icon as={FaLightbulb} color="teal.400" boxSize={4} />
                  <Text fontSize="sm" color={accentColor} fontWeight="medium">
                    Smart: showing tools that accept{" "}
                    <Badge colorScheme={TYPE_COLOR[lastStepOutputType] || "gray"} ml={1}>
                      {lastStepOutputType.toUpperCase()}
                    </Badge>
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost" colorScheme="teal" onClick={() => setSmartFilter(false)}>
                  Show All
                </Button>
              </Flex>
            )}
            {!smartFilter && lastStepOutputType && (
              <Flex justify="flex-end">
                <Button size="xs" colorScheme="teal" variant="outline" leftIcon={<Icon as={FaLightbulb} />} onClick={() => setSmartFilter(true)}>
                  Re-enable Smart Filter
                </Button>
              </Flex>
            )}

            {/* ── Custom Dropdown ── */}
            <Menu placement="bottom" flip={true} preventOverflow={true} onClose={() => setDropdownSearch("")}>
              <MenuButton
                as={Button}
                rightIcon={<FaChevronDown />}
                width="full"
                size="lg"
                textAlign="left"
                bg={inputBg}
                fontWeight="normal"
                borderWidth="1px"
                borderColor={stepBorder}
                _hover={{ borderColor: "teal.400" }}
                _active={{ borderColor: "teal.500" }}
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              >
                {selectedActionName}
              </MenuButton>

              <MenuList
                bg={menuBg}
                borderColor={stepBorder}
                shadow="2xl"
                rounded="xl"
                zIndex={1500}
                w="520px"          /* ← bigger width */
                maxW="95vw"
                p={0}
                overflow="hidden"
              >
                {/* Search bar */}
                <Box px={3} py={2} borderBottomWidth="1px" borderColor={stepBorder}>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tools..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      bg={inputBg}
                      border="none"
                      _focus={{ boxShadow: "none" }}
                      autoComplete="off"
                    />
                  </InputGroup>
                </Box>

                {/* Scrollable list — tall */}
                <Box maxH="360px" overflowY="auto">

                  {/* Recommended section */}
                  {compatibleActions.length > 0 && (
                    <>
                      {lastStepOutputType && smartFilter && (
                        <Box px={4} py={1.5} bg={smartBannerBg} borderBottomWidth="1px" borderColor={stepBorder}>
                          <Text fontSize="xs" fontWeight="bold" color={accentColor} textTransform="uppercase" letterSpacing="wider">
                            ✦ Recommended Next Steps ({compatibleActions.length})
                          </Text>
                        </Box>
                      )}
                      {compatibleActions.map((action) => (
                        <MenuItem
                          key={action.id}
                          onClick={() => { setSelectedActionId(action.id); setDropdownSearch(""); }}
                          bg={selectedActionId === action.id ? menuSelectedBg : "transparent"}
                          _hover={{ bg: menuHoverBg }}
                          fontWeight={selectedActionId === action.id ? "semibold" : "normal"}
                          fontSize="sm"
                          px={4}
                          py={2.5}
                        >
                          <Flex align="center" justify="space-between" width="full">
                            <HStack spacing={3}>
                              <Icon as={action.icon || FaTools} boxSize={4} color={accentColor} />
                              <Text>{action.name}</Text>
                            </HStack>
                            {action.outputType !== "any" && (
                              <Badge colorScheme={TYPE_COLOR[action.outputType] || "gray"} fontSize="9px" variant="subtle" ml={2} flexShrink={0}>
                                → {action.outputType.toUpperCase()}
                              </Badge>
                            )}
                          </Flex>
                        </MenuItem>
                      ))}
                    </>
                  )}

                  {/* Other tools (dimmed) */}
                  {otherActions.length > 0 && smartFilter && lastStepOutputType && (
                    <>
                      <Box px={4} py={1.5} borderTopWidth="1px" borderBottomWidth="1px" borderColor={stepBorder} bg={sectionDividerBg}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                          Other Tools ({otherActions.length})
                        </Text>
                      </Box>
                      {otherActions.map((action) => (
                        <MenuItem
                          key={action.id}
                          onClick={() => { setSelectedActionId(action.id); setDropdownSearch(""); }}
                          bg="transparent"
                          _hover={{ bg: menuHoverBg }}
                          fontSize="sm"
                          px={4}
                          py={2}
                          opacity={0.5}
                        >
                          <Flex align="center" justify="space-between" width="full">
                            <HStack spacing={3}>
                              <Icon as={action.icon || FaTools} boxSize={4} color="gray.400" />
                              <Text color="gray.500">{action.name}</Text>
                            </HStack>
                            {action.outputType !== "any" && (
                              <Badge colorScheme="gray" fontSize="9px" variant="subtle" ml={2} flexShrink={0}>
                                → {action.outputType.toUpperCase()}
                              </Badge>
                            )}
                          </Flex>
                        </MenuItem>
                      ))}
                    </>
                  )}

                  {compatibleActions.length === 0 && otherActions.length === 0 && (
                    <Box px={4} py={3}>
                      <Text fontSize="sm" color="gray.500">No tools found.</Text>
                    </Box>
                  )}
                </Box>
              </MenuList>
            </Menu>

            <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={addStep}>Add Step</Button>

            {/* ── Steps List ── */}
            <Box>
              <Heading size="sm" mb={3}>Workflow Steps</Heading>
              {steps.length === 0 ? (
                <Text color="gray.500">No steps added yet. Choose a tool and click Add Step.</Text>
              ) : (
                <Stack spacing={3}>
                  {steps.map((step, index) => (
                    <Box key={`${step.id}-${index}`} p={4} bg={stepBg} rounded="2xl" borderWidth="1px" borderColor={stepBorder}>
                      <Flex align="center" justify="space-between" gap={3}>
                        <HStack spacing={3} align="center">
                          <Icon as={step.icon || FaTools} boxSize={5} color={accentColor} />
                          <Box>
                            <HStack spacing={2} flexWrap="wrap">
                              <Text fontWeight="semibold">{step.stepNumber}. {step.name}</Text>
                              {step.outputType !== "any" && (
                                <Badge colorScheme={TYPE_COLOR[step.outputType] || "gray"} fontSize="9px">
                                  → {step.outputType.toUpperCase()}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.500">{step.path}</Text>
                          </Box>
                        </HStack>
                        <HStack spacing={1}>
                          <Tooltip label="Move up">
                            <Button size="sm" variant="ghost" onClick={() => moveStep(index, -1)} isDisabled={index === 0} aria-label="Move step up"><FaArrowUp /></Button>
                          </Tooltip>
                          <Tooltip label="Move down">
                            <Button size="sm" variant="ghost" onClick={() => moveStep(index, 1)} isDisabled={index === steps.length - 1} aria-label="Move step down"><FaArrowDown /></Button>
                          </Tooltip>
                          <Tooltip label="Remove step">
                            <Button size="sm" variant="ghost" colorScheme="red" onClick={() => removeStep(index)} aria-label="Remove step"><FaTrash /></Button>
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
              <Button leftIcon={<FaSave />} colorScheme="teal" onClick={saveWorkflow}>Save Workflow</Button>
              <Button variant="outline" onClick={clearBuilder}>Clear</Button>
              <Button leftIcon={<FaPlay />} colorScheme="green" onClick={runWorkflow}>Finalize</Button>
            </HStack>
          </VStack>
        </Box>

        {/* ── Right Panel ── */}
        <Box bg={cardBg} rounded="3xl" p={6} shadow="lg">
          <Heading size="md" mb={4}>Saved Workflows</Heading>
          {savedWorkflows.length === 0 ? (
            <Text color="gray.500">No saved workflows yet. Save a workflow to see it here.</Text>
          ) : (
            <Stack spacing={4}>
              {savedWorkflows.map((workflow) => (
                <Box key={workflow.id} p={4} bg={stepBg} rounded="2xl" borderWidth="1px" borderColor={stepBorder}>
                  <Flex align="center" justify="space-between" mb={3}>
                    <Box>
                      <Text fontWeight="bold">{workflow.name}</Text>
                      <Text fontSize="sm" color="gray.500">{workflow.description || "No description provided."}</Text>
                    </Box>
                    <Badge colorScheme="green">{workflow.steps.length} step(s)</Badge>
                  </Flex>
                  <Text fontSize="xs" color="gray.500" mb={3}>Saved on {new Date(workflow.savedAt).toLocaleString()}</Text>
                  <HStack spacing={2} wrap="wrap">
                    <Button size="sm" colorScheme="green" onClick={() => router.push(`/tools/workflow/run/${workflow.id}`)}>Run</Button>
                    <Button size="sm" colorScheme="teal" onClick={() => loadWorkflow(workflow)}>Load</Button>
                    <Button size="sm" variant="outline" colorScheme="red" onClick={() => deleteWorkflow(workflow.id)}>Delete</Button>
                  </HStack>
                </Box>
              ))}
            </Stack>
          )}

          <Divider my={6} />

          <Box>
            <Heading size="sm" mb={3}>Workflow Preview</Heading>
            {steps.length === 0 ? (
              <Text color="gray.500">Add steps to see the workflow preview here.</Text>
            ) : (
              <Stack spacing={0}>
                {steps.map((step, index) => (
                  <Box key={`preview-${step.id}-${step.stepNumber}`}>
                    <Flex align="center" justify="space-between" p={3} bg={previewBg} rounded="2xl" borderWidth="1px" borderColor={stepBorder}>
                      <HStack spacing={3}>
                        <Icon as={step.icon || FaTools} boxSize={5} color={accentColor} />
                        <Box>
                          <HStack spacing={2} flexWrap="wrap">
                            <Text fontWeight="semibold">{step.stepNumber}. {step.name}</Text>
                            {step.outputType !== "any" && (
                              <Badge colorScheme={TYPE_COLOR[step.outputType] || "gray"} fontSize="9px">
                                → {step.outputType.toUpperCase()}
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">{step.path}</Text>
                        </Box>
                      </HStack>
                      <Tooltip label="Open step">
                        <Button size="sm" leftIcon={<FaFolderOpen />} onClick={() => router.push(step.path)}>Open</Button>
                      </Tooltip>
                    </Flex>
                    {/* Arrow connector */}
                    {index < steps.length - 1 && (
                      <Flex justify="center" py={1}>
                        <Text fontSize="xl" color={accentColor} lineHeight={1}>↓</Text>
                      </Flex>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default WorkflowBuilderContent;