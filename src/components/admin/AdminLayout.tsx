import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Warehouse, ClipboardList } from "lucide-react";
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
                <h1 className="text-xl font-bold">Supplier Admin</h1>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  ← Order
                </a>
              </div>
            </div>
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
              <ThemeToggle className="hidden sm:flex" />
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
