import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

export default function Requests() {
  const { farmers, stock, requests, createRequest, approveRequest, rejectRequest } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const preselectFarmer = params.get("farmer") || "";
  const [farmerId, setFarmerId] = useState(preselectFarmer);
  const [feedId, setFeedId] = useState("");
  const [qty, setQty] = useState(1);

  const selectedFeed = useMemo(() => stock.find((s) => s.id === feedId), [stock, feedId]);
  const price = selectedFeed ? qty * selectedFeed.sellingPrice : 0;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!farmerId || !feedId || qty <= 0) return;

    // Validate stock availability
    const feed = stock.find(s => s.id === feedId);
    if (!feed) {
      toast({
        title: "Error",
        description: "Selected feed not found",
        variant: "destructive"
      });
      return;
    }

    if (feed.quantityBags < qty) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${feed.quantityBags} bags available for ${feed.name}. You requested ${qty} bags.`,
        variant: "destructive"
      });
      return;
    }

    const req = await createRequest(farmerId, feedId, qty);
    if (req) {
      toast({ title: "Request created", description: `Qty ${qty} bags for ₹${req.price}` });
      setQty(1);
    }
  }

  async function onApprove(id: string) {
    const res = await approveRequest(id);
    if (res.ok) toast({ title: "Request approved" });
    else toast({ title: "Cannot approve", description: (res as { ok: false; error: string }).error });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Feed Requests</h1>
        <p className="text-muted-foreground">Create and approve farmer feed requests (bags). Price auto-calculated.</p>
      </div>

      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            Create Request
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">Select farmer, feed, and quantity; farmer cannot change price.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-3">
            <select value={farmerId} onChange={(e)=>setFarmerId(e.target.value)} required className="h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
              <option value="">Select Farmer</option>
              {farmers.filter(f=>f.status==="Active").map((f)=> (
                <option key={f.id} value={f.id}>{f.fullName} ({f.code})</option>
              ))}
            </select>
            <select value={feedId} onChange={(e)=>setFeedId(e.target.value)} required className="h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
              <option value="">Select Feed</option>
              {stock.map((s)=> (
                <option key={s.id} value={s.id}>{s.name} • {s.quantityBags} bags avail</option>
              ))}
            </select>
            <Input 
              type="number" 
              min={1} 
              max={selectedFeed?.quantityBags || 999}
              value={qty} 
              onChange={(e)=>setQty(Number(e.target.value))} 
              placeholder="Quantity (bags)" 
              className="h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 rounded-xl"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">Price: ₹{price}</div>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 h-11 px-6 transition-all duration-200 rounded-xl"
              >
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="shadow-lg border-l-4 border-l-orange-500 dark:border-l-orange-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Pending Requests
            </CardTitle>
            <CardDescription>Review and approve feed requests from farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.filter(r=>r.status==="Pending").length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">✅</div>
                  <p>No pending requests at the moment</p>
                </div>
              ) : (
                requests.filter(r=>r.status==="Pending").map((r)=> {
                  // Use populated data directly from the request
                  const f = r.farmerId; // This is already populated with farmer data
                  const s = r.feedId;   // This is already populated with stock data
                  return (
                    <div key={r.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200 dark:bg-gray-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                {f?.fullName?.split(' ').map(n => n[0]).join('') || 'F'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{f?.fullName}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Code: {f?.code}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Feed:</span>
                              <p className="font-medium">{s?.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <p className="font-medium">{r.qtyBags} bags</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <p className="font-medium text-green-600">₹{r.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Requested:</span>
                              <p className="font-medium">{new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={()=>rejectRequest(r.id)} className="hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                            Reject
                          </Button>
                          <Button size="sm" onClick={()=>onApprove(r.id)} className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-green-500 dark:border-l-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription>Latest approvals and rejections with complete details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.filter(r=>r.status!=="Pending").slice(0,10).map((r)=>{
                // Use populated data directly from the request
                const f = r.farmerId; // This is already populated with farmer data
                const s = r.feedId;   // This is already populated with stock data
                const isApproved = r.status === "Approved";
                return (
                  <div key={r.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200 dark:bg-gray-800/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <span className={`text-sm font-semibold ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isApproved ? '✓' : '✗'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{f?.fullName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Dairy Code: {f?.code}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                            {r.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Feed Name:</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{s?.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{r.qtyBags} bags</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Price:</span>
                            <p className="font-medium text-green-600 dark:text-green-400">₹{r.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400 ml-4">
                        <div className="mb-2">
                          <span className="text-gray-500 dark:text-gray-400">Approved by:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{r.approvedBy || r.createdBy}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Approved at:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {r.approvedAt ? new Date(r.approvedAt).toLocaleString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : (r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'N/A')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {requests.filter(r=>r.status!=="Pending").length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
