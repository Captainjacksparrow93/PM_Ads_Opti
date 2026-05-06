"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ agencyName: "", name: "", email: "", password: "" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);
    toast.success("Account created! Welcome to AdsPilot.");
    router.push("/");
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 mb-4 shadow-lg shadow-violet-500/30">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">AdsPilot</h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered campaign management</p>
      </div>

      <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Create your agency account</h2>
          <p className="text-slate-400 text-sm mt-1">Start managing campaigns with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agency" className="text-slate-300 text-sm">Agency name</Label>
            <Input
              id="agency" value={form.agencyName} onChange={set("agencyName")}
              placeholder="Acme Digital Agency" required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300 text-sm">Your name</Label>
            <Input
              id="name" value={form.name} onChange={set("name")}
              placeholder="Jane Smith" required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-sm">Work email</Label>
            <Input
              id="email" type="email" value={form.email} onChange={set("email")}
              placeholder="jane@agency.com" required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
            <Input
              id="password" type="password" value={form.password} onChange={set("password")}
              placeholder="At least 8 characters" required minLength={8}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 h-11"
            />
          </div>

          <Button
            type="submit" disabled={isLoading}
            className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/20 mt-2"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
            ) : (
              <><Zap className="h-4 w-4" /> Create account</>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center pt-1">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <span className="text-slate-400">Already have an account?</span>
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
