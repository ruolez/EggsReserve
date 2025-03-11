import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { useToast } from "../ui/use-toast";
import { getCoops, createCoop, updateCoop, deleteCoop } from "../../lib/api";

interface Coop {
  id: string;
  name: string;
  num_birds: number;
  has_rooster: boolean;
  created_at: string;
}

const CoopsManagement = () => {
  const { toast } = useToast();
  const [coops, setCoops] = useState<Coop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<Coop | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    num_birds: 0,
    has_rooster: false,
  });

  useEffect(() => {
    loadCoops();
  }, []);

  const loadCoops = async () => {
    setIsLoading(true);
    try {
      const data = await getCoops();
      setCoops(data);
    } catch (error) {
      console.error("Error loading coops:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load coops. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (coop?: Coop) => {
    if (coop) {
      setSelectedCoop(coop);
      setFormData({
        name: coop.name,
        num_birds: coop.num_birds,
        has_rooster: coop.has_rooster,
      });
    } else {
      setSelectedCoop(null);
      setFormData({
        name: "",
        num_birds: 0,
        has_rooster: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (coop: Coop) => {
    setSelectedCoop(coop);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      has_rooster: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Coop name is required",
      });
      return;
    }

    if (formData.num_birds < 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Number of birds cannot be negative",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedCoop) {
        // Update existing coop
        await updateCoop(selectedCoop.id, formData);
        toast({
          title: "Coop Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        // Create new coop
        await createCoop(formData);
        toast({
          title: "Coop Created",
          description: `${formData.name} has been created successfully`,
        });
      }
      setIsDialogOpen(false);
      loadCoops();
    } catch (error) {
      console.error("Error saving coop:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${selectedCoop ? "update" : "create"} coop. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoop) return;

    setIsLoading(true);
    try {
      await deleteCoop(selectedCoop.id);
      toast({
        title: "Coop Deleted",
        description: `${selectedCoop.name} has been deleted successfully`,
      });
      setIsDeleteDialogOpen(false);
      loadCoops();
    } catch (error) {
      console.error("Error deleting coop:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete coop. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chicken Coops</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Coop
        </Button>
      </div>

      {isLoading && coops.length === 0 ? (
        <p className="text-center py-4">Loading coops...</p>
      ) : coops.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No coops found. Add your first coop to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coops.map((coop) => (
            <Card key={coop.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{coop.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(coop)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDeleteDialog(coop)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Birds:</span> {coop.num_birds}
                </p>
                <p>
                  <span className="font-medium">Rooster:</span>{" "}
                  {coop.has_rooster ? "Yes" : "No"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Added on {new Date(coop.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Coop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
          // Disable all animations that cause the dialog to move
          style={{
            animation: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'none'
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedCoop ? "Edit Coop" : "Add New Coop"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Coop Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter coop name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_birds">Number of Laying Birds</Label>
                <Input
                  id="num_birds"
                  name="num_birds"
                  type="number"
                  value={formData.num_birds}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="has_rooster"
                  checked={formData.has_rooster}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="has_rooster">Has Rooster</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : selectedCoop
                  ? "Update Coop"
                  : "Add Coop"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
          // Disable all animations that cause the dialog to move
          style={{
            animation: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'none'
          }}
        >
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the coop "{selectedCoop?.name}"?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Coop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoopsManagement;
