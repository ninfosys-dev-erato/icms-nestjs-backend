# Menu Order Field Migration

## Overview

This migration adds an `order` field to the `menus` table to allow customizing the display order of navigation menus in the admin panel.

## Changes Made

### 1. Prisma Schema Update
- Added `order Int @default(0)` field to the `Menu` model
- The field has a default value of 0

### 2. Database Migration
- SQL migration file: `prisma/migrations/add_order_to_menus.sql`
- Adds the `order` column to existing `menus` table
- Creates an index for better query performance
- Updates existing menus with default order values

### 3. Code Updates
- Updated DTOs to include the `order` field
- Added reordering functionality in services and repositories
- Added admin endpoint for reordering menus
- Updated entity interfaces to include the order field

## How to Apply the Migration

### Option 1: Manual SQL Execution
```bash
# Connect to your PostgreSQL database and run:
psql -h your_host -U your_user -d your_database -f prisma/migrations/add_order_to_menus.sql
```

### Option 2: Prisma Migrate (if you have database creation permissions)
```bash
npx prisma migrate dev --name add_order_to_menus
```

### Option 3: Prisma Deploy (for production)
```bash
npx prisma db push
```

## New API Endpoints

### Reorder Menus
```
PUT /admin/menus/reorder
Body: { id: string; order: number }[]
```

### Example Request
```json
[
  { "id": "menu1", "order": 1 },
  { "id": "menu2", "order": 2 },
  { "id": "menu3", "order": 3 }
]
```

## Database Schema Changes

### Before
```sql
CREATE TABLE menus (
  id TEXT PRIMARY KEY,
  name JSONB,
  description JSONB,
  location TEXT,
  isActive BOOLEAN DEFAULT true,
  isPublished BOOLEAN DEFAULT false,
  -- ... other fields
);
```

### After
```sql
CREATE TABLE menus (
  id TEXT PRIMARY KEY,
  name JSONB,
  description JSONB,
  location TEXT,
  "order" INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  isPublished BOOLEAN DEFAULT false,
  -- ... other fields
);

CREATE INDEX menus_order_idx ON menus("order");
```

## Usage in Admin Panel

1. **Menu Creation**: Set the `order` field when creating new menus
2. **Menu Editing**: Modify the `order` field to change display position
3. **Bulk Reordering**: Use the reorder endpoint to change multiple menu positions at once
4. **Sorting**: Menus are automatically sorted by order in ascending order

## Default Behavior

- New menus get `order = 0` by default
- Existing menus are updated with order based on creation timestamp
- Lower order numbers appear first in navigation
- Menus with the same order are sorted by creation date

## Backward Compatibility

- The `order` field is optional in DTOs
- Existing code will continue to work without changes
- Default value ensures no breaking changes
