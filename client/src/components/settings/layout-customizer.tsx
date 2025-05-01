import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { LayoutSettings, UserSettings } from "@shared/schema";
import { Grid3X3, List, Table2 } from "lucide-react";

interface LayoutCustomizerProps {
  settings: UserSettings;
  updateLayout: (layout: Partial<LayoutSettings>) => void;
}

export function LayoutCustomizer({ settings, updateLayout }: LayoutCustomizerProps) {
  const layout = settings.layout;

  // Handle sidebar position change
  const handleSidebarPositionChange = (value: string) => {
    updateLayout({ sidebarPosition: value as "left" | "right" });
  };

  // Handle sidebar width change
  const handleSidebarWidthChange = (value: string) => {
    updateLayout({ sidebarWidth: value as "narrow" | "medium" | "wide" });
  };

  // Handle default view change
  const handleDefaultViewChange = (value: string) => {
    updateLayout({ defaultView: value as "grid" | "list" | "table" });
  };

  // Handle grid columns change
  const handleGridColumnsChange = (value: number[]) => {
    updateLayout({ gridColumns: value[0] });
  };

  // Handle boolean settings
  const handleBooleanSetting = (key: keyof LayoutSettings, value: boolean) => {
    updateLayout({ [key]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Sidebar Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-base">Sidebar Position</Label>
            <RadioGroup
              value={layout.sidebarPosition}
              onValueChange={handleSidebarPositionChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="sidebar-left" />
                <Label htmlFor="sidebar-left">Left Side</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="sidebar-right" />
                <Label htmlFor="sidebar-right">Right Side</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base" htmlFor="sidebar-width">Sidebar Width</Label>
            <Select
              value={layout.sidebarWidth}
              onValueChange={handleSidebarWidthChange}
            >
              <SelectTrigger id="sidebar-width">
                <SelectValue placeholder="Select sidebar width" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Item Display Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-base">Default View</Label>
            <RadioGroup
              value={layout.defaultView}
              onValueChange={handleDefaultViewChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grid" id="view-grid" />
                <Label htmlFor="view-grid" className="flex items-center">
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid View
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="list" id="view-list" />
                <Label htmlFor="view-list" className="flex items-center">
                  <List className="w-4 h-4 mr-2" />
                  List View
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="table" id="view-table" />
                <Label htmlFor="view-table" className="flex items-center">
                  <Table2 className="w-4 h-4 mr-2" />
                  Table View
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Grid Columns: {layout.gridColumns}</Label>
            <Slider
              defaultValue={[layout.gridColumns]}
              min={1}
              max={6}
              step={1}
              onValueChange={handleGridColumnsChange}
              className="py-4"
            />
            <p className="text-sm text-muted-foreground">
              Set the number of columns for grid view (1-6)
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Content Display Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between border p-4 rounded-md">
            <div>
              <Label className="text-base">Show Item Count</Label>
              <p className="text-sm text-muted-foreground">
                Display number of items in each category
              </p>
            </div>
            <Switch
              checked={layout.showItemCount}
              onCheckedChange={(checked) => handleBooleanSetting("showItemCount", checked)}
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-md">
            <div>
              <Label className="text-base">Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Use more condensed layout for items
              </p>
            </div>
            <Switch
              checked={layout.compactView}
              onCheckedChange={(checked) => handleBooleanSetting("compactView", checked)}
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-md">
            <div>
              <Label className="text-base">Show Descriptions</Label>
              <p className="text-sm text-muted-foreground">
                Display item descriptions in list/grid views
              </p>
            </div>
            <Switch
              checked={layout.showItemDescription}
              onCheckedChange={(checked) => handleBooleanSetting("showItemDescription", checked)}
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-md">
            <div>
              <Label className="text-base">Show Attributes</Label>
              <p className="text-sm text-muted-foreground">
                Display item attributes in list/grid views
              </p>
            </div>
            <Switch
              checked={layout.showItemAttributes}
              onCheckedChange={(checked) => handleBooleanSetting("showItemAttributes", checked)}
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-md">
            <div>
              <Label className="text-base">Show Tags</Label>
              <p className="text-sm text-muted-foreground">
                Display item tags in list/grid views
              </p>
            </div>
            <Switch
              checked={layout.showItemTags}
              onCheckedChange={(checked) => handleBooleanSetting("showItemTags", checked)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-md bg-background">
        <h3 className="text-lg font-medium mb-4">Layout Preview</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl border border-dashed rounded-md p-6 relative">
            {/* Sidebar position indicator */}
            <div className={`absolute top-0 bottom-0 ${layout.sidebarPosition === "left" ? "left-0" : "right-0"} 
                             bg-muted/40 rounded-md ${getSidebarWidthClass(layout.sidebarWidth)}`}>
              <div className="p-2 text-center text-xs">
                Sidebar
                <div className="mt-2 h-32 flex flex-col gap-1">
                  <div className="bg-muted h-6 w-full rounded-sm"></div>
                  <div className="bg-muted h-6 w-full rounded-sm"></div>
                  <div className="bg-muted h-6 w-full rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className={`${layout.sidebarPosition === "left" ? "ml-20 md:ml-32" : "mr-20 md:mr-32"}`}>
              <div className="mb-4 h-8 bg-muted/60 w-1/2 rounded-md"></div>
              {layout.defaultView === "grid" && (
                <div className={`grid grid-cols-${Math.min(layout.gridColumns, 3)} gap-4`}>
                  {Array.from({ length: Math.min(layout.gridColumns * 2, 6) }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`bg-card border rounded-md p-2 ${layout.compactView ? 'h-24' : 'h-36'}`}
                    >
                      <div className="h-5 bg-muted/60 w-3/4 rounded-sm mb-2"></div>
                      {layout.showItemDescription && (
                        <div className="h-3 bg-muted/40 w-full rounded-sm mb-1"></div>
                      )}
                      {layout.showItemAttributes && (
                        <div className="flex gap-1 mt-2">
                          <div className="h-4 bg-muted/40 w-12 rounded-sm"></div>
                          <div className="h-4 bg-muted/40 w-12 rounded-sm"></div>
                        </div>
                      )}
                      {layout.showItemTags && (
                        <div className="flex gap-1 mt-2">
                          <div className="h-4 bg-primary/20 w-10 rounded-full"></div>
                          <div className="h-4 bg-primary/20 w-8 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {layout.defaultView === "list" && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`bg-card border rounded-md p-2 ${layout.compactView ? 'h-12' : 'h-16'} flex items-center`}
                    >
                      <div className="h-5 bg-muted/60 w-1/4 rounded-sm"></div>
                      <div className="flex-1 px-4">
                        {layout.showItemDescription && (
                          <div className="h-3 bg-muted/40 w-1/2 rounded-sm"></div>
                        )}
                      </div>
                      {layout.showItemAttributes && (
                        <div className="flex gap-1">
                          <div className="h-4 bg-muted/40 w-12 rounded-sm"></div>
                        </div>
                      )}
                      {layout.showItemTags && (
                        <div className="flex gap-1 ml-2">
                          <div className="h-4 bg-primary/20 w-10 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {layout.defaultView === "table" && (
                <div className="border rounded-md">
                  <div className="border-b bg-muted/20 p-2 flex">
                    <div className="flex-1 h-5 bg-muted/40 w-1/4 rounded-sm"></div>
                    {layout.showItemDescription && (
                      <div className="flex-1 h-5 bg-muted/40 w-1/4 rounded-sm"></div>
                    )}
                    {layout.showItemAttributes && (
                      <div className="flex-1 h-5 bg-muted/40 w-1/4 rounded-sm"></div>
                    )}
                    <div className="w-16 h-5 bg-muted/40 rounded-sm"></div>
                  </div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b p-2 flex items-center">
                      <div className="flex-1 h-4 bg-muted/30 w-1/4 rounded-sm"></div>
                      {layout.showItemDescription && (
                        <div className="flex-1 h-4 bg-muted/30 w-1/4 rounded-sm"></div>
                      )}
                      {layout.showItemAttributes && (
                        <div className="flex-1 h-4 bg-muted/30 w-1/4 rounded-sm"></div>
                      )}
                      <div className="w-16 flex justify-center">
                        {layout.showItemTags && (
                          <div className="h-4 bg-primary/20 w-8 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get sidebar width class
function getSidebarWidthClass(width: string): string {
  switch (width) {
    case "narrow":
      return "w-16";
    case "medium":
      return "w-20 md:w-32";
    case "wide":
      return "w-24 md:w-48";
    default:
      return "w-20 md:w-32";
  }
}