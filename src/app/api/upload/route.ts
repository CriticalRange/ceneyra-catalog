import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Vercel Blob handshake — token request comes from the browser (session cookie
  // present), completion callback comes from Vercel's servers (no cookie, but
  // the request is verified by handleUpload's built-in signature check).
  if (
    body.type === "blob.generate-client-token" ||
    body.type === "blob.upload-completed"
  ) {
    try {
      const response = await handleUpload({
        body: body as HandleUploadBody,
        request,
        onBeforeGenerateToken: async () => {
          // Auth runs here so it only applies to the token request, not the
          // server-side completion callback which has no session cookie.
          const session = await getSession();
          if (!session.isAdmin) throw new Error("Unauthorized");
          return {
            allowedContentTypes: [
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/webp",
            ],
            maximumSizeInBytes: 52_428_800, // 50 MB
          };
        },
        onUploadCompleted: async () => {},
      });
      return NextResponse.json(response);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  }

  // All other requests (metadata save) require an admin session.
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
