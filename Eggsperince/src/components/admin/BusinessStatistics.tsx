import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format, subDays, subMonths, parseISO, isValid, addDays } from "date-fns";
import { CalendarIcon, Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Egg } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "../ui/use-toast";
import { getCoops, getHarvests, getHarvestStatistics, getOrders, getExpenses } from "../../lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

interface Order {
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  quantity: number;
  status: "pending" | "complete";
  created_at: string;
  total: number | null;
}

interface Expense {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  date: string;
  total_cost: number;
  created_at: string;
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

const BusinessStatistics = () => {
  const { toast } = useToast();
  const [coops, setCoops] = useState<Coop[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [harvestStatistics, setHarvestStatistics] = useState<HarvestStatisticsData | null>(null);
  const [selectedCoop, setSelectedCoop] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
      // Load initial data for all sections
      await loadAllData();
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load statistics. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllData = async () => {
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
      setHarvestStatistics(statsData);

      // Get orders data
      const ordersData = await getOrders();
      // Filter orders by date if needed
      const filteredOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return (!date?.from || orderDate >= date.from) && 
               (!date?.to || orderDate <= addDays(date.to, 1));
      });
      setOrders(filteredOrders);

      // Get expenses data
      const expensesData = await getExpenses({
        start_date: filters.start_date,
        end_date: filters.end_date
      });
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error loading data:", error);
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
      await loadAllData();
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

  // Calculate business metrics
  const calculateBusinessMetrics = () => {
    // Filter completed orders only for sales calculations
    const completedOrders = orders.filter(order => order.status === "complete");
    
    // Total sales
    const totalSales = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total_cost, 0);
    
    // Total profit
    const totalProfit = totalSales - totalExpenses;
    
    // Total eggs collected
    const totalEggsCollected = harvestStatistics?.totalEggs || 0;
    
    // Total eggs sold
    const totalEggsSold = completedOrders.reduce((sum, order) => sum + order.quantity, 0) * 12; // Assuming 12 eggs per carton
    
    // Eggs utilization rate (sold/collected)
    const utilizationRate = totalEggsCollected > 0 ? (totalEggsSold / totalEggsCollected) * 100 : 0;
    
    // Average sale per order
    const avgSalePerOrder = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;
    
    // Pending orders value
    const pendingOrdersValue = orders
      .filter(order => order.status === "pending")
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Pending orders count
    const pendingOrdersCount = orders.filter(order => order.status === "pending").length;
    
    return {
      totalSales,
      totalExpenses,
      totalProfit,
      totalEggsCollected,
      totalEggsSold,
      utilizationRate,
      avgSalePerOrder,
      pendingOrdersValue,
      pendingOrdersCount
    };
  };

  const metrics = calculateBusinessMetrics();

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.name;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.total_cost;
    return acc;
  }, {} as Record<string, number>);

  // Group sales by month
  const salesByMonth = orders
    .filter(order => order.status === "complete")
    .reduce((acc, order) => {
      const month = format(new Date(order.created_at), "MMM yyyy");
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += order.total || 0;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Statistics</h2>
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
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="harvests">Harvests</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-green-700 dark:text-green-400">Total Profit</h3>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-300">${metrics.totalProfit.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {metrics.totalProfit >= 0 ? (
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>Sales: ${metrics.totalSales.toFixed(2)} - Expenses: ${metrics.totalExpenses.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>Sales: ${metrics.totalSales.toFixed(2)} - Expenses: ${metrics.totalExpenses.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-blue-700 dark:text-blue-400">Total Sales</h3>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">${metrics.totalSales.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="flex items-center">
                    <span>Orders: {orders.filter(o => o.status === "complete").length} completed</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-amber-700 dark:text-amber-400">Eggs Collected</h3>
                    <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">{metrics.totalEggsCollected}</p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
                    <Egg className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  <div className="flex items-center">
                    <span>Sold: {metrics.totalEggsSold} eggs ({metrics.utilizationRate.toFixed(1)}% utilization)</span>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Pending Orders</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Count:</span>
                  <span className="font-medium">{metrics.pendingOrdersCount} orders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">${metrics.pendingOrdersValue.toFixed(2)}</span>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Average Metrics</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Avg. Sale per Order:</span>
                  <span className="font-medium">${metrics.avgSalePerOrder.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg. Eggs per Day:</span>
                  <span className="font-medium">{harvestStatistics?.averagePerDay.toFixed(1) || "0"}</span>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Sales Summary</h3>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Sales</h4>
                  <p className="text-2xl font-bold">${metrics.totalSales.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Completed Orders</h4>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === "complete").length}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Order Value</h4>
                  <p className="text-2xl font-bold">${metrics.avgSalePerOrder.toFixed(2)}</p>
                </div>
              </div>
              
              <h4 className="text-md font-medium mb-2">Sales by Month</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Month</th>
                      <th className="text-right py-2 px-4">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(salesByMonth).length > 0 ? (
                      Object.entries(salesByMonth)
                        .sort((a, b) => {
                          // Sort by date (newest first)
                          const dateA = new Date(a[0]);
                          const dateB = new Date(b[0]);
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map(([month, amount]) => (
                          <tr key={month} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{month}</td>
                            <td className="py-2 px-4 text-right">${amount.toFixed(2)}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-muted-foreground">
                          No sales data available for the selected period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No orders found for the selected period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Order #</th>
                        <th className="text-left py-2 px-4">Customer</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-right py-2 px-4">Quantity</th>
                        <th className="text-right py-2 px-4">Total</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 10) // Show only the 10 most recent orders
                        .map((order) => (
                          <tr key={order.order_number} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{order.order_number}</td>
                            <td className="py-2 px-4">{order.customer_name}</td>
                            <td className="py-2 px-4">
                              {format(parseISO(order.created_at), "MMM d, yyyy")}
                            </td>
                            <td className="py-2 px-4 text-right">{order.quantity}</td>
                            <td className="py-2 px-4 text-right">${order.total?.toFixed(2) || "0.00"}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "complete" 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
          
          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Expenses Summary</h3>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</h4>
                  <p className="text-2xl font-bold">${metrics.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Expense Categories</h4>
                  <p className="text-2xl font-bold">{Object.keys(expensesByCategory).length}</p>
                </div>
              </div>
              
              <h4 className="text-md font-medium mb-2">Expenses by Category</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Category</th>
                      <th className="text-right py-2 px-4">Amount</th>
                      <th className="text-right py-2 px-4">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(expensesByCategory).length > 0 ? (
                      Object.entries(expensesByCategory)
                        .sort((a, b) => b[1] - a[1]) // Sort by amount (highest first)
                        .map(([category, amount]) => (
                          <tr key={category} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{category}</td>
                            <td className="py-2 px-4 text-right">${amount.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right">
                              {metrics.totalExpenses > 0 
                                ? ((amount / metrics.totalExpenses) * 100).toFixed(1) 
                                : "0.0"}%
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-muted-foreground">
                          No expense data available for the selected period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-medium">
                      <td className="py-2 px-4">Total</td>
                      <td className="py-2 px-4 text-right">${metrics.totalExpenses.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Recent Expenses</h3>
              {expenses.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No expenses found for the selected period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-right py-2 px-4">Quantity</th>
                        <th className="text-right py-2 px-4">Cost</th>
                        <th className="text-right py-2 px-4">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10) // Show only the 10 most recent expenses
                        .map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{expense.name}</td>
                            <td className="py-2 px-4">
                              {format(new Date(expense.date), "MMM d, yyyy")}
                            </td>
                            <td className="py-2 px-4 text-right">{expense.quantity}</td>
                            <td className="py-2 px-4 text-right">${expense.cost.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right">${expense.total_cost.toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
          
          {/* Harvests Tab */}
          <TabsContent value="harvests" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Harvest Summary</h3>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Eggs Collected</h4>
                  <p className="text-2xl font-bold">{harvestStatistics?.totalEggs || 0}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Average Per Day</h4>
                  <p className="text-2xl font-bold">{harvestStatistics?.averagePerDay.toFixed(1) || "0"}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Collection Days</h4>
                  <p className="text-2xl font-bold">{harvestStatistics?.byDate.length || 0}</p>
                </div>
              </div>
              
              <h4 className="text-md font-medium mb-2">Eggs By Coop</h4>
              {harvestStatistics?.byCoops.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No data available for the selected filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Coop Name</th>
                        <th className="text-right py-2 px-4">Total Eggs</th>
                        <th className="text-right py-2 px-4">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harvestStatistics?.byCoops.map((coopStat) => (
                        <tr key={coopStat.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{coopStat.name}</td>
                          <td className="py-2 px-4 text-right">{coopStat.totalEggs}</td>
                          <td className="py-2 px-4 text-right">
                            {harvestStatistics.totalEggs > 0 
                              ? ((coopStat.totalEggs / harvestStatistics.totalEggs) * 100).toFixed(1) 
                              : "0.0"}%
                          </td>
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
                        <th className="text-right py-2 px-4">Eggs Collected</th>
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
                          <td className="py-2 px-4 text-right">{harvest.eggs_collected}</td>
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BusinessStatistics;
