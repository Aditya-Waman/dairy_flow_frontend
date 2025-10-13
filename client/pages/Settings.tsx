import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogOut, User, Shield, Bell, BellRing, AlertTriangle, FileText, Palette, Sun, Moon, Monitor } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newRequests: true,
    dailyReports: false,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="p-2 rounded-lg bg-primary/10 animate-bounce-subtle">
          <Bell className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Settings & Preferences</h1>
          <p className="text-muted-foreground">Manage your account, notifications, and system preferences</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Palette className="size-5 text-purple-600" />
              </div>
              Theme Preferences
            </CardTitle>
            <CardDescription>Customize your visual experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <button
                onClick={() => setTheme("light")}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200 ${
                  theme === "light" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Sun className="size-4 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Light Mode</div>
                    <div className="text-xs text-muted-foreground">Bright and clear interface</div>
                  </div>
                </div>
                {theme === "light" && <div className="text-primary font-bold">✓</div>}
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200 ${
                  theme === "dark" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <Moon className="size-4 text-slate-100" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Dark Mode</div>
                    <div className="text-xs text-muted-foreground">Easy on the eyes at night</div>
                  </div>
                </div>
                {theme === "dark" && <div className="text-primary font-bold">✓</div>}
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200 ${
                  theme === "system" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Monitor className="size-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">System</div>
                    <div className="text-xs text-muted-foreground">Follow system preferences</div>
                  </div>
                </div>
                {theme === "system" && <div className="text-primary font-bold">✓</div>}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100">
                <User className="size-5 text-green-600" />
              </div>
              Account Information
            </CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 p-3 rounded-lg bg-white/70 border border-green-100">
              <div className="text-sm font-medium text-gray-600">Name</div>
              <div className="text-base font-semibold">{user?.name}</div>
            </div>
            <div className="grid gap-2 p-3 rounded-lg bg-white/70 border border-green-100">
              <div className="text-sm font-medium text-gray-600">Mobile</div>
              <div className="text-base font-semibold font-mono">{user?.mobile}</div>
            </div>
            <div className="grid gap-2 p-3 rounded-lg bg-white/70 border border-green-100">
              <div className="text-sm font-medium text-gray-600">Role</div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="size-4 text-primary" />
                </div>
                <span className="text-base font-bold capitalize text-primary">{user?.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100">
              <BellRing className="size-5 text-orange-600" />
            </div>
            Notification Preferences
          </CardTitle>
            <CardDescription>Customize how and when you receive notifications</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="size-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Low Stock Alerts</div>
                <div className="text-xs text-muted-foreground">Get notified when feed stock falls below threshold</div>
                  </div>
                </div>
                <Switch 
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, lowStock: checked }))}
                />
              </div>
              
          <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Bell className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">New Feed Requests</div>
                <div className="text-xs text-muted-foreground">Notifications for pending farmer requests</div>
                  </div>
                </div>
                <Switch 
                  checked={notifications.newRequests}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newRequests: checked }))}
                />
              </div>
              
          <div className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <FileText className="size-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Daily Summary Reports</div>
                <div className="text-xs text-muted-foreground">Receive daily business summary reports</div>
                  </div>
                </div>
                <Switch 
                  checked={notifications.dailyReports}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyReports: checked }))}
                />
            </div>
          </CardContent>
        </Card>

      <Card className="border-2 border-destructive/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-lg bg-red-100">
              <LogOut className="size-5 text-red-600" />
            </div>
            Account Actions
          </CardTitle>
          <CardDescription>Manage your account session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border-2 border-destructive/30 rounded-xl bg-red-50/50">
            <div>
              <div className="text-sm font-semibold">Sign Out</div>
              <div className="text-xs text-muted-foreground">End your current session and return to login</div>
            </div>
            <Button variant="destructive" onClick={logout} className="gap-2 hover-lift">
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
