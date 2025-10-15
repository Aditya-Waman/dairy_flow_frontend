import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { CompactDateRangePicker } from "@/components/ui/compact-date-picker";
import { Calendar as CalendarIcon, Users, UserX, Clock, Package, TrendingUp, DollarSign, FileText, Leaf, Download } from "lucide-react";

export default function AdminDashboard() {
  const { farmers, stock, requests, admins } = useData();
  const navigate = useNavigate();
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
  const todayApproved = requests.filter(r=>r.status==="Approved" && r.approvedAt && new Date(r.approvedAt) >= todayStart && new Date(r.approvedAt) <= todayEnd);
  const todayTotals = todayApproved.reduce((acc, r)=>{
    // Handle populated feedId object
    const feed = typeof r.feedId === 'object' ? r.feedId : stock.find(s=>s.id===r.feedId);
    if (!feed) return acc;
    acc.qty += r.qtyBags;
    // Use historical prices for approved requests
    const purchasePrice = r.purchasePriceAtApproval || feed.purchasePrice;
    const sellingPrice = r.sellingPriceAtApproval || feed.sellingPrice;
    acc.revenue += r.qtyBags * sellingPrice;
    acc.cost += r.qtyBags * purchasePrice;
    return acc;
  }, { qty:0, revenue:0, cost:0 });
  const todayProfit = todayTotals.revenue - todayTotals.cost;

  // Range summary
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const from = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0,0,0,0) : undefined;
  const to = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23,59,59,999) : undefined;
  const rangeLabel = from && to ? `${from.toLocaleDateString()} – ${to.toLocaleDateString()}` : "Select dates";
  const approvedInRange = requests.filter(r=>r.status==="Approved" && r.approvedAt && (!from || new Date(r.approvedAt)>=from) && (!to || new Date(r.approvedAt)<=to));
  const totals = approvedInRange.reduce((acc, r)=>{
    // Handle populated feedId object
    const feed = typeof r.feedId === 'object' ? r.feedId : stock.find(s=>s.id===r.feedId);
    if (!feed) return acc;
    acc.qty += r.qtyBags;
    // Use historical prices for approved requests
    const purchasePrice = r.purchasePriceAtApproval || feed.purchasePrice;
    const sellingPrice = r.sellingPriceAtApproval || feed.sellingPrice;
    acc.revenue += r.qtyBags * sellingPrice;
    acc.cost += r.qtyBags * purchasePrice;
    return acc;
  }, { qty:0, revenue:0, cost:0 });
  const profit = totals.revenue - totals.cost;

  // PDF generation function for individual farmer reports
  const generateFarmerPDF = (farmerData: any) => {
    const farmerRequests = approvedInRange.filter((r) => {
      const f = typeof r.farmerId === 'object' ? r.farmerId : farmers.find((x) => x.id === r.farmerId);
      return f?.id === farmerData.farmer.id;
    });

    // Calculate total amount for this farmer using historical prices
    const farmerTotal = farmerRequests.reduce((total, r) => {
      const s = typeof r.feedId === 'object' ? r.feedId : stock.find((x) => x.id === r.feedId);
      const sellingPrice = r.sellingPriceAtApproval || s?.sellingPrice || 0;
      return total + (sellingPrice * r.qtyBags);
    }, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paras Dairy - ${farmerData.farmer.fullName} Report</title>
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
                  max-width: 800px;
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

              .farmer-info {
                  margin-top: 20px;
                  padding: 15px 25px;
                  display: inline-block;
                  background: rgba(45, 122, 62, 0.05);
                  border-radius: 25px;
                  border: 1px solid rgba(45, 122, 62, 0.2);
              }

              .farmer-name {
                  font-size: 18px;
                  color: #333;
                  font-weight: 600;
                  margin-bottom: 5px;
              }

              .farmer-code {
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

              .report-section {
                  margin-bottom: 30px;
              }

              .section-title {
                  font-size: 18px;
                  font-weight: 600;
                  color: #2d7a3e;
                  margin-bottom: 15px;
                  border-bottom: 2px solid #4caf50;
                  padding-bottom: 5px;
              }

              .request-item {
                  background: #f8f9fa;
                  border: 1px solid #e9ecef;
                  border-radius: 8px;
                  padding: 15px;
                  margin-bottom: 10px;
              }

              .request-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 10px;
              }

              .feed-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
              }

              .feed-rate {
                  font-size: 14px;
                  color: #666;
                  background: #e3f2fd;
                  padding: 4px 8px;
                  border-radius: 4px;
              }

              .request-details {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 15px;
                  font-size: 14px;
              }

              .detail-item {
                  display: flex;
                  justify-content: space-between;
              }

              .detail-label {
                  color: #666;
                  font-weight: 500;
              }

              .detail-value {
                  color: #333;
                  font-weight: 600;
              }

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
                  <div class="report-title">Farmer Feed Request Report</div>
                  <div class="farmer-info">
                      <div class="farmer-name">${farmerData.farmer.fullName}</div>
                      <div class="farmer-code">Dairy Code: ${farmerData.farmer.code}</div>
                      <div class="farmer-code" style="margin-top: 8px; font-size: 12px; color: #666;">
                        Report Period: ${from && to ? `${from.toLocaleDateString('en-IN')} - ${to.toLocaleDateString('en-IN')}` : 'All Time'}
                      </div>
                  </div>
              </div>

              <div class="content-area">
                  <div class="report-section">
                      <div class="section-title">Feed Request Details</div>
                      ${farmerRequests.map((r) => {
                        const s = typeof r.feedId === 'object' ? r.feedId : stock.find((x) => x.id === r.feedId);
                        // Use historical prices for approved requests
                        const sellingPrice = r.sellingPriceAtApproval || s?.sellingPrice || 0;
                        return `
                          <div class="request-item">
                              <div class="request-header">
                                  <div class="feed-name">${s?.name || 'Unknown Feed'}</div>
                                  <div class="feed-rate">Rate: ₹${sellingPrice}/bag</div>
                              </div>
                              <div class="request-details">
                                  <div class="detail-item">
                                      <span class="detail-label">Quantity:</span>
                                      <span class="detail-value">${r.qtyBags} bags</span>
                                  </div>
                                  <div class="detail-item">
                                      <span class="detail-label">Feed Rate:</span>
                                      <span class="detail-value">₹${sellingPrice}/bag</span>
                                  </div>
                                  <div class="detail-item">
                                      <span class="detail-label">Total Bill:</span>
                                      <span class="detail-value">₹${(sellingPrice * r.qtyBags).toLocaleString()}</span>
                                  </div>
                                  <div class="detail-item">
                                      <span class="detail-label">Approval Date:</span>
                                      <span class="detail-value">${r.approvedAt ? new Date(r.approvedAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                                  </div>
                                  <div class="detail-item">
                                      <span class="detail-label">Approval Time:</span>
                                      <span class="detail-value">${r.approvedAt ? new Date(r.approvedAt).toLocaleTimeString('en-IN') : 'N/A'}</span>
                                  </div>
                                  <div class="detail-item">
                                      <span class="detail-label">Approved By:</span>
                                      <span class="detail-value">${r.approvedBy || 'System'}</span>
                                  </div>
                              </div>
                          </div>
                        `;
                      }).join('')}
                  </div>
                  
                  <div class="report-section" style="margin-top: 30px;">
                      <div class="section-title">Summary</div>
                      <div class="request-item" style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border: 2px solid #2196f3;">
                          <div class="request-header">
                              <div class="feed-name" style="color: #1976d2; font-size: 18px;">Total Amount Spent on Feed</div>
                              <div class="feed-rate" style="background: #1976d2; color: white; font-size: 16px; font-weight: bold;">
                                  ₹${farmerTotal.toLocaleString()}
                              </div>
                          </div>
                      </div>
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="p-2 rounded-lg bg-primary/10 animate-bounce-subtle">
          <Users className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage farmers, stock, and feed requests with comprehensive analytics</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-white hover-lift animate-scale-in">
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 mb-2">
              <div className="p-1.5 rounded-md bg-green-100 transition-smooth">
                <Users className="size-3" />
              </div>
              Active Farmers
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-1">{farmers.filter(f=>f.status==="Active").length}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-white hover-lift animate-scale-in" style={{animationDelay: '0.1s'}}>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
              <div className="p-1.5 rounded-md bg-gray-100 transition-smooth">
                <UserX className="size-3" />
              </div>
              Inactive Farmers
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-1">{farmers.filter(f=>f.status!=="Active").length}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Suspended accounts</p>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-white hover-lift animate-scale-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 mb-2">
              <div className="p-1.5 rounded-md bg-orange-100 transition-smooth">
                <Clock className="size-3" />
              </div>
              Pending Requests
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-1">{requests.filter(r=>r.status==="Pending").length}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-white hover-lift animate-scale-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 mb-2">
              <div className="p-1.5 rounded-md bg-blue-100 transition-smooth">
                <Package className="size-3" />
              </div>
              Stock Available
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-1">{stock.reduce((a,s)=>a+s.quantityBags,0)}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Total bags in stock</p>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-white hover-lift animate-scale-in" style={{animationDelay: '0.4s'}}>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 mb-2">
              <div className="p-1.5 rounded-md bg-purple-100 transition-smooth">
                <Users className="size-3" />
              </div>
              Admins
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-1">{admins?.length || 0}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">System administrators</p>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-white hover-lift animate-scale-in" style={{animationDelay: '0.5s'}}>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 mb-2">
              <div className="p-1.5 rounded-md bg-emerald-100 transition-smooth">
                <Leaf className="size-3" />
              </div>
              Feed Types
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-1">{stock.length}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Available feeds</p>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 hover-lift animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-xl bg-blue-100 transition-smooth">
                <CalendarIcon className="size-6 text-blue-600" />
              </div>
              Today's Performance
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">{new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/70 rounded-xl border border-blue-100 hover:bg-white/90 transition-colors duration-200">
                <span className="text-sm font-semibold text-gray-700">Bags Sold</span>
                <span className="font-bold text-2xl text-blue-600">{todayTotals.qty}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/70 rounded-xl border border-green-100 hover:bg-white/90 transition-colors duration-200">
                <span className="text-sm font-semibold text-gray-700">Revenue</span>
                <span className="font-bold text-2xl text-green-600">₹{todayTotals.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/70 rounded-xl border border-red-100 hover:bg-white/90 transition-colors duration-200">
                <span className="text-sm font-semibold text-gray-700">Cost</span>
                <span className="font-bold text-2xl text-red-600">₹{todayTotals.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border-2 border-blue-200">
                <span className="text-lg font-bold text-gray-800">Net Profit</span>
                <span className={`font-bold text-3xl ${todayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{todayProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-xl bg-purple-100">
                <FileText className="size-6 text-purple-600" />
              </div>
              Summary (Selected Range)
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Select date range for detailed analysis</CardDescription>
            <div className="mt-6">
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
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between"><span>Bags sold</span><span>{totals.qty}</span></div>
              <div className="flex justify-between"><span>Revenue</span><span>₹{totals.revenue.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Cost</span><span>₹{totals.cost.toLocaleString()}</span></div>
              <div className="flex justify-between font-semibold"><span>Profit</span><span>₹{profit.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end mb-2">
              <Button 
                variant="secondary" 
                onClick={()=>window.print()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
              >
                Export PDF
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Feed</TableHead>
                  <TableHead className="text-right">Bags</TableHead>
                  <TableHead className="text-right">Value (₹)</TableHead>
                  <TableHead>Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedInRange.map((r)=>{
                  // Use populated data directly from the request
                  const f = typeof r.farmerId === 'object' ? r.farmerId : farmers.find(x=>x.id===r.farmerId);
                  const s = typeof r.feedId === 'object' ? r.feedId : stock.find(x=>x.id===r.feedId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.approvedAt!).toLocaleString()}</TableCell>
                      <TableCell>{f?.fullName}</TableCell>
                      <TableCell>{s?.name}</TableCell>
                      <TableCell className="text-right">{r.qtyBags}</TableCell>
                      <TableCell className="text-right">{r.price.toLocaleString()}</TableCell>
                      <TableCell>{r.approvedBy}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl mb-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Users className="size-6 text-green-600" />
              </div>
              Farmers
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium mb-4">Search, filter and manage farmer accounts</CardDescription>
            <div className="flex gap-3">
              <Input placeholder="Search by name / code / mobile" className="flex-1 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500" />
              <Button 
                className="bg-green-600 hover:bg-green-700 h-11 px-6 transition-all duration-200"
                onClick={() => navigate('/farmers')}
              >
                Manage Farmers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {farmers.slice(0, 5).map((f) => (
                  <TableRow key={f.id} className="hover:bg-green-50/50 transition-colors duration-200">
                    <TableCell className="font-semibold">{f.fullName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{f.mobile}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-mono text-xs font-bold">
                        {f.code}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{f.email || '—'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        f.status === "Active" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}>
                        {f.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate('/farmers')}
                          className="hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
                        >
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/requests?farmer=${encodeURIComponent(f.id)}`)}
                          className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        >
                          Request Feed
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {farmers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No farmers found. <Button variant="link" onClick={() => navigate('/farmers')} className="p-0 h-auto">Add your first farmer</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="size-6 text-blue-600" />
              </div>
              Stock Summary
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Current stock levels and last update information</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feed Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total Weight</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((s)=> {
                  const totalWeight = (s.quantityBags * s.bagWeight / 1000).toFixed(2);
                  const isLow = s.quantityBags < 20;
                  const isMedium = s.quantityBags >= 20 && s.quantityBags < 50;
                  return (
                    <TableRow key={s.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <TableCell className="font-semibold">{s.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                          {s.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          isLow
                            ? "bg-red-100 text-red-800 border-red-200" 
                            : isMedium
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}>
                          {s.quantityBags} bags
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">{totalWeight} tons</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                          {s.updatedBy || 'System'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {s.lastUpdated ? new Date(s.lastUpdated).toLocaleString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit'
                        }) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {stock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No stock items found. <Button variant="link" onClick={() => navigate('/stock')} className="p-0 h-auto">Add stock items</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                <FileText className="size-6 text-indigo-600" />
              </div>
              Farmer-wise Feed Request Report
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Detailed feed request history without profit calculations</CardDescription>
            <div className="mt-6">
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Group requests by farmer
                const farmerMap: Record<string, {
                  farmer: any;
                  requests: any[];
                }> = {};

                approvedInRange.forEach((r) => {
                  const f = typeof r.farmerId === 'object' ? r.farmerId : farmers.find((x) => x.id === r.farmerId);
                  if (!f) return;

                  if (!farmerMap[f.id]) {
                    farmerMap[f.id] = {
                      farmer: f,
                      requests: []
                    };
                  }
                  farmerMap[f.id].requests.push(r);
                });

                return Object.values(farmerMap).map((farmerData) => (
                  <Card key={farmerData.farmer.id} className="border-l-4 border-l-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-indigo-50/30">
                    <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-indigo-800">{farmerData.farmer.fullName}</CardTitle>
                          <CardDescription className="text-sm mt-1 text-indigo-600 font-medium">Dairy Code: {farmerData.farmer.code}</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateFarmerPDF(farmerData)}
                          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Download className="size-4" />
                          Download PDF
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-indigo-100 to-purple-100">
                              <TableHead className="font-semibold text-indigo-800">Feed Name</TableHead>
                              <TableHead className="font-semibold text-indigo-800 text-center">Quantity</TableHead>
                              <TableHead className="font-semibold text-indigo-800 text-center">Feed Rate</TableHead>
                              <TableHead className="font-semibold text-indigo-800 text-center">Total Bill</TableHead>
                              <TableHead className="font-semibold text-indigo-800 text-center">Approved Date & Time</TableHead>
                              <TableHead className="font-semibold text-indigo-800 text-center">Approved By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {farmerData.requests.map((r, index) => {
                              const s = typeof r.feedId === 'object' ? r.feedId : stock.find((x) => x.id === r.feedId);
                              // Use historical prices for approved requests
                              const sellingPrice = r.sellingPriceAtApproval || s?.sellingPrice || 0;
                              return (
                                <TableRow key={r.id} className={`hover:bg-indigo-50/50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-25/30'}`}>
                                  <TableCell className="font-semibold text-gray-800">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                      {s?.name || 'Unknown Feed'}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                      {r.qtyBags} bags
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                      ₹{sellingPrice}/bag
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                      ₹{(sellingPrice * r.qtyBags).toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium text-gray-700">
                                        {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString('en-IN') : 'N/A'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {r.approvedAt ? new Date(r.approvedAt).toLocaleTimeString('en-IN') : 'N/A'}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                      {r.approvedBy || 'System'}
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
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
