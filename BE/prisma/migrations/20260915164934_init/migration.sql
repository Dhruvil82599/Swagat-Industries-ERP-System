-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "mobile_number" VARCHAR(15) NOT NULL,
    "address" TEXT NOT NULL,
    "gst_no" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "industry_name" VARCHAR(255) NOT NULL,
    "gst_no" VARCHAR(20),
    "address" TEXT NOT NULL,
    "contact_person" VARCHAR(150),
    "mobile_no" VARCHAR(15),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" SERIAL NOT NULL,
    "industry_id" INTEGER NOT NULL,
    "site_name" VARCHAR(255) NOT NULL,
    "site_address" TEXT NOT NULL,
    "city_location" VARCHAR(150) NOT NULL,
    "contact_person" VARCHAR(150),
    "mobile_no" VARCHAR(15),
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shutters" (
    "id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "shutter_name_no" VARCHAR(150) NOT NULL,
    "height_inches" DECIMAL(10,2) NOT NULL,
    "width_inches" DECIMAL(10,2) NOT NULL,
    "shutter_type" VARCHAR(50) NOT NULL,
    "fitting_type" VARCHAR(50) NOT NULL,
    "rate_per_sqft" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gi_top_cover_rate_per_sqft" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gear_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "motor_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gst_applicable" BOOLEAN NOT NULL DEFAULT true,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shutters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "quotation_no" VARCHAR(50) NOT NULL,
    "quotation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" INTEGER NOT NULL,
    "industry_id" INTEGER,
    "site_id" INTEGER,
    "shutter_basic_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gi_top_cover_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transportation_charges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "additional_charges_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_reason" VARCHAR(255),
    "total_basic" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gst_applicable" BOOLEAN NOT NULL DEFAULT true,
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "gst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "final_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" SERIAL NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "shutter_id" INTEGER,
    "sr_no" INTEGER NOT NULL,
    "shutter_name_no" VARCHAR(150),
    "height_inches" DECIMAL(10,2) NOT NULL,
    "width_inches" DECIMAL(10,2) NOT NULL,
    "height_ft" DECIMAL(10,2) NOT NULL,
    "width_ft" DECIMAL(10,2) NOT NULL,
    "shutter_type" VARCHAR(50) NOT NULL,
    "fitting_type" VARCHAR(50) NOT NULL,
    "over_height" DECIMAL(10,2) NOT NULL,
    "over_width" DECIMAL(10,2) NOT NULL,
    "total_sqft" DECIMAL(10,2) NOT NULL,
    "cover_size" DECIMAL(10,2) NOT NULL,
    "rate_per_sqft" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gi_top_cover_rate_per_sqft" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gear_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "motor_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shutter_basic" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gi_top_cover_basic" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "basic_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gst_applicable" BOOLEAN NOT NULL DEFAULT true,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_charges" (
    "id" SERIAL NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "charge_type" VARCHAR(50) NOT NULL DEFAULT 'Quotation-wise',
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additional_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_amount" DECIMAL(12,2) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "transaction_no" VARCHAR(100),
    "cheque_no" VARCHAR(100),
    "cheque_date" TIMESTAMP(3),
    "bank_name" VARCHAR(100),
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(255) NOT NULL DEFAULT 'Swagat Industries',
    "logo_url" TEXT,
    "address" TEXT,
    "city_state_pincode" VARCHAR(255),
    "mobile" VARCHAR(50),
    "alt_mobile" VARCHAR(50),
    "email" VARCHAR(100),
    "website" VARCHAR(100),
    "gst_no" VARCHAR(50),
    "pan_no" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "account_no" VARCHAR(50),
    "ifsc_code" VARCHAR(50),
    "branch_name" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_terms" (
    "id" SERIAL NOT NULL,
    "term_key" VARCHAR(100),
    "term_title" VARCHAR(255) NOT NULL,
    "term_text" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotation_terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_customer_name_idx" ON "customers"("customer_name");

-- CreateIndex
CREATE INDEX "customers_mobile_number_idx" ON "customers"("mobile_number");

-- CreateIndex
CREATE INDEX "industries_customer_id_idx" ON "industries"("customer_id");

-- CreateIndex
CREATE INDEX "industries_industry_name_idx" ON "industries"("industry_name");

-- CreateIndex
CREATE INDEX "sites_industry_id_idx" ON "sites"("industry_id");

-- CreateIndex
CREATE INDEX "sites_site_name_idx" ON "sites"("site_name");

-- CreateIndex
CREATE INDEX "shutters_site_id_idx" ON "shutters"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_no_key" ON "quotations"("quotation_no");

-- CreateIndex
CREATE INDEX "quotations_quotation_no_idx" ON "quotations"("quotation_no");

-- CreateIndex
CREATE INDEX "quotations_quotation_date_idx" ON "quotations"("quotation_date");

-- CreateIndex
CREATE INDEX "quotations_customer_id_idx" ON "quotations"("customer_id");

-- CreateIndex
CREATE INDEX "quotations_industry_id_idx" ON "quotations"("industry_id");

-- CreateIndex
CREATE INDEX "quotations_site_id_idx" ON "quotations"("site_id");

-- CreateIndex
CREATE INDEX "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- CreateIndex
CREATE INDEX "quotation_items_shutter_id_idx" ON "quotation_items"("shutter_id");

-- CreateIndex
CREATE INDEX "additional_charges_quotation_id_idx" ON "additional_charges"("quotation_id");

-- CreateIndex
CREATE INDEX "payments_quotation_id_idx" ON "payments"("quotation_id");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "quotation_terms_display_order_idx" ON "quotation_terms"("display_order");

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shutters" ADD CONSTRAINT "shutters_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_shutter_id_fkey" FOREIGN KEY ("shutter_id") REFERENCES "shutters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_charges" ADD CONSTRAINT "additional_charges_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
