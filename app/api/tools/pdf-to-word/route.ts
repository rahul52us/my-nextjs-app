import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFParser = require("pdf2json");

export const runtime = "nodejs";

// ✅ PDF header validate કરો - corrupt file early catch થાય
function validatePdfBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  // PDF must start with "%PDF-"
  if (buffer.length < 5) {
    return { valid: false, error: "File is too small to be a valid PDF." };
  }

  const header = buffer.slice(0, 5).toString("ascii");
  if (header !== "%PDF-") {
    return {
      valid: false,
      error: "File does not appear to be a valid PDF (invalid header).",
    };
  }

  // PDF must end with "%%EOF"
  const tail = buffer.slice(-1024).toString("ascii");
  if (!tail.includes("%%EOF")) {
    return {
      valid: false,
      error: "PDF file appears to be incomplete or corrupted (missing EOF marker).",
    };
  }

  return { valid: true };
}

interface PdfTextItem {
  R?: { T?: string; S?: number }[];
  x?: number;
  y?: number;
}

interface PdfPage {
  Texts?: PdfTextItem[];
}

interface PdfData {
  Pages?: PdfPage[];
}

async function extractTextFromPdf(buffer: Buffer): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1);

    parser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData?.parserError || "Failed to parse PDF."));
    });

    parser.on("pdfParser_dataReady", (pdfData: PdfData) => {
      const pages = pdfData?.Pages || [];

      const result = pages.map((page: PdfPage) => {
        const texts = page?.Texts || [];
        const lineMap = new Map<number, string[]>();

        texts.forEach((textItem: PdfTextItem) => {
          const yPos = Math.round((textItem.y || 0) * 10) / 10;
          const encoded = textItem?.R?.[0]?.T || "";
          let decoded = "";
          try {
            decoded = decodeURIComponent(encoded).trim();
          } catch {
            decoded = encoded.trim();
          }

          if (decoded) {
            if (!lineMap.has(yPos)) lineMap.set(yPos, []);
            lineMap.get(yPos)!.push(decoded);
          }
        });

        return Array.from(lineMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([, words]) => words.join(" ").trim())
          .filter((line) => line.length > 0);
      });

      resolve(result);
    });

    parser.parseBuffer(buffer);
  });
}

function buildDocxParagraphs(pages: string[][]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (pages.length === 0 || pages.every((p) => p.length === 0)) {
    return [
      new Paragraph({
        children: [new TextRun("No readable text found in the PDF.")],
      }),
    ];
  }

  pages.forEach((pageLines, pageIndex) => {
    if (pageIndex > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "", break: 1 })],
          spacing: { after: 200 },
        })
      );
    }

    let currentBlock: string[] = [];

    pageLines.forEach((line) => {
      if (line.trim() === "") {
        if (currentBlock.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: currentBlock.join(" ").trim(), size: 24 })],
              spacing: { after: 160 },
            })
          );
          currentBlock = [];
        }
      } else {
        currentBlock.push(line);
      }
    });

    if (currentBlock.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: currentBlock.join(" ").trim(), size: 24 })],
          spacing: { after: 160 },
        })
      );
    }
  });

  return paragraphs;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name || "input.pdf";
    const isPdfByName = fileName.toLowerCase().endsWith(".pdf");
    const isPdfByType = file.type === "application/pdf";

    if (!isPdfByName && !isPdfByType) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // ✅ File size check
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // ✅ Corrupt file early detect
    const validation = validatePdfBuffer(pdfBuffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const pages = await extractTextFromPdf(pdfBuffer);
    const paragraphs = buildDocxParagraphs(pages);

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const outputFileName = fileName.replace(/\.pdf$/i, ".docx");

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
      },
    });
  } catch (error: any) {
    console.error("PDF to Word conversion error:", error);

    // ✅ User-friendly error messages
    const msg = error?.message || "";
    if (msg.includes("encrypted") || msg.includes("password")) {
      return NextResponse.json(
        { error: "This PDF is password-protected. Please remove the password and try again." },
        { status: 400 }
      );
    }
    if (msg.includes("corrupt") || msg.includes("invalid")) {
      return NextResponse.json(
        { error: "The PDF file appears to be corrupted. Please try with a different file." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to convert PDF to Word document." },
      { status: 500 }
    );
  }
}