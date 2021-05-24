-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_a_DocColumn" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "columnName" TEXT NOT NULL,
    "description" TEXT,
    "dataTypes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentID" BIGINT NOT NULL,
    FOREIGN KEY ("documentID") REFERENCES "a_Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_a_DocColumn" ("id", "name", "columnName", "description", "dataTypes", "createdAt", "updatedAt", "documentID") SELECT "id", "name", "columnName", "description", "dataTypes", "createdAt", "updatedAt", "documentID" FROM "a_DocColumn";
DROP TABLE "a_DocColumn";
ALTER TABLE "new_a_DocColumn" RENAME TO "a_DocColumn";
CREATE UNIQUE INDEX "a_DocColumn.columnName_unique" ON "a_DocColumn"("columnName");
CREATE TABLE "new_a_Document" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "description" TEXT,
    "parent" BIGINT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_a_Document" ("id", "name", "tableName", "description", "parent", "createdAt", "updatedAt") SELECT "id", "name", "tableName", "description", "parent", "createdAt", "updatedAt" FROM "a_Document";
DROP TABLE "a_Document";
ALTER TABLE "new_a_Document" RENAME TO "a_Document";
CREATE UNIQUE INDEX "a_Document.tableName_unique" ON "a_Document"("tableName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
