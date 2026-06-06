import { prisma } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import CatalogGrid from "@/components/CatalogGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalogs = await prisma.catalog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-black/8 dark:border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white tracking-tight">
              Catalogs
            </h1>
            <p className="mt-3 text-base text-black/50 dark:text-white/50 max-w-md">
              Browse our interactive flipbook catalogs.
            </p>
          </div>
        </section>

        {/* Catalog grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <CatalogGrid
            catalogs={catalogs.map((c) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              slug: c.slug,
              coverImage: c.coverImage,
              filepath: c.filepath,
              pageCount: c.pageCount,
              isActive: c.isActive,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </section>
      </main>

      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-black/30 dark:text-white/30">
            &copy; {new Date().getFullYear()} Ceneyra
          </p>
        </div>
      </footer>
    </div>
  );
}
