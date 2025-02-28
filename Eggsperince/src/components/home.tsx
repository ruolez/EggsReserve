import React, { useState, useEffect } from "react";
import StockDisplay from "./StockDisplay";
import ReservationForm from "./ReservationForm.tsx";
import OrderConfirmation from "./OrderConfirmation";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { AdminPinDialog } from "./AdminPinDialog";
import { ThemeToggle } from "./ThemeToggle";
import { z } from "zod";
import { getStock, createOrder } from "../lib/api";
import { Egg } from "lucide-react";

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
        setLastUpdated(new Date(stock.updated_at).toLocaleDateString());
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
      setLastUpdated(new Date(stock.updated_at).toLocaleDateString());

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
    <div className="min-h-[100vh] overflow-hidden bg-gradient-to-b from-background via-background to-secondary/30 dark:from-background dark:via-background dark:to-secondary/10 transition-colors duration-500 flex flex-col">
      <header className="max-w-[1200px] mx-auto w-full px-4 py-2 animate-in fade-in slide-in-from-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">

          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdminPin(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>Admin</span>
            </button>
            <AdminPinDialog
              open={showAdminPin}
              onOpenChange={setShowAdminPin}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-2 md:py-4 flex flex-col gap-6 overflow-y-auto">
        <div className="w-full animate-in fade-in slide-in-from-top" style={{ animationDelay: "100ms" }}>
          <StockDisplay
            currentStock={currentStock}
            lastUpdated={lastUpdated}
          />
        </div>
        
        <div className="w-full animate-in fade-in slide-in-from-top" style={{ animationDelay: "200ms" }}>
          <ReservationForm
            availableStock={currentStock}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
      
      <footer className="bg-card/40 backdrop-blur-sm border-t border-border/20">
        <div className="max-w-[1200px] mx-auto w-full px-4 py-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SolBe Organics Inc. All rights reserved.</p>
        </div>
      </footer>
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent
          // Disable all animations that cause the dialog to move
          style={{
            animation: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'none'
          }}
        >
          <DialogTitle className="sr-only">Order Confirmation</DialogTitle>
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
