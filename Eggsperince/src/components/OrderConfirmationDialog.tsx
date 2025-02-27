import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import OrderConfirmation from "./OrderConfirmation";

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
  orderNumber?: string;
  quantity?: number;
  email?: string;
}

const OrderConfirmationDialog = ({
  open,
  onOpenChange,
  customerName,
  orderNumber,
  quantity,
  email,
}: OrderConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <DialogContent 
          className="relative w-full max-w-[600px] p-0 overflow-hidden border-none bg-transparent shadow-none"
          // Disable all animations that cause the dialog to move
          style={{
            animation: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'none'
          }}
        >
          <DialogTitle className="sr-only">Order Confirmation</DialogTitle>
          <OrderConfirmation
            customerName={customerName}
            orderNumber={orderNumber}
            quantity={quantity}
            email={email}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default OrderConfirmationDialog;
