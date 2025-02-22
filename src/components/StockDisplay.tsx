import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Egg } from "lucide-react";

interface StockDisplayProps {
  currentStock?: number;
  maxStock?: number;
  lastUpdated?: string;
}

const StockDisplay = ({
  currentStock = 50,
  maxStock = 100,
  lastUpdated = new Date().toLocaleTimeString(),
}: StockDisplayProps) => {
  const stockPercentage = (currentStock / maxStock) * 100;
  const stockStatus =
    stockPercentage > 66 ? "High" : stockPercentage > 33 ? "Medium" : "Low";

  const statusColors = {
    High: "bg-green-500",
    Medium: "bg-yellow-500",
    Low: "bg-red-500",
  };

  return (
    <Card className="w-full max-w-[1200px] bg-white dark:bg-gray-800 transition-colors duration-300 mx-auto p-6 shadow-lg rounded-xl">
      <div className="flex flex-col md:flex-row gap-[24px] justify-center items-center rounded-[1px] border-[#646667]">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-full py-[4] opacity-100 py-[0.5] bg-[#ffffff]">
            <div className="bg-white dark:bg-gray-700 rounded-full p-4 transition-colors duration-300">
              <img
                src="/eggs.png"
                alt="Eggs"
                className="object-contain h-20 w-20"
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#ff6a00]">Eggs Reserve</h2>
            <p className="text-muted-foreground text-xs">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold">{currentStock}</span>
            <span className="text-xl text-muted-foreground">/ {maxStock}</span>
            <Badge
              className={`${statusColors[stockStatus]} text-white ml-2`}
              variant="secondary"
            >
              {stockStatus}
            </Badge>
          </div>

          <div className="w-full md:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${statusColors[stockStatus]} transition-all duration-500 ease-in-out`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StockDisplay;
