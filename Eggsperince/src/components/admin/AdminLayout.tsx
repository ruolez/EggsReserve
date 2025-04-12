// AdminLayout.tsx - Cleaned and fixed

import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
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
  ToggleLeft
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

const linkClass = (path: string, currentPath: string) =>
  `flex items-center space-x-2 px-3 py-2 rounded-md ${
    currentPath === path
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-secondary"
  }`;

const AdminLayout: React.FC = () => {
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
            {/* Navigation Menu */}
            <div className="flex flex-wrap w-full sm:w-auto justify-between sm:justify-end sm:space-x-2 gap-2">
              {/* Sales & Orders Group */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/orders"
                  className={linkClass("/admin/orders", location.pathname)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/admin/inventory"
                  className={linkClass("/admin/inventory", location.pathname)}
                >
                  <Warehouse className="h-5 w-5" />
                  <span>Inventory</span>
                </Link>
                <Link
                  to="/admin/products"
                  className={linkClass("/admin/products", location.pathname)}
                >
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </Link>
              </div>
              {/* Farm Management Group */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/coops"
                  className={linkClass("/admin/coops", location.pathname)}
                >
                  <Home className="h-5 w-5" />
                  <span>Coops</span>
                </Link>
                <Link
                  to="/admin/harvest"
                  className={linkClass("/admin/harvest", location.pathname)}
                >
                  <Egg className="h-5 w-5" />
                  <span>Harvest</span>
                </Link>
              </div>
              {/* Business Group */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/business-stats"
                  className={linkClass("/admin/business-stats", location.pathname)}
                >
                  <BarChart className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/expenses"
                  className={linkClass("/admin/expenses", location.pathname)}
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Expenses</span>
                </Link>
              </div>
              {/* Settings */}
              <div className="flex space-x-1">
                <Link
                  to="/admin/email"
                  className={linkClass("/admin/email", location.pathname)}
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </Link>
                <Link
                  to="/admin/product-display"
                  className={linkClass("/admin/product-display", location.pathname)}
                >
                  <ToggleLeft className="h-5 w-5" />
                  <span>Display</span>
                </Link>
                <ThemeToggle />
              </div>
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
