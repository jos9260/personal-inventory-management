import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ItemGrid from "@/components/items/item-grid";
import Breadcrumbs from "@/components/breadcrumbs";
import AddItemModal from "@/components/modals/add-item-modal";
import AddCategoryModal from "@/components/modals/add-category-modal";
import InventoryStats from "@/components/dashboard/inventory-stats";
import { useCategories } from "@/hooks/use-categories";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { CategoryWithRelations, SubcategoryWithRelations } from "@/types/category";

export default function Dashboard() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("date_desc");
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isMobile = useMobile();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const getActiveCategoryName = () => {
    if (!categories) return "All Items";
    
    if (selectedSubcategoryId) {
      const mainCategory = categories.find(c => c.id === selectedCategoryId) as CategoryWithRelations | undefined;
      const subcategory = mainCategory?.subcategories?.find((s: SubcategoryWithRelations) => s.id === selectedSubcategoryId);
      return subcategory?.name || "All Items";
    }
    
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId) as CategoryWithRelations | undefined;
      return category?.name || "All Items";
    }
    
    return "All Items";
  };

  const getItemCount = () => {
    if (!categories) return 0;
    
    if (selectedSubcategoryId) {
      const mainCategory = categories.find(c => c.id === selectedCategoryId) as CategoryWithRelations | undefined;
      const subcategory = mainCategory?.subcategories?.find((s: SubcategoryWithRelations) => s.id === selectedSubcategoryId);
      return subcategory?.itemCount || 0;
    }
    
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId) as CategoryWithRelations | undefined;
      return category?.itemCount || 0;
    }
    
    // Sum all items across all categories if no category selected
    return (categories as CategoryWithRelations[]).reduce(
      (total: number, category: CategoryWithRelations) => 
        total + (category.itemCount || 0) + 
        (category.subcategories?.reduce((subtotal: number, sub: SubcategoryWithRelations) => subtotal + (sub.itemCount || 0), 0) || 0), 
      0
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onAddItem={() => setAddItemModalOpen(true)}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Show sidebar directly for desktop and as a sheet for mobile */}
        {!isMobile ? (
          <Sidebar 
            categories={categories || []} 
            loading={categoriesLoading}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            setSelectedSubcategoryId={setSelectedSubcategoryId}
            onAddCategory={() => setAddCategoryModalOpen(true)}
            isOpen={true}
            onClose={() => {}}
          />
        ) : (
          <Sidebar 
            categories={categories || []} 
            loading={categoriesLoading}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            setSelectedSubcategoryId={setSelectedSubcategoryId}
            onAddCategory={() => setAddCategoryModalOpen(true)}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Breadcrumbs 
            categories={categories || []}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            onNavigate={(categoryId, subcategoryId) => {
              setSelectedCategoryId(categoryId);
              setSelectedSubcategoryId(subcategoryId);
            }}
          />
          
          {/* Only show stats when viewing all items */}
          {!selectedCategoryId && !selectedSubcategoryId && (
            <InventoryStats />
          )}
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-text">
                {getActiveCategoryName()} ({getItemCount()} items)
              </h1>
              
              <div className="flex space-x-3">
                <select
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="quantity_desc">Quantity (High-Low)</option>
                  <option value="quantity_asc">Quantity (Low-High)</option>
                </select>
              </div>
            </div>
          </div>
          
          <ItemGrid 
            categoryId={selectedSubcategoryId || selectedCategoryId}
            searchQuery={searchQuery}
            sortOption={sortOption}
          />
        </main>
      </div>
      
      <AddItemModal 
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        categories={categories || []}
        selectedCategoryId={selectedCategoryId}
        selectedSubcategoryId={selectedSubcategoryId}
      />
      
      <AddCategoryModal 
        isOpen={addCategoryModalOpen}
        onClose={() => setAddCategoryModalOpen(false)}
        categories={categories || []}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
}
