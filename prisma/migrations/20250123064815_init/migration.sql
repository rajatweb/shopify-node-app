/*
  Warnings:

  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `stores` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "session_shop_key";

-- AlterTable
ALTER TABLE "session" DROP CONSTRAINT "session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "session_id_seq";

-- AlterTable
ALTER TABLE "stores" DROP CONSTRAINT "stores_pkey",
DROP COLUMN "id";
