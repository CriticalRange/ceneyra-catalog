import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import FlipBookClientWrapper from "@/components/FlipBookClientWrapper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const catalog = await prisma.catalog.findFirst({ where: { isActive: true } });
  if (!catalog) return { title: "Catalog — Ceneyra" };
  return {
    title: `${catalog.title} — Ceneyra`,
    description: catalog.description ?? undefined,
  };
}

export default async function ViewPage() {
  const catalog = await prisma.catalog.findFirst({ where: { isActive: true } });

  if (!catalog) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      {/* Top bar */}
      <div className="border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-14">
            <Link
              href="/"
              className="flex items-center gap-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <span className="text-black/20 dark:text-white/20">|</span>
            <span className="text-black dark:text-white text-sm font-medium truncate">
              {catalog.title}
            </span>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <main className="flex-1 overflow-x-auto py-10 px-4">
        <FlipBookClientWrapper pdfUrl={catalog.filepath} title={catalog.title} />
      </main>

      <footer className="py-6 text-center">
        <p className="text-xs text-black/30 dark:text-white/30">
          &copy; {new Date().getFullYear()} Ceneyra
        </p>
      </footer>
    </div>
  );
}
