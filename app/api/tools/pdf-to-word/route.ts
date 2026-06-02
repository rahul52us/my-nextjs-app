import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

    // File size check (20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${backendUrl}/convert/pdf-to-word`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      let errDetail = response.statusText;
      try {
        const errJson = await response.json();
        errDetail = errJson.error || errJson.message || errDetail;
      } catch {
        try {
          errDetail = await response.text() || errDetail;
        } catch {}
      }
      return NextResponse.json(
        { error: `Backend conversion failed: ${errDetail}` },
        { status: response.status }
      );
    }

    const docxBuffer = await response.arrayBuffer();
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

    return NextResponse.json(
      { error: error?.message || "Failed to convert PDF to Word document." },
      { status: 500 }
    );
  }
}