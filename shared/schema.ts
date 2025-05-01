import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Defines the categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").default("folder"),
  parentId: integer("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories self-relations
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  subcategories: many(categories, { relationName: "subcategories" }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "subcategories",
  }),
  items: many(items),
}));

// Defines the items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  attributes: json("attributes").$type<Record<string, string | number | boolean>>().default({}),
  tags: text("tags").array(),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Items relations
export const itemsRelations = relations(items, ({ one }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
}));

// Zod schemas for validation
export const categoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(1, "Category name is required"),
  icon: (schema) => schema.optional(),
  parentId: (schema) => schema.nullable(),
});

export const categorySelectSchema = createSelectSchema(categories);

export const itemInsertSchema = createInsertSchema(items, {
  name: (schema) => schema.min(1, "Item name is required"),
  description: (schema) => schema.optional(),
  quantity: (schema) => schema.int().positive().default(1),
  categoryId: (schema) => schema.int().positive("Category is required"),
  attributes: (schema) => schema.optional(),
  tags: (schema) => schema.array(z.string()).optional(),
  isFavorite: (schema) => z.boolean().default(false),
});

export const itemSelectSchema = createSelectSchema(items);

// Theme presets table
export const themePresets = pgTable("theme_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  themeData: json("theme_data").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Settings table for user preferences
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: json("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Settings schema
export const settingInsertSchema = createInsertSchema(settings, {
  key: (schema) => schema.min(1, "Setting key is required"),
  value: (schema) => schema.optional(),
});

export const settingSelectSchema = createSelectSchema(settings);

// Define theme settings schema
export const themeSchema = z.object({
  primaryColor: z.string().default("#6366F1"),
  secondaryColor: z.string().default("#A855F7"),
  accentColor: z.string().default("#2DD4BF"),
  textColor: z.string().default("#111827"),
  backgroundColor: z.string().default("#F9FAFB"),
  cardColor: z.string().default("#FFFFFF"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  borderRadius: z.enum(["none", "small", "medium", "large"]).default("medium"),
  fontFamily: z.string().default("Inter, sans-serif"),
});

// Define layout settings schema
export const layoutSchema = z.object({
  sidebarPosition: z.enum(["left", "right"]).default("left"),
  sidebarWidth: z.enum(["narrow", "medium", "wide"]).default("medium"),
  defaultView: z.enum(["grid", "list", "table"]).default("grid"),
  gridColumns: z.number().min(1).max(6).default(3),
  showItemCount: z.boolean().default(true),
  compactView: z.boolean().default(false),
  showItemDescription: z.boolean().default(true),
  showItemAttributes: z.boolean().default(true),
  showItemTags: z.boolean().default(true),
});

// Define all settings schema
export const userSettingsSchema = z.object({
  theme: themeSchema,
  layout: layoutSchema,
});

// Theme preset schemas
export const themePresetInsertSchema = createInsertSchema(themePresets, {
  name: (schema) => schema.min(2, "Preset name must be at least 2 characters"),
  themeData: () => themeSchema,
  isDefault: (schema) => schema.optional(),
});

export const themePresetSelectSchema = createSelectSchema(themePresets);

// Custom schema for search query
export const searchQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  sort: z.enum(["name_asc", "name_desc", "date_asc", "date_desc", "quantity_asc", "quantity_desc"]).optional(),
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof categoryInsertSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof itemInsertSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof settingInsertSchema>;
export type ThemeSettings = z.infer<typeof themeSchema>;
export type LayoutSettings = z.infer<typeof layoutSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type ThemePreset = typeof themePresets.$inferSelect;
export type InsertThemePreset = z.infer<typeof themePresetInsertSchema>;
