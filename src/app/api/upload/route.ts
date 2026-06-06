import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Vercel Blob client token / completion handshake
  if (
    body.type === "blob.generate-client-token" ||
    body.type === "blob.upload-completed"
  ) {
    const response = await handleUpload({
      body: body as HandleUploadBody,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
        maximumSizeInBytes: 52_428_800, // 50 MB
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(response);
  }

  // Save catalog metadata once client-side uploads are complete
  const { title, description, pdfUrl, pdfName, coverUrl } = body;
  if (!title?.trim() || !pdfUrl) {
    try { await del(pdfUrl); } catch { /* ignore */ }
    if (coverUrl) try { await del(coverUrl); } catch { /* ignore */ }
    return NextResponse.json(
      { error: "PDF URL and title are required" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  let slug = slugify(title.trim());
  const existing = await prisma.catalog.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${timestamp}`;

  const catalog = await prisma.catalog.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      slug,
      filename: pdfName ?? "catalog.pdf",
      filepath: pdfUrl,
      coverImage: coverUrl ?? null,
      pageCount: 0,
      isPublished: true,
    },
  });

  return NextResponse.json(catalog, { status: 201 });
}
