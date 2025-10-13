import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useData, AdminUser } from "@/context/DataContext";
import { Users, X } from "lucide-react";

export default function Admins() {
  const { user } = useAuth();
  const { admins, addAdmin, updateAdmin, deleteAdmin } = useData();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);

  if (user?.role !== "superadmin") {
    return (
      <div className="text-sm text-muted-foreground">Only superadmins can manage admins.</div>
    );
  }

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return admins.filter((a) => [a.name, a.mobile].some((x) => x.toLowerCase().includes(t)));
  }, [admins, q]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const form = e.currentTarget as any;
    const base = { name: form.name.value, mobile: form.mobile.value } as any;
    const pwd = form.password.value as string;
    
    try {
      // Check if we're editing an existing admin (has an ID) or adding a new one
      const adminId = editing?.id || (editing as any)?._id;
      if (adminId) {
        // Editing existing admin
        await updateAdmin(adminId, { ...base, ...(pwd ? { password: pwd } : {}) });
      } else {
        // Adding new admin
        await addAdmin({ ...base, password: pwd || "admin123" } as any);
      }
      setEditing(null);
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      // Don't close the dialog if there's an error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manage Admins</h1>
          <p className="text-muted-foreground">Create, edit, and remove admin accounts.</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search by name / mobile" value={q} onChange={(e)=>setQ(e.target.value)} className="w-64" />
          <Dialog open={!!editing} onOpenChange={(open)=>{
            if (!open) {
              setEditing(null);
            } else if (!editing) {
              // If opening and no editing state, set empty object for "Add Admin" mode
              setEditing({} as any);
            }
          }}>
            <DialogTrigger asChild>
              <Button>Add Admin</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl shadow-lg bg-white">
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Users className="size-5 text-purple-600" />
                    </div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editing?.id ? "Edit Admin" : "Add Admin"}
                    </DialogTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(null)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </DialogHeader>
              <form onSubmit={onSave} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <Input 
                      name="name" 
                      required 
                      defaultValue={editing?.name||""} 
                      className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 rounded-xl"
                      placeholder="Enter admin's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                    <Input 
                      name="mobile" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      maxLength={10} 
                      required 
                      defaultValue={editing?.mobile||""} 
                      className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 rounded-xl"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password {editing ? <span className="text-gray-500 text-xs font-normal">(leave blank to keep current)</span> : null}
                    </label>
                    <Input 
                      name="password" 
                      type="password" 
                      placeholder={editing ? "Enter new password" : "Set a password"} 
                      className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <div className="flex gap-3 w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditing(null)}
                      className="flex-1 h-11 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    >
                      <Users className="size-4 mr-2" />
                      {editing?.id ? "Update Admin" : "Add Admin"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
          <CardDescription>Showing {filtered.length} results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a)=> (
                <TableRow key={a.id || (a as any)._id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.mobile}</TableCell>
                  <TableCell>{a.createdBy}</TableCell>
                  <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={()=>setEditing(a)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={()=>{
                        const adminId = a.id || (a as any)._id;
                        if (adminId) {
                          deleteAdmin(adminId);
                        } else {
                          console.error('Cannot delete admin: missing ID', a);
                        }
                      }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
