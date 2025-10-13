import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useData, StockItem } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { DataStatus } from "@/components/ui/data-status";
import { LoadingState, EmptyState } from "@/components/ui/error-display";
import { Package, Plus, Search, AlertTriangle, Edit, RotateCcw, X, Download, FileText } from "lucide-react";
import { CompactDateRangePicker } from "@/components/ui/compact-date-picker";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 20;

export default function Stock() {
  const { 
    stock, 
    loading, 
    error, 
    lastUpdated,
    addStock, 
    updateStock,
    refreshData,
    clearError
  } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<StockItem | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    quantityBags: 0,
    bagWeight: 50,
    purchasePrice: 0,
    sellingPrice: 0,
  });

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    let filteredStock = stock.filter((s) => [s.name, s.type].some((x) => x.toLowerCase().includes(t)));
    
    // Apply date range filter for last updated
    if (startDate || endDate) {
      const from = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0) : undefined;
      const to = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999) : undefined;
      
      filteredStock = filteredStock.filter((s) => {
        if (!s.lastUpdated) return false;
        const lastUpdated = new Date(s.lastUpdated);
        if (from && lastUpdated < from) return false;
        if (to && lastUpdated > to) return false;
        return true;
      });
    }
    
    return filteredStock;
  }, [stock, q, startDate, endDate]);

  useEffect(() => {
    const lows = stock.filter((s) => s.quantityBags < LOW_STOCK_THRESHOLD);
    if (lows.length) {
      toast({ title: "Low stock alert", description: `${lows.length} item(s) below ${LOW_STOCK_THRESHOLD} bags.` });
    }
  }, [stock, toast]);

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.type.trim()) {
      toast({ title: "Validation Error", description: "Please fill in feed name and type." });
      return;
    }
    
    if (formData.quantityBags <= 0 || formData.bagWeight <= 0 || formData.purchasePrice <= 0 || formData.sellingPrice <= 0) {
      toast({ title: "Validation Error", description: "Please enter valid numeric values for quantity, weight, and prices." });
      return;
    }
    
    const payload = {
      name: formData.name.trim(),
      type: formData.type.trim(),
      quantityBags: Number(formData.quantityBags),
      bagWeight: Number(formData.bagWeight),
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
    } as const;
    
    if (editing?.id) {
      updateStock(editing.id, payload as any);
      toast({ title: "Feed updated successfully", description: `${payload.name} has been updated.` });
    } else {
      addStock(payload as any);
      toast({ title: "Feed added successfully", description: `${payload.name} has been added to stock.` });
    }
    
    // Close dialog and reset form
    setEditing(null);
    setIsAddDialogOpen(false);
    setFormData({
      name: "",
      type: "",
      quantityBags: 0,
      bagWeight: 50,
      purchasePrice: 0,
      sellingPrice: 0,
    });
  }

  const handleRestock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!restockItem) return;
    
    try {
      const form = e.currentTarget as any;
      const addBags = Number(form.add.value) || 0;
      
      if (addBags <= 0) {
        toast({ title: "Error", description: "Please enter a valid number of bags", variant: "destructive" });
        return;
      }

      await updateStock(restockItem.id, { 
        quantityBags: restockItem.quantityBags + addBags 
      });
      
      toast({ 
        title: "Stock updated", 
        description: `Added ${addBags} bags to ${restockItem.name}. New total: ${restockItem.quantityBags + addBags} bags` 
      });
      
      setIsRestockDialogOpen(false);
      setRestockItem(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update stock", variant: "destructive" });
    }
  };

  // PDF generation function for stock summary
  const generateStockPDF = () => {
    const from = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0) : undefined;
    const to = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999) : undefined;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paras Dairy - Stock Summary Report</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }

              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: #ffffff;
                  padding: 40px 20px;
              }

              .container {
                  max-width: 1000px;
                  margin: 0 auto;
                  background: white;
              }

              .header {
                  text-align: center;
                  padding: 30px 20px;
                  border-bottom: 3px solid #2d7a3e;
                  background: linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%);
                  position: relative;
              }

              .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 5px;
                  background: linear-gradient(90deg, #2d7a3e 0%, #4caf50 50%, #2d7a3e 100%);
              }

              .company-name {
                  font-size: 48px;
                  font-weight: 700;
                  color: #2d7a3e;
                  letter-spacing: 3px;
                  margin-bottom: 15px;
                  text-transform: uppercase;
                  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
              }

              .divider {
                  width: 80px;
                  height: 3px;
                  background: linear-gradient(90deg, transparent, #4caf50, transparent);
                  margin: 15px auto;
              }

              .report-title {
                  font-size: 24px;
                  font-weight: 600;
                  color: #2d7a3e;
                  margin-bottom: 10px;
              }

              .report-info {
                  margin-top: 20px;
                  padding: 15px 25px;
                  display: inline-block;
                  background: rgba(45, 122, 62, 0.05);
                  border-radius: 25px;
                  border: 1px solid rgba(45, 122, 62, 0.2);
              }

              .report-period {
                  font-size: 14px;
                  color: #666;
                  font-weight: 500;
              }

              .content-area {
                  padding: 40px 20px;
                  min-height: 400px;
                  border-left: 1px solid #e0e0e0;
                  border-right: 1px solid #e0e0e0;
              }

              .table-container {
                  overflow-x: auto;
                  margin-top: 20px;
              }

              table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 12px;
              }

              th {
                  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
                  color: #1976d2;
                  font-weight: bold;
                  padding: 12px 8px;
                  text-align: center;
                  border: 1px solid #ddd;
              }

              td {
                  padding: 10px 8px;
                  text-align: center;
                  border: 1px solid #ddd;
                  vertical-align: middle;
              }

              tr:nth-child(even) {
                  background-color: #f8f9fa;
              }

              tr:hover {
                  background-color: #e3f2fd;
              }

              .badge {
                  display: inline-block;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  margin: 2px;
              }

              .badge-blue { background: #e3f2fd; color: #1976d2; }
              .badge-green { background: #e8f5e8; color: #2e7d32; }
              .badge-purple { background: #f3e5f5; color: #7b1fa2; }
              .badge-yellow { background: #fff8e1; color: #f57c00; }
              .badge-indigo { background: #e8eaf6; color: #3f51b5; }
              .badge-emerald { background: #e8f5e8; color: #2e7d32; }
              .badge-red { background: #ffebee; color: #c62828; }
              .badge-orange { background: #fff3e0; color: #ef6c00; }

              .footer {
                  text-align: center;
                  padding: 20px;
                  border-top: 2px solid #e0e0e0;
                  font-size: 12px;
                  color: #666;
              }

              @media print {
                  body {
                      padding: 0;
                  }
                  
                  .container {
                      max-width: 100%;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 class="company-name">PARAS DAIRY</h1>
                  <div class="divider"></div>
                  <div class="report-title">Stock Summary Report</div>
                  <div class="report-info">
                      <div class="report-period">Report Period: ${from && to ? `${from.toLocaleDateString('en-IN')} - ${to.toLocaleDateString('en-IN')}` : 'All Time'}</div>
                  </div>
              </div>

              <div class="content-area">
                  <div class="table-container">
                      <table>
                          <thead>
                              <tr>
                                  <th>Feed Name</th>
                                  <th>Type</th>
                                  <th>Quantity</th>
                                  <th>Bag Weight</th>
                                  <th>Purchase Price</th>
                                  <th>Selling Price</th>
                                  <th>Last Updated</th>
                                  <th>Updated By</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${filtered.map((s) => {
                                const totalWeight = (s.quantityBags * s.bagWeight / 1000).toFixed(2);
                                const isLow = s.quantityBags < LOW_STOCK_THRESHOLD;
                                return `
                                  <tr>
                                      <td>${s.name}</td>
                                      <td><span class="badge badge-blue">${s.type}</span></td>
                                      <td><span class="badge ${isLow ? 'badge-red' : 'badge-green'}">${s.quantityBags} bags</span></td>
                                      <td><span class="badge badge-purple">${s.bagWeight} kg</span></td>
                                      <td><span class="badge badge-yellow">₹${s.purchasePrice}</span></td>
                                      <td><span class="badge badge-emerald">₹${s.sellingPrice}</span></td>
                                      <td>${s.lastUpdated ? new Date(s.lastUpdated).toLocaleString('en-IN') : 'N/A'}</td>
                                      <td><span class="badge badge-indigo">${s.updatedBy || 'System'}</span></td>
                                  </tr>
                                `;
                              }).join('')}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div class="footer">
                  <p>Generated on ${new Date().toLocaleDateString('en-IN')} | Paras Dairy Management System</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Update form data when editing changes
  React.useEffect(() => {
    if (editing) {
      setFormData({
        name: editing.name || "",
        type: editing.type || "",
        quantityBags: editing.quantityBags || 0,
        bagWeight: editing.bagWeight || 50,
        purchasePrice: editing.purchasePrice || 0,
        sellingPrice: editing.sellingPrice || 0,
      });
    } else {
      setFormData({
        name: "",
        type: "",
        quantityBags: 0,
        bagWeight: 50,
        purchasePrice: 0,
        sellingPrice: 0,
      });
    }
  }, [editing]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="p-2 rounded-lg bg-primary/10 animate-bounce-subtle">
          <Package className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Feed Stock Management</h1>
          <p className="text-muted-foreground">Manage feed inventory, prices, and bag weights with comprehensive tracking</p>
        </div>
      </div>

      {/* Data Status */}
      <DataStatus
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        onClearError={clearError}
        refreshLabel="Refresh Stock"
      />

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input 
              placeholder="Search by feed name or type..." 
              value={q} 
              onChange={(e)=>setQ(e.target.value)} 
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl" 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={!!editing || isAddDialogOpen} onOpenChange={(open)=>{
            if (!open) {
              setEditing(null);
              setIsAddDialogOpen(false);
              // Reset form when dialog closes
              setFormData({
                name: "",
                type: "",
                quantityBags: 0,
                bagWeight: 50,
                purchasePrice: 0,
                sellingPrice: 0,
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={()=>setIsAddDialogOpen(true)} 
                className="gap-2 bg-blue-600 hover:bg-blue-700 h-11 px-6 transition-all duration-200 rounded-xl"
              >
                <Plus className="size-4" />
                Add Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl shadow-lg bg-white">
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Package className="size-5 text-blue-600" />
                    </div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editing?.id ? "Edit Feed" : "Add New Feed"}
                    </DialogTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(null);
                      setIsAddDialogOpen(false);
                      setFormData({
                        name: "",
                        type: "",
                        quantityBags: 0,
                        bagWeight: 50,
                        purchasePrice: 0,
                        sellingPrice: 0,
                      });
                    }}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </DialogHeader>
              <form onSubmit={onSave} className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Feed Name <span className="text-red-500">*</span></label>
                      <Input 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
                        placeholder="e.g., Maize, Cottonseed" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Feed Type <span className="text-red-500">*</span></label>
                      <Input 
                        name="type" 
                        required 
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
                        placeholder="e.g., Grain, Oilcake" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity (bags) <span className="text-red-500">*</span></label>
                      <Input 
                        name="quantityBags" 
                        type="number" 
                        min={1} 
                        required 
                        value={formData.quantityBags || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantityBags: Number(e.target.value) || 0 }))}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Bag Weight (kg) <span className="text-red-500">*</span></label>
                      <Input 
                        name="bagWeight" 
                        type="number" 
                        min={1} 
                        step="0.1" 
                        required 
                        value={formData.bagWeight || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, bagWeight: Number(e.target.value) || 0 }))}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
                        placeholder="50" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Price (₹ per bag) <span className="text-red-500">*</span></label>
                      <Input 
                        name="purchasePrice" 
                        type="number" 
                        min={0} 
                        step="0.01" 
                        required 
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
                        placeholder="Enter purchase price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Selling Price (₹ per bag) <span className="text-red-500">*</span></label>
                      <Input 
                        name="sellingPrice" 
                        type="number" 
                        min={0.01} 
                        step="0.01" 
                        required 
                        value={formData.sellingPrice || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: Number(e.target.value) || 0 }))}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
                        placeholder="Enter selling price"
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <div className="flex gap-3 w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditing(null);
                        setIsAddDialogOpen(false);
                        setFormData({
                          name: "",
                          type: "",
                          quantityBags: 0,
                          bagWeight: 50,
                          purchasePrice: 0,
                          sellingPrice: 0,
                        });
                      }}
                      className="flex-1 h-11 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    >
                      <Package className="size-4 mr-2" />
                      {editing?.id ? "Update Feed" : "Add Feed"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={()=>window.print()} className="gap-2">
            <Package className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-blue-100">
              <Package className="size-6 text-green-600" />
            </div>
            Stock Summary
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Total items: {stock.length} • Low stock threshold: {LOW_STOCK_THRESHOLD} bags • 
            Total weight: {(stock.reduce((a,s)=>a+(s.quantityBags * s.bagWeight),0)/1000).toFixed(1)} tons
          </CardDescription>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <CompactDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                startPlaceholder="Start date"
                endPlaceholder="End date"
                showDayName={true}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateStockPDF}
              className="gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-green-100 to-blue-100 border-b-2 border-green-200">
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[180px]">Feed Name</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[120px]">Type</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[120px]">Quantity</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[120px]">Bag Weight</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[140px]">Purchase Price</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[140px]">Selling Price</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[160px]">Last Updated</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[120px]">Updated By</TableHead>
                  <TableHead className="font-bold text-green-800 text-center py-4 w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <LoadingState message="Loading stock items..." />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <EmptyState
                        title="No stock items found"
                        description="No stock items match your current search criteria or the inventory is empty."
                        icon={Package}
                        action={
                          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                            <Plus className="size-4" />
                            Add Stock Item
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s, index)=> {
                    const isLowStock = s.quantityBags < LOW_STOCK_THRESHOLD;
                    return (
                      <TableRow 
                        key={s.id} 
                        className={`hover:bg-green-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-green-25/30'
                        } border-b border-gray-100 ${isLowStock ? 'bg-red-50/50' : ''}`}
                      >
                        <TableCell className="text-center py-4 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                            <span className="font-semibold text-gray-800 truncate">{s.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 w-full">
                            {s.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold border w-full ${
                            isLowStock 
                              ? 'bg-red-100 text-red-800 border-red-200' 
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {s.quantityBags} bags
                            {isLowStock && <AlertTriangle className="inline size-3 ml-1 flex-shrink-0" />}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200 w-full">
                            {s.bagWeight} kg
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 w-full">
                            ₹{s.purchasePrice.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 w-full">
                            ₹{s.sellingPrice.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">
                              {s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {s.lastUpdated ? new Date(s.lastUpdated).toLocaleTimeString('en-IN') : 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 w-full">
                            {s.updatedBy || 'System'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={()=>setEditing(s)} 
                              className="gap-1 px-2 py-1.5 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md min-w-[60px]"
                            >
                              <Edit className="size-3" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="gap-1 px-2 py-1.5 text-xs hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md min-w-[70px]"
                              onClick={() => {
                                setRestockItem(s);
                                setIsRestockDialogOpen(true);
                              }}
                            >
                              <RotateCcw className="size-3" />
                              Restock
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="size-5" />
              Restock {restockItem?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestock} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Add bags</label>
              <Input name="add" type="number" min={1} required defaultValue={1} />
              <p className="text-xs text-muted-foreground mt-1">
                Current stock: {restockItem?.quantityBags} bags
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" className="gap-2">
                <RotateCcw className="size-4" />
                Update Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
