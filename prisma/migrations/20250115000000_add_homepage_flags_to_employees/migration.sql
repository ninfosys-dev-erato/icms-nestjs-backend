-- Migration: Add homepage flags to employees table
-- This migration adds two new boolean columns to control homepage display

-- Add new columns to employees table
ALTER TABLE "public"."employees" 
ADD COLUMN "showUpInHomepage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "showDownInHomepage" BOOLEAN NOT NULL DEFAULT false;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN "public"."employees"."showUpInHomepage" IS 'Show employee in top section of homepage';
COMMENT ON COLUMN "public"."employees"."showDownInHomepage" IS 'Show employee in bottom section of homepage';

-- Create indexes for better query performance on homepage queries
CREATE INDEX "idx_employees_showUpInHomepage" ON "public"."employees"("showUpInHomepage");
CREATE INDEX "idx_employees_showDownInHomepage" ON "public"."employees"("showDownInHomepage");
CREATE INDEX "idx_employees_homepage_order" ON "public"."employees"("order") WHERE "isActive" = true;

-- Update existing employees to have default values
UPDATE "public"."employees" 
SET 
  "showUpInHomepage" = false,
  "showDownInHomepage" = false
WHERE "showUpInHomepage" IS NULL OR "showDownInHomepage" IS NULL;
