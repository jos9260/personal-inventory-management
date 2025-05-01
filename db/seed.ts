import { db } from "./index";
import { categories, items } from "@shared/schema";

async function seed() {
  try {
    console.log("Starting seed...");

    // Check if we already have data to avoid duplicates
    const existingCategories = await db.query.categories.findMany();
    if (existingCategories.length > 0) {
      console.log("Database already has categories, skipping seed");
      return;
    }

    // Create main categories
    const wardrobeCategory = await db.insert(categories).values({
      name: "Wardrobe",
      icon: "shirt",
    }).returning() as any[];

    const electronicsCategory = await db.insert(categories).values({
      name: "Electronics",
      icon: "laptop",
    }).returning() as any[];

    const kitchenCategory = await db.insert(categories).values({
      name: "Kitchen",
      icon: "utensils",
    }).returning() as any[];

    const garageCategory = await db.insert(categories).values({
      name: "Garage",
      icon: "tool",
    }).returning() as any[];

    // Create subcategories for Wardrobe
    const tshirtsSubcategory = await db.insert(categories).values({
      name: "T-Shirts",
      parentId: wardrobeCategory[0].id,
      icon: "shirt",
    }).returning() as any[];

    const pantsSubcategory = await db.insert(categories).values({
      name: "Pants",
      parentId: wardrobeCategory[0].id,
      icon: "shirt",
    }).returning() as any[];

    const shoesSubcategory = await db.insert(categories).values({
      name: "Shoes",
      parentId: wardrobeCategory[0].id,
      icon: "shirt",
    }).returning() as any[];

    // Create subcategories for Electronics
    const phonesSubcategory = await db.insert(categories).values({
      name: "Phones",
      parentId: electronicsCategory[0].id,
      icon: "smartphone",
    }).returning() as any[];

    const computersSubcategory = await db.insert(categories).values({
      name: "Computers",
      parentId: electronicsCategory[0].id,
      icon: "laptop",
    }).returning() as any[];

    // Create subcategories for Kitchen
    const utensilsSubcategory = await db.insert(categories).values({
      name: "Utensils",
      parentId: kitchenCategory[0].id,
      icon: "utensils",
    }).returning() as any[];

    const appliancesSubcategory = await db.insert(categories).values({
      name: "Appliances",
      parentId: kitchenCategory[0].id,
      icon: "mixer",
    }).returning() as any[];

    // Create subcategories for Garage
    const toolsSubcategory = await db.insert(categories).values({
      name: "Tools",
      parentId: garageCategory[0].id,
      icon: "tool",
    }).returning() as any[];

    const gardensSubcategory = await db.insert(categories).values({
      name: "Garden",
      parentId: garageCategory[0].id,
      icon: "plant",
    }).returning() as any[];

    // Add sample items
    // T-shirts
    await db.insert(items).values([
      {
        name: "Black V-Neck",
        description: "Cotton, L size",
        quantity: 3,
        categoryId: tshirtsSubcategory[0].id,
        tags: ["black", "cotton", "v-neck"],
        attributes: { size: "L", color: "Black", material: "Cotton" },
      },
      {
        name: "White Crew Neck",
        description: "Cotton, M size",
        quantity: 2,
        categoryId: tshirtsSubcategory[0].id,
        tags: ["white", "cotton", "crew-neck"],
        attributes: { size: "M", color: "White", material: "Cotton" },
      },
      {
        name: "Gray Polo",
        description: "Cotton blend, L size",
        quantity: 1,
        categoryId: tshirtsSubcategory[0].id,
        tags: ["gray", "polo", "cotton-blend"],
        attributes: { size: "L", color: "Gray", material: "Cotton Blend" },
      },
      {
        name: "Navy Henley",
        description: "Cotton, S size",
        quantity: 2,
        categoryId: tshirtsSubcategory[0].id,
        tags: ["navy", "henley", "cotton"],
        attributes: { size: "S", color: "Navy", material: "Cotton" },
      },
    ]);

    // Pants
    await db.insert(items).values([
      {
        name: "Blue Jeans",
        description: "Denim, Size 32",
        quantity: 2,
        categoryId: pantsSubcategory[0].id,
        tags: ["blue", "denim", "jeans"],
        attributes: { size: "32", color: "Blue", material: "Denim" },
      },
      {
        name: "Black Chinos",
        description: "Cotton, Size 30",
        quantity: 1,
        categoryId: pantsSubcategory[0].id,
        tags: ["black", "chinos", "cotton"],
        attributes: { size: "30", color: "Black", material: "Cotton" },
      },
    ]);

    // Shoes
    await db.insert(items).values([
      {
        name: "Running Shoes",
        description: "Nike, Size 10",
        quantity: 1,
        categoryId: shoesSubcategory[0].id,
        tags: ["nike", "running", "athletic"],
        attributes: { size: "10", brand: "Nike", type: "Running" },
      },
      {
        name: "Casual Sneakers",
        description: "Adidas, Size 9",
        quantity: 1,
        categoryId: shoesSubcategory[0].id,
        tags: ["adidas", "sneakers", "casual"],
        attributes: { size: "9", brand: "Adidas", type: "Casual" },
      },
    ]);

    // Electronics - Phones
    await db.insert(items).values([
      {
        name: "iPhone 13",
        description: "128GB, Black",
        quantity: 1,
        categoryId: phonesSubcategory[0].id,
        tags: ["apple", "iphone", "smartphone"],
        attributes: { storage: "128GB", color: "Black", brand: "Apple" },
        isFavorite: true,
      },
    ]);

    // Electronics - Computers
    await db.insert(items).values([
      {
        name: "MacBook Pro",
        description: "13-inch, 512GB SSD, 16GB RAM",
        quantity: 1,
        categoryId: computersSubcategory[0].id,
        tags: ["apple", "macbook", "laptop"],
        attributes: { size: "13-inch", storage: "512GB", ram: "16GB", brand: "Apple" },
        isFavorite: true,
      },
      {
        name: "Dell XPS",
        description: "15-inch, 1TB SSD, 32GB RAM",
        quantity: 1,
        categoryId: computersSubcategory[0].id,
        tags: ["dell", "xps", "laptop"],
        attributes: { size: "15-inch", storage: "1TB", ram: "32GB", brand: "Dell" },
      },
    ]);

    // Kitchen - Utensils
    await db.insert(items).values([
      {
        name: "Chef's Knife",
        description: "8-inch, Stainless Steel",
        quantity: 1,
        categoryId: utensilsSubcategory[0].id,
        tags: ["knife", "chef", "stainless-steel"],
        attributes: { size: "8-inch", material: "Stainless Steel", brand: "Wusthof" },
      },
      {
        name: "Cutting Board",
        description: "Wooden, Large",
        quantity: 2,
        categoryId: utensilsSubcategory[0].id,
        tags: ["board", "cutting", "wooden"],
        attributes: { size: "Large", material: "Wood", type: "Cutting Board" },
      },
    ]);

    // Kitchen - Appliances
    await db.insert(items).values([
      {
        name: "Stand Mixer",
        description: "KitchenAid, 5-Quart",
        quantity: 1,
        categoryId: appliancesSubcategory[0].id,
        tags: ["mixer", "kitchenaid", "appliance"],
        attributes: { size: "5-Quart", brand: "KitchenAid", color: "Red" },
        isFavorite: true,
      },
      {
        name: "Blender",
        description: "Vitamix, 64oz",
        quantity: 1,
        categoryId: appliancesSubcategory[0].id,
        tags: ["blender", "vitamix", "appliance"],
        attributes: { size: "64oz", brand: "Vitamix", power: "1500W" },
      },
    ]);

    // Garage - Tools
    await db.insert(items).values([
      {
        name: "Cordless Drill",
        description: "DeWalt, 20V",
        quantity: 1,
        categoryId: toolsSubcategory[0].id,
        tags: ["drill", "dewalt", "cordless"],
        attributes: { power: "20V", brand: "DeWalt", type: "Drill" },
      },
      {
        name: "Hammer",
        description: "Stanley, 16oz",
        quantity: 2,
        categoryId: toolsSubcategory[0].id,
        tags: ["hammer", "stanley", "tool"],
        attributes: { weight: "16oz", brand: "Stanley", material: "Steel" },
      },
    ]);

    // Garage - Garden
    await db.insert(items).values([
      {
        name: "Garden Hose",
        description: "50ft, Expandable",
        quantity: 1,
        categoryId: gardensSubcategory[0].id,
        tags: ["hose", "garden", "expandable"],
        attributes: { length: "50ft", material: "Rubber", type: "Expandable" },
      },
      {
        name: "Pruning Shears",
        description: "Fiskars, 8-inch",
        quantity: 1,
        categoryId: gardensSubcategory[0].id,
        tags: ["shears", "pruning", "fiskars"],
        attributes: { size: "8-inch", brand: "Fiskars", type: "Pruning" },
      },
    ]);

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
