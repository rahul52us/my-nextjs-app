import { NextRequest, NextResponse } from "next/server";
import * as mammoth from "mammoth";
import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";

function cleanHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string[] {
  const lines: string[] = [];

  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/);

    let line = "";

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;

      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      lines.push(line);
    }

    // Paragraph spacing
    lines.push("");
  });

  return lines;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate DOCX
    if (
      !file.name.toLowerCase().endsWith(".docx") &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return NextResponse.json(
        {
          error: "Invalid file format. Please upload a DOCX file",
        },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // Convert DOCX → HTML
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
        ],
      }
    );

    // Clean HTML → plain text
    const text = cleanHtmlToText(result.value || "");

    // Create PDF
    const pdfDoc = await PDFDocument.create();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;

    const margin = 40;

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const maxWidth = pageWidth - margin * 2;

    const lineHeight = fontSize * 1.5;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    let y = pageHeight - 60;

    // Wrap text
    const lines = wrapText(text, maxWidth, font, fontSize);

    // Draw text
    for (const line of lines) {
      // New page if needed
      if (y < 60) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 60;
      }

      if (line.trim() !== "") {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      y -= lineHeight;
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Return PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(
          /\.docx$/i,
          ".pdf"
        )}"`,
      },
    });
  } catch (error: any) {
    console.error("Word to PDF conversion error:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Failed to convert Word document to PDF",
      },
      {
        status: 500,
      }
    );
  }
}