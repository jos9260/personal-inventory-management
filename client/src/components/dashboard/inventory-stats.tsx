import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  Layers, 
  Package, 
  Star, 
  BarChart, 
  ChevronDown, 
  ChevronUp,
  BarChart2
} from 'lucide-react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

// Type definitions for statistics data
interface CategoryStats {
  total: number;
  main: number;
  sub: number;
}

interface ItemStats {
  total: number;
  favorite: number;
  quantity: number;
}

interface CategoryItemCount {
  id: number;
  name: string;
  count: number;
  totalQuantity: number;
}

interface StatsData {
  categories: CategoryStats;
  items: ItemStats;
  itemsPerCategory: CategoryItemCount[];
}

export default function InventoryStats() {
  const [isOpen, setIsOpen] = useState(true);
  
  // Fetch inventory statistics from API
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Inventory Statistics</h3>
          </div>
          <Button variant="ghost" size="sm" className="w-9 p-0" disabled>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Inventory Statistics</h3>
          </div>
          <Button variant="ghost" size="sm" className="w-9 p-0" disabled>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <p>Could not load inventory statistics</p>
        </div>
      </Card>
    );
  }

  // Create stats grid items
  const statItems = [
    {
      title: 'Total Categories',
      value: stats.categories.total,
      description: `${stats.categories.main} main, ${stats.categories.sub} sub`,
      icon: Layers,
      color: 'text-blue-500'
    },
    {
      title: 'Total Items',
      value: stats.items.total,
      description: `${stats.items.quantity} total quantity`,
      icon: Package,
      color: 'text-green-500'
    },
    {
      title: 'Favorite Items',
      value: stats.items.favorite,
      description: `${stats.items.favorite > 0 ? Math.round((stats.items.favorite / stats.items.total) * 100) : 0}% of total items`,
      icon: Star,
      color: 'text-amber-500'
    },
    {
      title: 'Category Distribution',
      value: stats.itemsPerCategory?.length || 0,
      description: 'Categories with items',
      icon: BarChart,
      color: 'text-purple-500'
    }
  ];

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Inventory Statistics</h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
            {statItems.map((item, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                      <div className="flex items-baseline space-x-2">
                        <h3 className="text-3xl font-bold">{item.value}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    
                    <div className={`p-3 rounded-full bg-muted ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}