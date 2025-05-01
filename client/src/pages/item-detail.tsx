import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Breadcrumbs from "@/components/breadcrumbs";
import EditItemModal from "@/components/modals/edit-item-modal";
import QRCodeModal from "@/components/items/qr-code-modal";
import { useCategories } from "@/hooks/use-categories";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, Heart, Pencil, Trash2, ArrowLeft, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ItemDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ id: string }>("/items/:id");
  const itemId = params?.id ? parseInt(params.id) : 0;
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const { toast } = useToast();
  const { data: categories } = useCategories();
  
  const { data: item, isLoading } = useQuery({
    queryKey: [`/api/items/${itemId}`],
    enabled: !!itemId,
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/items/${itemId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteItem = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate();
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header searchQuery="" setSearchQuery={() => {}} onAddItem={() => {}} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-40 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="h-screen flex flex-col">
        <Header searchQuery="" setSearchQuery={() => {}} onAddItem={() => {}} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Item not found</h2>
            <p className="mt-2 text-muted-foreground">The item you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-4" onClick={() => navigate("/")}>Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }
  
  const category = categories?.find(c => c.id === item.categoryId);
  let subcategory;
  
  if (category?.parentId) {
    // This item belongs to a subcategory
    const parentCategory = categories?.find(c => c.id === category.parentId);
    subcategory = category;
    
    return renderItemDetail(item, parentCategory?.id || null, subcategory.id);
  } else {
    // Item belongs to a main category
    return renderItemDetail(item, category?.id || null, null);
  }
  
  function renderItemDetail(item, categoryId, subcategoryId) {
    const attributes = item.attributes || {};
    
    return (
      <div className="h-screen flex flex-col">
        <Header searchQuery="" setSearchQuery={() => {}} onAddItem={() => {}} />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Breadcrumbs 
            categories={categories || []}
            selectedCategoryId={categoryId}
            selectedSubcategoryId={subcategoryId}
            onNavigate={(catId, subId) => {
              navigate("/");
            }}
            showItemName={item.name}
          />
          
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setQrCodeModalOpen(true)}
              >
                <QrCode size={16} />
                QR Code
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil size={16} />
                Edit
              </Button>
              
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                onClick={handleDeleteItem}
                disabled={deleteItemMutation.isPending}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">{item.name}</h1>
                    {item.isFavorite && (
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      Quantity: {item.quantity}
                    </Badge>
                    
                    <Badge variant="secondary">
                      {item.categoryName || category?.name || "Uncategorized"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attributes */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Attributes</h2>
                
                {Object.keys(attributes).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-medium capitalize">{key}</span>
                        <span>{value as string}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No attributes added to this item.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Tags */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                
                {item.tags && item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        <Tag size={12} />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tags added to this item.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
        <EditItemModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          item={item}
          categories={categories || []}
        />
        
        <QRCodeModal
          isOpen={qrCodeModalOpen}
          onClose={() => setQrCodeModalOpen(false)}
          item={item}
        />
      </div>
    );
  }
}
