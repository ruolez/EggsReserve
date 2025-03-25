import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../lib/api";

interface Product {
  id: string;
  name: string;
  sale_price: number;
  cost_price: number;
  sku: string | null;
  upc: string | null;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sale_price: "",
    cost_price: "",
    sku: "",
    upc: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        sale_price: parseFloat(formData.sale_price),
        cost_price: parseFloat(formData.cost_price),
        sku: formData.sku || null,
        upc: formData.upc || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setFormData({
        name: "",
        sale_price: "",
        cost_price: "",
        sku: "",
        upc: "",
      });
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sale_price: product.sale_price.toString(),
      cost_price: product.cost_price.toString(),
      sku: product.sku || "",
      upc: product.upc || "",
    });
  };

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent
            // Disable all animations that cause the dialog to move
            style={{
              animation: 'none',
              transform: 'translate(-50%, -50%)',
              transition: 'none'
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sale Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">UPC</label>
                  <Input
                    value={formData.upc}
                    onChange={(e) =>
                      setFormData({ ...formData, upc: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Sale Price</th>
              <th className="text-left py-3 px-2">Cost Price</th>
              <th className="text-left py-3 px-2">SKU</th>
              <th className="text-left py-3 px-2">UPC</th>
              <th className="text-left py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`border-b ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
              >
                <td className="py-3 px-2">{product.name}</td>
                <td className="py-3 px-2">${product.sale_price.toFixed(2)}</td>
                <td className="py-3 px-2">${product.cost_price.toFixed(2)}</td>
                <td className="py-3 px-2">{product.sku || "-"}</td>
                <td className="py-3 px-2">{product.upc || "-"}</td>
                <td className="py-3 px-2">
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        // Disable all animations that cause the dialog to move
                        style={{
                          animation: 'none',
                          transform: 'translate(-50%, -50%)',
                          transition: 'none'
                        }}
                      >
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Sale Price</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.sale_price}
                                onChange={(e) =>
                                  setFormData({ ...formData, sale_price: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Cost Price</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.cost_price}
                                onChange={(e) =>
                                  setFormData({ ...formData, cost_price: e.target.value })
                                }
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">SKU</label>
                              <Input
                                value={formData.sku}
                                onChange={(e) =>
                                  setFormData({ ...formData, sku: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">UPC</label>
                              <Input
                                value={formData.upc}
                                onChange={(e) =>
                                  setFormData({ ...formData, upc: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <Button type="submit" className="w-full">
                            Update Product
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        // Disable all animations that cause the dialog to move
                        style={{
                          animation: 'none',
                          transform: 'translate(-50%, -50%)',
                          transition: 'none'
                        }}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {product.name}? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await deleteProduct(product.id);
                                toast({
                                  title: "Success",
                                  description: "Product deleted successfully",
                                });
                                loadProducts();
                              } catch (error) {
                                console.error("Error deleting product:", error);
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: "Failed to delete product",
                                });
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ProductsManagement;
