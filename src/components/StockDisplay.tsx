import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Egg } from "lucide-react";

interface StockDisplayProps {
  currentStock?: number;
  lastUpdated?: string;
}

const StockDisplay = ({
  currentStock = 50,
  lastUpdated = new Date().toLocaleTimeString(),
}: StockDisplayProps) => {
  // Determine stock status based on absolute value
  const stockStatus = 
    currentStock >= 40 ? "High" : 
    currentStock >= 15 ? "Medium" : "Low";

  const statusColors = {
    High: "bg-green-500",
    Medium: "bg-yellow-500",
    Low: "bg-red-500",
  };

  return (
    <Card className="w-full sm:w-4/5 mx-auto overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
      <CardContent className="py-1 px-3 sm:py-3 sm:px-5">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
              <img
                src="/eggs.png"
                alt="Eggs"
                className="relative object-contain w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full p-1 border border-border/40 shadow-sm"
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Eggs Reserve</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">organic without corn soy or glyphosates</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-center">
                <span className="font-bold text-3xl sm:text-4xl">{currentStock}</span>
                <Badge
                  className={`${statusColors[stockStatus]} text-white ml-2 sm:ml-3 px-2 sm:px-3 py-1 text-xs sm:text-sm`}
                  variant="secondary"
                >
                  {stockStatus}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stockStatus === "High" 
                  ? "In stock" 
                  : stockStatus === "Medium" 
                    ? "Reserve soon" 
                    : "Limited stock"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDisplay;
