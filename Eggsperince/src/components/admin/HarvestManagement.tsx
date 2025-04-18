import React, { useEffect, useState, useRef } from "react";
import { DateRange } from "react-day-picker";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon, Trash2, Edit, Plus, Download, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import DatePickerWithRange from "../ui/date-picker-with-range";
import { useToast } from "../ui/use-toast";
import { getCoops, getHarvests, recordHarvest, updateHarvest, deleteHarvest, exportHarvestData, importHarvestsFromCSV } from "../../lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface Coop {
  id: string;
  name: string;
}

interface Harvest {
  id: string;
  coop_id: string;
  eggs_collected: number;
  collection_date: string;
  notes: string | null;
  created_at: string;
  coops: {
    id: string;
    name: string;
  };
}

interface CoopHarvestData {
  coop_id: string;
  eggs_collected: number;
}

const HarvestManagement = () => {
  const { toast } = useToast();
  const [coops, setCoops] = useState<Coop[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportResultsDialogOpen, setIsImportResultsDialogOpen] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [coopHarvests, setCoopHarvests] = useState<CoopHarvestData[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCoops();
    loadHarvests();
  }, []);

  // Initialize coopHarvests when coops are loaded
  useEffect(() => {
    if (coops.length > 0) {
      setCoopHarvests(
        coops.map(coop => ({
          coop_id: coop.id,
          eggs_collected: 0
        }))
      );
    }
  }, [coops]);

  const loadCoops = async () => {
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
    }
  };

  const loadHarvests = async () => {
    setIsLoading(true);
    try {
      const filters = {
        start_date: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
      };
      const data = await getHarvests(filters);
      setHarvests(data);
    } catch (error) {
      console.error("Error loading harvests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load harvests. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reload harvests when date range changes
  useEffect(() => {
    loadHarvests();
  }, [dateRange]);

  const handleOpenDialog = (harvest?: Harvest) => {
    if (harvest) {
      // Edit mode
      setSelectedHarvest(harvest);
      setSelectedDate(new Date(harvest.collection_date));
      setNotes(harvest.notes || "");
      
      // Set up single coop harvest data
      setCoopHarvests([{
        coop_id: harvest.coop_id,
        eggs_collected: harvest.eggs_collected
      }]);
    } else {
      // New harvest mode
      setSelectedHarvest(null);
      setSelectedDate(new Date());
      setNotes("");
      
      // Initialize all coops with zero eggs
      setCoopHarvests(
        coops.map(coop => ({
          coop_id: coop.id,
          eggs_collected: 0
        }))
      );
    }
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setIsDeleteDialogOpen(true);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleEggCountChange = (coopId: string, count: number) => {
    setCoopHarvests(prev => 
      prev.map(item => 
        item.coop_id === coopId 
          ? { ...item, eggs_collected: count } 
          : item
      )
    );
  };

  const handleSubmit = async () => {
    // Validate that at least one coop has eggs collected
    const hasEggs = coopHarvests.some(item => item.eggs_collected > 0);
    
    if (!hasEggs) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one coop must have eggs collected",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedHarvest) {
        // Update existing harvest (single coop mode)
        const coopHarvest = coopHarvests[0];
        await updateHarvest(selectedHarvest.id, {
          coop_id: coopHarvest.coop_id,
          eggs_collected: coopHarvest.eggs_collected,
          collection_date: format(selectedDate, "yyyy-MM-dd"),
          notes: notes,
        });
        toast({
          title: "Harvest Updated",
          description: `Harvest record has been updated successfully`,
        });
      } else {
        // Create new harvests (multiple coops)
        // Format date in local timezone to prevent UTC conversion issues
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        
        // Only save coops with eggs > 0
        const validHarvests = coopHarvests.filter(item => item.eggs_collected > 0);
        
        // Save each harvest
        for (const harvest of validHarvests) {
          await recordHarvest({
            coop_id: harvest.coop_id,
            eggs_collected: harvest.eggs_collected,
            collection_date: formattedDate,
            notes: notes,
          });
        }
        
        const totalEggs = validHarvests.reduce((sum, item) => sum + item.eggs_collected, 0);
        toast({
          title: "Harvests Recorded",
          description: `${totalEggs} eggs from ${validHarvests.length} coop(s) have been recorded successfully`,
        });
      }
      setIsDialogOpen(false);
      loadHarvests();
    } catch (error) {
      console.error("Error saving harvest:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${selectedHarvest ? "update" : "record"} harvest. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHarvest) return;

    setIsLoading(true);
    try {
      await deleteHarvest(selectedHarvest.id);
      toast({
        title: "Harvest Deleted",
        description: `Harvest record has been deleted successfully`,
      });
      setIsDeleteDialogOpen(false);
      loadHarvests();
    } catch (error) {
      console.error("Error deleting harvest:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete harvest. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCoopNameById = (id: string) => {
    const coop = coops.find(c => c.id === id);
    return coop ? coop.name : "Unknown Coop";
  };

  // CSV Export function
  const handleExportCSV = () => {
    if (harvests.length === 0) {
      toast({
        title: "No Data",
        description: "There are no harvest records to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvContent = exportHarvestData(harvests);
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set up download attributes
      link.setAttribute('href', url);
      link.setAttribute('download', `egg-harvests-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      // Add to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `${harvests.length} harvest records exported to CSV.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export harvest data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // CSV Import function
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Read the file content
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvContent = event.target?.result as string;
        
        // Process the CSV content
        const results = await importHarvestsFromCSV(csvContent);
        setImportResults(results);
        setIsImportResultsDialogOpen(true);
        
        // Reload harvests to show new data
        loadHarvests();
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import harvest data. Please check your CSV file format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Egg Harvests</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex-grow">
            <DatePickerWithRange 
              date={dateRange} 
              onDateChange={(newDateRange) => {
                // Ensure we always have a 'to' date
                setDateRange({
                  from: newDateRange.from,
                  to: newDateRange.to || newDateRange.from
                });
              }} 
              className="w-full"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={loadHarvests} 
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            disabled={harvests.length === 0 || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={handleImportClick} 
            disabled={coops.length === 0 || isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Button onClick={() => handleOpenDialog()} disabled={coops.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Record Harvest
          </Button>
        </div>
      </div>

      {coops.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No coops available. Please add a coop first before recording harvests.
          </p>
        </Card>
      ) : isLoading && harvests.length === 0 ? (
        <p className="text-center py-4">Loading harvests...</p>
      ) : harvests.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No harvests recorded yet. Start collecting eggs and record your first harvest.
          </p>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Coop</th>
                  <th className="text-left py-2 px-4">Eggs Collected</th>
                  <th className="text-left py-2 px-4">Notes</th>
                  <th className="text-right py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {harvests.map((harvest) => (
                  <tr key={harvest.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">
                      {format(new Date(harvest.collection_date + 'T00:00:00'), "MM/dd/yyyy")}
                    </td>
                    <td className="py-2 px-4">{harvest.coops?.name || "Unknown"}</td>
                    <td className="py-2 px-4">{harvest.eggs_collected}</td>
                    <td className="py-2 px-4 max-w-xs truncate">
                      {harvest.notes || "-"}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(harvest)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(harvest)}
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
        </Card>
      )}

      {/* Add/Edit Harvest Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="fixed inset-0 w-full h-full max-w-none rounded-none p-6"
          style={{
            animation: 'none',
            transform: 'none',
            transition: 'none'
          }}
        >
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl">
              {selectedHarvest ? "Edit Harvest" : "Record Harvest"}
            </DialogTitle>
            {!selectedHarvest && (
              <DialogDescription className="text-xl mt-2">
                Enter the number of eggs collected for each coop
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {selectedHarvest ? (
              // Edit mode - single coop
              <div className="space-y-6 flex-grow">
                <div className="space-y-2">
                  <Label className="text-xl">Coop</Label>
                  <div className="text-2xl font-medium p-6 border rounded-md bg-primary/5 text-center shadow-sm">
                    {getCoopNameById(coopHarvests[0]?.coop_id)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xl">Number of Eggs</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={coopHarvests[0]?.eggs_collected.toString()}
                    onChange={(e) => handleEggCountChange(
                      coopHarvests[0]?.coop_id, 
                      parseInt(e.target.value) || 0
                    )}
                    className="text-3xl py-8 text-center font-bold text-primary shadow-sm"
                    placeholder="Enter number of eggs"
                  />
                </div>
              </div>
            ) : (
              // New harvest mode - multiple coops with individual selectors
              <div className="flex-grow overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coops.map((coop) => {
                    const coopHarvest = coopHarvests.find(c => c.coop_id === coop.id);
                    const isSelected = coopHarvest?.eggs_collected > 0;
                    
                    return (
                      <div 
                        key={coop.id} 
                        className={`border rounded-lg p-6 shadow-md transition-all duration-200 ${
                          isSelected 
                            ? 'border-primary bg-primary/10 scale-105 transform' 
                            : 'border-muted hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <div className="text-2xl font-medium mb-4 text-center">
                          {coop.name}
                        </div>
                        
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={coopHarvest?.eggs_collected.toString() || "0"}
                          onChange={(e) => handleEggCountChange(
                            coop.id, 
                            parseInt(e.target.value) || 0
                          )}
                          className={`text-2xl py-6 text-center font-bold ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          }`}
                          placeholder="Eggs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xl">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any notes about this harvest"
                  rows={3}
                  className="text-xl shadow-sm"
                />
              </div>
              
              {/* Collection Date Selector - moved to bottom */}
              <div className="space-y-2">
                <Label htmlFor="collection_date" className="text-xl">Collection Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-xl py-8 shadow-sm"
                    >
                      <CalendarIcon className="mr-3 h-6 w-6" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-4 pl-4 pr-16 shadow-xl" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      initialFocus
                      className="text-xl"
                      styles={{
                        day: { width: '60px', height: '60px', fontSize: '1.5rem' },
                        caption: { fontSize: '1.75rem', padding: '16px 0' },
                        head_cell: { fontSize: '1.25rem', padding: '16px 0' },
                        nav_button: { width: '48px', height: '48px' },
                        table: { width: '90%', marginRight: 'auto' },
                        cell: { padding: '6px' },
                        button: { fontSize: '1.5rem' }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <DialogFooter className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xl py-8 px-10 shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="text-xl py-8 px-10 shadow-sm"
              >
                {isLoading
                  ? "Saving..."
                  : selectedHarvest
                  ? "Update Harvest"
                  : "Record Harvest"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent 
          className="fixed inset-0 w-full h-full max-w-none rounded-none p-6"
          style={{
            animation: 'none',
            transform: 'none',
            transition: 'none'
          }}
        >
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow flex items-center justify-center">
            <p className="text-2xl text-center max-w-2xl">
              Are you sure you want to delete this harvest record? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xl py-8 px-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-xl py-8 px-10"
            >
              {isLoading ? "Deleting..." : "Delete Harvest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Results Dialog */}
      <Dialog open={isImportResultsDialogOpen} onOpenChange={setIsImportResultsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>CSV Import Results</DialogTitle>
            <DialogDescription>
              Summary of the harvest data import operation
            </DialogDescription>
          </DialogHeader>
          
          {importResults && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Successfully imported:</span>
                <span className="font-bold text-green-600">{importResults.success} records</span>
              </div>
              
              {importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                    <span className="font-medium">Errors encountered:</span>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md max-h-[200px] overflow-y-auto">
                    <ul className="list-disc pl-5 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index} className="text-sm text-destructive">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                  {importResults.success > 0 
                    ? "The harvest data has been imported and the table has been updated."
                    : "No records were imported. Please check the errors and try again with a corrected CSV file."}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsImportResultsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HarvestManagement;
