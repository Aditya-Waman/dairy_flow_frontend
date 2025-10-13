import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { CompactDateRangePicker } from "@/components/ui/compact-date-picker";
import { Download, FileText, TrendingUp, Users, Package } from "lucide-react";

export default function Reports() {
  const { farmers, stock, requests, admins } = useData() as any;
  const { user } = useAuth();
  const [farmerId, setFarmerId] = useState<string>("");
  const [adminId, setAdminId] = useState<string>("");
  const month = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(month.getFullYear(), month.getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const from = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0) : undefined;
  const to = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999) : undefined;
  const rangeLabel = from && to ? `${from.toLocaleDateString()} – ${to.toLocaleDateString()}` : from ? `${from.toLocaleDateString()}` : "All";

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (r.status !== "Approved" || !r.approvedAt) return false;
      const d = new Date(r.approvedAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      // Handle populated farmerId object
      const requestFarmerId = typeof r.farmerId === 'object' ? r.farmerId.id : r.farmerId;
      if (farmerId && requestFarmerId !== farmerId) return false;
      if (adminId && r.approvedBy !== admins.find((a:any)=>a.id===adminId)?.name) return false;
      return true;
    });
  }, [requests, from, to, farmerId, adminId, admins]);

  const totals = useMemo(() => {
    let qty = 0, revenue = 0, cost = 0;
    for (const r of filteredRequests) {
      // Handle populated feedId object
      const feed = typeof r.feedId === 'object' ? r.feedId : stock.find((s)=>s.id===r.feedId);
      if (!feed) continue;
      qty += r.qtyBags;
      revenue += r.qtyBags * feed.sellingPrice;
      cost += r.qtyBags * feed.purchasePrice;
    }
    return { qty, revenue, cost, profit: revenue - cost };
  }, [filteredRequests, stock]);

  // Farmer-wise summary with detailed feed breakdown
  const farmerSummary = useMemo(() => {
    const farmerMap: Record<string, {
      farmer: any;
      totalBags: number;
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      feeds: Array<{
        feedName: string;
        bags: number;
        revenue: number;
        cost: number;
        profit: number;
        lastApproved: string;
        approvedBy: string;
      }>;
    }> = {};

    filteredRequests.forEach((r) => {
      // Handle populated farmerId and feedId objects
      const farmer = typeof r.farmerId === 'object' ? r.farmerId : farmers.find((f: any) => f.id === r.farmerId);
      const feed = typeof r.feedId === 'object' ? r.feedId : stock.find((s: any) => s.id === r.feedId);
      if (!farmer || !feed) return;

      if (!farmerMap[farmer.id]) {
        farmerMap[farmer.id] = {
          farmer,
          totalBags: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          feeds: []
        };
      }

      const feedIndex = farmerMap[farmer.id].feeds.findIndex(f => f.feedName === feed.name);
      if (feedIndex >= 0) {
        farmerMap[farmer.id].feeds[feedIndex].bags += r.qtyBags;
        farmerMap[farmer.id].feeds[feedIndex].revenue += r.qtyBags * feed.sellingPrice;
        farmerMap[farmer.id].feeds[feedIndex].cost += r.qtyBags * feed.purchasePrice;
        farmerMap[farmer.id].feeds[feedIndex].profit += r.qtyBags * (feed.sellingPrice - feed.purchasePrice);
        if (r.approvedAt && new Date(r.approvedAt) > new Date(farmerMap[farmer.id].feeds[feedIndex].lastApproved)) {
          farmerMap[farmer.id].feeds[feedIndex].lastApproved = r.approvedAt;
          farmerMap[farmer.id].feeds[feedIndex].approvedBy = r.approvedBy || '';
        }
      } else {
        farmerMap[farmer.id].feeds.push({
          feedName: feed.name,
          bags: r.qtyBags,
          revenue: r.qtyBags * feed.sellingPrice,
          cost: r.qtyBags * feed.purchasePrice,
          profit: r.qtyBags * (feed.sellingPrice - feed.purchasePrice),
          lastApproved: r.approvedAt || '',
          approvedBy: r.approvedBy || ''
        });
      }

      farmerMap[farmer.id].totalBags += r.qtyBags;
      farmerMap[farmer.id].totalRevenue += r.qtyBags * feed.sellingPrice;
      farmerMap[farmer.id].totalCost += r.qtyBags * feed.purchasePrice;
      farmerMap[farmer.id].totalProfit += r.qtyBags * (feed.sellingPrice - feed.purchasePrice);
    });

    return Object.values(farmerMap).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [filteredRequests, farmers, stock]);

  const printRef = useRef<HTMLDivElement>(null);
  function onPrint() {
    window.print();
  }

  // PDF generation function for transaction details
  const generateTransactionPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paras Dairy - Transaction Details Report</title>
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
                  <div class="report-title">Transaction Details Report</div>
                  <div class="report-info">
                      <div class="report-period">Report Period: ${from && to ? `${from.toLocaleDateString('en-IN')} - ${to.toLocaleDateString('en-IN')}` : 'All Time'}</div>
                  </div>
              </div>

              <div class="content-area">
                  <div class="table-container">
                      <table>
                          <thead>
                              <tr>
                                  <th>Farmer Name</th>
                                  <th>Dairy Code</th>
                                  <th>Feed Name</th>
                                  <th>Selling Price</th>
                                  <th>Quantity</th>
                                  <th>Total Price</th>
                                  <th>Approved By</th>
                                  <th>Approved At</th>
                                  <th>Total Profit</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${filteredRequests.map((r:any) => {
                                const f = typeof r.farmerId === 'object' ? r.farmerId : farmers.find((x:any)=>x.id===r.farmerId);
                                const s = typeof r.feedId === 'object' ? r.feedId : stock.find((x:any)=>x.id===r.feedId);
                                const totalPrice = (s?.sellingPrice || 0) * r.qtyBags;
                                const totalProfit = ((s?.sellingPrice || 0) - (s?.purchasePrice || 0)) * r.qtyBags;
                                return `
                                  <tr>
                                      <td>${f?.fullName || 'N/A'}</td>
                                      <td><span class="badge badge-blue">${f?.code || 'N/A'}</span></td>
                                      <td>${s?.name || 'Unknown Feed'}</td>
                                      <td><span class="badge badge-green">₹${s?.sellingPrice || 0}</span></td>
                                      <td><span class="badge badge-purple">${r.qtyBags} bags</span></td>
                                      <td><span class="badge badge-yellow">₹${totalPrice.toLocaleString()}</span></td>
                                      <td><span class="badge badge-indigo">${r.approvedBy || 'System'}</span></td>
                                      <td>${new Date(r.approvedAt!).toLocaleString('en-IN')}</td>
                                      <td><span class="badge ${totalProfit >= 0 ? 'badge-emerald' : 'badge-red'}">₹${totalProfit.toLocaleString()}</span></td>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive farmer-wise reports with detailed feed analysis and profit calculations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrint} className="gap-2">
            <Download className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Active Farmers
            </CardDescription>
            <CardTitle className="text-3xl">{farmerSummary.length}</CardTitle>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardHeader>
        </Card>
        <Card className="border-primary/10">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Package className="size-4 text-primary" />
              Total Bags
            </CardDescription>
            <CardTitle className="text-3xl">{totals.qty}</CardTitle>
            <p className="text-xs text-muted-foreground">Feed bags sold</p>
          </CardHeader>
        </Card>
        <Card className="border-primary/10">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl">₹{totals.revenue.toLocaleString()}</CardTitle>
            <p className="text-xs text-muted-foreground">From all sales</p>
          </CardHeader>
        </Card>
        <Card className="border-primary/10">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Total Profit
            </CardDescription>
            <CardTitle className="text-3xl">₹{totals.profit.toLocaleString()}</CardTitle>
            <p className="text-xs text-muted-foreground">Net profit margin</p>
          </CardHeader>
        </Card>
      </section>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Filter data by farmer, admin, and date range for detailed analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <select value={farmerId} onChange={(e)=>setFarmerId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Farmers</option>
              {farmers.map((f:any)=> (<option key={f.id} value={f.id}>{f.fullName} ({f.code})</option>))}
            </select>
            <select value={adminId} onChange={(e)=>setAdminId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Admins</option>
              {admins?.map((a:any)=> (<option key={a.id} value={a.id}>{a.name}</option>))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1">
              <CompactDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                startPlaceholder="From"
                endPlaceholder="To"
              />
            </div>
            <Button variant="outline" onClick={() => {
              setFarmerId("");
              setAdminId("");
              setStartDate(new Date(month.getFullYear(), month.getMonth(), 1));
              setEndDate(new Date());
            }} className="gap-2 shrink-0">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Farmer-wise Detailed Report */}
      <div ref={printRef}>
        <Card>
          <CardHeader>
            <CardTitle>Farmer-wise Detailed Report</CardTitle>
            <CardDescription>
              Period: {rangeLabel} • {farmerSummary.length} farmers • {filteredRequests.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {farmerSummary.map((farmerData, index) => (
                <Card key={farmerData.farmer.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">{farmerData.farmer.fullName}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">Dairy Code: {farmerData.farmer.code}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">₹{farmerData.totalProfit.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total Profit</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {farmerData.feeds.map((feed, feedIndex) => (
                        <div key={feedIndex} className="p-3 rounded-lg border bg-muted/30 dark:bg-muted/10">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{feed.feedName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {feed.lastApproved ? new Date(feed.lastApproved).toLocaleString('en-IN', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                }) : 'Date not available'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-primary">₹{feed.profit.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Profit</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Bags:</span>
                              <span className="ml-1 font-semibold">{feed.bags}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="ml-1 font-semibold">₹{feed.revenue.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Approved by:</span>
                              <span className="ml-1 font-semibold">{feed.approvedBy || 'System'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card className="mt-6 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="size-5 text-blue-600" />
                  </div>
                  Transaction Details
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Complete list of approved requests in selected period</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => generateTransactionPDF()}
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
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
                  <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200">
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[140px]">Farmer Name</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[100px]">Dairy Code</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[120px]">Feed Name</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[110px]">Selling Price</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[100px]">Quantity</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[120px]">Total Price</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[120px]">Approved By</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[140px]">Approved At</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[120px]">Total Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((r:any, index:number)=>{
                    // Use populated data directly from the request
                    const f = typeof r.farmerId === 'object' ? r.farmerId : farmers.find((x:any)=>x.id===r.farmerId);
                    const s = typeof r.feedId === 'object' ? r.feedId : stock.find((x:any)=>x.id===r.feedId);
                    const totalPrice = (s?.sellingPrice || 0) * r.qtyBags;
                    const totalProfit = ((s?.sellingPrice || 0) - (s?.purchasePrice || 0)) * r.qtyBags;
                    
                    return (
                      <TableRow 
                        key={r.id} 
                        className={`hover:bg-blue-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-blue-25/30'
                        } border-b border-gray-100`}
                      >
                        <TableCell className="text-center py-4 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-semibold text-gray-800">{f?.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {f?.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className="font-medium text-gray-800">{s?.name}</span>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                            ₹{s?.sellingPrice || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            {r.qtyBags} bags
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            ₹{totalPrice.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {r.approvedBy}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">
                              {new Date(r.approvedAt!).toLocaleDateString('en-IN')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(r.approvedAt!).toLocaleTimeString('en-IN')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4 px-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                            totalProfit >= 0 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            ₹{totalProfit.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
