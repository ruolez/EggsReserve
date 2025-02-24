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
    <Card className="w-full max-w-[1200px] bg-white dark:bg-gray-800 transition-colors duration-300 mx-auto p-2 md:p-3 shadow-lg rounded-xl">
      <div className="flex flex-col md:flex-row gap-2 md:gap-[24px] justify-center items-center rounded-[1px] border-[#646667]">
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src="/eggs.png"
            alt="Eggs"
            className="object-contain md:w-24 md:h-24 w-20 h-20 flex bg-[#ffffff] rounded-[50] rounded-[00] rounded-full"
          />
          <div>
            <h2 className="md:text-2xl font-bold text-[#ff6a00] text-3xl">
              Eggs Reserve
            </h2>
            <p className="text-muted-foreground text-[10px] md:text-xs">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end ">
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl">{currentStock}</span>
            <span className="text-xl text-muted-foreground">/ {maxStock}</span>
            <Badge
              className={`${statusColors[stockStatus]} text-white ml-2`}
              variant="secondary"
            >
              {stockStatus}
            </Badge>
          </div>

          <div className="w-full md:w-64 h-2 bg-gray-200 rounded-full overflow-hidden gap-1 mx-1">
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
