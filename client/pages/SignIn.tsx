import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(mobile, password);
    setLoading(false);
    if (!res.ok) {
      setError((res as { ok: false; error: string }).error);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 dark:from-green-800 dark:via-green-700 dark:to-emerald-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-md relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 text-white mb-8 animate-slide-up">
            <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white grid place-items-center font-extrabold text-2xl border-2 border-white/30 shadow-2xl hover-lift">
              <Leaf className="size-8" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">DairyFlow</h2>
              <p className="text-sm text-white/90">Modern Farm Management System</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Modern Animated PARAS DAIRY Logo */}
            <div className="flex flex-col items-center space-y-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              {/* Circular Logo with Enhanced Glowing Effect */}
              <div className="relative">
                {/* Outer Glowing Ring Animation */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 opacity-60 animate-pulse"></div>
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 opacity-40 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-emerald-300 via-green-400 to-teal-500 opacity-30 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
                
                {/* Main Logo Circle */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-2xl flex items-center justify-center border-4 border-emerald-400/40 backdrop-blur-sm">
                  {/* Cow Icon */}
                  <svg 
                    className="w-16 h-16 text-emerald-600 animate-zoom-in drop-shadow-lg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    style={{animationDelay: '0.3s'}}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
              </div>
              
              {/* Brand Name with Premium Colors and Animations */}
              <div className="text-center space-y-2 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <h1 className="text-4xl font-black tracking-wider flex items-center justify-center gap-4">
                  <span className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-white shadow-2xl animate-premium-glow relative overflow-hidden">
                    <span className="relative z-10">PARAS</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </span>
                  <span className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-white shadow-2xl animate-premium-glow relative overflow-hidden">
                    <span className="relative z-10">DAIRY</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </span>
                </h1>
                <p className="text-white/90 text-sm font-medium tracking-wide drop-shadow-md">
                  Premium Dairy Management System
                </p>
              </div>
            </div>
            

            <div className="text-white/80 text-sm text-center space-y-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Secure Authentication
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Real-time Data Sync
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Comprehensive Analytics
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md shadow-2xl border-0 animate-scale-in bg-white dark:bg-gray-800">
          <CardHeader className="pb-6">
            <div className="md:hidden flex items-center gap-3 mb-4 justify-center">
              <div className="size-12 rounded-xl bg-primary text-primary-foreground grid place-items-center font-extrabold shadow-lg">
                <Leaf className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">DairyFlow</h2>
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in with your mobile number and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <Input 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    maxLength={10} 
                    value={mobile} 
                    onChange={(e)=>setMobile(e.target.value.replace(/\D/g, ""))} 
                    placeholder="Enter 10-digit mobile" 
                    required 
                    className="pl-11 h-12 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary transition-all duration-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input 
                    type={showPwd?"text":"password"} 
                    value={password} 
                    onChange={(e)=>setPassword(e.target.value)} 
                    placeholder="Your password" 
                    required 
                    className="pl-11 pr-16 h-12 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary transition-all duration-200 rounded-xl"
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={()=>setShowPwd(v=>!v)}
                  >
                    {showPwd?"Hide":"Show"}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl",
                  loading && "opacity-80"
                )} 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </span>
                )}
              </Button>
              <div className="text-xs text-center text-muted-foreground bg-muted/30 p-3 rounded-lg">
                🔒 By continuing you agree to our Terms of Service and Privacy Policy
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
