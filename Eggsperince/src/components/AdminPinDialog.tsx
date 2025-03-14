import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface AdminPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
  onPinSuccess?: () => void;
}

export function AdminPinDialog({ 
  open, 
  onOpenChange, 
  redirectPath = "/admin/orders",
  onPinSuccess 
}: AdminPinDialogProps) {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Log when component mounts or redirectPath changes
  useEffect(() => {
    console.log("AdminPinDialog mounted/updated with redirectPath:", redirectPath);
  }, [redirectPath]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("PIN submitted:", pin, "Expected PIN: 321");
    console.log("Will redirect to:", redirectPath);
    
    if (pin === "321") {
      console.log("PIN correct, navigating to:", redirectPath);
      
      // Call the success callback if provided
      if (onPinSuccess) {
        console.log("Calling onPinSuccess callback");
        onPinSuccess();
      } else {
        // Default behavior - navigate directly
        navigate(redirectPath);
      }
      
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
      <DialogContent 
        className="sm:max-w-[400px]"
        // Disable all animations that cause the dialog to move
        style={{
          animation: 'none',
          transform: 'translate(-50%, -50%)',
          transition: 'none'
        }}
      >
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
