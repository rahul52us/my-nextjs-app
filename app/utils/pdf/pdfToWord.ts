import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  PageBreak,
  convertMillimetersToTwip,
} from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.6.205'}/build/pdf.worker.min.mjs`;
  }
}

/** Convert mm to pixels at 96 DPI (what docx ImageRun expects) */
function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * 96);
}

export interface PdfToWordOptions {
  renderScale?: number;
  onProgress?: (progress: { step: string; pct: number }) => void;
}

/**
 * Converts a PDF to a Word document (.docx) entirely in the browser.
 * Renders each page to high-resolution canvas and embeds it into the Word doc,
 * preserving layout, fonts, tables, logos, and styling.
 */
export async function pdfToWord(
  file: File | Blob,
  options?: PdfToWordOptions
): Promise<Blob> {
  const { renderScale = 2.0, onProgress } = options || {};

  onProgress?.({ step: 'Reading PDF file...', pct: 10 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ step: 'Parsing PDF document...', pct: 25 });
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // A4 dimensions
  const marginMm = 10;
  const contentWidthMm = 210 - marginMm * 2; // 190mm
  const contentHeightMm = 297 - marginMm * 2; // 277mm

  const children: Paragraph[] = [];

  for (let i = 1; i <= numPages; i++) {
    const pct = Math.round(25 + ((i / numPages) * 60));
    onProgress?.({
      step: `Converting page ${i} of ${numPages}...`,
      pct,
    });

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: renderScale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available');
    }

    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    // Convert canvas to PNG ArrayBuffer
    const pngBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
    const pngBuffer = await pngBlob.arrayBuffer();

    // Calculate image dimensions to fit the content area while preserving aspect ratio
    const pageAspect = viewport.width / viewport.height;
    const contentAspect = contentWidthMm / contentHeightMm;

    let imgWidthPx: number;
    let imgHeightPx: number;

    if (pageAspect > contentAspect) {
      imgWidthPx = mmToPx(contentWidthMm);
      imgHeightPx = Math.round(imgWidthPx / pageAspect);
    } else {
      imgHeightPx = mmToPx(contentHeightMm);
      imgWidthPx = Math.round(imgHeightPx * pageAspect);
    }

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: pngBuffer,
            transformation: {
              width: imgWidthPx,
              height: imgHeightPx,
            },
            type: 'png',
          }),
        ],
      })
    );

    // Add page break after each page except the last
    if (i < numPages) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  onProgress?.({ step: 'Generating Word (.docx) document...', pct: 90 });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(marginMm),
              bottom: convertMillimetersToTwip(marginMm),
              left: convertMillimetersToTwip(marginMm),
              right: convertMillimetersToTwip(marginMm),
            },
          },
        },
        children,
      },
    ],
  });

  const wordBlob = await Packer.toBlob(doc);
  onProgress?.({ step: 'Complete!', pct: 100 });
  return wordBlob;
}
