import { IconType } from "react-icons";
import {
  FiFileText,
  FiImage,
  FiMinimize2,
  FiLayers,
  FiRepeat,
  FiScissors,
  FiEdit,
  FiLock,
  FiArchive,
  FiMaximize2,
  FiFile,
  FiGrid,
} from "react-icons/fi";
import {
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaCompress,
  FaObjectGroup,
  FaCut,
  FaEdit,
  FaExchangeAlt,
  FaFileArchive,
} from "react-icons/fa";

export interface ToolMeta {
  id: string;
  name: string;
  route: string;
  icon: IconType;
  category: "pdf" | "image" | "converter" | "file";
  acceptedTypes: string[]; // MIME types or wildcards e.g. ['image/jpeg', 'image/png'] or ['application/pdf']
  maxFiles?: number; // Maximum files supported by this tool (1 = single file, >1 = batch)
  subtext?: string;
  badge?: string;
}

export const TOOLS_REGISTRY: Record<string, ToolMeta> = {
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    route: "/converter/PDFtools/PdftoJpg",
    icon: FiImage,
    category: "pdf",
    acceptedTypes: ["application/pdf", ".pdf"],
    maxFiles: 1,
    subtext: "Convert document pages to high-quality JPG images",
  },
  "image-to-pdf": {
    id: "image-to-pdf",
    name: "Images to PDF",
    route: "/converter/images-to-pdf",
    icon: FaFilePdf,
    category: "pdf",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
    maxFiles: 100,
    subtext: "Convert your JPG images into a single PDF document",
    badge: "Popular",
  },
  "jpg-to-png": {
    id: "jpg-to-png",
    name: "JPG to PNG",
    route: "/converter/Imagetools/Imagetypeconvert",
    icon: FiRepeat,
    category: "image",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
    maxFiles: 50,
    subtext: "Convert image format to PNG, WEBP, or GIF",
  },
  "compress-image": {
    id: "compress-image",
    name: "Compress JPG",
    route: "/converter/Imagetools/Imagecom",
    icon: FiMinimize2,
    category: "image",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
    maxFiles: 20,
    subtext: "Reduce JPG image file size without losing quality",
  },
  "merge-images": {
    id: "merge-images",
    name: "Merge Images to PDF",
    route: "/converter/images-to-pdf",
    icon: FiLayers,
    category: "image",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
    maxFiles: 100,
    subtext: "Combine multiple JPG images into one file",
  },
  "pdf-to-word": {
    id: "pdf-to-word",
    name: "PDF to Word",
    route: "/converter/PDFtools/PDFtoWord",
    icon: FaFileWord,
    category: "pdf",
    acceptedTypes: ["application/pdf", ".pdf"],
    maxFiles: 1,
    subtext: "Convert PDF documents to editable DOCX format",
  },
  "pdf-merge": {
    id: "pdf-merge",
    name: "PDF Merge",
    route: "/converter/PDFtools/Pdfmerge",
    icon: FaObjectGroup,
    category: "pdf",
    acceptedTypes: ["application/pdf", ".pdf"],
    maxFiles: 50,
    subtext: "Combine multiple PDF files into one document",
  },
  "pdf-split": {
    id: "pdf-split",
    name: "PDF Split",
    route: "/converter/PDFtools/Pdfsplit",
    icon: FaCut,
    category: "pdf",
    acceptedTypes: ["application/pdf", ".pdf"],
    maxFiles: 1,
    subtext: "Separate pages from your PDF file",
  },
  "pdf-watermark": {
    id: "pdf-watermark",
    name: "PDF Watermark",
    route: "/converter/PDFtools/Pdfwatermark",
    icon: FiFileText,
    category: "pdf",
    acceptedTypes: ["application/pdf", ".pdf"],
    maxFiles: 1,
    subtext: "Add custom text or image watermark to PDF",
  },
  "pdf-edit": {
    id: "pdf-edit",
    name: "PDF Edit",
    route: "/converter/PDFtools/Pdfedit",
    icon: FaEdit,
    category: "pdf",
    acceptedTypes: ["application/pdf", ".pdf"],
    maxFiles: 1,
    subtext: "Edit and annotate your PDF documents",
  },
  "image-edit": {
    id: "image-edit",
    name: "Image Edit",
    route: "/converter/Imagetools/Imageedit",
    icon: FiEdit,
    category: "image",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/*"],
    maxFiles: 1,
    subtext: "Crop, rotate, or adjust image colors",
  },
  "files-to-zip": {
    id: "files-to-zip",
    name: "Files to ZIP",
    route: "/converter/files-to-zip",
    icon: FiArchive,
    category: "file",
    acceptedTypes: ["*/*"],
    maxFiles: 100,
    subtext: "Compress multiple files into a single ZIP archive",
  },
};

/**
 * Related tools mapping object.
 * Maps a tool ID/slug to an array of recommended next-step tool IDs.
 */
export const relatedToolsMap: Record<string, string[]> = {
  "pdf-to-jpg": ["compress-image", "image-to-pdf", "jpg-to-png", "files-to-zip"],
  "image-to-pdf": ["pdf-to-word", "pdf-merge", "pdf-split", "pdf-watermark"],
  "jpg-to-png": ["compress-image", "image-to-pdf", "image-edit"],
  "compress-image": ["jpg-to-png", "image-to-pdf", "files-to-zip"],
  "pdf-to-word": ["pdf-to-jpg", "pdf-edit", "pdf-merge"],
  "pdf-merge": ["pdf-split", "pdf-watermark", "pdf-to-jpg"],
  "pdf-split": ["pdf-merge", "pdf-to-jpg", "pdf-to-word"],
};

/**
 * Contextual subtext displayed at the top of the "Continue to..." section
 */
export const toolContextSubtexts: Record<string, string> = {
  "pdf-to-jpg": "Take your converted JPG files further with these tools",
  "image-to-pdf": "Perform additional actions on your generated PDF",
  "jpg-to-png": "Enhance or format your converted images",
  "compress-image": "Do more with your compressed image files",
  "pdf-to-word": "Continue editing or managing your converted Word document",
  default: "Continue your workflow with these related tools",
};

/**
 * Helper to retrieve related ToolMeta objects for a given tool slug.
 */
export function getRelatedTools(currentToolSlug: string, maxCount: number = 4): ToolMeta[] {
  const targetIds = relatedToolsMap[currentToolSlug] || [
    "compress-image",
    "image-to-pdf",
    "jpg-to-png",
    "pdf-merge",
  ];

  const tools: ToolMeta[] = [];
  for (const id of targetIds) {
    if (TOOLS_REGISTRY[id] && id !== currentToolSlug) {
      tools.push(TOOLS_REGISTRY[id]);
    }
  }

  return tools.slice(0, maxCount);
}

/**
 * Helper to check if a file type is accepted by a destination tool
 */
export function isFileTypeAcceptedByTool(fileType: string, toolId: string): boolean {
  const tool = TOOLS_REGISTRY[toolId];
  if (!tool) return true; // Default allow if tool metadata unknown

  const accepted = tool.acceptedTypes;
  if (!accepted || accepted.includes("*/*")) return true;

  for (const pattern of accepted) {
    if (pattern === fileType) return true;
    if (pattern.endsWith("/*")) {
      const mainType = pattern.split("/")[0];
      if (fileType.startsWith(`${mainType}/`)) return true;
    }
    if (pattern.startsWith(".") && fileType.includes(pattern.replace(".", ""))) return true;
  }

  return false;
}
