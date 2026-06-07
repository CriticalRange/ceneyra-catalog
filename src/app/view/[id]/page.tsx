import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import FlipBookClientWrapper from "@/components/FlipBookClientWrapper";

export const dynamic = "force-dynamic";

export default async function ViewCatalogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await prisma.catalog.findUnique({ where: { id } });
  if (!catalog) notFound();

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <FlipBookClientWrapper pdfUrl={catalog.filepath} title={catalog.title} />
      </main>
    </div>
  );
}
