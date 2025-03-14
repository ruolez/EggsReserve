import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Trash2, Edit, Plus, DollarSign, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { useToast } from "../ui/use-toast";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../../lib/api";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";
import { DateRange } from "react-day-picker";

interface Expense {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  date: string;
  total_cost: number;
  created_at: string;
}

const ExpensesManagement = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    cost: 0,
    date: new Date().toISOString().split("T")[0],
    total_cost: 0,
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    // Apply filters whenever expenses, nameFilter, or dateRange changes
    applyFilters();
  }, [expenses, nameFilter, dateRange]);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load expenses. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter(expense => 
        expense.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) >= dateRange.from!
      );
    }

    if (dateRange?.to) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) <= dateRange.to
      );
    }

    setFilteredExpenses(filtered);
  };

  const resetFilters = () => {
    setNameFilter("");
    setDateRange(undefined);
  };

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setSelectedExpense(expense);
      setFormData({
        name: expense.name,
        quantity: expense.quantity,
        cost: expense.cost,
        date: expense.date,
        total_cost: expense.total_cost,
      });
    } else {
      setSelectedExpense(null);
      setFormData({
        name: "",
        quantity: 1,
        cost: 0,
        date: new Date().toISOString().split("T")[0],
        total_cost: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      
      setFormData(prev => {
        const updatedData = {
          ...prev,
          [name]: numValue,
        };
        
        // Auto-calculate total cost when quantity or cost changes
        if (name === 'quantity' || name === 'cost') {
          updatedData.total_cost = 
            (name === 'quantity' ? numValue : prev.quantity) * 
            (name === 'cost' ? numValue : prev.cost);
        }
        
        return updatedData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Add one day to fix the date selection issue
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      setFormData({
        ...formData,
        date: adjustedDate.toISOString().split("T")[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Expense name is required",
      });
      return;
    }

    if (formData.quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Quantity must be greater than zero",
      });
      return;
    }

    if (formData.cost < 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Cost cannot be negative",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedExpense) {
        // Update existing expense
        await updateExpense(selectedExpense.id, formData);
        toast({
          title: "Expense Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        // Create new expense
        await createExpense(formData);
        toast({
          title: "Expense Created",
          description: `${formData.name} has been created successfully`,
        });
      }
      setIsDialogOpen(false);
      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${selectedExpense ? "update" : "create"} expense. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;

    setIsLoading(true);
    try {
      await deleteExpense(selectedExpense.id);
      toast({
        title: "Expense Deleted",
        description: `${selectedExpense.name} has been deleted successfully`,
      });
      setIsDeleteDialogOpen(false);
      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.total_cost,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses Management</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="nameFilter">Filter by Name</Label>
            <Input
              id="nameFilter"
              placeholder="Search expenses..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label>Filter by Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from || dateRange?.to ? (
                    <>
                      {dateRange.from
                        ? format(dateRange.from, "PPP")
                        : "Start date"}{" "}
                      -{" "}
                      {dateRange.to
                        ? format(dateRange.to, "PPP")
                        : "End date"}
                    </>
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="p-4 bg-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-medium">Total Expenses</h3>
          </div>
          <p className="text-xl font-bold">${totalExpenses.toFixed(2)}</p>
        </div>
      </Card>

      {isLoading && filteredExpenses.length === 0 ? (
        <p className="text-center py-4">Loading expenses...</p>
      ) : filteredExpenses.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            {expenses.length === 0
              ? "No expenses found. Add your first expense to get started."
              : "No expenses match your filters."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2 text-right">Cost</th>
                <th className="px-4 py-2 text-right">Total Cost</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-secondary/50">
                  <td className="px-4 py-2">{expense.name}</td>
                  <td className="px-4 py-2">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">{expense.quantity}</td>
                  <td className="px-4 py-2 text-right">${expense.cost.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">${expense.total_cost.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(expense)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
          style={{
            animation: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'none'
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter expense name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost per Unit</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(new Date(formData.date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={handleDateChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_cost">Total Cost</Label>
                <Input
                  id="total_cost"
                  name="total_cost"
                  type="number"
                  value={formData.total_cost}
                  readOnly
                  className="bg-secondary"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated from quantity and cost
                </p>
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
                  : selectedExpense
                  ? "Update Expense"
                  : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
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
            Are you sure you want to delete the expense "{selectedExpense?.name}"?
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
              {isLoading ? "Deleting..." : "Delete Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesManagement;
