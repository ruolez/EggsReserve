import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Egg, ShoppingBag } from "lucide-react";

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
    High: "bg-green-500/90",
    Medium: "bg-yellow-500/90",
    Low: "bg-red-500/90",
  };

  const statusMessages = {
    High: "In stock",
    Medium: "Reserve soon",
    Low: "Limited stock",
  };

  // Calculate percentage for progress bar
  const stockPercentage = Math.min(100, Math.max(0, (currentStock / 100) * 100));

  return (
    <Card className="w-full max-w-[450px] mx-auto overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Header with logo and title */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <img
                src="/eggs.png"
                alt="Eggs"
                className="relative object-contain w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-2 border border-border/40 shadow-md"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Eggs Reserve</h2>
              <p className="text-xs sm:text-sm text-muted-foreground"><b>organic</b> no corn soy or glyphosate</p>
            </div>
          </div>
          
          {/* Stock information with visual elements */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Updated: {lastUpdated}</span>
              </div>
            </div>
            
            {/* Stock progress bar */}
            <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full ${statusColors[stockStatus]} transition-all duration-500 ease-in-out`}
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>
            
            {/* Stock details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${statusColors[stockStatus]} text-white px-3 py-1 text-xs`}
                  variant="secondary"
                >
                  {stockStatus}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {statusMessages[stockStatus]}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-3xl sm:text-4xl text-foreground">{currentStock}</span>
                <span className="text-sm text-muted-foreground ml-2">cartons</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDisplay;
