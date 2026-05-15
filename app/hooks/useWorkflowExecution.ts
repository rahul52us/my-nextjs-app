import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
const pdfjsLib: any = require('pdfjs-dist');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
const JSZip: any = require('jszip');

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export type WorkflowStep = {
  id: string;
  name: string;
  path: string;
  stepNumber: number;
};

export type SavedWorkflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  savedAt: string;
};

export type WorkflowStepStatus = "pending" | "running" | "completed" | "failed";

export type WorkflowExecutionEntry = {
  stepNumber: number;
  name: string;
  status: WorkflowStepStatus;
  message?: string;
};

export type WorkflowExecutionState = {
  status: "idle" | "running" | "completed" | "error";
  currentStepIndex: number;
  steps: WorkflowExecutionEntry[];
  resultBlob: Blob | null;
  error?: string;
};

function getToolSlug(path: string) {
  const parts = path.split("/").filter(Boolean);
  const lastPart = parts[parts.length - 1] || "";

  const overrides: Record<string, string> = {
    PDFtoWord: 'pdf-to-word',
    PdftoJpg: 'pdf-to-jpg',
    Wordtopdf: 'word-to-pdf',
    Excletopdf: 'excel-to-pdf',
    PDFmerge: 'pdf-merge',
    Pdfsplit: 'pdf-split',
    Pdfwatermark: 'pdf-watermark',
    Pdfedit: 'pdf-edit',
    Pdfrotate: 'pdf-rotate',
    Pdfsign: 'pdf-sign',
    Pdfpageno: 'pdf-page-no',
    Pdfpagerearange: 'pdf-page-rearange',
    Pdfdeffrence: 'pdf-difference',
    Imagecom: 'image-compression',
    Imageedit: 'image-edit',
  };

  if (overrides[lastPart]) {
    return overrides[lastPart];
  }

  const normalized = lastPart
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

  if (normalized.includes('-')) {
    return normalized.replace(/-+/g, '-');
  }

  return normalized.replace(/to/g, '-to-').replace(/-+/g, '-');
}

function getFileNameForUpload(inputFile: File | Blob, slug: string) {
  if (inputFile instanceof File && inputFile.name) {
    return inputFile.name;
  }

  const mimeExtMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
  };

  const extension = mimeExtMap[(inputFile as Blob).type]
    || (slug.includes('pdf') ? '.pdf' : '.bin');
  return `${slug}${extension}`;
}

async function convertPdfToJpgClient(inputFile: File | Blob): Promise<Blob> {
  const arrayBuffer = await inputFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  if (pageCount === 1) {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create canvas context for PDF rendering.');

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate image blob from canvas.'));
      }, 'image/jpeg', 0.95);
    });

    return blob;
  }

  const zip = new JSZip();
  for (let i = 1; i <= pageCount; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create canvas context for PDF rendering.');

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate image blob from canvas.'));
      }, 'image/jpeg', 0.95);
    });

    zip.file(`page_${i}.jpg`, blob);
  }

  return zip.generateAsync({ type: 'blob' });
}

async function executeToolStep(slug: string, inputFile: File | Blob): Promise<Blob> {
  if (slug === 'pdf-to-jpg') {
    return convertPdfToJpgClient(inputFile);
  }

  const isJsonInputTool = ['json-to-csv', 'qr-code-generator', 'html-to-pdf'].includes(slug);
  let response: Response;

  if (isJsonInputTool) {
    const text = await (inputFile as any).text?.() || await new Response(inputFile).text();
    let body: any;
    if (slug === 'json-to-csv') {
      try {
        body = { data: JSON.parse(text) };
      } catch (e) {
        throw new Error("Input for JSON to CSV must be a valid JSON array of objects.");
      }
    } else if (slug === 'qr-code-generator') {
      body = { text };
    } else { // html-to-pdf
      body = { html: text };
    }

    response = await fetch(`/api/tools/${slug}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } else {
    const uploadFile = inputFile instanceof File
      ? inputFile
      : new File([inputFile], getFileNameForUpload(inputFile, slug), { type: inputFile.type || 'application/octet-stream' });

    const formData = new FormData();
    formData.append("file", uploadFile);

    response = await fetch(`/api/tools/${slug}`, {
      method: "POST",
      body: formData,
    });
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    const message = typeof payload === "string" ? payload : payload?.error || payload?.message || response.statusText;
    throw new Error(message || `Tool ${slug} failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await response.json();

    // Handle tools that return base64 encoded files (PDF, Image, QR Code)
    const base64Data = json.pdf || json.image || json.qrCode;
    if (base64Data) {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      let type = 'application/octet-stream';
      if (json.pdf) type = 'application/pdf';
      else if (json.image) type = json.format ? `image/${json.format}` : 'image/jpeg';
      else if (json.qrCode) type = json.format || 'image/png';

      return new Blob([byteNumbers], { type });
    }

    // Handle tools that return text, CSV, or structured JSON
    if (json.csv) return new Blob([json.csv], { type: 'text/csv' });
    if (json.text) return new Blob([json.text], { type: 'text/plain' });
    if (json.data) return new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });

    return new Blob([JSON.stringify(json)], { type: 'application/json' });
  }

  return response.blob();
}

export function useWorkflowExecution(workflow: SavedWorkflow | null) {
  const [state, setState] = useState<WorkflowExecutionState>({
    status: "idle",
    currentStepIndex: -1,
    steps: workflow?.steps.map((step) => ({
      stepNumber: step.stepNumber,
      name: step.name,
      status: "pending" as WorkflowStepStatus,
    })) ?? [],
    resultBlob: null,
    error: undefined,
  });

  const [lastWorkflowId, setLastWorkflowId] = useState<string | null>(workflow?.id ?? null);

  useEffect(() => {
    if (!workflow) {
      setState({
        status: "idle",
        currentStepIndex: -1,
        steps: [],
        resultBlob: null,
        error: undefined,
      });
      setLastWorkflowId(null);
      return;
    }

    if (workflow.id !== lastWorkflowId) {
      setState({
        status: "idle",
        currentStepIndex: -1,
        steps: workflow.steps.map((step) => ({
          stepNumber: step.stepNumber,
          name: step.name,
          status: "pending",
        })),
        resultBlob: null,
        error: undefined,
      });
      setLastWorkflowId(workflow.id);
    }
  }, [workflow, lastWorkflowId]);

  const runWorkflow = async (inputFile: File) => {
    if (!workflow) {
      setState((prev) => ({ ...prev, status: "error", error: "Workflow is not loaded." }));
      return;
    }

    if (!inputFile) {
      setState((prev) => ({ ...prev, status: "error", error: "Please upload a file to start the workflow." }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "running",
      currentStepIndex: 0,
      steps: workflow.steps.map((step) => ({ stepNumber: step.stepNumber, name: step.name, status: "pending" })),
      resultBlob: null,
      error: undefined,
    }));

    let currentInput: Blob | File = inputFile;

    for (let index = 0; index < workflow.steps.length; index += 1) {
      const step = workflow.steps[index];
      const slug = getToolSlug(step.path);
      setState((prev) => ({
        ...prev,
        currentStepIndex: index,
        steps: prev.steps.map((item, idx) => idx === index ? { ...item, status: "running", message: "Processing..." } : item),
      }));

      try {
        const outputBlob = await executeToolStep(slug, currentInput);
        setState((prev) => ({
          ...prev,
          steps: prev.steps.map((item, idx) => idx === index ? { ...item, status: "completed", message: "Completed" } : item),
          resultBlob: outputBlob,
        }));
        currentInput = outputBlob;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error while executing step.";
        setState((prev) => ({
          ...prev,
          status: "error",
          steps: prev.steps.map((item, idx) => idx === index ? { ...item, status: "failed", message } : item),
          error: message,
        }));
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      status: "completed",
      currentStepIndex: workflow.steps.length - 1,
    }));
  };

  const reset = () => {
    setState({
      status: "idle",
      currentStepIndex: -1,
      steps: workflow?.steps.map((step) => ({
        stepNumber: step.stepNumber,
        name: step.name,
        status: "pending",
      })) ?? [],
      resultBlob: null,
      error: undefined,
    });
  };

  return {
    state,
    runWorkflow,
    reset,
  };
}
