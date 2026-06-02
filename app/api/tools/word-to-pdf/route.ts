import { NextRequest, NextResponse } from "next/server";

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

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${backendUrl}/convert/word-to-pdf`, {
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

    const pdfBuffer = await response.arrayBuffer();
    const outputFileName = file.name.replace(/\.docx$/i, ".pdf");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Word to PDF conversion error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to convert Word document to PDF",
      },
      {
        status: 500,
      }
    );
  }
}