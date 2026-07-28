export interface CarryForwardFile {
  name: string;
  type: string;
  dataUrl: string; // base64 / data URL
}

export const CARRY_FORWARD_STORAGE_KEY = "toolsahayata_pending_files";

/**
 * Converts a Blob or File object to a base64 Data URL string.
 */
export function blobToDataUrl(blobOrFile: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blobOrFile);
  });
}

/**
 * Stores converted files (blobs or URLs) in sessionStorage so the destination tool can automatically load them.
 */
export async function storeConvertedFilesForCarryForward(
  files: Array<{ blob?: Blob; url?: string; pageNumber?: number; name?: string }>
): Promise<boolean> {
  try {
    if (!files || files.length === 0) return false;

    const itemsToSave: CarryForwardFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      let dataUrl = "";

      if (item.blob) {
        dataUrl = await blobToDataUrl(item.blob);
      } else if (item.url && item.url.startsWith("data:")) {
        dataUrl = item.url;
      }

      if (dataUrl) {
        itemsToSave.push({
          name: item.name || `converted-page-${item.pageNumber || i + 1}.jpg`,
          type: item.blob?.type || "image/jpeg",
          dataUrl,
        });
      }
    }

    if (itemsToSave.length > 0) {
      sessionStorage.setItem(CARRY_FORWARD_STORAGE_KEY, JSON.stringify(itemsToSave));
      return true;
    }
  } catch (err) {
    console.warn("Could not save carry-forward files to sessionStorage:", err);
  }
  return false;
}

/**
 * Retrieves pending carry-forward files from sessionStorage.
 */
export function getCarryForwardFiles(): CarryForwardFile[] | null {
  try {
    const raw = sessionStorage.getItem(CARRY_FORWARD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Clears carry-forward files after they have been consumed.
 */
export function clearCarryForwardFiles(): void {
  try {
    sessionStorage.removeItem(CARRY_FORWARD_STORAGE_KEY);
  } catch (err) {
    // Ignore storage errors
  }
}
