import { prisma } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import CatalogCard from "@/components/CatalogCard";

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
          {catalogs.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-black/30 dark:text-white/30 text-lg">No catalogs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {catalogs.map((catalog) => (
                <CatalogCard
                  key={catalog.id}
                  id={catalog.id}
                  title={catalog.title}
                  description={catalog.description}
                  slug={catalog.slug}
                  coverImage={catalog.coverImage}
                  filepath={catalog.filepath}
                  pageCount={catalog.pageCount}
                  isActive={catalog.isActive}
                  createdAt={catalog.createdAt.toISOString()}
                />
              ))}
            </div>
          )}
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
