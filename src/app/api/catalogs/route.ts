import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const catalogs = await prisma.catalog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      coverImage: true,
      pageCount: true,
      createdAt: true,
    },
  });
  return NextResponse.json(catalogs);
}
