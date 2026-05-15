import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const dpi = parseInt(formData.get('dpi') as string) || 150;
    const quality = parseInt(formData.get('quality') as string) || 90;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    const fileName = file.name ? file.name.toLowerCase() : '';
    const isPdfByName = fileName.endsWith('.pdf');
    const isPdfByType = file.type === 'application/pdf';

    if (!isPdfByName && !isPdfByType) {
      return NextResponse.json({ error: 'Invalid file format. Please upload a PDF file' }, { status: 400 });
    }

    // Load PDF to get page count
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Convert PDF buffer to data URL for puppeteer
    const pdfDataUrl = `data:application/pdf;base64,${Buffer.from(fileBuffer).toString('base64')}`;

    if (pageCount === 1) {
      // Single page - return as JPG
      await page.goto(pdfDataUrl, { waitUntil: 'networkidle0' });

      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: quality,
        fullPage: true,
      });

      await browser.close();

      const imageBlob = new Blob([screenshot], { type: 'image/jpeg' });

      return new NextResponse(imageBlob, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '.jpg')}"`,
        },
      });

    } else {
      // Multiple pages - return as ZIP
      const zip = new JSZip();

      for (let i = 0; i < pageCount; i++) {
        // Navigate to specific page
        await page.goto(`${pdfDataUrl}#page=${i + 1}`, { waitUntil: 'networkidle0' });

        const screenshot = await page.screenshot({
          type: 'jpeg',
          quality: quality,
          fullPage: true,
        });

        zip.file(`page_${i + 1}.jpg`, screenshot);
      }

      await browser.close();

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      return new NextResponse(zipBlob, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '_pages.zip')}"`,
        },
      });
    }

  } catch (error) {
    console.error('PDF to JPG conversion error:', error);
    if (browser) {
      await browser.close();
    }
    return NextResponse.json(
      { error: 'Failed to convert PDF to JPG' },
      { status: 500 }
    );
  }
}