import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompactDateRangePicker } from "@/components/ui/compact-date-picker";
import { Download, Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { reportApi } from "@/lib/api";

interface FeedStockData {
  feedId: number;
  feedName: string;
  feedType: string;
  totalOrdered: number;
  totalSold: number;
  remainingStock: number;
  currentPrice: string;
  purchasePrice: string;
  bagWeight: string;
  lastUpdated: string;
}

interface FeedStockSummary {
  totalFeeds: number;
  totalOrdered: number;
  totalSold: number;
  totalRemaining: number;
  totalValue: number;
}

interface FeedStockReportResponse {
  success: boolean;
  summary: FeedStockSummary;
  feedStockReport: FeedStockData[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

export default function FeedStockReport() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<FeedStockReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedStockReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await reportApi.getFeedStockReport({
        startDate: startDateStr,
        endDate: endDateStr
      });

      // The API returns the data directly in the response
      setReportData(response as FeedStockReportResponse);

    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the report');
    } finally {
      setLoading(false);
    }
  };

  const rangeLabel = useMemo(() => {
    if (!startDate || !endDate) return "Select Date Range";
    return `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
  }, [startDate, endDate]);

  const generatePDF = () => {
    if (!reportData) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Feed Stock Report - DairyFlow</title>
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

              .summary-cards {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 20px;
                  margin: 30px 0;
                  padding: 0 20px;
              }

              .summary-card {
                  background: linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%);
                  border: 1px solid #e0e0e0;
                  border-radius: 12px;
                  padding: 20px;
                  text-align: center;
              }

              .summary-card h3 {
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 8px;
                  font-weight: 500;
              }

              .summary-card .value {
                  font-size: 24px;
                  font-weight: bold;
                  color: #2d7a3e;
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
                  <h1 class="company-name">DAIRYFLOW</h1>
                  <div class="divider"></div>
                  <div class="report-title">Feed Stock Report</div>
                  <div class="report-info">
                      <div class="report-period">Report Period: ${rangeLabel}</div>
                  </div>
              </div>

              <div class="summary-cards">
                  <div class="summary-card">
                      <h3>Total Feeds</h3>
                      <div class="value">${reportData.summary.totalFeeds}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Total Ordered</h3>
                      <div class="value">${reportData.summary.totalOrdered.toLocaleString()}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Total Sold</h3>
                      <div class="value">${reportData.summary.totalSold.toLocaleString()}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Remaining Stock</h3>
                      <div class="value">${reportData.summary.totalRemaining.toLocaleString()}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Total Value</h3>
                      <div class="value">₹${reportData.summary.totalValue.toLocaleString()}</div>
                  </div>
              </div>

              <div class="content-area">
                  <div class="table-container">
                      <table>
                          <thead>
                              <tr>
                                  <th>Feed Name</th>
                                  <th>Type</th>
                                  <th>Total Ordered</th>
                                  <th>Total Sold</th>
                                  <th>Remaining Stock</th>
                                  <th>Current Price</th>
                                  <th>Stock Value</th>
                                  <th>Status</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${reportData.feedStockReport.map((feed) => {
                                const currentPrice = parseFloat(feed.currentPrice) || 0;
                                const stockValue = feed.remainingStock * currentPrice;
                                const isLowStock = feed.remainingStock < 10;
                                const statusClass = isLowStock ? 'badge-red' : 'badge-green';
                                const statusText = isLowStock ? 'Low Stock' : 'In Stock';
                                
                                return `
                                  <tr>
                                      <td><span class="badge badge-blue">${feed.feedName}</span></td>
                                      <td>${feed.feedType}</td>
                                      <td><span class="badge badge-purple">${feed.totalOrdered} bags</span></td>
                                      <td><span class="badge badge-yellow">${feed.totalSold} bags</span></td>
                                      <td><span class="badge badge-green">${feed.remainingStock} bags</span></td>
                                      <td>₹${feed.currentPrice}</td>
                                      <td>₹${stockValue.toLocaleString()}</td>
                                      <td><span class="badge ${statusClass}">${statusText}</span></td>
                                  </tr>
                                `;
                              }).join('')}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div class="footer">
                  <p>Generated on ${new Date().toLocaleDateString('en-IN')} | DairyFlow Management System</p>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Feed Stock Report</h1>
          <p className="text-muted-foreground">Comprehensive feed inventory analysis with date range filtering</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generatePDF} 
            className="gap-2"
            disabled={!reportData}
          >
            <Download className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select date range to analyze feed stock movements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1">
              <CompactDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                startPlaceholder="Start Date"
                endPlaceholder="End Date"
              />
            </div>
            <Button 
              onClick={fetchFeedStockReport} 
              className="gap-2 shrink-0"
              disabled={loading || !startDate || !endDate}
            >
              {loading ? "Loading..." : "Show Report"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                setEndDate(new Date());
                setReportData(null);
                setError(null);
              }} 
              className="gap-2 shrink-0"
            >
              Clear
            </Button>
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Total Feeds
              </CardDescription>
              <CardTitle className="text-3xl">{reportData.summary.totalFeeds}</CardTitle>
              <p className="text-xs text-muted-foreground">Feed types</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Total Ordered
              </CardDescription>
              <CardTitle className="text-3xl">{reportData.summary.totalOrdered.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground">Bags in period</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Total Sold
              </CardDescription>
              <CardTitle className="text-3xl">{reportData.summary.totalSold.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground">Bags sold</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="size-4 text-primary" />
                Remaining Stock
              </CardDescription>
              <CardTitle className="text-3xl">{reportData.summary.totalRemaining.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground">Bags in stock</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Total Value
              </CardDescription>
              <CardTitle className="text-3xl">₹{reportData.summary.totalValue.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground">Stock value</p>
            </CardHeader>
          </Card>
        </section>
      )}

      {/* Feed Stock Report Table */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Feed Stock Details</CardTitle>
            <CardDescription>
              Period: {rangeLabel} • {reportData.summary.totalFeeds} feed types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Ordered</TableHead>
                    <TableHead>Total Sold</TableHead>
                    <TableHead>Remaining Stock</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.feedStockReport.map((feed) => {
                    const currentPrice = parseFloat(feed.currentPrice) || 0;
                    const stockValue = feed.remainingStock * currentPrice;
                    const isLowStock = feed.remainingStock < 10;
                    
                    return (
                      <TableRow key={feed.feedId}>
                        <TableCell className="font-medium">{feed.feedName}</TableCell>
                        <TableCell>{feed.feedType}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                            {feed.totalOrdered} bags
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                            {feed.totalSold} bags
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {feed.remainingStock} bags
                          </span>
                        </TableCell>
                        <TableCell>₹{feed.currentPrice}</TableCell>
                        <TableCell>₹{stockValue.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${
                            isLowStock 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isLowStock ? (
                              <>
                                <AlertTriangle className="size-3 mr-1" />
                                Low Stock
                              </>
                            ) : (
                              <>
                                <CheckCircle className="size-3 mr-1" />
                                In Stock
                              </>
                            )}
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
      )}
    </div>
  );
}
