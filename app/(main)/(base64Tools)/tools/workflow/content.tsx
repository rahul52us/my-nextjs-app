"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box, Button, Heading, Text, Input, VStack, HStack, SimpleGrid,
  Badge, Flex, useColorModeValue, useToast, Icon,
  Menu, MenuButton, MenuList, MenuItem, InputGroup, InputLeftElement,
  Table, Thead, Tbody, Tr, Th, Td, Switch, IconButton,
  FormControl, FormLabel, Select
} from "@chakra-ui/react";
import {
  FaTrash, FaPlay, FaTools, FaChevronDown, FaSearch, FaArrowRight, FaEdit
} from "react-icons/fa";
import { features } from "../../../layoutComponent/utils/constant";
import { AUTH_TOKEN } from "../../../../config/utils/variables";

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

const WorkflowBuilderContent = () => {
  const router = useRouter();
  const toast = useToast();

  const [view, setView] = useState<"list" | "edit">("list");
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedActionId, setSelectedActionId] = useState("");
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [dropdownSearch, setDropdownSearch] = useState("");

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN || "") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Theme colors
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const stepBorder = useColorModeValue("gray.200", "gray.600");
  const menuBg = useColorModeValue("white", "gray.700");
  const menuHoverBg = useColorModeValue("red.50", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const badgeBg = useColorModeValue("blue.50", "blue.900");
  const badgeColor = useColorModeValue("blue.700", "blue.100");
  const badgeBorder = useColorModeValue("blue.100", "blue.700");
  const toolBoxBg = useColorModeValue("blue.50", "blue.900");
  const toolBoxBorder = useColorModeValue("blue.200", "blue.700");

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

  const filteredActions = useMemo(() => {
    const searchLower = dropdownSearch.toLowerCase();
    return availableActions.filter((a) => !searchLower || a.name.toLowerCase().includes(searchLower));
  }, [availableActions, dropdownSearch]);

  useEffect(() => {
    if (!selectedActionId && availableActions.length > 0) {
      setSelectedActionId(availableActions[0].id);
    }
  }, [availableActions, selectedActionId]);

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

  const addStep = () => {
    const action = availableActions.find((item) => item.id === selectedActionId);
    if (!action) { toast({ status: "error", title: "Please select a valid step." }); return; }
    
    let settings = {};
    const slug = action.path.split("/").pop()?.toLowerCase() || "";
    if (slug.includes("compression") || slug.includes("pdf-to-jpg")) settings = { quality: 80 };
    if (slug.includes("split")) settings = { pageRange: "" };
    if (slug.includes("rotate")) settings = { angle: 90 };
    if (slug.includes("watermark")) settings = { watermarkText: "ToolSahayata" };

    setSteps((prev) => [...prev, { ...action, stepNumber: prev.length + 1, settings }]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev.filter((_, idx) => idx !== index).map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
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

  const selectedActionName =
    availableActions.find((a) => a.id === selectedActionId)?.name || "Select a tool";

  const renderSettingsUI = (step: WorkflowStep, index: number) => {
    const slug = step.path.split("/").pop()?.toLowerCase() || "";
    
    if (slug.includes("compression") || slug.includes("pdf-to-jpg")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} pl={2}>
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Compression level:</Text>
          <HStack spacing={2}>
            <Select size="xs" w="120px" bg={inputBg} color={textColor} value={step.settings?.quality || 80} onChange={(e) => updateStepSetting(index, "quality", parseInt(e.target.value))}>
              <option value={90}>Low (Best Quality)</option>
              <option value={80}>Normal (Recommended)</option>
              <option value={50}>High (Smallest File)</option>
              <option value={20}>Extreme (Lowest Quality)</option>
            </Select>
          </HStack>
        </VStack>
      );
    }

    if (slug.includes("split")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} pl={2}>
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Split range:</Text>
          <Input size="xs" bg={inputBg} color={textColor} placeholder="e.g. 1-3, 5-8" value={step.settings?.pageRange || ""} onChange={(e) => updateStepSetting(index, "pageRange", e.target.value)} />
        </VStack>
      );
    }

    if (slug.includes("rotate")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} pl={2}>
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Rotation angle:</Text>
          <Select size="xs" w="100px" bg={inputBg} color={textColor} value={step.settings?.angle || 90} onChange={(e) => updateStepSetting(index, "angle", parseInt(e.target.value))}>
            <option value={90}>90° Clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° Clockwise</option>
          </Select>
        </VStack>
      );
    }

    if (slug.includes("watermark")) {
      return (
        <VStack align="flex-start" spacing={1} mt={2} pl={2}>
          <Text fontSize="xs" color={subTextColor} fontWeight="semibold">Watermark text:</Text>
          <Input size="xs" bg={inputBg} color={textColor} value={step.settings?.watermarkText || ""} onChange={(e) => updateStepSetting(index, "watermarkText", e.target.value)} />
        </VStack>
      );
    }

    return null;
  };

  return (
    <Box minH="80vh" bg={pageBg} color={textColor} p={{ base: 4, md: 8, lg: 12 }}>
      {view === "list" && (
        <Box maxW="6xl" mx="auto">
          <Heading size="xl" color={textColor} mb={6} fontWeight="bold">Workflows</Heading>
          
          <Box bg={cardBg} p={{ base: 4, md: 8 }} rounded="xl" shadow="sm" borderWidth="1px" borderColor={stepBorder}>
          <Text color={subTextColor} mb={8} fontSize="md" lineHeight="tall">
            Simplify tasks by connecting tools into one automated workflow. Create custom workflows that connect your favorite tools. Set up each step, fine-tune your settings, and save your automations for easy access whenever you need them.
          </Text>

          <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
            <Heading size="lg" color={textColor}>My workflows</Heading>
            <Button
              variant="outline"
              colorScheme="gray"
              onClick={() => { clearBuilder(); setEditingWorkflowId(null); setView("edit"); }}
              size="md"
              fontWeight="medium"
            >
              Create new workflow
            </Button>
          </Flex>

          <Box borderWidth="1px" borderColor={stepBorder} rounded="md" overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color={subTextColor} fontSize="sm" textTransform="none">Name</Th>
                  <Th color={subTextColor} fontSize="sm" textTransform="none">Tools</Th>
                  <Th color={subTextColor} fontSize="sm" textTransform="none">Status</Th>
                  <Th color={subTextColor} fontSize="sm" textTransform="none" textAlign="right"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {savedWorkflows.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={8} color={subTextColor}>
                      No workflows created yet. Click "Create new workflow" to get started!
                    </Td>
                  </Tr>
                ) : (
                  savedWorkflows.map((workflow) => (
                    <Tr key={workflow.id} _hover={{ bg: tableHeaderBg }} opacity={workflow.isActive ? 1 : 0.6}>
                      <Td fontWeight="medium" color={textColor} w="20%">
                        <HStack>
                          <Icon as={FaTools} color="blue.500" />
                          <Text>{workflow.name}</Text>
                        </HStack>
                      </Td>
                      <Td w="50%">
                        <Flex flexWrap="wrap" align="center" gap={2}>
                          {workflow.steps.map((step, idx) => (
                            <React.Fragment key={step.id + idx}>
                              <Badge bg={badgeBg} color={badgeColor} textTransform="none" rounded="md" px={3} py={1} fontSize="xs" fontWeight="medium" border="1px solid" borderColor={badgeBorder}>
                                {step.name}
                              </Badge>
                              {idx < workflow.steps.length - 1 && <Icon as={FaArrowRight} boxSize={3} color={subTextColor} />}
                            </React.Fragment>
                          ))}
                        </Flex>
                      </Td>
                      <Td w="10%">
                        <Switch colorScheme="green" isChecked={workflow.isActive} onChange={() => toggleWorkflowStatus(workflow.id)} />
                      </Td>
                      <Td textAlign="right" w="20%">
                        <HStack justify="flex-end" spacing={1}>
                          <IconButton aria-label="Run" icon={<FaPlay />} size="sm" variant="ghost" color={subTextColor} isDisabled={!workflow.isActive} onClick={() => runWorkflowAction(workflow)} _hover={{ color: "green.500" }} />
                          <IconButton aria-label="Edit" icon={<FaEdit />} size="sm" variant="ghost" color={subTextColor} onClick={() => { loadWorkflow(workflow); setEditingWorkflowId(workflow.id); setView("edit"); }} _hover={{ color: "blue.500" }} />
                          <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" variant="ghost" color={subTextColor} onClick={() => deleteWorkflow(workflow.id)} _hover={{ color: "red.500" }} />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
      )}

      {view === "edit" && (
        <Box maxW="6xl" mx="auto">
          <Heading size="lg" color={textColor} mb={8} fontWeight="semibold">
            <Text as="span" color={subTextColor} cursor="pointer" onClick={() => setView("list")} _hover={{ color: textColor }}>
              Workflows
            </Text> / {editingWorkflowId ? "Edit Workflow" : "Create Workflow"}
          </Heading>

          <Box bg={cardBg} p={{ base: 6, md: 8 }} rounded="xl" shadow="sm" borderWidth="1px" borderColor={stepBorder}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={12}>
              {/* Left Column: Tool selection */}
              <Box>
                <Heading size="md" mb={6} color={textColor} fontWeight="semibold" borderBottomWidth="1px" borderColor={stepBorder} pb={2}>Tool selection</Heading>
                <VStack align="stretch" spacing={6}>
                  <Box bg={toolBoxBg} p={5} rounded="md" borderWidth="1px" borderColor={toolBoxBorder}>
                    <Text fontWeight="semibold" mb={2} color={textColor}>Workflow name:</Text>
                    <Text fontSize="sm" color={subTextColor} mb={4}>Enter a workflow name so you can find it in tools and on the homepage.</Text>
                    <Input bg={cardBg} color={textColor} value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Workflow name" size="md" borderColor={stepBorder} _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #4299E1" }} />
                  </Box>

                  <Box>
                    <Text fontWeight="semibold" mb={2} color={textColor}>Select a tool:</Text>
                    <Menu placement="bottom" flip={true} preventOverflow={true} onClose={() => setDropdownSearch("")}>
                      <MenuButton
                        as={Button}
                        rightIcon={<FaChevronDown />}
                        width="full"
                        size="md"
                        textAlign="left"
                        bg={cardBg}
                        color={textColor}
                        fontWeight="normal"
                        borderWidth="1px"
                        borderColor={stepBorder}
                        _hover={{ borderColor: "gray.400" }}
                        _active={{ bg: tableHeaderBg }}
                      >
                        {selectedActionName}
                      </MenuButton>
                      <MenuList bg={menuBg} borderColor={stepBorder} shadow="xl" rounded="md" zIndex={1500} w={{ base: "100%", md: "400px" }} maxH="300px" overflowY="auto" p={0}>
                        <Box px={3} py={2} borderBottomWidth="1px" borderColor={stepBorder} position="sticky" top={0} bg={menuBg} zIndex={1}>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.400" /></InputLeftElement>
                            <Input placeholder="Search tools..." value={dropdownSearch} onChange={(e) => setDropdownSearch(e.target.value)} border="none" _focus={{ boxShadow: "none" }} />
                          </InputGroup>
                        </Box>
                        {filteredActions.map((action) => (
                          <MenuItem
                            key={action.id}
                            onClick={() => { setSelectedActionId(action.id); setDropdownSearch(""); }}
                            bg={selectedActionId === action.id ? menuHoverBg : "transparent"}
                            _hover={{ bg: menuHoverBg }}
                            fontSize="sm"
                            px={4}
                            py={2.5}
                          >
                            <HStack spacing={3}>
                              <Icon as={action.icon || FaTools} boxSize={4} color="gray.500" />
                              <Text color={textColor}>{action.name}</Text>
                            </HStack>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Box>

                  <Flex justify="flex-end">
                    <Button variant="outline" colorScheme="blue" borderColor="blue.400" color="blue.400" rightIcon={<FaArrowRight />} onClick={addStep} _hover={{ bg: "blue.50" }} size="sm" px={6}>
                      Add step
                    </Button>
                  </Flex>
                </VStack>
              </Box>

              {/* Right Column: Workflow preview */}
              <Box>
                <Heading size="md" mb={6} color={textColor} fontWeight="semibold" borderBottomWidth="1px" borderColor={stepBorder} pb={2}>Workflow preview</Heading>
                <Box>
                  {steps.length === 0 ? (
                    <Text color={subTextColor} fontSize="sm" textAlign="center" py={8}>No tools selected. Add a step from the left.</Text>
                  ) : (
                    <VStack align="stretch" spacing={0} pl={2}>
                      {steps.map((step, index) => (
                        <Flex key={step.id + index} position="relative" pb={index < steps.length - 1 ? 6 : 0}>
                          {/* Vertical line connecting steps */}
                          {index < steps.length - 1 && (
                            <Box position="absolute" left="11px" top="24px" bottom="-4px" width="1px" bg={stepBorder} zIndex={0} />
                          )}
                          
                          <Flex align="flex-start" gap={4} zIndex={1} width="100%">
                            <Flex align="center" justify="center" w="24px" h="24px" rounded="full" bg={tableHeaderBg} color={subTextColor} fontWeight="bold" fontSize="xs" flexShrink={0} mt={1}>
                              {index + 1}
                            </Flex>
                            <Box flex="1">
                              <Flex justify="space-between" align="center">
                                <HStack spacing={3} align="flex-start">
                                  <Icon as={step.icon || FaTools} color="blue.500" boxSize={4} mt={1} />
                                  <VStack align="flex-start" spacing={0}>
                                    <Text fontWeight="semibold" color={textColor}>{step.name}</Text>
                                    {renderSettingsUI(step, index)}
                                  </VStack>
                                </HStack>
                                <IconButton aria-label="Remove" icon={<FaTrash />} size="xs" variant="ghost" color={subTextColor} _hover={{ color: "red.500", bg: "red.50" }} onClick={() => removeStep(index)} />
                              </Flex>
                            </Box>
                          </Flex>
                        </Flex>
                      ))}
                    </VStack>
                  )}

                  <Flex justify="flex-end" mt={12} gap={6} align="center">
                    <Button variant="link" color="blue.500" fontWeight="normal" onClick={() => setView("list")} fontSize="sm">
                      Cancel
                    </Button>
                    <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }} onClick={async () => {
                      const saved = saveWorkflow();
                      const savedWorkflow = await saved;
                      if (savedWorkflow) setView("list");
                    }} px={8} size="md">
                      {editingWorkflowId ? "Update Workflow" : "Create Workflow"}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            </SimpleGrid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WorkflowBuilderContent;
