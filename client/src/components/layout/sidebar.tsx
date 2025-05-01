import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Boxes, 
  ChevronDown, 
  ChevronRight, 
  FolderClosed, 
  Plus, 
  Shirt, 
  Smartphone, 
  Laptop, 
  Utensils, 
  Drill, 
  X
} from "lucide-react";
import { CategoryWithRelations, SubcategoryWithRelations } from "@/types/category";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  categories: CategoryWithRelations[];
  loading: boolean;
  selectedCategoryId: number | null;
  selectedSubcategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  setSelectedSubcategoryId: (id: number | null) => void;
  onAddCategory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  categories,
  loading,
  selectedCategoryId,
  selectedSubcategoryId,
  setSelectedCategoryId,
  setSelectedSubcategoryId,
  onAddCategory,
  isOpen,
  onClose
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const selectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
    onClose();
  };
  
  const selectSubcategory = (categoryId: number, subcategoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(subcategoryId);
    onClose();
  };
  
  const selectAllItems = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    onClose();
  };
  
  const getCategoryIcon = (iconName: string | null | undefined) => {
    if (!iconName) return <FolderClosed className="h-5 w-5" />;
    
    switch (iconName) {
      case 'shirt':
        return <Shirt className="h-5 w-5" />;
      case 'smartphone':
        return <Smartphone className="h-5 w-5" />;
      case 'laptop':
        return <Laptop className="h-5 w-5" />;
      case 'utensils':
        return <Utensils className="h-5 w-5" />;
      case 'tool':
        return <Drill className="h-5 w-5" />;
      default:
        return <FolderClosed className="h-5 w-5" />;
    }
  };
  
  // Calculate total item count across all categories
  const totalItemCount = categories.reduce(
    (total, category) => 
      total + (category.itemCount || 0) + 
      (category.subcategories?.reduce((subtotal: number, sub: SubcategoryWithRelations) => subtotal + (sub.itemCount || 0), 0) || 0), 
    0
  );
  
  const sidebarContent = (
    <div className="w-64 flex flex-col h-full">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            <Button
              variant={selectedCategoryId === null ? "default" : "ghost"}
              className="w-full justify-between"
              onClick={selectAllItems}
            >
              <div className="flex items-center">
                <Boxes className="mr-3 h-5 w-5" />
                <span>All Items</span>
              </div>
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs">
                {totalItemCount}
              </span>
            </Button>
            
            {loading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map(category => (
                  <div key={category.id} className="space-y-1">
                    <Button
                      variant={selectedCategoryId === category.id && selectedSubcategoryId === null ? "default" : "ghost"}
                      className="w-full justify-between"
                      onClick={() => {
                        if (category.subcategories && category.subcategories.length > 0) {
                          toggleCategory(category.id);
                        } else {
                          selectCategory(category.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {getCategoryIcon(category.icon)}
                        <span className="ml-3">{category.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs">
                          {category.itemCount || 0}
                        </span>
                        {category.subcategories && category.subcategories.length > 0 && (
                          expandedCategories[category.id] ? 
                            <ChevronDown className="h-5 w-5" /> :
                            <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </Button>
                    
                    {category.subcategories && category.subcategories.length > 0 && expandedCategories[category.id] && (
                      <div className="pl-10 space-y-1">
                        {category.subcategories.map((subcategory: SubcategoryWithRelations) => (
                          <Button
                            key={subcategory.id}
                            variant={selectedSubcategoryId === subcategory.id ? "default" : "ghost"}
                            className="w-full justify-between"
                            onClick={() => selectSubcategory(category.id, subcategory.id)}
                          >
                            <span className="truncate">{subcategory.name}</span>
                            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs">
                              {subcategory.itemCount || 0}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </nav>
        </ScrollArea>
        
        <div className="p-4">
          <Button 
            onClick={onAddCategory}
            variant="outline" 
            className="w-full flex items-center"
          >
            <Plus className="mr-2 h-5 w-5 text-primary" />
            Add Category
          </Button>
        </div>
      </div>
    </div>
  );
  
  const isMobile = useMobile();
  
  // For mobile: use Sheet component with overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop overlay when sidebar is open */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
            onClick={onClose}
          />
        )}
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="left" className="p-0 z-20">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }
  
  // For desktop: render sidebar directly
  return (
    <aside className="hidden md:block bg-white border-r border-gray-200 min-h-0 z-10">
      {sidebarContent}
    </aside>
  );
}
