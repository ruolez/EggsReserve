import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { getProductDisplaySetting, updateProductDisplaySetting } from "../../lib/api";

const ProductDisplaySettings = () => {
  const [showProductSelection, setShowProductSelection] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const setting = await getProductDisplaySetting();
      setShowProductSelection(setting);
    } catch (error) {
      console.error("Error loading product display settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product display settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await updateProductDisplaySetting(checked);
      setShowProductSelection(checked);
      toast({
        title: "Settings Updated",
        description: `Product selection is now ${checked ? "visible" : "hidden"} in the reservation form`,
      });
    } catch (error) {
      console.error("Error updating product display settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product display settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Display Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-secondary/20 p-4 rounded-lg">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-medium">Reservation Form Options</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-product-selection" className="text-base">
                  Show Product Selection
                </Label>
                <p className="text-sm text-muted-foreground">
                  {showProductSelection 
                    ? "Customers can choose between eggs and cashews" 
                    : "Only eggs are available for ordering (product selection is hidden)"}
                </p>
              </div>
              <Switch
                id="show-product-selection"
                checked={showProductSelection}
                onCheckedChange={handleToggleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            About this setting
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            When product selection is hidden, customers will only be able to order eggs.
            The product selection dropdown will not appear in the reservation form, and all
            orders will default to "Carton of eggs".
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductDisplaySettings;
