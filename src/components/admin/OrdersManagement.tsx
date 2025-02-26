import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getOrders, updateOrderStatus, deleteOrder } from "../../lib/api";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isAfter, isBefore, isValid, parseISO, startOfDay } from "date-fns";
import { cn } from "../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type SortField =
  | "order_number"
  | "customer_name"
  | "quantity"
  | "status"
  | "created_at"
  | "email"
  | "total";
type SortDirection = "asc" | "desc";

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

const statusColors = {
  pending: {
    light: "bg-amber-100 text-amber-800",
    dark: "dark:bg-amber-900 dark:text-amber-200",
  },
  complete: {
    light: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900 dark:text-green-200",
  },
};

const OrdersManagement = () => {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    loadOrders();
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [sortField, sortDirection]);

  // Apply filters whenever orders, statusFilter, searchQuery, or date range changes
  useEffect(() => {
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter (case insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.customer_name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.order_number.toLowerCase().includes(query)
      );
    }
    
    // Apply date range filter
    if (dateFrom && isValid(dateFrom)) {
      const fromDate = startOfDay(dateFrom);
      result = result.filter(order => {
        const orderDate = parseISO(order.created_at);
        return isAfter(orderDate, fromDate) || orderDate.getTime() === fromDate.getTime();
      });
    }
    
    if (dateTo && isValid(dateTo)) {
      const toDate = startOfDay(dateTo);
      // Add one day to include the end date fully
      toDate.setDate(toDate.getDate() + 1);
      result = result.filter(order => {
        const orderDate = parseISO(order.created_at);
        return isBefore(orderDate, toDate);
      });
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery, dateFrom, dateTo]);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      const sortedData = [...data].sort((a, b) => {
        if (sortField === "quantity" || sortField === "total") {
          const aValue = a[sortField] || 0;
          const bValue = b[sortField] || 0;
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return sortDirection === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      });
      setOrders(sortedData);
      setFilteredOrders(sortedData); // Initialize filtered orders with all orders
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-lg">
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            On Order:{" "}
            {orders
              .filter((o) => o.status === "pending")
              .reduce((acc, order) => acc + order.quantity, 0)}{" "}
            cartons
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or order #"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[130px] justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[130px] justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "MMM d, yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {(dateFrom || dateTo) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
              >
                Clear
              </Button>
            )}
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem 
                value="pending" 
                className={`${statusColors.pending.light} ${statusColors.pending.dark}`}
              >
                Pending
              </SelectItem>
              <SelectItem 
                value="complete" 
                className={`${statusColors.complete.light} ${statusColors.complete.dark}`}
              >
                Complete
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b cursor-pointer">
              <th className="text-left py-3 px-2 w-8">#</th>
              <th
                className="text-left py-3 px-2 cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("customer_name");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Customer
                  {sortField === "customer_name" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-2 cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("total");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Total
                  {sortField === "total" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-2 cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("quantity");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Qty
                  {sortField === "quantity" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-2 cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("status");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortField === "status" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-left py-3 px-2">Actions</th>
              <th
                className="text-left py-3 px-2 hidden md:table-cell cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("created_at");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Date
                  {sortField === "created_at" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-2 hidden md:table-cell cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("email");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Contact
                  {sortField === "email" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="text-left py-3 px-2 cursor-pointer select-none group hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  setSortField("order_number");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-2">
                  Order #
                  {sortField === "order_number" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr
                key={order.order_number}
                className={`border-b ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
              >
                <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-2">{order.customer_name}</td>
                <td className="py-3 px-2">
                  ${order.total?.toFixed(2) || "0.00"}
                </td>
                <td className="py-3 px-2">
                  <Select
                    value={order.quantity.toString()}
                    onValueChange={async (newQty) => {
                      if (parseInt(newQty) === order.quantity) return;
                      setUpdatingStatus(order.order_number);
                      try {
                        await updateOrderStatus(
                          order.order_number,
                          order.status,
                          parseInt(newQty),
                        );
                        const updatedOrders = await getOrders();
                        setOrders(updatedOrders);
                        toast({
                          title: "Quantity Updated",
                          description: `Order quantity updated to ${newQty}`,
                        });
                      } catch (error) {
                        console.error("Error updating quantity:", error);
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to update quantity",
                        });
                      } finally {
                        setUpdatingStatus(null);
                      }
                    }}
                    disabled={
                      updatingStatus === order.order_number ||
                      order.status === "complete"
                    }
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-2">
                  <Select
                    value={order.status}
                    onValueChange={async (newStatus) => {
                      if (newStatus === order.status) return;
                      setUpdatingStatus(order.order_number);
                      try {
                        await updateOrderStatus(
                          order.order_number,
                          newStatus as "pending" | "complete",
                        );
                        const updatedOrders = await getOrders();
                        setOrders(updatedOrders);
                        toast({
                          title: "Status Updated",
                          description: `Order ${order.order_number} is now ${newStatus}`,
                        });
                      } catch (error) {
                        console.error("Error updating status:", error);
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to update status",
                        });
                      } finally {
                        setUpdatingStatus(null);
                      }
                    }}
                    disabled={updatingStatus === order.order_number}
                  >
                    <SelectTrigger 
                      className={`w-[110px] ${statusColors[order.status].light} ${statusColors[order.status].dark}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        value="pending" 
                        className={`${statusColors.pending.light} ${statusColors.pending.dark}`}
                      >
                        Pending
                      </SelectItem>
                      <SelectItem 
                        value="complete" 
                        className={`${statusColors.complete.light} ${statusColors.complete.dark}`}
                      >
                        Complete
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      // Disable all animations that cause the dialog to move
                      style={{
                        animation: 'none',
                        transform: 'translate(-50%, -50%)',
                        transition: 'none'
                      }}
                      // Add onKeyDown handler to trigger delete on Enter key
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          // Directly call the delete function
                          (async () => {
                            setUpdatingStatus(order.order_number);
                            try {
                              await deleteOrder(order.order_number);
                              const updatedOrders = await getOrders();
                              setOrders(updatedOrders);
                              toast({
                                title: "Order Deleted",
                                description: `Order ${order.order_number} has been deleted`,
                              });
                            } catch (error) {
                              console.error("Error deleting order:", error);
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Failed to delete order",
                              });
                            } finally {
                              setUpdatingStatus(null);
                            }
                          })();
                        }
                      }}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete order{" "}
                          {order.order_number}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            setUpdatingStatus(order.order_number);
                            try {
                              await deleteOrder(order.order_number);
                              const updatedOrders = await getOrders();
                              setOrders(updatedOrders);
                              toast({
                                title: "Order Deleted",
                                description: `Order ${order.order_number} has been deleted`,
                              });
                            } catch (error) {
                              console.error("Error deleting order:", error);
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Failed to delete order",
                              });
                            } finally {
                              setUpdatingStatus(null);
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
                <td className="py-3 px-2 hidden md:table-cell">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-2 hidden md:table-cell">
                  <div>{order.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.phone}
                  </div>
                </td>
                <td className="py-3 px-2">{order.order_number}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-300 font-semibold">
            <tr>
              <td colSpan={2} className="py-3 px-2 text-right">Totals:</td>
              <td className="py-3 px-2">
                ${filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
              </td>
              <td className="py-3 px-2">
                {filteredOrders.reduce((sum, order) => sum + order.quantity, 0)} cartons
              </td>
              <td colSpan={5}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};

export default OrdersManagement;
