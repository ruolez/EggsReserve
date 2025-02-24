import React, { useState } from "react";
import StockDisplay from "./StockDisplay";
import ReservationForm from "./ReservationForm.tsx";
import OrderConfirmation from "./OrderConfirmation";
import { Dialog, DialogContent } from "./ui/dialog";
import { AdminPinDialog } from "./AdminPinDialog";
import { ThemeToggle } from "./ThemeToggle";
import { z } from "zod";
import { getStock, createOrder } from "../lib/api";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  quantity: z.string().min(1, "Please select a quantity"),
});

type FormData = z.infer<typeof formSchema>;

interface OrderData extends FormData {
  orderNumber: string;
}

const Home = () => {
  const [currentStock, setCurrentStock] = useState(0);
  const [maxStock, setMaxStock] = useState(100);
  const [lastUpdated, setLastUpdated] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const loadStock = async () => {
      try {
        const stock = await getStock();
        setCurrentStock(stock.current_quantity);
        setMaxStock(stock.max_quantity);
        setLastUpdated(new Date(stock.updated_at).toLocaleTimeString());
      } catch (error) {
        console.error("Error loading stock:", error);
      }
    };
    loadStock();
  }, []);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const orderNumber = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      await createOrder({
        order_number: orderNumber,
        customer_name: data.name,
        email: data.email,
        phone: data.phone,
        quantity: parseInt(data.quantity),
      });

      // Refresh stock
      const stock = await getStock();
      setCurrentStock(stock.current_quantity);
      setLastUpdated(new Date(stock.updated_at).toLocaleTimeString());

      setOrderData({ ...data, orderNumber });
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error creating order:", error);
      // You should show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 flex flex-col">
      <div className="max-w-[1200px] mx-auto w-full mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[#494949] font-light text-base flex flex-row justify-center items-center text-center static">
            organic without corn soy and glyphosates
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdminPin(true)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Admin →
            </button>
            <AdminPinDialog
              open={showAdminPin}
              onOpenChange={setShowAdminPin}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto w-full space-y-8">
        <StockDisplay
          currentStock={currentStock}
          maxStock={maxStock}
          lastUpdated={lastUpdated}
        />
        <div className="flex justify-center">
          <ReservationForm
            availableStock={currentStock}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[600px]">
          {orderData && (
            <OrderConfirmation
              customerName={orderData.name}
              orderNumber={orderData.orderNumber}
              quantity={parseInt(orderData.quantity)}
              email={orderData.email}
              onClose={() => setShowConfirmation(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
