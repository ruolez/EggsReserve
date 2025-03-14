import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPinDialog } from "./AdminPinDialog";

const EggsRedirect = () => {
  const [showAdminPin, setShowAdminPin] = useState(true);
  const pinSuccessRef = useRef(false);
  const navigate = useNavigate();

  // Log when component mounts
  useEffect(() => {
    console.log("EggsRedirect component mounted");
  }, []);

  // Handle successful PIN entry
  const handlePinSuccess = () => {
    console.log("PIN success callback triggered");
    pinSuccessRef.current = true;
    navigate("/admin/harvest");
  };

  // Handle dialog open state change
  const handleOpenChange = (open: boolean) => {
    console.log("Dialog open state changed:", open);
    setShowAdminPin(open);
    
    // Only navigate to home if the dialog is closed AND pin was not successful
    if (!open && !pinSuccessRef.current) {
      console.log("Dialog closed without successful PIN, navigating to home");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Egg Harvest Management</h1>
        <p className="mb-4">Please enter your admin PIN to continue</p>
        <AdminPinDialog 
          open={showAdminPin} 
          onOpenChange={handleOpenChange} 
          redirectPath="/admin/harvest"
          onPinSuccess={handlePinSuccess}
        />
      </div>
    </div>
  );
};

export default EggsRedirect;
