import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { getSession, validateCsrf } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // CSRF check for metadata save (not needed for Blob handshake — it's a library call)
  if (body.type !== "blob.generate-client-token" && body.type !== "blob.upload-completed") {
    if (!await validateCsrf(request)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }
  }

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

  const cleanup = async () => {
    if (pdfUrl) try { await del(pdfUrl); } catch { /* ignore */ }
    if (coverUrl) try { await del(coverUrl); } catch { /* ignore */ }
  };

  if (!title?.trim() || !pdfUrl) {
    await cleanup();
    return NextResponse.json({ error: "PDF URL and title are required" }, { status: 400 });
  }

  // Validate URLs are from Vercel Blob (prevent arbitrary URL injection)
  const blobHost = "public.blob.vercel-storage.com";
  if (!pdfUrl.includes(blobHost) || (coverUrl && !coverUrl.includes(blobHost))) {
    await cleanup();
    return NextResponse.json({ error: "Invalid file source" }, { status: 400 });
  }

  // Cap total catalog count
  const total = await prisma.catalog.count();
  if (total >= 50) {
    await cleanup();
    return NextResponse.json({ error: "Catalog limit reached" }, { status: 400 });
  }

  const hasActive = await prisma.catalog.count({ where: { isActive: true } });

  const catalog = await prisma.catalog.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      filename: pdfName ?? "catalog.pdf",
      filepath: pdfUrl,
      coverImage: coverUrl ?? null,
      pageCount: 0,
      isPublished: true,
      isActive: hasActive === 0,
    },
  });

  return NextResponse.json(catalog, { status: 201 });
}
