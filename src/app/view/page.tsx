import { prisma } from "@/lib/db";
import Link from "next/link";
import FlipBookClientWrapper from "@/components/FlipBookClientWrapper";

export const dynamic = "force-dynamic";

async function getOrActivateCatalog() {
  const active = await prisma.catalog.findFirst({ where: { isActive: true } });
  if (active) return { catalog: active, autoActivated: false };

  const fallback = await prisma.catalog.findFirst({
    where: { isPublished: true },
    orderBy: { title: "asc" },
  });
  if (!fallback) return { catalog: null, autoActivated: false };

  await prisma.catalog.update({
    where: { id: fallback.id },
    data: { isActive: true },
  });

  return { catalog: fallback, autoActivated: true };
}

export async function generateMetadata() {
  const { catalog } = await getOrActivateCatalog();
  if (!catalog) return { title: "Catalog — Ceneyra" };
  return {
    title: `${catalog.title} — Ceneyra`,
    description: catalog.description ?? undefined,
  };
}

export default async function ViewPage() {
  const { catalog, autoActivated } = await getOrActivateCatalog();

  if (!catalog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-4 text-center">
        <svg className="w-16 h-16 text-black/15 dark:text-white/15 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-3">Coming Soon</h1>
        <p className="text-black/50 dark:text-white/50 max-w-xs">
          Our catalog is being prepared. Check back soon — it will be available here shortly.
        </p>
        <Link href="/" className="mt-8 text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black overflow-hidden">

      {/* Auto-activation warning */}
      {autoActivated && (
        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            No catalog was set as active — <strong>&ldquo;{catalog!.title}&rdquo;</strong> was automatically activated (first alphabetically).{" "}
            <Link href="/admin/dashboard" className="underline underline-offset-2 hover:opacity-70">
              Change in admin
            </Link>
          </p>
        </div>
      )}

      {/* Viewer */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <FlipBookClientWrapper pdfUrl={catalog!.filepath} title={catalog!.title} />
      </main>
    </div>
  );
}
