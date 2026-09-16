-- DropForeignKey
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_customer_id_fkey";

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
