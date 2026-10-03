import * as pdfjsLib from 'pdfjs-dist';
import * as JSZipLib from 'jszip';
import { saveAs } from 'file-saver';

const JSZip: any = (JSZipLib as any).default || JSZipLib;

if (typeof window !== 'undefined') {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.6.205'}/build/pdf.worker.min.mjs`;
  }
}

export interface JpgResult {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
}

export interface PdfToJpgOptions {
  quality?: number;
  scale?: number;
  onProgress?: (progress: { step: string; pct: number }) => void;
}

export async function pdfToJpg(
  file: File | Blob,
  options?: PdfToJpgOptions
): Promise<JpgResult[]> {
  const { quality = 0.92, scale = 2.0, onProgress } = options || {};

  onProgress?.({ step: 'Reading PDF...', pct: 10 });
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const results: JpgResult[] = [];

  for (let i = 1; i <= numPages; i++) {
    const pct = Math.round(10 + ((i / numPages) * 85));
    onProgress?.({ step: `Rendering page ${i} of ${numPages}...`, pct });

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) continue;

    await page.render({ canvasContext: context, viewport, canvas } as any).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        'image/jpeg',
        quality
      );
    });

    results.push({ pageNumber: i, dataUrl, blob });
  }

  onProgress?.({ step: 'Complete!', pct: 100 });
  return results;
}

export async function downloadAllAsZip(results: JpgResult[], baseName: string): Promise<void> {
  const zip = new JSZip();
  for (const result of results) {
    zip.file(`${baseName}_page_${result.pageNumber}.jpg`, result.blob);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseName}_images.zip`);
}
