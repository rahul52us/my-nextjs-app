import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(
  files: (File | Blob)[],
  onProgress?: (progress: { step: string; pct: number }) => void
): Promise<Blob> {
  onProgress?.({ step: 'Creating merged document...', pct: 10 });
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.({
      step: `Merging file ${i + 1} of ${files.length}...`,
      pct: Math.round(10 + ((i / files.length) * 80)),
    });
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.({ step: 'Finalizing PDF...', pct: 95 });
  const pdfBytes = await mergedPdf.save();
  onProgress?.({ step: 'Complete!', pct: 100 });
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
