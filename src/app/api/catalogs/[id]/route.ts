import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, validateCsrf } from "@/lib/session";
import { del } from "@vercel/blob";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { title, description, isPublished, isActive } = body;

  if (isActive === true) {
    await prisma.catalog.updateMany({ data: { isActive: false } });
  }

  const catalog = await prisma.catalog.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublished !== undefined && { isPublished }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(catalog);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { id } = await params;
  const catalog = await prisma.catalog.findUnique({ where: { id } });
  if (!catalog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const toDelete = [catalog.filepath, catalog.coverImage].filter(Boolean) as string[];
  if (toDelete.length) {
    try { await del(toDelete); } catch { /* ignore */ }
  }

  await prisma.catalog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
