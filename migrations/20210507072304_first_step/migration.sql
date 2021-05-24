-- CreateTable
CREATE TABLE "a_Document" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "description" TEXT,
    "parent" BIGINT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "a_DocColumn" (
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

-- CreateIndex
CREATE UNIQUE INDEX "a_Document.tableName_unique" ON "a_Document"("tableName");

-- CreateIndex
CREATE UNIQUE INDEX "a_DocColumn.columnName_unique" ON "a_DocColumn"("columnName");
