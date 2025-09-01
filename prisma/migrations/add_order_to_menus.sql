-- Add order field to menus table
ALTER TABLE menus ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Create index on order field for better performance
CREATE INDEX IF NOT EXISTS "menus_order_idx" ON menus("order");

-- Update existing menus to have a default order based on creation time
UPDATE menus SET "order" = EXTRACT(EPOCH FROM "createdAt")::INTEGER WHERE "order" IS NULL;
