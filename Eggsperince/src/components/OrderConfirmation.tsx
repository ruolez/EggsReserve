import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, Copy, Mail, User, Package, Hash } from "lucide-react";

interface OrderConfirmationProps {
  customerName?: string;
  orderNumber?: string;
  quantity?: number;
  email?: string;
  productType?: string;
  onClose?: () => void;
}

const OrderConfirmation = ({
  customerName = "John Doe",
  orderNumber = "ORD-123456",
  quantity = 2,
  email = "john.doe@example.com",
  productType = "Carton of eggs",
  onClose = () => {},
}: OrderConfirmationProps) => {
  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 shadow-md">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Order Confirmed!
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-1">
          Thank you for your reservation
        </p>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3 p-2 bg-background/80 rounded-md shadow-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Order Number:</span>
          <span className="font-medium ml-auto">{orderNumber}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={copyOrderNumber}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-background/80 rounded-md shadow-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Customer:</span>
          <span className="font-medium ml-auto">{customerName}</span>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-background/80 rounded-md shadow-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Product:</span>
          <span className="font-medium ml-auto">{productType}</span>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-background/80 rounded-md shadow-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Quantity:</span>
          <span className="font-medium ml-auto">{quantity} {productType.toLowerCase().includes("cashew") ? "bags" : "cartons"}</span>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-background/80 rounded-md shadow-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Email:</span>
          <span className="font-medium ml-auto">{email}</span>
        </div>
      </div>

      <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
        <p className="text-center text-sm">
          A confirmation email has been sent to your email address.
        </p>
      </div>
      
      <div className="flex justify-center pt-2">
        <Button 
          onClick={onClose} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
