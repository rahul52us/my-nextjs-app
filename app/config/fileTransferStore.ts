import { isFileTypeAcceptedByTool, TOOLS_REGISTRY } from "./toolsConfig";

export interface TransferredItem {
  file: File | Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl?: string;
}

export interface TransferPayload {
  files: Array<{
    file?: File | Blob;
    blob?: Blob;
    url?: string;
    name?: string;
    type?: string;
    pageNumber?: number;
  }>;
  sourceToolId: string;
  sourceToolName?: string;
}

export interface TransferState {
  items: TransferredItem[];
  sourceToolId: string;
  sourceToolName: string;
  timestamp: number;
}

const DB_NAME = "toolsahayata_transfer_db";
const DB_VERSION = 1;
const STORE_NAME = "handoff";
const RECORD_KEY = "current_transfer";

// In-memory state for 0ms client-side SPA navigation transfer
let inMemoryState: TransferState | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves output files into the central transfer store (In-memory + IndexedDB).
 */
export async function setTransferFiles(payload: TransferPayload): Promise<void> {
  if (!payload.files || payload.files.length === 0) return;

  const sourceTool = TOOLS_REGISTRY[payload.sourceToolId];
  const sourceToolName = payload.sourceToolName || sourceTool?.name || payload.sourceToolId;

  const items: TransferredItem[] = [];

  for (let i = 0; i < payload.files.length; i++) {
    const raw = payload.files[i];
    let fileObj: File | Blob | null = null;
    let name = raw.name || `file-${i + 1}`;
    let type = raw.type || "application/octet-stream";

    if (raw.file instanceof File || raw.file instanceof Blob) {
      fileObj = raw.file;
      if (raw.file instanceof File) {
        name = raw.file.name;
        type = raw.file.type || type;
      }
    } else if (raw.blob instanceof Blob) {
      fileObj = raw.blob;
      type = raw.blob.type || type;
    } else if (raw.url && raw.url.startsWith("data:")) {
      try {
        const res = await fetch(raw.url);
        fileObj = await res.blob();
        type = fileObj.type || type;
      } catch (err) {
        console.warn("Failed to convert data URL to Blob", err);
      }
    }

    if (fileObj) {
      // Ensure name has a default extension if missing
      if (!name.includes(".")) {
        const ext = type.includes("jpeg") ? "jpg" : type.includes("png") ? "png" : type.includes("pdf") ? "pdf" : "bin";
        name = `${name}.${ext}`;
      }

      items.push({
        file: fileObj,
        fileName: name,
        fileType: type,
        fileSize: fileObj.size,
        previewUrl: raw.url || (typeof window !== "undefined" ? URL.createObjectURL(fileObj) : undefined),
      });
    }
  }

  if (items.length === 0) return;

  const state: TransferState = {
    items,
    sourceToolId: payload.sourceToolId,
    sourceToolName,
    timestamp: Date.now(),
  };

  // 1. Save in-memory for instant SPA transition
  inMemoryState = state;

  // 2. Persist to IndexedDB for page reloads / new tab support
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Save serializable records (Blobs are supported directly by IndexedDB)
    const recordsToStore = {
      sourceToolId: state.sourceToolId,
      sourceToolName: state.sourceToolName,
      timestamp: state.timestamp,
      items: state.items.map((it) => ({
        blob: it.file,
        fileName: it.fileName,
        fileType: it.fileType,
        fileSize: it.fileSize,
      })),
    };

    store.put(recordsToStore, RECORD_KEY);
  } catch (err) {
    console.warn("Could not persist transfer files to IndexedDB:", err);
  }
}

/**
 * Retrieves the current pending transferred files (checks in-memory first, then IndexedDB).
 */
export async function getTransferFiles(): Promise<TransferState | null> {
  if (inMemoryState && inMemoryState.items.length > 0) {
    return inMemoryState;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const record: any = await new Promise((resolve) => {
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });

    if (record && record.items && record.items.length > 0) {
      const items: TransferredItem[] = record.items.map((it: any) => {
        const fileObj = it.blob instanceof File ? it.blob : new File([it.blob], it.fileName, { type: it.fileType });
        return {
          file: fileObj,
          fileName: it.fileName,
          fileType: it.fileType,
          fileSize: it.fileSize,
          previewUrl: typeof window !== "undefined" ? URL.createObjectURL(fileObj) : undefined,
        };
      });

      const state: TransferState = {
        items,
        sourceToolId: record.sourceToolId,
        sourceToolName: record.sourceToolName,
        timestamp: record.timestamp,
      };

      inMemoryState = state;
      return state;
    }
  } catch (err) {
    console.warn("Error reading transfer files from IndexedDB:", err);
  }

  return null;
}

/**
 * Clears transfer state from both in-memory and IndexedDB.
 */
export async function clearTransfer(): Promise<void> {
  inMemoryState = null;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(RECORD_KEY);
  } catch (err) {
    // Ignore cleanup errors
  }
}

/**
 * Checks if current pending transfer state is compatible with the destination tool.
 */
export function checkTransferCompatibility(state: TransferState, destinationToolId: string): boolean {
  if (!state || !state.items || state.items.length === 0) return false;

  for (const item of state.items) {
    if (isFileTypeAcceptedByTool(item.fileType, destinationToolId)) {
      return true;
    }
  }

  return false;
}
