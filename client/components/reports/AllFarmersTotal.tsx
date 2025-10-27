import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompactDateRangePicker } from "@/components/ui/compact-date-picker";
import { Download, Users, TrendingUp, Calculator, AlertCircle } from "lucide-react";
import { reportApi } from "@/lib/api";

interface FarmerTotalData {
  serialNumber: number;
  farmerName: string;
  dairyCode: string;
  totalFeedCost: string | number; // Backend returns as string
  farmerId: number;
}

interface AllFarmersTotalResponse {
  success: boolean;
  farmers: FarmerTotalData[];
  grandTotal: number;
  totalFarmers: number;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

export default function AllFarmersTotal() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<AllFarmersTotalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAllFarmersTotal = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format dates in local timezone to avoid timezone shift issues
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      const response = await reportApi.getAllFarmersTotal({
        startDate: startDateStr,
        endDate: endDateStr
      });

      // The API returns the data directly in the response
      setReportData(response as AllFarmersTotalResponse);

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
          <title>All Farmers Total Report - PARAS</title>
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

              .grand-total-row {
                  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%) !important;
                  font-weight: bold;
                  border-top: 3px solid #2d7a3e;
              }

              .grand-total-row td {
                  font-size: 14px;
                  padding: 15px 8px;
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
                  <h1 class="company-name">PARAS</h1>
                  <div class="divider"></div>
                  <div class="report-title">All Farmers Total Report</div>
                  <div class="report-info">
                      <div class="report-period">Report Period: ${rangeLabel}</div>
                  </div>
              </div>

              <div class="summary-cards">
                  <div class="summary-card">
                      <h3>Total Farmers</h3>
                      <div class="value">${reportData.totalFarmers}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Grand Total</h3>
                      <div class="value">₹${reportData.grandTotal.toLocaleString()}</div>
                  </div>
              </div>

              <div class="content-area">
                  <div class="table-container">
                      <table>
                          <thead>
                              <tr>
                                  <th>Serial Number</th>
                                  <th>Farmer's Name</th>
                                  <th>Dairy Code</th>
                                  <th>Total Feed Cost</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${reportData.farmers.map((farmer) => `
                                  <tr>
                                      <td><span class="badge badge-blue">${farmer.serialNumber}</span></td>
                                      <td>${farmer.farmerName}</td>
                                      <td><span class="badge badge-purple">${farmer.dairyCode}</span></td>
                                      <td><span class="badge badge-green">₹${Number(farmer.totalFeedCost).toLocaleString()}</span></td>
                                  </tr>
                              `).join('')}
                              <tr class="grand-total-row">
                                  <td colspan="3"><strong>GRAND TOTAL</strong></td>
                                  <td><strong>₹${reportData.grandTotal.toLocaleString()}</strong></td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>

              <div class="footer">
                  <p>Generated on ${new Date().toLocaleDateString('en-IN')} | PARAS Management System</p>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">All Farmers Total</h1>
          <p className="text-muted-foreground">Comprehensive report showing total feed costs for all farmers within selected date range</p>
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
          <CardDescription>Select date range to analyze farmers' total feed costs</CardDescription>
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
              onClick={fetchAllFarmersTotal} 
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
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 flex items-center gap-2">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Total Farmers
              </CardDescription>
              <CardTitle className="text-3xl">{reportData.totalFarmers}</CardTitle>
              <p className="text-xs text-muted-foreground">Active farmers</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                Grand Total
              </CardDescription>
              <CardTitle className="text-3xl">₹{reportData.grandTotal.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground">Total feed costs</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Average Cost
              </CardDescription>
              <CardTitle className="text-3xl">₹{reportData.totalFarmers > 0 ? Math.round(reportData.grandTotal / reportData.totalFarmers).toLocaleString() : '0'}</CardTitle>
              <p className="text-xs text-muted-foreground">Per farmer</p>
            </CardHeader>
          </Card>
          <Card className="border-primary/10">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                Period
              </CardDescription>
              <CardTitle className="text-lg">{rangeLabel}</CardTitle>
              <p className="text-xs text-muted-foreground">Date range</p>
            </CardHeader>
          </Card>
        </section>
      )}

      {/* All Farmers Total Table */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>All Farmers Total Feed Cost</CardTitle>
            <CardDescription>
              Period: {rangeLabel} • {reportData.totalFarmers} farmers • Grand Total: ₹{reportData.grandTotal.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200">
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[120px]">Serial Number</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[200px]">Farmer's Name</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[150px]">Dairy Code</TableHead>
                    <TableHead className="font-bold text-blue-800 text-center py-4 px-3 min-w-[180px]">Total Feed Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.farmers.map((farmer, index) => (
                    <TableRow 
                      key={farmer.farmerId} 
                      className={`hover:bg-blue-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-blue-25/30'
                      } border-b border-gray-100`}
                    >
                      <TableCell className="text-center py-4 px-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {farmer.serialNumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-4 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-semibold text-gray-800">{farmer.farmerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4 px-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {farmer.dairyCode}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-4 px-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                          ₹{Number(farmer.totalFeedCost).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Grand Total Row */}
                  <TableRow className="bg-gradient-to-r from-green-100 to-emerald-100 border-t-4 border-green-300 font-bold">
                    <TableCell className="text-center py-6 px-3" colSpan={3}>
                      <div className="flex items-center justify-center gap-2">
                        <Calculator className="size-5 text-green-700" />
                        <span className="text-lg text-green-800">GRAND TOTAL</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-6 px-3">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold bg-green-200 text-green-900 border-2 border-green-300">
                        ₹{reportData.grandTotal.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
