import { Suspense } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminLayout from "./components/admin/AdminLayout";
import InventoryManagement from "./components/admin/InventoryManagement";
import ProductsManagement from "./components/admin/ProductsManagement";
import OrdersManagement from "./components/admin/OrdersManagement";
import routes from "tempo-routes";

function App() {
  // Handle Tempo routes first
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  // Handle app routes
  const appRoutes = useRoutes([
    { path: "/", element: <Home /> },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "inventory", element: <InventoryManagement /> },
        { path: "orders", element: <OrdersManagement /> },
        { path: "products", element: <ProductsManagement /> },
      ],
    },
    // Add Tempo route at the end
    ...(import.meta.env.VITE_TEMPO === "true"
      ? [{ path: "tempobook/*", element: null }]
      : []),
  ]);

  return (
    <ThemeProvider defaultTheme="system">
      <Suspense fallback={<p>Loading...</p>}>
        {tempoRoutes}
        {appRoutes}
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
