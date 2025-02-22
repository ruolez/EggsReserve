import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { getOrders, updateOrderStatus } from "../../lib/api";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Order {
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  quantity: number;
  status: "pending" | "complete";
  created_at: string;
}

const OrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
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
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-lg">
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            Pending Orders:{" "}
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
            <tr className="border-b">
              <th className="text-left py-3 px-4">Order #</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Contact</th>
              <th className="text-left py-3 px-4">Quantity</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_number} className="border-b">
                <td className="py-3 px-4">{order.order_number}</td>
                <td className="py-3 px-4">{order.customer_name}</td>
                <td className="py-3 px-4">
                  <div>{order.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.phone}
                  </div>
                </td>
                <td className="py-3 px-4">{order.quantity}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${order.status === "complete" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          console.log(
                            "Complete button clicked for order:",
                            order.order_number,
                          );
                          setUpdatingStatus(order.order_number);
                          try {
                            await updateOrderStatus(
                              order.order_number,
                              "complete",
                            );

                            // Refresh orders list
                            const updatedOrders = await getOrders();
                            setOrders(updatedOrders);

                            toast({
                              title: "Order Completed",
                              description: `Order ${order.order_number} has been marked as complete`,
                              variant: "success",
                            });
                          } catch (error) {
                            console.error("Error completing order:", error);
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description:
                                error instanceof Error
                                  ? error.message
                                  : "Failed to complete order",
                            });
                          } finally {
                            setUpdatingStatus(null);
                          }
                        }}
                        disabled={updatingStatus === order.order_number}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default OrdersManagement;
