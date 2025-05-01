import { db } from "@db";
import { categories, items, settings, themePresets } from "@shared/schema";
import { eq, like, and, or, desc, asc, isNull } from "drizzle-orm";
import type { 
  InsertCategory, 
  InsertItem, 
  Category, 
  Item, 
  UserSettings, 
  InsertSetting,
  ThemePreset,
  InsertThemePreset,
  ThemeSettings
} from "@shared/schema";
import { userSettingsSchema, themeSchema } from "@shared/schema";

// Category operations
export const storage = {
  // Category operations
  async getCategories() {
    return await db.query.categories.findMany({
      with: {
        subcategories: true,
        items: true,
      },
    });
  },

  async getCategoryById(id: number) {
    return await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        subcategories: true,
        items: true,
      },
    });
  },

  async createCategory(category: InsertCategory) {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  },

  async updateCategory(id: number, category: Partial<InsertCategory>) {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  },

  async deleteCategory(id: number) {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return deletedCategory;
  },

  async getCategorySubcategories(id: number) {
    return await db.query.categories.findMany({
      where: eq(categories.parentId, id),
    });
  },

  // Item operations
  async getItems(categoryId?: number, search?: string) {
    let query = db.select().from(items);

    if (categoryId) {
      query = query.where(eq(items.categoryId, categoryId));
    }

    if (search) {
      query = query.where(
        or(
          like(items.name, `%${search}%`),
          like(items.description || '', `%${search}%`)
        )
      );
    }

    return await query;
  },

  async getItemById(id: number) {
    return await db.query.items.findFirst({
      where: eq(items.id, id),
      with: {
        category: true,
      },
    });
  },

  async createItem(item: InsertItem) {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  },

  async updateItem(id: number, item: Partial<InsertItem>) {
    const [updatedItem] = await db
      .update(items)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  },

  async deleteItem(id: number) {
    const [deletedItem] = await db
      .delete(items)
      .where(eq(items.id, id))
      .returning();
    return deletedItem;
  },

  async getItemsByCategory(categoryId: number) {
    return await db.query.items.findMany({
      where: eq(items.categoryId, categoryId),
    });
  },

  // Settings operations
  async getSettings() {
    // Default settings object with all required fields
    const defaultSettings = {
      theme: {
        primaryColor: "#6366F1",
        secondaryColor: "#A855F7",
        accentColor: "#2DD4BF",
        textColor: "#111827",
        backgroundColor: "#F9FAFB",
        cardColor: "#FFFFFF",
        fontSize: "medium",
        borderRadius: "medium",
        fontFamily: "Inter, sans-serif"
      },
      layout: {
        sidebarPosition: "left",
        sidebarWidth: "medium",
        defaultView: "grid",
        gridColumns: 3,
        showItemCount: true,
        compactView: false,
        showItemDescription: true,
        showItemAttributes: true,
        showItemTags: true
      }
    };

    try {
      // Look for stored settings in the database
      const settingsRecord = await db.query.settings.findFirst({
        where: eq(settings.key, "user_settings"),
      });

      if (settingsRecord && settingsRecord.value) {
        try {
          // Parse and validate the stored settings
          return userSettingsSchema.parse(settingsRecord.value);
        } catch (error) {
          console.error("Invalid settings format, using defaults:", error);
          // Save and return default settings if stored settings are invalid
          await this.saveSettings(defaultSettings);
          return defaultSettings;
        }
      }

      // No settings found, create default settings
      const validatedSettings = userSettingsSchema.parse(defaultSettings);
      await this.saveSettings(validatedSettings);
      return validatedSettings;
    } catch (error) {
      console.error("Error getting settings:", error);
      return userSettingsSchema.parse(defaultSettings);
    }
  },

  async saveSettings(userSettings: UserSettings) {
    // Validate the settings against our schema
    const validSettings = userSettingsSchema.parse(userSettings);

    // Check if settings already exist
    const existingSettings = await db.query.settings.findFirst({
      where: eq(settings.key, "user_settings"),
    });

    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(settings)
        .set({
          value: validSettings,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      // Create new settings
      const [newSettings] = await db
        .insert(settings)
        .values({
          key: "user_settings",
          value: validSettings,
        })
        .returning();
      return newSettings;
    }
  },

  async resetSettings() {
    // Default settings object with all required fields
    const defaultSettings = {
      theme: {
        primaryColor: "#6366F1",
        secondaryColor: "#A855F7",
        accentColor: "#2DD4BF",
        textColor: "#111827",
        backgroundColor: "#F9FAFB",
        cardColor: "#FFFFFF",
        fontSize: "medium",
        borderRadius: "medium",
        fontFamily: "Inter, sans-serif"
      },
      layout: {
        sidebarPosition: "left",
        sidebarWidth: "medium",
        defaultView: "grid",
        gridColumns: 3,
        showItemCount: true,
        compactView: false,
        showItemDescription: true,
        showItemAttributes: true,
        showItemTags: true
      }
    };
    
    // Validate with schema
    const validatedDefaults = userSettingsSchema.parse(defaultSettings);
    
    try {
      // Find and update existing settings
      const existingSettings = await db.query.settings.findFirst({
        where: eq(settings.key, "user_settings"),
      });

      if (existingSettings) {
        const [updatedSettings] = await db
          .update(settings)
          .set({
            value: validatedDefaults,
            updatedAt: new Date(),
          })
          .where(eq(settings.id, existingSettings.id))
          .returning();
        return updatedSettings;
      } else {
        // Create new settings record with defaults
        const [newSettings] = await db
          .insert(settings)
          .values({
            key: "user_settings",
            value: validatedDefaults,
          })
          .returning();
        return newSettings;
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      return { key: "user_settings", value: validatedDefaults };
    }
  },
  
  // Theme preset operations
  async getThemePresets() {
    return await db.query.themePresets.findMany({
      orderBy: [desc(themePresets.isDefault), asc(themePresets.name)]
    });
  },
  
  async getThemePresetById(id: number) {
    return await db.query.themePresets.findFirst({
      where: eq(themePresets.id, id)
    });
  },
  
  async createThemePreset(preset: InsertThemePreset) {
    // Reset any other presets that were default if this one is default
    if (preset.isDefault) {
      await db
        .update(themePresets)
        .set({ isDefault: false })
        .where(eq(themePresets.isDefault, true));
    }
    
    // Insert the new preset
    const [newPreset] = await db.insert(themePresets).values(preset).returning();
    return newPreset;
  },
  
  async updateThemePreset(id: number, preset: Partial<InsertThemePreset>) {
    // If making this preset default, reset any other default presets
    if (preset.isDefault) {
      await db
        .update(themePresets)
        .set({ isDefault: false })
        .where(eq(themePresets.isDefault, true));
    }
    
    // Update the preset
    const [updatedPreset] = await db
      .update(themePresets)
      .set({ ...preset, updatedAt: new Date() })
      .where(eq(themePresets.id, id))
      .returning();
    return updatedPreset;
  },
  
  async deleteThemePreset(id: number) {
    const [deletedPreset] = await db
      .delete(themePresets)
      .where(eq(themePresets.id, id))
      .returning();
      
    // If deleted preset was default, set the first available preset as default
    if (deletedPreset && deletedPreset.isDefault) {
      const remainingPresets = await this.getThemePresets();
      if (remainingPresets.length > 0) {
        await this.updateThemePreset(remainingPresets[0].id, { isDefault: true });
      }
    }
    
    return deletedPreset;
  },
  
  async applyThemePreset(id: number) {
    // Get the preset
    const preset = await this.getThemePresetById(id);
    if (!preset) {
      throw new Error(`Theme preset with id ${id} not found`);
    }
    
    // Get current settings
    const currentSettings = await this.getSettings();
    
    // Apply the theme from the preset
    const updatedSettings = {
      ...currentSettings,
      theme: preset.themeData
    };
    
    // Save the updated settings
    return await this.saveSettings(updatedSettings);
  },
};
