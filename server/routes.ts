import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  categories, 
  categoryInsertSchema, 
  items, 
  itemInsertSchema, 
  searchQuerySchema, 
  settings, 
  userSettingsSchema,
  themePresetInsertSchema
} from "@shared/schema";
import { eq, like, and, or, desc, asc, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Get all categories with counts
  app.get(`${apiPrefix}/categories`, async (_req, res) => {
    try {
      const allCategories = await db.query.categories.findMany({
        with: {
          subcategories: true,
          items: true,
        },
      });

      // Process to add item counts and structure parent-child relationships
      const result = allCategories
        .filter((category) => category.parentId === null)
        .map((category) => ({
          ...category,
          itemCount: category.items.length,
          subcategories: allCategories
            .filter((sub) => sub.parentId === category.id)
            .map((sub) => ({
              ...sub,
              itemCount: sub.items.length,
              items: undefined,
            })),
          items: undefined,
        }));

      return res.json(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Add a new category
  app.post(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const validatedData = categoryInsertSchema.parse(req.body);
      const [newCategory] = await db.insert(categories).values(validatedData).returning();
      return res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating category:", error);
      return res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Update a category
  app.put(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = categoryInsertSchema.parse(req.body);
      
      const [updatedCategory] = await db
        .update(categories)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(categories.id, parseInt(id)))
        .returning();
      
      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      return res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error updating category:", error);
      return res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Delete a category
  app.delete(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      
      // Check if the category has subcategories
      const subcategories = await db.query.categories.findMany({
        where: eq(categories.parentId, categoryId),
      });
      
      if (subcategories.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete category with subcategories. Delete subcategories first." 
        });
      }
      
      // Check if the category has items
      const categoryItems = await db.query.items.findMany({
        where: eq(items.categoryId, categoryId),
      });
      
      if (categoryItems.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete category with items. Move or delete items first." 
        });
      }
      
      const [deletedCategory] = await db
        .delete(categories)
        .where(eq(categories.id, categoryId))
        .returning();
      
      if (!deletedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      return res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Get all items with filtering and sorting
  app.get(`${apiPrefix}/items`, async (req, res) => {
    try {
      const queryParams = searchQuerySchema.parse({
        q: req.query.q as string | undefined,
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        tags: req.query.tags ? String(req.query.tags).split(',') : undefined,
        isFavorite: req.query.isFavorite === 'true' ? true : undefined,
        sort: req.query.sort as string | undefined,
      });
      
      let query = db.select().from(items).leftJoin(categories, eq(items.categoryId, categories.id));
      
      // Apply search filter
      if (queryParams.q) {
        query = query.where(
          or(
            like(items.name, `%${queryParams.q}%`),
            like(items.description || '', `%${queryParams.q}%`)
          )
        );
      }
      
      // Apply category filter
      if (queryParams.categoryId) {
        // Get the specified category
        const category = await db.query.categories.findFirst({
          where: eq(categories.id, queryParams.categoryId),
        });
        
        if (category) {
          if (category.parentId === null) {
            // If main category, include all its subcategories
            const subcategories = await db.query.categories.findMany({
              where: eq(categories.parentId, queryParams.categoryId),
              columns: { id: true },
            });
            
            const subcategoryIds = subcategories.map(sub => sub.id);
            
            query = query.where(
              or(
                eq(items.categoryId, queryParams.categoryId),
                ...subcategoryIds.map(id => eq(items.categoryId, id))
              )
            );
          } else {
            // If subcategory, just filter by that ID
            query = query.where(eq(items.categoryId, queryParams.categoryId));
          }
        }
      }
      
      // Apply tags filter
      if (queryParams.tags && queryParams.tags.length > 0) {
        // Filter items that contain at least one of the specified tags
        query = query.where(
          sql`${items.tags} && ${queryParams.tags}`
        );
      }
      
      // Apply favorite filter
      if (queryParams.isFavorite) {
        query = query.where(eq(items.isFavorite, true));
      }
      
      // Apply sorting
      if (queryParams.sort) {
        switch (queryParams.sort) {
          case 'name_asc':
            query = query.orderBy(asc(items.name));
            break;
          case 'name_desc':
            query = query.orderBy(desc(items.name));
            break;
          case 'date_asc':
            query = query.orderBy(asc(items.createdAt));
            break;
          case 'date_desc':
            query = query.orderBy(desc(items.createdAt));
            break;
          case 'quantity_asc':
            query = query.orderBy(asc(items.quantity));
            break;
          case 'quantity_desc':
            query = query.orderBy(desc(items.quantity));
            break;
          default:
            query = query.orderBy(desc(items.updatedAt));
        }
      } else {
        // Default sorting by updated date
        query = query.orderBy(desc(items.updatedAt));
      }
      
      const results = await query;
      
      // Transform results to include category name
      const transformedResults = results.map(({ items: item, categories: category }) => ({
        ...item,
        categoryName: category?.name,
      }));
      
      return res.json(transformedResults);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error fetching items:", error);
      return res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // Get a single item by ID
  app.get(`${apiPrefix}/items/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await db.query.items.findFirst({
        where: eq(items.id, parseInt(id)),
        with: {
          category: true,
        },
      });
      
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      return res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      return res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Add a new item
  app.post(`${apiPrefix}/items`, async (req, res) => {
    try {
      const validatedData = itemInsertSchema.parse(req.body);
      const [newItem] = await db.insert(items).values(validatedData).returning();
      return res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating item:", error);
      return res.status(500).json({ error: "Failed to create item" });
    }
  });

  // Update an item
  app.put(`${apiPrefix}/items/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = itemInsertSchema.parse(req.body);
      
      const [updatedItem] = await db
        .update(items)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(items.id, parseInt(id)))
        .returning();
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      return res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error updating item:", error);
      return res.status(500).json({ error: "Failed to update item" });
    }
  });

  // Delete an item
  app.delete(`${apiPrefix}/items/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [deletedItem] = await db
        .delete(items)
        .where(eq(items.id, parseInt(id)))
        .returning();
      
      if (!deletedItem) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      return res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      return res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Get inventory statistics
  app.get(`${apiPrefix}/stats`, async (_req, res) => {
    try {
      // Get total categories count
      const categoriesCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories);
      
      // Get main categories count (no parent)
      const mainCategoriesCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories)
        .where(isNull(categories.parentId));
      
      // Get subcategories count
      const subcategoriesCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories)
        .where(sql`${categories.parentId} is not null`);
      
      // Get total items count
      const itemsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(items);
      
      // Get total items quantity
      const itemsQuantity = await db
        .select({ sum: sql<number>`sum(${items.quantity})` })
        .from(items);
      
      // Get favorite items count
      const favoriteItemsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(items)
        .where(eq(items.isFavorite, true));
      
      // Get items per category
      const itemsPerCategory = await db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          itemCount: sql<number>`count(${items.id})`,
        })
        .from(categories)
        .leftJoin(items, eq(categories.id, items.categoryId))
        .groupBy(categories.id, categories.name);
      
      return res.json({
        categories: {
          total: categoriesCount[0]?.count || 0,
          main: mainCategoriesCount[0]?.count || 0,
          sub: subcategoriesCount[0]?.count || 0,
        },
        items: {
          total: itemsCount[0]?.count || 0,
          quantity: itemsQuantity[0]?.sum || 0,
          favorite: favoriteItemsCount[0]?.count || 0,
        },
        itemsPerCategory,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).json({ error: "Failed to fetch inventory statistics" });
    }
  });

  // Settings routes
  app.get(`${apiPrefix}/settings`, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      return res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put(`${apiPrefix}/settings`, async (req, res) => {
    try {
      const validatedData = userSettingsSchema.parse(req.body);
      const updatedSettings = await storage.saveSettings(validatedData);
      return res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error updating settings:", error);
      return res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.post(`${apiPrefix}/settings/reset`, async (_req, res) => {
    try {
      const defaultSettings = await storage.resetSettings();
      return res.json(defaultSettings);
    } catch (error) {
      console.error("Error resetting settings:", error);
      return res.status(500).json({ error: "Failed to reset settings" });
    }
  });

  // Theme preset routes
  app.get(`${apiPrefix}/theme-presets`, async (_req, res) => {
    try {
      const presets = await storage.getThemePresets();
      return res.json(presets);
    } catch (error) {
      console.error("Error fetching theme presets:", error);
      return res.status(500).json({ error: "Failed to fetch theme presets" });
    }
  });

  app.get(`${apiPrefix}/theme-presets/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const preset = await storage.getThemePresetById(parseInt(id));
      
      if (!preset) {
        return res.status(404).json({ error: "Theme preset not found" });
      }
      
      return res.json(preset);
    } catch (error) {
      console.error("Error fetching theme preset:", error);
      return res.status(500).json({ error: "Failed to fetch theme preset" });
    }
  });

  app.post(`${apiPrefix}/theme-presets`, async (req, res) => {
    try {
      const validatedData = themePresetInsertSchema.parse(req.body);
      const newPreset = await storage.createThemePreset(validatedData);
      return res.status(201).json(newPreset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating theme preset:", error);
      return res.status(500).json({ error: "Failed to create theme preset" });
    }
  });

  app.put(`${apiPrefix}/theme-presets/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = themePresetInsertSchema.parse(req.body);
      
      const updatedPreset = await storage.updateThemePreset(parseInt(id), validatedData);
      
      if (!updatedPreset) {
        return res.status(404).json({ error: "Theme preset not found" });
      }
      
      return res.json(updatedPreset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error updating theme preset:", error);
      return res.status(500).json({ error: "Failed to update theme preset" });
    }
  });

  app.delete(`${apiPrefix}/theme-presets/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedPreset = await storage.deleteThemePreset(parseInt(id));
      
      if (!deletedPreset) {
        return res.status(404).json({ error: "Theme preset not found" });
      }
      
      return res.json({ message: "Theme preset deleted successfully" });
    } catch (error) {
      console.error("Error deleting theme preset:", error);
      return res.status(500).json({ error: "Failed to delete theme preset" });
    }
  });

  app.post(`${apiPrefix}/theme-presets/:id/apply`, async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.applyThemePreset(parseInt(id));
      
      // Get the updated settings after applying the preset
      const updatedSettings = await storage.getSettings();
      
      return res.json(updatedSettings);
    } catch (error) {
      console.error("Error applying theme preset:", error);
      return res.status(500).json({ error: "Failed to apply theme preset" });
    }
  });

  // Add import/export endpoints
  app.post(`${apiPrefix}/import`, async (req, res) => {
    try {
      const { categories: importedCategories, items: importedItems } = req.body;
      
      if (!Array.isArray(importedCategories) || !Array.isArray(importedItems)) {
        return res.status(400).json({ error: "Invalid import data format" });
      }
      
      // Transaction to ensure data consistency
      await db.transaction(async (tx) => {
        // Clear existing data
        await tx.delete(items);
        await tx.delete(categories);
        
        // Insert categories - first parent categories, then subcategories
        const parentCategories = importedCategories.filter(c => c.parentId === null);
        const subcategories = importedCategories.filter(c => c.parentId !== null);
        
        if (parentCategories.length > 0) {
          await tx.insert(categories).values(parentCategories);
        }
        
        if (subcategories.length > 0) {
          await tx.insert(categories).values(subcategories);
        }
        
        // Insert items
        if (importedItems.length > 0) {
          await tx.insert(items).values(importedItems);
        }
      });
      
      return res.status(200).json({ message: "Import completed successfully" });
    } catch (error) {
      console.error("Error importing data:", error);
      return res.status(500).json({ error: "Failed to import data" });
    }
  });
  
  // Reset all data to default
  app.post(`${apiPrefix}/reset`, async (_req, res) => {
    try {
      // Delete all existing data
      await db.transaction(async (tx) => {
        await tx.delete(items);
        await tx.delete(categories);
      });
      
      // Don't need to seed data here as the frontend will refetch
      
      return res.status(200).json({ message: "Reset completed successfully" });
    } catch (error) {
      console.error("Error resetting data:", error);
      return res.status(500).json({ error: "Failed to reset data" });
    }
  });
  
  // Stats endpoint for dashboard
  app.get(`${apiPrefix}/stats`, async (_req, res) => {
    try {
      // Get all categories
      const allCategories = await db.query.categories.findMany();
      
      // Get all items
      const allItems = await db.query.items.findMany();
      
      // Calculate statistics
      const parentCategories = allCategories.filter(c => c.parentId === null);
      const subcategories = allCategories.filter(c => c.parentId !== null);
      
      const totalItems = allItems.length;
      const favoriteItems = allItems.filter(item => item.isFavorite).length;
      const totalQuantity = allItems.reduce((acc, item) => acc + item.quantity, 0);
      
      // Count items per category
      const itemsPerCategory = allCategories.map(category => {
        const categoryItems = allItems.filter(item => item.categoryId === category.id);
        return {
          id: category.id,
          name: category.name,
          count: categoryItems.length,
          totalQuantity: categoryItems.reduce((acc, item) => acc + item.quantity, 0)
        };
      }).filter(category => category.count > 0);
      
      return res.status(200).json({
        categories: {
          total: Number(allCategories.length),
          main: Number(parentCategories.length),
          sub: Number(subcategories.length)
        },
        items: {
          total: Number(totalItems),
          favorite: Number(favoriteItems),
          quantity: Number(totalQuantity)
        },
        itemsPerCategory: itemsPerCategory.map(item => ({
          id: Number(item.id),
          name: item.name,
          count: Number(item.count),
          totalQuantity: Number(item.totalQuantity)
        }))
      });
    } catch (error) {
      console.error("Error generating stats:", error);
      return res.status(500).json({ error: "Failed to generate stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
