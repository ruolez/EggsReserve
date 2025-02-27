import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getStock, updateStock } from "../../lib/api";
import { useToast } from "../ui/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

const InventoryManagement = () => {
  const { toast } = useToast();
  const [currentStock, setCurrentStock] = useState(0);
  const [maxStock, setMaxStock] = useState(100);
  const [newStock, setNewStock] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const stock = await getStock();
      setCurrentStock(stock.current_quantity);
      setMaxStock(stock.max_quantity);
    } catch (error) {
      console.error("Error loading stock:", error);
    }
  };

  const handleUpdateStock = async () => {
    if (!newStock) return;

    const quantity = parseInt(newStock);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "Please enter a valid number",
      });
      return;
    }

    if (quantity > maxStock) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: `Stock cannot exceed maximum of ${maxStock}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateStock(quantity);
      const updatedStock = await getStock();
      setCurrentStock(updatedStock.current_quantity);
      setNewStock("");
      toast({
        title: "Stock Updated",
        description: `Current stock is now ${updatedStock.current_quantity}`,
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Inventory Management</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Current Stock
            </h3>
            <p className="text-2xl font-bold">{currentStock}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Maximum Stock
            </h3>
            <p className="text-2xl font-bold">{maxStock}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStock();
            }}
          >
            <Input
              type="number"
              placeholder="Enter new stock level"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              min="0"
              max={maxStock}
            />
          </form>
          <Button onClick={handleUpdateStock} disabled={isLoading || !newStock}>
            {isLoading ? "Updating..." : "Update Stock"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryManagement;
