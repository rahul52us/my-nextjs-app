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
  useColorModeValue,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
} from "@chakra-ui/react";
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
    if (!raw) {
      setLoadingSaved(false);
      return;
    }

    try {
      const savedWorkflows: SavedWorkflow[] = JSON.parse(raw);
      const matched = savedWorkflows.find((workflow) => workflow.id === workflowId) ?? null;
      setWorkflow(matched);
    } catch (error) {
      console.error("Failed to load workflow", error);
      setWorkflow(null);
    }

    setLoadingSaved(false);
  }, [workflowId]);

  useEffect(() => {
    if (!state.resultBlob) {
      setDownloadUrl(null);
      return;
    }

    const url = URL.createObjectURL(state.resultBlob);
    setDownloadUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [state.resultBlob]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadedFile(file);
  };

  const handleStart = async () => {
    if (!uploadedFile || !workflow) return;
    await runWorkflow(uploadedFile);
  };

  const stepCount = workflow?.steps.length ?? 0;
  const progressValue = stepCount > 0 ? ((state.currentStepIndex + (state.status === "completed" ? 1 : 0)) / stepCount) * 100 : 0;

  const fileLabel = uploadedFile ? uploadedFile.name : "No file selected";

  const getResultExtension = () => {
    if (state.resultBlob) {
      if (state.resultBlob.type === 'image/jpeg') return '.jpg';
      if (state.resultBlob.type === 'application/zip') return '.zip';
      if (state.resultBlob.type === 'application/pdf') return '.pdf';
      if (state.resultBlob.type === 'text/plain') return '.txt';
      if (state.resultBlob.type === 'text/csv') return '.csv';
      if (state.resultBlob.type === 'application/json') return '.json';
    }

    const lastStepName = workflow?.steps?.[workflow.steps.length - 1]?.name.toLowerCase() || '';
    if (lastStepName.includes('jpg') || lastStepName.includes('image')) return '.jpg';
    if (lastStepName.includes('zip')) return '.zip';
    if (lastStepName.includes('pdf')) return '.pdf';
    if (lastStepName.includes('text') || lastStepName.includes('txt')) return '.txt';
    if (lastStepName.includes('csv')) return '.csv';
    if (lastStepName.includes('json')) return '.json';
    if (uploadedFile?.name?.includes('.')) {
      return uploadedFile.name.slice(uploadedFile.name.lastIndexOf('.'));
    }

    return '';
  };

  const resultFileName = uploadedFile?.name
    ? `${uploadedFile.name.replace(/\.[^.]+$/, '') || 'result'}-workflow-output${getResultExtension()}`
    : 'workflow-result';

  const errorMessage = state.status === "error" ? state.error : undefined;

  return (
    <Box py={{ base: 6, md: 10 }} px={{ base: 4, md: 8 }} maxW="container.lg" mx="auto">
      <HStack justify="space-between" mb={6} flexWrap="wrap">
        <VStack align="flex-start" spacing={2}>
          <Heading size="xl">Workflow Runner</Heading>
          <Text color={useColorModeValue("gray.600", "gray.300")}>Upload once and let the selected workflow run through all steps automatically.</Text>
        </VStack>
        <Button size="sm" variant="outline" onClick={() => router.push("/tools/workflow")}>Back to Builder</Button>
      </HStack>

      {loadingSaved ? (
        <Text>Loading workflow...</Text>
      ) : !workflow ? (
        <Alert status="error" rounded="2xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Workflow not found</AlertTitle>
            <AlertDescription>The workflow ID may be invalid or the workflow has been removed.</AlertDescription>
          </Box>
        </Alert>
      ) : (
        <Stack spacing={6}>
          <Box p={6} bg={useColorModeValue("white", "gray.800")} rounded="3xl" shadow="md" borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}> 
            <Heading size="md" mb={2}>{workflow.name}</Heading>
            <Text color={useColorModeValue("gray.500", "gray.400")}>{workflow.description || "No description provided."}</Text>
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} mt={2}>Steps: {workflow.steps.length}</Text>
          </Box>

          <Box p={6} bg={useColorModeValue("white", "gray.800")} rounded="3xl" shadow="md" borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}> 
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Upload File</Heading>
              <Input type="file" onChange={handleFileChange} />
              <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>Selected file: {fileLabel}</Text>
              <HStack spacing={3} wrap="wrap">
                <Button colorScheme="teal" onClick={handleStart} isDisabled={!uploadedFile || state.status === "running"}>
                  {state.status === "running" ? "Running workflow..." : "Start Workflow"}
                </Button>
                <Button variant="outline" onClick={() => { setUploadedFile(null); reset(); }}>
                  Reset
                </Button>
              </HStack>
              {errorMessage && (
                <Alert status="error" rounded="2xl">
                  <AlertIcon />{errorMessage}
                </Alert>
              )}
            </VStack>
          </Box>

          <Box p={6} bg={useColorModeValue("white", "gray.800")} rounded="3xl" shadow="md" borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}> 
            <Heading size="md" mb={4}>Progress</Heading>
            <Progress value={progressValue} size="md" colorScheme="teal" mb={4} />
            <Stack spacing={3}>
              {workflow.steps.map((step, index) => {
                const status = state.steps[index]?.status ?? "pending";
                return (
                  <Box key={step.id} p={3} rounded="2xl" bg={useColorModeValue("gray.50", "gray.750")} borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}> 
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">{step.stepNumber}. {step.name}</Text>
                      <Badge colorScheme={status === "completed" ? "green" : status === "running" ? "teal" : status === "failed" ? "red" : "gray"}>
                        {status.toUpperCase()}
                      </Badge>
                    </HStack>
                    {state.steps[index]?.message && (
                      <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>{state.steps[index]?.message}</Text>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {state.status === "completed" && state.resultBlob && downloadUrl && (
            <Box p={6} bg={useColorModeValue("white", "gray.800")} rounded="3xl" shadow="md" borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}> 
              <Heading size="md" mb={3}>Done</Heading>
              <Text mb={4}>The workflow completed successfully. Download the transformed file below.</Text>
              <Link href={downloadUrl} download={resultFileName} color="teal.500" fontWeight="bold">
                Download final file
              </Link>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
