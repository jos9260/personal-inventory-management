import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, Heart, Pencil, Trash2 } from "lucide-react";
import type { Item } from "@shared/schema";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/items/${item.id}`, {
        ...item,
        isFavorite: !item.isFavorite,
      });
    },
    onSuccess: () => {
      toast({
        title: item.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${item.name} has been ${item.isFavorite ? "removed from" : "added to"} your favorites`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/items/${item.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item deleted",
        description: `${item.name} has been deleted from your inventory`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate();
    }
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/items/${item.id}`);
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/items/${item.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.description || "No description"}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Quantity: <span className="font-medium text-gray-900">{item.quantity}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={item.isFavorite ? "text-red-500" : "text-gray-400"}
              >
                <Heart className={`h-4 w-4 ${item.isFavorite ? "fill-red-500" : ""}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
