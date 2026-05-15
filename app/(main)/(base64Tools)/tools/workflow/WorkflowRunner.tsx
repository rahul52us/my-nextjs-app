'use client';

import { type ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
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
} from "@chakra-ui/react";
import { FiUpload, FiFile, FiCheck } from "react-icons/fi";
import { useWorkflowExecution, SavedWorkflow } from "../../../../hooks/useWorkflowExecution";

const WORKFLOW_STORAGE_KEY = "toolsWorkflowBuilder_savedWorkflows";

type WorkflowRunnerProps = {
  workflowId: string;
};

export default function WorkflowRunner({ workflowId }: WorkflowRunnerProps) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<SavedWorkflow | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const { state, runWorkflow, reset } = useWorkflowExecution(workflow);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) { setLoadingSaved(false); return; }
    try {
      const savedWorkflows: SavedWorkflow[] = JSON.parse(raw);
      const matched = savedWorkflows.find((w) => w.id === workflowId) ?? null;
      setWorkflow(matched);
    } catch (error) {
      console.error("Failed to load workflow", error);
      setWorkflow(null);
    }
    setLoadingSaved(false);
  }, [workflowId]);

  useEffect(() => {
    if (!state.resultBlob) { setDownloadUrl(null); return; }
    const url = URL.createObjectURL(state.resultBlob);
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.resultBlob]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadedFile(event.target.files?.[0] ?? null);
  };

  const handleStart = async () => {
    if (!uploadedFile || !workflow) return;
    await runWorkflow(uploadedFile);
  };

  const handleReset = () => {
    setUploadedFile(null);
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
        "text/plain": ".txt",
        "text/csv": ".csv",
        "application/json": ".json",
      };
      if (map[state.resultBlob.type]) return map[state.resultBlob.type];
    }
    const last = workflow?.steps?.[workflow.steps.length - 1]?.name.toLowerCase() || "";
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

  // ── colour tokens ──────────────────────────────────────────────
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const inputHover = useColorModeValue("gray.100", "gray.600");
  const pillBorder = useColorModeValue("gray.200", "gray.600");
  const stepBg = useColorModeValue("gray.50", "gray.750");

  const statusColor = (s: string) =>
    s === "completed" ? "green" : s === "running" ? "teal" : s === "failed" ? "red" : "gray";

  return (
    <Box py={{ base: 6, md: 10 }} px={{ base: 4, md: 8 }} maxW="container.lg" mx="auto">

      {/* ── Header ── */}
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="xl">Workflow Runner</Heading>
          <Text color={mutedText}>
            Upload once and let the selected workflow run through all steps automatically.
          </Text>
        </VStack>
        <Button size="sm" variant="outline" onClick={() => router.push("/tools/workflow")}>
          Back to Builder
        </Button>
      </HStack>

      {/* ── States ── */}
      {loadingSaved ? (
        <Text>Loading workflow…</Text>
      ) : !workflow ? (
        <Alert status="error" rounded="xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Workflow not found</AlertTitle>
            <AlertDescription>
              The workflow ID may be invalid or the workflow has been removed.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <Stack spacing={5}>

          {/* ── Workflow info card ── */}
          <Box p={6} bg={cardBg} rounded="xl" borderWidth="0.5px" borderColor={cardBorder}>
            <Heading size="md" mb={1}>{workflow.name}</Heading>
            <Text color={mutedText}>{workflow.description || "No description provided."}</Text>
            <Text fontSize="sm" color={mutedText} mt={2}>
              {workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}
            </Text>
          </Box>

          {/* ── Upload card ── */}
          <Box p={6} bg={cardBg} rounded="xl" borderWidth="0.5px" borderColor={cardBorder}>
            <VStack align="stretch" spacing={4}>
              <Heading size="md" fontWeight="500">Upload file</Heading>

              {/* Custom file trigger */}
              <FormLabel
                htmlFor="file-upload"
                display="flex"
                alignItems="center"
                gap={3}
                px={4}
                py={3}
                bg={inputBg}
                borderWidth="0.5px"
                borderColor={inputBorder}
                rounded="lg"
                cursor="pointer"
                _hover={{ bg: inputHover }}
                transition="background 0.15s"
                m={0}
              >
                <Icon as={FiUpload} color="gray.500" boxSize={5} />
                <Text
                  fontSize="sm"
                  color={uploadedFile ? "inherit" : mutedText}
                  noOfLines={1}
                  flex={1}
                >
                  {uploadedFile ? uploadedFile.name : "Choose a file…"}
                </Text>
                <Input
                  id="file-upload"
                  type="file"
                  display="none"
                  onChange={handleFileChange}
                />
              </FormLabel>

              {/* Selected file pill */}
              {uploadedFile && (
                <HStack
                  px={3}
                  py={2}
                  bg={inputBg}
                  borderWidth="0.5px"
                  borderColor={pillBorder}
                  rounded="lg"
                  spacing={2}
                >
                  <Icon as={FiFile} boxSize={4} color="gray.500" />
                  <Text fontSize="xs" flex={1} noOfLines={1}>
                    {uploadedFile.name}
                  </Text>
                  <Icon as={FiCheck} boxSize={4} color="green.400" />
                </HStack>
              )}

              {/* Action buttons */}
              <HStack spacing={3}>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!uploadedFile || state.status === "running"}
                  onClick={handleStart}
                >
                  {state.status === "running" ? "Running…" : "Start workflow"}
                </Button>
                <Button size="sm" variant="ghost" color={mutedText} onClick={handleReset}>
                  Reset
                </Button>
              </HStack>

              {errorMessage && (
                <Alert status="error" rounded="lg" fontSize="sm">
                  <AlertIcon />
                  {errorMessage}
                </Alert>
              )}
            </VStack>
          </Box>

          {/* ── Progress card ── */}
          <Box p={6} bg={cardBg} rounded="xl" borderWidth="0.5px" borderColor={cardBorder}>
            <Heading size="md" mb={4}>Progress</Heading>
            <Progress value={progressValue} size="sm" colorScheme="teal" rounded="full" mb={5} />
            <Stack spacing={3}>
              {workflow.steps.map((step, index) => {
                const status = state.steps[index]?.status ?? "pending";
                return (
                  <Box
                    key={step.id}
                    p={3}
                    rounded="lg"
                    bg={stepBg}
                    borderWidth="0.5px"
                    borderColor={cardBorder}
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="500" fontSize="sm">
                        {step.stepNumber}. {step.name}
                      </Text>
                      <Badge colorScheme={statusColor(status)} fontSize="10px" px={2} py={0.5}>
                        {status.toUpperCase()}
                      </Badge>
                    </HStack>
                    {state.steps[index]?.message && (
                      <Text fontSize="xs" color={mutedText} mt={1}>
                        {state.steps[index]?.message}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* ── Result card ── */}
          {state.status === "completed" && state.resultBlob && downloadUrl && (
            <Box p={6} bg={cardBg} rounded="xl" borderWidth="0.5px" borderColor={cardBorder}>
              <Heading size="md" mb={1}>Done</Heading>
              <Text color={mutedText} mb={4}>
                Workflow completed successfully. Download the transformed file below.
              </Text>
              <Link href={downloadUrl} download={resultFileName} color="teal.500" fontWeight="500">
                Download final file
              </Link>
            </Box>
          )}

        </Stack>
      )}
    </Box>
  );
}