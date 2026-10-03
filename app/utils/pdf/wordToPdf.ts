import * as mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface WordToPdfOptions {
  onProgress?: (progress: { step: string; pct: number }) => void;
}

/**
 * Converts a Word document (.docx) to a PDF document entirely in the browser.
 * Extracts formatted HTML using mammoth, renders into high-res canvas with html2canvas,
 * and compiles into an A4 PDF via jsPDF.
 */
export async function wordToPdf(
  file: File | Blob,
  options?: WordToPdfOptions
): Promise<Blob> {
  const { onProgress } = options || {};

  onProgress?.({ step: 'Reading Word document...', pct: 15 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ step: 'Extracting document content...', pct: 35 });
  const mammothLib: any = (mammoth as any).default || mammoth;
  const result = await mammothLib.convertToHtml({ arrayBuffer });
  const html = result.value;

  if (!html || html.trim().length === 0) {
    throw new Error('No readable content could be extracted from the Word file.');
  }

  onProgress?.({ step: 'Rendering document layout...', pct: 55 });

  // Create a visible but off-screen container for rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px'; // A4 width at 96dpi
  container.style.minHeight = '1123px'; // A4 height at 96dpi
  container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';
  container.style.color = '#111827';
  container.style.background = '#ffffff';
  container.style.padding = '48px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '99999';
  container.style.overflow = 'visible';
  container.style.pointerEvents = 'none';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Small delay to ensure fonts and layout settle
  await new Promise((resolve) => setTimeout(resolve, 250));

  try {
    onProgress?.({ step: 'Generating high-res canvas...', pct: 75 });
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });

    onProgress?.({ step: 'Compiling PDF pages...', pct: 90 });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit A4 width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    onProgress?.({ step: 'Complete!', pct: 100 });
    const outputBlob = pdf.output('blob');
    return outputBlob;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
