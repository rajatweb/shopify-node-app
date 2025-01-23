/*
  Warnings:

  - A unique constraint covering the columns `[shop]` on the table `session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "session_shop_key" ON "session"("shop");
