import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { getOrders, updateOrderStatus, deleteOrder } from "../../lib/api";
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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [sortField, sortDirection]);

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
            {orders.map((order, index) => (
              <tr
                key={order.order_number}
                className={`border-b ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
              >
                <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-2">{order.customer_name}</td>
                <td className="py-3 px-2">{order.quantity}</td>
                <td className="py-3 px-2">
                  ${order.total?.toFixed(2) || "0.00"}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
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
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <AlertDialogContent>
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
        </table>
      </div>
    </Card>
  );
};

export default OrdersManagement;
