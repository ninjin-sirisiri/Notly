-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "folder_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notes_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notes" ("content", "created_at", "file_path", "folder_id", "id", "title", "updated_at") SELECT "content", "created_at", "file_path", "folder_id", "id", "title", "updated_at" FROM "notes";
DROP TABLE "notes";
ALTER TABLE "new_notes" RENAME TO "notes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
