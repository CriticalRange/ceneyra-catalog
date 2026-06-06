-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Catalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "coverImage" TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Catalog" ("coverImage", "createdAt", "description", "filename", "filepath", "id", "isPublished", "pageCount", "slug", "title", "updatedAt") SELECT "coverImage", "createdAt", "description", "filename", "filepath", "id", "isPublished", "pageCount", "slug", "title", "updatedAt" FROM "Catalog";
DROP TABLE "Catalog";
ALTER TABLE "new_Catalog" RENAME TO "Catalog";
CREATE UNIQUE INDEX "Catalog_slug_key" ON "Catalog"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
