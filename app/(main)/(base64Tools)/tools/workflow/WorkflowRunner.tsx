'use client';

import React, { type ChangeEvent, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  Stack,
  Badge,
  Icon,
  FormLabel,
  useColorModeValue,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  Flex,
  Spinner,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaCloudUploadAlt, FaFileAlt, FaCheckCircle,
  FaExclamationTriangle, FaDownload, FaArrowLeft,
  FaRedo, FaTools, FaSlidersH, FaPercent
} from "react-icons/fa";
import { useWorkflowExecution, SavedWorkflow } from "../../../../hooks/useWorkflowExecution";
import { features } from "../../../layoutComponent/utils/constant";
import axios from "axios";
import { AUTH_TOKEN } from "../../../../config/utils/variables";

type WorkflowRunnerProps = {
  workflowId: string;
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function WorkflowRunner({ workflowId }: WorkflowRunnerProps) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<SavedWorkflow | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [textInput, setTextInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const MAX_WORKFLOW_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const { state, runWorkflow, reset } = useWorkflowExecution(workflow);

  // Check if first step accepts text input
  const isTextFirstStep = useMemo(() => {
    if (!workflow || workflow.steps.length === 0) return false;
    const name = workflow.steps[0].name.toLowerCase();
    const path = workflow.steps[0].path.toLowerCase();
    return name.includes("text") || 
           name.includes("ascii") || 
           name.includes("hex") || 
           name.includes("decimal") || 
           name.includes("base64") || 
           name.includes("json") || 
           name.includes("regex") || 
           name.includes("chatbot") || 
           name.includes("cv") ||
           name.includes("formatter") ||
           name.includes("color") ||
           name.includes("timestamp") ||           name.includes("url") || 
           path.includes("url") ||            path.includes("encoder") ||
           path.includes("decoder") ||
           path.includes("binary") ||
           path.includes("tools/text") ||
           path.includes("tools/json");
  }, [workflow]);

  useEffect(() => {
    if (isTextFirstStep) {
      setInputType("text");
    } else {
      setInputType("file");
    }
  }, [isTextFirstStep]);

  // Map features to have access to step icons
  const availableActions = useMemo(() => {
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

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const tokenKey = AUTH_TOKEN || "auth_token";
        const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
        const { data } = await axios.get(`/workflows/${workflowId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setWorkflow(data?.data ?? null);
      } catch (error) {
        console.error("Failed to load workflow", error);
        setWorkflow(null);
      } finally {
        setLoadingSaved(false);
      }
    };
    loadWorkflow();
  }, [workflowId]);

  useEffect(() => {
    if (!state.resultBlob) { setDownloadUrl(null); return; }
    const url = URL.createObjectURL(state.resultBlob);
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.resultBlob]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > MAX_WORKFLOW_FILE_SIZE) {
      setValidationError(`Selected file is too large for workflow processing. Maximum allowed size is ${formatBytes(MAX_WORKFLOW_FILE_SIZE)}.`);
      setUploadedFile(null);
      return;
    }

    setValidationError(null);
    setUploadedFile(file);
  };

  // Drag and Drop triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (workflow?.isActive !== false && state.status !== "running") {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (workflow?.isActive === false || state.status === "running") return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_WORKFLOW_FILE_SIZE) {
        setValidationError(`Selected file is too large for workflow processing. Maximum allowed size is ${formatBytes(MAX_WORKFLOW_FILE_SIZE)}.`);
        setUploadedFile(null);
        return;
      }
      setValidationError(null);
      setUploadedFile(file);
    }
  };

  const handleStart = async () => {
    if (!workflow || !workflow.isActive) return;
    setValidationError(null);

    if (inputType === "text") {
      if (!textInput.trim()) return;
      const firstStepName = workflow.steps[0]?.name.toLowerCase() || "";
      const extension = firstStepName.includes("json") ? ".json" : ".txt";
      const mime = firstStepName.includes("json") ? "application/json" : "text/plain";
      const file = new File([textInput], `input${extension}`, { type: mime });
      await runWorkflow(file);
    } else {
      if (!uploadedFile) return;
      if (uploadedFile.size > MAX_WORKFLOW_FILE_SIZE) {
        setValidationError(`Selected file is too large for workflow processing. Maximum allowed size is ${formatBytes(MAX_WORKFLOW_FILE_SIZE)}.`);
        return;
      }
      await runWorkflow(uploadedFile);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setTextInput("");
    setValidationError(null);
    reset();
  };

  const stepCount = workflow?.steps.length ?? 0;
  const progressValue =
    stepCount > 0
      ? ((state.currentStepIndex + (state.status === "completed" ? 1 : 0)) / stepCount) * 100
      : 0;

  const getResultExtension = () => {
    if (state.resultBlob) {
      const map: Record<string, string> = {
        "image/jpeg": ".jpg",
        "application/zip": ".zip",
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
        "application/msword": ".doc",
        "text/plain": ".txt",
        "text/csv": ".csv",
        "application/json": ".json",
      };
      if (map[state.resultBlob.type]) return map[state.resultBlob.type];
    }
    const last = workflow?.steps?.[workflow.steps.length - 1]?.name.toLowerCase() || "";
    if (last.includes("word") || last.includes("docx") || last.includes("doc")) return ".docx";
    if (last.includes("jpg") || last.includes("image")) return ".jpg";
    if (last.includes("zip")) return ".zip";
    if (last.includes("pdf")) return ".pdf";
    if (last.includes("csv")) return ".csv";
    if (last.includes("json")) return ".json";
    if (uploadedFile?.name?.includes("."))
      return uploadedFile.name.slice(uploadedFile.name.lastIndexOf("."));
    return "";
  };

  const resultFileName = uploadedFile?.name
    ? `${uploadedFile.name.replace(/\.[^.]+$/, "") || "result"}-workflow-output${getResultExtension()}`
    : "workflow-result";

  const errorMessage = state.status === "error" ? state.error : undefined;

  // Expected file format based on first step
  const expectedFormatText = useMemo(() => {
    if (!workflow || workflow.steps.length === 0) return "any file";
    const firstStep = workflow.steps[0];
    const name = firstStep.name.toLowerCase();
    if (name.includes("pdf")) return "PDF file";
    if (name.includes("word") || name.includes("doc")) return "Word document";
    if (name.includes("excel") || name.includes("csv")) return "Excel/CSV table";
    if (name.includes("image") || name.includes("jpg") || name.includes("png")) return "Image file";
    if (name.includes("audio") || name.includes("mp3")) return "Audio track";
    if (name.includes("zip")) return "ZIP archive";
    if (name.includes("json")) return "JSON file";
    return "compatible format";
  }, [workflow]);

  // Color tokens
  const cardBg = useColorModeValue("white", "gray.850");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.450");
  const uploadBg = useColorModeValue("gray.50", "gray.800");
  const uploadHoverBg = useColorModeValue("blue.50", "gray.750");
  const uploadBorder = useColorModeValue("gray.300", "gray.600");
  const stepBg = useColorModeValue("gray.50", "gray.750");

  const statusColor = (s: string) =>
    s === "completed" ? "green" : s === "running" ? "blue" : s === "failed" ? "red" : "gray";

  // Calculate compression/processing savings
  const sizeStats = useMemo(() => {
    if (!uploadedFile || !state.resultBlob || state.status !== "completed") return null;
    const orig = uploadedFile.size;
    const res = state.resultBlob.size;
    const diff = orig - res;
    const ratio = Math.round((diff / orig) * 100);
    return {
      original: formatBytes(orig),
      processed: formatBytes(res),
      reduced: diff > 0,
      savingsPercent: ratio > 0 ? ratio : 0,
    };
  }, [uploadedFile, state.resultBlob, state.status]);

  return (
    <Box py={{ base: 6, md: 10 }} px={{ base: 4, md: 8 }} maxW="4xl" mx="auto" minH="85vh">
      {/* Top Navigation */}
      <HStack justify="space-between" mb={8} flexWrap="wrap" gap={3}>
        <Button
          leftIcon={<FaArrowLeft />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={() => router.push("/tools/workflow")}
        >
          Back to Workflows
        </Button>
        <Heading size="xs" color={mutedText} textTransform="uppercase" letterSpacing="wider">
          Workflow Pipeline Runner
        </Heading>
      </HStack>

      {loadingSaved ? (
        <Flex justify="center" align="center" py={12}>
          <Spinner size="lg" color="blue.500" thickness="3px" />
          <Text ml={3}>Loading workflow details...</Text>
        </Flex>
      ) : !workflow ? (
        <Alert status="error" rounded="2xl" shadow="sm">
          <AlertIcon />
          <Box>
            <AlertTitle>Workflow not found</AlertTitle>
            <AlertDescription>
              The workflow ID may be invalid or it has been removed.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <Stack spacing={6}>
          {/* Workflow Header Panel */}
          <Box
            p={6}
            bg={cardBg}
            rounded="2xl"
            borderWidth="1px"
            borderColor={cardBorder}
            shadow="sm"
          >
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <VStack align="flex-start" spacing={1}>
                <Heading size="md">{workflow.name}</Heading>
                <Text color={mutedText} fontSize="sm">
                  {workflow.description || "No description provided."}
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle" px={2.5} py={1} rounded="md">
                  {workflow.steps.length} Step{workflow.steps.length !== 1 ? "s" : ""}
                </Badge>
                {workflow.isActive === false && (
                  <Badge colorScheme="red" variant="solid" px={2.5} py={1} rounded="md">
                    Disabled
                  </Badge>
                )}
              </HStack>
            </Flex>
          </Box>

          {/* Inactive workflow warning */}
          {workflow.isActive === false && (
            <Alert status="warning" rounded="2xl" variant="subtle">
              <AlertIcon />
              <Box>
                <AlertTitle>Workflow is inactive</AlertTitle>
                <AlertDescription fontSize="sm">
                  Please activate this workflow toggle in the Workflow Builder to upload and process files.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Running State: Pipeline Timeline Runner */}
          {state.status === "running" && (
            <Box p={6} bg={cardBg} rounded="2xl" borderWidth="1px" borderColor={cardBorder} shadow="sm">
              <Heading size="sm" mb={4}>
                Executing Pipeline Steps...
              </Heading>
              <Progress value={progressValue} size="xs" colorScheme="blue" rounded="full" mb={6} hasStripe isAnimated />

              <VStack align="stretch" spacing={3}>
                {workflow.steps.map((step, index) => {
                  const stepState = state.steps[index];
                  const status = stepState?.status ?? "pending";
                  const action = availableActions.find((a) => a.id === step.id || a.path === step.path || a.name === step.name);
                  const stepIcon = action?.icon ?? FaTools;

                  const isCurrent = state.currentStepIndex === index;

                  return (
                    <Box
                      key={`${step.id}-${index}`}
                      p={4}
                      rounded="xl"
                      bg={isCurrent ? useColorModeValue("blue.50", "gray.750") : stepBg}
                      borderWidth="1px"
                      borderColor={isCurrent ? "blue.300" : cardBorder}
                      transition="all 0.2s"
                    >
                      <Flex align="center" justify="space-between">
                        <HStack spacing={3}>
                          {status === "running" ? (
                            <Spinner size="xs" color="blue.500" />
                          ) : status === "completed" ? (
                            <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                          ) : status === "failed" ? (
                            <Icon as={FaExclamationTriangle} color="red.500" boxSize={4} />
                          ) : (
                            <Flex
                              w="18px"
                              h="18px"
                              rounded="full"
                              bg="gray.300"
                              color="white"
                              fontSize="10px"
                              fontWeight="bold"
                              align="center"
                              justify="center"
                            >
                              {index + 1}
                            </Flex>
                          )}

                          <Icon as={stepIcon} color={isCurrent ? "blue.500" : "gray.400"} boxSize={4} />
                          <VStack align="flex-start" spacing={0}>
                            <Text fontWeight={isCurrent ? "bold" : "semibold"} fontSize="sm" color={isCurrent ? "blue.600" : "inherit"}>
                              {step.name}
                            </Text>
                            {step.settings && Object.keys(step.settings).length > 0 && (
                              <HStack spacing={1} color="gray.500" fontSize="10px">
                                <Icon as={FaSlidersH} />
                                <Text>
                                  {Object.entries(step.settings)
                                    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                                    .join(" | ")}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </HStack>

                        <Badge colorScheme={statusColor(status)} fontSize="9px" px={2} py={0.5} rounded="md">
                          {status.toUpperCase()}
                        </Badge>
                      </Flex>

                      {status === "failed" && stepState?.message && (
                        <Box mt={3} p={2.5} bg="red.50" _dark={{ bg: "red.950" }} rounded="md" borderLeftWidth="3px" borderColor="red.400">
                          <Text fontSize="xs" color="red.700" _dark={{ color: "red.200" }} fontWeight="semibold">
                            Error: {stepState.message}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          )}

          {/* Success Screen */}
          {state.status === "completed" && state.resultBlob && downloadUrl && (
            <VStack spacing={6} align="stretch">
              <Box
                p={8}
                bg={cardBg}
                rounded="2xl"
                borderWidth="1px"
                borderColor="green.200"
                shadow="sm"
                textAlign="center"
              >
                <Icon as={FaCheckCircle} color="green.450" boxSize={16} mb={4} />
                <Heading size="lg" mb={2}>Workflow Complete!</Heading>
                <Text color={mutedText} mb={6} maxW="md" mx="auto">
                  All pipeline steps ran successfully. Your processed output file is ready for download.
                </Text>

                {sizeStats && (
                  <SimpleGrid columns={2} gap={4} maxW="sm" mx="auto" mb={6} p={4} bg={stepBg} rounded="xl" borderWidth="1px" borderColor={cardBorder}>
                    <VStack spacing={0}>
                      <Text fontSize="xs" color={mutedText}>Original Size</Text>
                      <Text fontWeight="bold" fontSize="md">{sizeStats.original}</Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontSize="xs" color={mutedText}>Result Size</Text>
                      <Text fontWeight="bold" fontSize="md" color={sizeStats.reduced ? "green.500" : "inherit"}>
                        {sizeStats.processed}
                      </Text>
                    </VStack>
                    {sizeStats.reduced && sizeStats.savingsPercent > 0 && (
                      <Flex gridColumn="span 2" align="center" justify="center" color="green.500" gap={1} fontSize="xs" fontWeight="semibold" pt={2} borderTopWidth="1px" borderColor={cardBorder}>
                        <Icon as={FaPercent} />
                        <Text>File compressed by {sizeStats.savingsPercent}%!</Text>
                      </Flex>
                    )}
                  </SimpleGrid>
                )}

                <VStack spacing={3} maxW="xs" mx="auto">
                  <Button
                    as={Link}
                    href={downloadUrl}
                    download={resultFileName}
                    bgGradient="linear(to-r, green.400, green.600)"
                    color="white"
                    _hover={{ bgGradient: "linear(to-r, green.500, green.700)", textDecoration: "none", transform: "translateY(-1px)" }}
                    leftIcon={<FaDownload />}
                    w="full"
                    size="lg"
                    rounded="xl"
                    fontWeight="bold"
                    shadow="md"
                  >
                    Download Output File
                  </Button>
                  <Button
                    leftIcon={<FaRedo />}
                    variant="outline"
                    onClick={handleReset}
                    w="full"
                    rounded="xl"
                    size="sm"
                  >
                    Process Another File
                  </Button>
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Idle / Ready / Error Upload Panel */}
          {(state.status === "idle" || state.status === "error") && (
            <Box
              p={6}
              bg={cardBg}
              rounded="2xl"
              borderWidth="1px"
              borderColor={cardBorder}
              shadow="sm"
              opacity={workflow.isActive === false ? 0.6 : 1}
            >
              <VStack align="stretch" spacing={5}>
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                  <Heading size="md" fontWeight="bold">
                    Run Automation
                  </Heading>
                  {isTextFirstStep && (
                    <HStack bg={stepBg} p={1} rounded="xl" borderWidth="1px" borderColor={cardBorder} spacing={1}>
                      <Button
                        size="xs"
                        variant={inputType === "text" ? "solid" : "ghost"}
                        colorScheme={inputType === "text" ? "blue" : "gray"}
                        onClick={() => setInputType("text")}
                        rounded="lg"
                      >
                        Paste Text
                      </Button>
                      <Button
                        size="xs"
                        variant={inputType === "file" ? "solid" : "ghost"}
                        colorScheme={inputType === "file" ? "blue" : "gray"}
                        onClick={() => setInputType("file")}
                        rounded="lg"
                      >
                        Upload File
                      </Button>
                    </HStack>
                  )}
                </Flex>

                {inputType === "text" ? (
                  <VStack align="stretch" spacing={2}>
                    <FormLabel fontSize="sm" fontWeight="semibold" m={0}>
                      Enter Input Text for {workflow.steps[0]?.name}:
                    </FormLabel>
                    <Textarea
                      placeholder={`Type or paste the text data to process... (e.g. text for ${workflow.steps[0]?.name})`}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      size="md"
                      bg={uploadBg}
                      borderColor={uploadBorder}
                      _focus={{ borderColor: "blue.400" }}
                      rows={6}
                      rounded="xl"
                      fontFamily="monospace"
                      disabled={workflow.isActive === false}
                    />
                  </VStack>
                ) : (
                  /* Drag and Drop Zone */
                  <Box
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor={isDragging ? "blue.400" : uploadBorder}
                    bg={isDragging ? uploadHoverBg : uploadBg}
                    rounded="2xl"
                    p={8}
                    textAlign="center"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    transition="all 0.2s"
                    cursor={workflow.isActive === false ? "not-allowed" : "pointer"}
                    position="relative"
                  >
                    <FormLabel
                      htmlFor="file-upload"
                      m={0}
                      w="full"
                      h="full"
                      cursor={workflow.isActive === false ? "not-allowed" : "pointer"}
                    >
                      <VStack spacing={3}>
                        <Icon
                          as={FaCloudUploadAlt}
                          color={isDragging ? "blue.500" : "gray.400"}
                          boxSize={12}
                          transition="transform 0.15s"
                          _hover={{ transform: "scale(1.05)" }}
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="md">
                            {uploadedFile ? "Selected file:" : "Drag & drop your file here"}
                          </Text>
                          <Text fontSize="xs" color={mutedText} mt={1}>
                            {uploadedFile ? `${uploadedFile.name} (${formatBytes(uploadedFile.size)})` : `or click to browse from device. Expected format: ${expectedFormatText}`}
                          </Text>
                        </Box>
                      </VStack>
                      <Input
                        id="file-upload"
                        type="file"
                        display="none"
                        onChange={handleFileChange}
                        disabled={workflow.isActive === false}
                      />
                    </FormLabel>
                  </Box>
                )}

                {/* Reset or Run actions */}
                <HStack spacing={3}>
                  <Button
                    size="md"
                    colorScheme="blue"
                    px={8}
                    rounded="xl"
                    isDisabled={
                      (inputType === "text" ? !textInput.trim() : !uploadedFile) || 
                      workflow.isActive === false
                    }
                    onClick={handleStart}
                    fontWeight="bold"
                  >
                    Start Pipeline Processing
                  </Button>
                  {(inputType === "text" ? textInput : uploadedFile) && (
                    <Button size="md" variant="ghost" rounded="xl" onClick={handleReset}>
                      Clear Selection
                    </Button>
                  )}
                </HStack>

                {(validationError || errorMessage) && (
                  <Alert status="error" rounded="xl" variant="subtle" fontSize="sm">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Pipeline execution failed</AlertTitle>
                      <AlertDescription>{validationError || errorMessage}</AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
