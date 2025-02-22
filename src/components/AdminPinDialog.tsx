import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface AdminPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPinDialog({ open, onOpenChange }: AdminPinDialogProps) {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "321") {
      navigate("/admin/orders");
      onOpenChange(false);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please try again",
      });
      setPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enter Admin PIN</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl tracking-widest"
            maxLength={3}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
