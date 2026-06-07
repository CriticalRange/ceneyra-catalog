import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import AdminCatalogList from "@/components/AdminCatalogList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  const catalogs = await prisma.catalog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Catalogs</h1>
            <p className="text-black/45 dark:text-white/45 text-sm mt-0.5">
              {catalogs.length} total &mdash;{" "}
              {catalogs.filter((c) => c.isPublished).length} published
            </p>
          </div>
          <a
            href="/admin/upload"
            className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
            style={{ background: "#172c4f" }}
          >
            + New
          </a>
        </div>

        <AdminCatalogList
          catalogs={catalogs.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            filepath: c.filepath,
            coverImage: c.coverImage,
            pageCount: c.pageCount,
            isPublished: c.isPublished,
            isActive: c.isActive,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
