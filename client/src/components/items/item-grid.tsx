import { useItems } from "@/hooks/use-items";
import ItemCard from "./item-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemGridProps {
  categoryId: number | null;
  searchQuery: string;
  sortOption: string;
}

export default function ItemGrid({ categoryId, searchQuery, sortOption }: ItemGridProps) {
  const { data: items, isLoading, error } = useItems({
    categoryId,
    searchQuery,
    sortOption,
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg border-t border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-medium text-red-600">Error loading items</div>
        <p className="mt-2 text-gray-600">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
  
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none" 
          strokeWidth="1.5" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery 
            ? `No items match the search "${searchQuery}"`
            : categoryId 
              ? "No items in this category yet" 
              : "Get started by adding some items to your inventory"
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
