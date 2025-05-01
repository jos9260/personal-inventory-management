import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { ThemeCustomizer } from "../components/settings/theme-customizer";
import { LayoutCustomizer } from "../components/settings/layout-customizer";
import { DataManagement } from "../components/settings/data-management";
import { Loader2, Save, RotateCcw, ArrowLeft, PaintBucket, Layout, Database } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { settings, updateTheme, updateLayout, resetSettings, isLoading } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("theme");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetSettings();
      toast({
        title: "Settings reset",
        description: "All settings have been reset to default values",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isResetting}
            className="gap-1"
          >
            {isResetting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-1 h-4 w-4" />
            )}
            Reset to defaults
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customize your inventory system</CardTitle>
          <CardDescription>
            Manage appearance, data and system settings for your inventory management experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="theme" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <PaintBucket className="h-4 w-4" />
                <span>Theme</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span>Layout</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Data</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="theme" className="space-y-6">
              <ThemeCustomizer settings={settings} updateTheme={updateTheme} />
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-6">
              <LayoutCustomizer settings={settings} updateLayout={updateLayout} />
            </TabsContent>
            
            <TabsContent value="data" className="space-y-6">
              <DataManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}