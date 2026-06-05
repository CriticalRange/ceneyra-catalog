import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import FlipBookClientWrapper from "@/components/FlipBookClientWrapper";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await prisma.catalog.findUnique({ where: { slug } });
  if (!catalog) return { title: "Not Found" };
  return {
    title: `${catalog.title} — Ceneyra Catalog`,
    description: catalog.description ?? undefined,
  };
}

export default async function CatalogViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await prisma.catalog.findUnique({
    where: { slug, isPublished: true },
  });

  if (!catalog) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-14">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              All Catalogs
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 text-sm font-medium truncate">
              {catalog.title}
            </span>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <main className="flex-1 overflow-x-auto py-10 px-4">
        <FlipBookClientWrapper
          pdfUrl={catalog.filepath}
          title={catalog.title}
        />
      </main>

      {/* Footer */}
      <div className="bg-slate-800 border-t border-slate-700 py-4 text-center">
        <p className="text-xs text-slate-500">
          Powered by{" "}
          <span className="text-indigo-400 font-medium">Ceneyra Catalog</span>
        </p>
      </div>
    </div>
  );
}
