import { PDFDocument } from 'pdf-lib';
import * as JSZipLib from 'jszip';
import { saveAs } from 'file-saver';

const JSZip: any = (JSZipLib as any).default || JSZipLib;

export async function getPageCount(file: File | Blob): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}

export async function splitPdf(
  file: File | Blob,
  ranges: { start: number; end: number }[],
  onProgress?: (progress: { step: string; pct: number }) => void
): Promise<Blob[]> {
  onProgress?.({ step: 'Loading PDF...', pct: 15 });
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const results: Blob[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    onProgress?.({
      step: `Extracting pages ${range.start}-${range.end}...`,
      pct: Math.round(15 + ((i / ranges.length) * 80)),
    });

    const newPdf = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (let p = range.start; p <= range.end; p++) {
      pageIndices.push(p - 1); // Convert to 0-indexed
    }
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }
    const pdfBytes = await newPdf.save();
    results.push(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
  }

  onProgress?.({ step: 'Complete!', pct: 100 });
  return results;
}

export async function downloadSplitsAsZip(
  blobs: Blob[],
  baseName: string,
  ranges: { start: number; end: number }[]
): Promise<void> {
  const zip = new JSZip();
  blobs.forEach((blob, index) => {
    const range = ranges[index];
    zip.file(`${baseName}_pages_${range.start}-${range.end}.pdf`, blob);
  });
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseName}_split.zip`);
}
