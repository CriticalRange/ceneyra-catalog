import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { unlink } from "fs/promises";
import { join } from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const catalog = await prisma.catalog.findUnique({ where: { id } });
  if (!catalog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(catalog);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, description, isPublished } = body;

  const catalog = await prisma.catalog.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });

  return NextResponse.json(catalog);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const catalog = await prisma.catalog.findUnique({ where: { id } });
  if (!catalog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete the PDF file
  try {
    const fullPath = join(process.cwd(), "public", catalog.filepath);
    await unlink(fullPath);
  } catch {
    // File may already be gone
  }

  // Delete cover image if it exists and is locally stored
  if (catalog.coverImage && catalog.coverImage.startsWith("/uploads/")) {
    try {
      const coverPath = join(process.cwd(), "public", catalog.coverImage);
      await unlink(coverPath);
    } catch {
      // File may already be gone
    }
  }

  await prisma.catalog.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
