import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useData, Farmer } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataStatus } from "@/components/ui/data-status";
import { LoadingState, EmptyState } from "@/components/ui/error-display";
import { Users, UserPlus, Search, UserCheck, UserX, Edit, Trash2, RotateCcw, X } from "lucide-react";

export default function Farmers() {
  const { 
    farmers, 
    loading, 
    error, 
    lastUpdated,
    addFarmer, 
    updateFarmer, 
    deleteFarmer, 
    toggleFarmerStatus,
    refreshData,
    clearError
  } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [editing, setEditing] = useState<Farmer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return farmers.filter((f) => [f.fullName, f.mobile, f.code, f.email || ''].some((x) => x.toLowerCase().includes(t)));
  }, [farmers, q]);

  // Separate active and inactive BEFORE pagination
  const activeFiltered = filtered.filter((f) => f.status === "Active");
  const inactiveFiltered = filtered.filter((f) => f.status !== "Active");
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = activeFiltered.slice((page - 1) * pageSize, page * pageSize);
  const inactive = inactiveFiltered.slice((page - 1) * pageSize, page * pageSize);

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as any;
    const payload = {
      fullName: form.fullName.value,
      mobile: form.mobile.value,
      code: form.code.value,
      email: form.email.value,
      status: (form.status.value as "Active" | "Inactive") || "Active",
    } as const;
    if (editing && editing.id) {
      updateFarmer(editing.id, payload as any);
    } else {
      addFarmer(payload as any);
    }
    setEditing(null);
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="p-2 rounded-lg bg-primary/10 animate-bounce-subtle">
          <Users className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Farmer Management</h1>
          <p className="text-muted-foreground">Manage farmer accounts, track feed history, and monitor active/inactive status</p>
        </div>
      </div>

      {/* Data Status */}
      <DataStatus
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        onClearError={clearError}
        refreshLabel="Refresh Farmers"
      />

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input 
              placeholder="Search by name, code, or mobile..." 
              value={q} 
              onChange={(e)=>{setQ(e.target.value); setPage(1);}} 
              className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 rounded-xl" 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setEditing(null); setIsDialogOpen(true); }} 
                className="gap-2 bg-green-600 hover:bg-green-700 h-11 px-6 transition-all duration-200 rounded-xl"
              >
                <UserPlus className="size-4" />
                Add Farmer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl shadow-lg bg-white">
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <UserPlus className="size-5 text-green-600" />
                    </div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editing?.id ? "Edit Farmer" : "Add New Farmer"}
                    </DialogTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(null); setIsDialogOpen(false); }}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </DialogHeader>
              <form onSubmit={onSave} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      name="fullName" 
                      required 
                      defaultValue={editing?.fullName||""} 
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 rounded-xl"
                      placeholder="Enter farmer's full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      name="mobile" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      maxLength={10} 
                      required 
                      defaultValue={editing?.mobile||""} 
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 rounded-xl"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Dairy Code <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        name="code" 
                        required 
                        defaultValue={editing?.code||""} 
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 rounded-xl"
                        placeholder="e.g., DK-1023"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <Input 
                        name="email" 
                        type="email"
                        defaultValue={editing?.email||""} 
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 rounded-xl"
                        placeholder="farmer@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Account Status
                    </label>
                    <select 
                      name="status" 
                      defaultValue={editing?.status||"Active"} 
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                    >
                      <option value="Active">🟢 Active - Can request feed</option>
                      <option value="Inactive">🔴 Inactive - Cannot request feed</option>
                    </select>
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <div className="flex gap-3 w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => { setEditing(null); setIsDialogOpen(false); }}
                      className="flex-1 h-11 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    >
                      <UserPlus className="size-4 mr-2" />
                      {editing?.id ? "Update Farmer" : "Save Farmer"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            onClick={()=>window.print()}
            className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-xl"
          >
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <Users className="size-6 text-green-600 dark:text-green-400" />
            </div>
            Farmer List
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">
            Showing {filtered.length} results • {activeFiltered.length} active • {inactiveFiltered.length} inactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <UserCheck className="size-4" />
                Active Farmers ({activeFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="flex items-center gap-2">
                <UserX className="size-4" />
                Inactive Farmers ({inactiveFiltered.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <UserCheck className="size-5" />
                  <span className="font-medium">Active Farmers ({activeFiltered.length})</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">These farmers can request feed and are currently active in the system.</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[130px]">Mobile</TableHead>
                    <TableHead className="w-[110px]">Code</TableHead>
                    <TableHead className="w-[180px]">Email</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="text-right w-[320px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <LoadingState message="Loading farmers..." />
                      </TableCell>
                    </TableRow>
                  ) : active.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <EmptyState
                          title="No active farmers found"
                          description="No farmers match your current search criteria or all farmers are inactive."
                          icon={Users}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    active.map((f)=> (
                      <TableRow key={f.id} className="border-l-4 border-l-green-500 hover:bg-green-50/50 transition-colors duration-200">
                        <TableCell className="font-semibold">{f.fullName}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{f.mobile}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-mono text-xs font-bold">
                            {f.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{f.email || '—'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                            <UserCheck className="size-3" />
                            Active
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => { setEditing(f); setIsDialogOpen(true); }} className="gap-1">
                              <Edit className="size-3" />
                              Edit
                            </Button>
                            <Button size="sm" asChild className="gap-1">
                              <Link to={`/requests?farmer=${encodeURIComponent(f.id)}`}>
                                <UserPlus className="size-3" />
                                Request
                              </Link>
                            </Button>
                            {user?.role === "superadmin" ? (
                              <Button size="sm" variant="destructive" onClick={()=>deleteFarmer(f.id)} className="gap-1">
                                <Trash2 className="size-3" />
                                Delete
                              </Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={()=>toggleFarmerStatus(f.id)} className="gap-1">
                                <UserX className="size-3" />
                                Deactivate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="inactive" className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                  <UserX className="size-5" />
                  <span className="font-medium">Inactive Farmers ({inactiveFiltered.length})</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">These farmers are currently inactive and cannot request feed until reactivated.</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[130px]">Mobile</TableHead>
                    <TableHead className="w-[110px]">Code</TableHead>
                    <TableHead className="w-[180px]">Email</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="text-right w-[320px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <LoadingState message="Loading farmers..." />
                      </TableCell>
                    </TableRow>
                  ) : inactive.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <EmptyState
                          title="No inactive farmers found"
                          description="All farmers are currently active or no farmers match your search criteria."
                          icon={Users}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    inactive.map((f)=> (
                      <TableRow key={f.id} className="border-l-4 border-l-red-500 hover:bg-red-50/30 transition-colors duration-200">
                        <TableCell className="font-semibold opacity-75">{f.fullName}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm opacity-75">{f.mobile}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-mono text-xs font-bold opacity-75">
                            {f.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm opacity-75">{f.email || '—'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            <UserX className="size-3" />
                            Inactive
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => { setEditing(f); setIsDialogOpen(true); }} className="gap-1">
                              <Edit className="size-3" />
                              Edit
                            </Button>
                            <Button size="sm" variant="secondary" onClick={()=>toggleFarmerStatus(f.id)} className="gap-1">
                              <RotateCcw className="size-3" />
                              Reactivate
                            </Button>
                            {user?.role === "superadmin" && (
                              <Button size="sm" variant="destructive" onClick={()=>deleteFarmer(f.id)} className="gap-1">
                                <Trash2 className="size-3" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
          <div className="flex items-center justify-between mt-4 text-sm">
            <div>Page {page} / {totalPages}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>Prev</Button>
              <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={()=>setPage((p)=>Math.min(totalPages,p+1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
