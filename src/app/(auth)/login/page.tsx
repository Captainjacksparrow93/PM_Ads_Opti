"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@adspilot.io");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    toast.success("Welcome back! Loading your dashboard…");
    router.push("/");
  };

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 mb-4 shadow-lg shadow-violet-500/30">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">AdsPilot</h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered campaign management</p>
      </div>

      {/* Card */}
      <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Sign in to your account</h2>
          <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-sm">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 focus-visible:border-violet-500 h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <Link href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/20 transition-all"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <><Zap className="h-4 w-4" /> Sign in</>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <span className="text-slate-400">Don&apos;t have an account?</span>
            <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* Demo hint */}
      <div className="mt-4 flex items-center gap-2 justify-center text-xs text-slate-500">
        <div className="h-px w-12 bg-slate-700" />
        <span>Demo credentials pre-filled</span>
        <div className="h-px w-12 bg-slate-700" />
      </div>
    </div>
  );
}
