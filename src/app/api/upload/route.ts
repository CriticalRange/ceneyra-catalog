import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { existsSync } from "fs";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("pdf") as File | null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const coverFile = formData.get("cover") as File | null;

  if (!file || !title) {
    return NextResponse.json(
      { error: "PDF file and title are required" },
      { status: 400 }
    );
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Only PDF files are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 50 MB" },
      { status: 400 }
    );
  }

  const uploadsDir = join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // Save PDF
  const timestamp = Date.now();
  const safeFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const pdfPath = join(uploadsDir, safeFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(pdfPath, buffer);
  const filepath = `/uploads/${safeFilename}`;

  // Save cover image if provided
  let coverImage: string | undefined;
  if (coverFile && coverFile.size > 0) {
    const coverExt = coverFile.name.split(".").pop()?.toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "webp"];
    if (coverExt && allowedExts.includes(coverExt)) {
      const coverFilename = `${timestamp}-cover.${coverExt}`;
      const coverPath = join(uploadsDir, coverFilename);
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      await writeFile(coverPath, coverBuffer);
      coverImage = `/uploads/${coverFilename}`;
    }
  }

  // Generate a unique slug
  let slug = slugify(title);
  const existing = await prisma.catalog.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${timestamp}`;
  }

  const catalog = await prisma.catalog.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      slug,
      filename: file.name,
      filepath,
      coverImage: coverImage ?? null,
      pageCount: 0,
      isPublished: true,
    },
  });

  return NextResponse.json(catalog, { status: 201 });
}
