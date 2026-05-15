import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get all pages
    const pages = pdfDoc.getPages();

    // Add page numbers
    pages.forEach((page, index) => {
      const { width } = page.getSize();

      const pageNumText = `Page ${index + 1} of ${pages.length}`;

      page.drawText(pageNumText, {
        x: width / 2 - 40,
        y: 20,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });

    // Save updated PDF
    const pdfBytes = await pdfDoc.save();

    // Return PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="numbered-${file.name}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to process PDF",
      },
      { status: 500 }
    );
  }
}