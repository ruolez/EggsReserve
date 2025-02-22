import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";

interface OrderConfirmationProps {
  customerName?: string;
  orderNumber?: string;
  quantity?: number;
  email?: string;
  onClose?: () => void;
}

const OrderConfirmation = ({
  customerName = "John Doe",
  orderNumber = "ORD-123456",
  quantity = 2,
  email = "john.doe@example.com",
  onClose = () => {},
}: OrderConfirmationProps) => {
  return (
    <div className="min-h-[400px] w-full max-w-[600px] bg-background p-6">
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>

          <h2 className="text-2xl font-semibold text-center">
            Order Confirmed!
          </h2>

          <div className="w-full space-y-4">
            <div className="border-t border-b border-border py-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Name:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{quantity} cartons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{email}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-muted-foreground">
            A confirmation email has been sent to your email address.
          </p>

          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
