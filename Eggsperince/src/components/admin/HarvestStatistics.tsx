import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format, subDays, subMonths, parseISO, isValid, addDays } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "../ui/use-toast";
import { getCoops, getHarvests, getHarvestStatistics } from "../../lib/api";

interface Coop {
  id: string;
  name: string;
}

interface Harvest {
  id: string;
  coop_id: string;
  eggs_collected: number;
  collection_date: string;
  notes: string | null;
  created_at: string;
  coops: {
    id: string;
    name: string;
  };
}

interface HarvestStatisticsData {
  totalEggs: number;
  averagePerDay: number;
  byCoops: {
    id: string;
    name: string;
    totalEggs: number;
  }[];
  byDate: {
    date: string;
    totalEggs: number;
  }[];
}

const HarvestStatistics = () => {
  const { toast } = useToast();
  const [coops, setCoops] = useState<Coop[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [statistics, setStatistics] = useState<HarvestStatisticsData | null>(null);
  const [selectedCoop, setSelectedCoop] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  useEffect(() => {
    loadCoops();
    loadInitialData();
  }, []);

  const loadCoops = async () => {
    try {
      const data = await getCoops();
      setCoops(data);
    } catch (error) {
      console.error("Error loading coops:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load coops. Please try again.",
      });
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load initial harvests and statistics
      await loadHarvestsAndStatistics();
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load harvest statistics. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHarvestsAndStatistics = async () => {
    try {
      // Prepare filters
      const filters: {
        coop_id?: string;
        start_date?: string;
        end_date?: string;
      } = {};

      if (selectedCoop && selectedCoop !== "all") {
        filters.coop_id = selectedCoop;
      }

      if (date?.from) {
        filters.start_date = date.from.toISOString().split("T")[0];
      }

      if (date?.to) {
        filters.end_date = date.to.toISOString().split("T")[0];
      }

      // Get harvests with filters
      const harvestsData = await getHarvests(filters);
      setHarvests(harvestsData);

      // Get statistics with the same filters
      const statsData = await getHarvestStatistics(filters);
      setStatistics(statsData);
    } catch (error) {
      console.error("Error loading harvests and statistics:", error);
      throw error;
    }
  };

  const handleCoopChange = (value: string) => {
    setSelectedCoop(value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDate(range);
  };

  const handleQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    setDate({
      from: startDate,
      to: endDate,
    });
  };

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true);
    try {
      await loadHarvestsAndStatistics();
      toast({
        title: "Filters Applied",
        description: "Statistics have been updated with the selected filters.",
      });
    } catch (error) {
      console.error("Error applying filters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply filters. Please try again.",
      });
    } finally {
      setIsApplyingFilters(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Harvest Statistics</h2>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="coop_filter">Coop</Label>
            <Select
              value={selectedCoop}
              onValueChange={handleCoopChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Coops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coops</SelectItem>
                {coops.map((coop) => (
                  <SelectItem key={coop.id} value={coop.id}>
                    {coop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="date_range">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date_range"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(date.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickFilter(7)}>
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickFilter(30)}>
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickFilter(90)}>
              Last 90 Days
            </Button>
          </div>
          <Button onClick={handleApplyFilters} disabled={isApplyingFilters}>
            {isApplyingFilters ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply Filters"
            )}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : statistics ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Total Eggs Collected</h3>
              <p className="text-3xl font-bold">{statistics.totalEggs}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Average Per Day</h3>
              <p className="text-3xl font-bold">{statistics.averagePerDay.toFixed(1)}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Collection Days</h3>
              <p className="text-3xl font-bold">{statistics.byDate.length}</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Eggs By Coop</h3>
            {statistics.byCoops.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No data available for the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Coop Name</th>
                      <th className="text-left py-2 px-4">Total Eggs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.byCoops.map((coopStat) => (
                      <tr key={coopStat.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{coopStat.name}</td>
                        <td className="py-2 px-4">{coopStat.totalEggs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Harvest Records</h3>
            {harvests.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No harvest records found for the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Coop</th>
                      <th className="text-left py-2 px-4">Eggs Collected</th>
                      <th className="text-left py-2 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvests.map((harvest) => (
                      <tr key={harvest.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">
                          {format(parseISO(harvest.collection_date), "MMM d, yyyy")}
                        </td>
                        <td className="py-2 px-4">{harvest.coops?.name || "Unknown"}</td>
                        <td className="py-2 px-4">{harvest.eggs_collected}</td>
                        <td className="py-2 px-4 max-w-xs truncate">
                          {harvest.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No statistics available. Please try adjusting your filters.</p>
        </Card>
      )}
    </div>
  );
};

export default HarvestStatistics;
