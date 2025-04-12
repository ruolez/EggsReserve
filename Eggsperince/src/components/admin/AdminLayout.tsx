import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
<<<<<<< HEAD
<<<<<<< HEAD
import { 
  Warehouse, 
  ClipboardList, 
  Package, 
  Mail, 
  Home, 
  Egg, 
  BarChart, 
  DollarSign,
  ShoppingCart,
  Settings,
  ChevronDown,
  ToggleLeft
} from "lucide-react";
=======
import { Warehouse, ClipboardList, Package, Mail, Home, Egg, BarChart, DollarSign } from "lucide-react";
>>>>>>> parent of 5c66a73 (updated statistics)
=======
import { Warehouse, ClipboardList, Package, Mail, Home, Egg, BarChart, DollarSign } from "lucide-react";
>>>>>>> parent of 5c66a73 (updated statistics)
import { ThemeToggle } from "../ThemeToggle";

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Control Panel</h1>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  ← Order
                </a>
              </div>
            </div>
<<<<<<< HEAD
<<<<<<< HEAD
            
            {/* Navigation Menu - Reorganized into logical groups */}
            <div className="flex flex-wrap w-full sm:w-auto justify-between sm:justify-end sm:space-x-2 gap-2">
              {/* Sales & Orders Group */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/orders"
                  className={linkClass("/admin/orders")}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/admin/inventory"
                  className={linkClass("/admin/inventory")}
                >
                  <Warehouse className="h-5 w-5" />
                  <span>Inventory</span>
                </Link>
                <Link
                  to="/admin/products"
                  className={linkClass("/admin/products")}
                >
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </Link>
              </div>
              
              {/* Farm Management Group */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/coops"
                  className={linkClass("/admin/coops")}
                >
                  <Home className="h-5 w-5" />
                  <span>Coops</span>
                </Link>
                <Link
                  to="/admin/harvest"
                  className={linkClass("/admin/harvest")}
                >
                  <Egg className="h-5 w-5" />
                  <span>Harvest</span>
                </Link>
              </div>
              
              {/* Business Group */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/business-stats"
                  className={linkClass("/admin/business-stats")}
                >
                  <BarChart className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/expenses"
                  className={linkClass("/admin/expenses")}
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Expenses</span>
                </Link>
              </div>
              
              {/* Settings */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/email"
                  className={linkClass("/admin/email")}
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </Link>
                <Link
                  to="/admin/product-display"
                  className={linkClass("/admin/product-display")}
                >
                  <ToggleLeft className="h-5 w-5" />
                  <span>Display</span>
                </Link>
                <ThemeToggle />
              </div>
=======
=======
>>>>>>> parent of 5c66a73 (updated statistics)
            <div className="flex w-full sm:w-auto justify-between sm:justify-end sm:space-x-4 gap-2">
              <Link
                to="/admin/inventory"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/inventory" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <Warehouse className="h-5 w-5" />
                <span>Inventory</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <ClipboardList className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              <Link
                to="/admin/products"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </Link>
              <Link
                to="/admin/email"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </Link>
              <Link
                to="/admin/coops"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/coops" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <Home className="h-5 w-5" />
                <span>Coops</span>
              </Link>
              <Link
                to="/admin/harvest"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/harvest" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <Egg className="h-5 w-5" />
                <span>Harvest</span>
              </Link>
              <Link
                to="/admin/statistics"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/statistics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <BarChart className="h-5 w-5" />
                <span>Stats</span>
              </Link>
              <Link
                to="/admin/expenses"
                className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 rounded-md flex-1 sm:flex-initial ${location.pathname === "/admin/expenses" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <DollarSign className="h-5 w-5" />
                <span>Expenses</span>
              </Link>
              <ThemeToggle />
<<<<<<< HEAD
>>>>>>> parent of 5c66a73 (updated statistics)
=======
>>>>>>> parent of 5c66a73 (updated statistics)
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
