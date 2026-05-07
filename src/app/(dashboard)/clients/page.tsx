"use client";
import { useState } from "react";
import {
  Plus, Search, Building2, Globe, TrendingUp, Megaphone,
  MoreVertical, CheckCircle2, XCircle, Wifi, ShoppingBag,
  Target, Calendar, DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useClient } from "@/components/providers/client-provider";
import { formatCurrency, formatROAS, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Client } from "@/types";

function PlatformPill({ connected, label, color }: { connected: boolean; label: string; color: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      connected
        ? `${color} border-current/20`
        : "bg-slate-100 text-slate-400 border-slate-200"
    )}>
      {connected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </div>
  );
}

function GoalProgress({ client }: { client: Client }) {
  if (!client.goal?.target_revenue || !client.shopify_revenue) return null;
  const pct = Math.min((client.shopify_revenue / client.goal.target_revenue) * 100, 100);
  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-500 flex items-center gap-1"><Target className="w-3 h-3" /> Revenue goal</span>
        <span className="font-semibold text-slate-700">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-violet-500" : "bg-amber-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">
        {formatCurrency(client.shopify_revenue)} of {formatCurrency(client.goal.target_revenue)} target
      </p>
    </div>
  );
}

function ClientCard({ client, onSelect }: { client: Client; onSelect: () => void }) {
  const spendPct = client.monthly_budget ? (client.total_spend! / client.monthly_budget) * 100 : 0;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={onSelect}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
              {getInitials(client.name)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-violet-700 transition-colors">{client.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {client.industry}
              </p>
            </div>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-100" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Platform badges */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          <PlatformPill connected={client.meta_connected} label="Meta" color="bg-blue-50 text-blue-600" />
          <PlatformPill connected={client.google_connected} label="Google" color="bg-green-50 text-green-600" />
          <PlatformPill connected={client.shopify_connected} label="Shopify" color="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">Ad Spend</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(client.total_spend ?? 0)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">ROAS</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{formatROAS(client.roas ?? 0)}</p>
          </div>
          {client.shopify_revenue ? (
            <div className="bg-emerald-50 rounded-lg p-2.5">
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5"><ShoppingBag className="w-2.5 h-2.5" /> Revenue</p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatCurrency(client.shopify_revenue)}</p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-[11px] text-slate-500 font-medium">Campaigns</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {client.active_campaigns}<span className="text-slate-400 font-normal">/{client.campaign_count}</span>
              </p>
            </div>
          )}
        </div>

        {/* Budget progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Monthly budget used</span>
            <span className="font-medium text-slate-700">{spendPct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", spendPct > 90 ? "bg-red-500" : spendPct > 75 ? "bg-amber-500" : "bg-violet-500")}
              style={{ width: `${Math.min(spendPct, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{formatCurrency(client.total_spend ?? 0)} of {formatCurrency(client.monthly_budget ?? 0)}</p>
        </div>

        {/* Goal progress */}
        <GoalProgress client={client} />

        {/* Goal timeframe badge */}
        {client.goal?.timeframe_end && (
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>Goal ends {new Date(client.goal.timeframe_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            {client.goal.target_roas && (
              <span className="ml-auto flex items-center gap-0.5 font-medium text-violet-600">
                <Target className="w-3 h-3" /> {client.goal.target_roas}x ROAS
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NewClientForm {
  name: string;
  industry: string;
  website: string;
  monthly_budget: string;
  target_roas: string;
  target_revenue: string;
  target_cpa: string;
  timeframe_start: string;
  timeframe_end: string;
  goal_notes: string;
}

const EMPTY_FORM: NewClientForm = {
  name: "", industry: "", website: "",
  monthly_budget: "", target_roas: "", target_revenue: "",
  target_cpa: "", timeframe_start: "", timeframe_end: "", goal_notes: "",
};

export default function ClientsPage() {
  const { clients, setSelectedClient } = useClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "meta" | "google" | "shopify">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<NewClientForm>(EMPTY_FORM);

  const set = (k: keyof NewClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const filtered = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesFilter =
      filter === "all" ||
      (filter === "meta" && c.meta_connected) ||
      (filter === "google" && c.google_connected) ||
      (filter === "shopify" && c.shopify_connected);
    return matchesSearch && matchesFilter;
  });

  const handleAdd = () => {
    toast.success(`Client "${form.name}" created! Connect platforms in Settings.`);
    setAddOpen(false);
    setForm(EMPTY_FORM);
    setStep(1);
  };

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 h-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all", "meta", "google", "shopify"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
                  filter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f === "all" ? "All" : f === "meta" ? "Meta" : f === "google" ? "Google" : "Shopify"}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-500">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: clients.length, icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Meta Connected", value: clients.filter((c) => c.meta_connected).length, icon: Wifi, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Google Connected", value: clients.filter((c) => c.google_connected).length, icon: Globe, color: "text-green-600", bg: "bg-green-50" },
          { label: "Shopify Connected", value: clients.filter((c) => c.shopify_connected).length, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No clients found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} onSelect={() => setSelectedClient(client)} />
          ))}
        </div>
      )}

      {/* Add Client Dialog — 2 steps */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setForm(EMPTY_FORM); setStep(1); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {step === 1 ? <><Building2 className="w-4 h-4 text-violet-600" /> Client Details</> : <><Target className="w-4 h-4 text-violet-600" /> Goals & Budget</>}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2].map((s) => (
                <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors", s <= step ? "bg-violet-500" : "bg-slate-200")} />
              ))}
              <span className="text-xs text-slate-400 ml-1">{step}/2</span>
            </div>
          </DialogHeader>

          {step === 1 ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Client / Brand Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Acme Corporation" value={form.name} onChange={set("name")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input placeholder="e.g. E-commerce, SaaS" value={form.industry} onChange={set("industry")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input placeholder="https://example.com" value={form.website} onChange={set("website")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Ad Budget ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="50000" type="number" className="pl-8" value={form.monthly_budget} onChange={set("monthly_budget")} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-500">Set the performance targets the AI will optimize towards for this client.</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Target ROAS</Label>
                  <Input placeholder="4.5" type="number" step="0.1" value={form.target_roas} onChange={set("target_roas")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Target CPA ($)</Label>
                  <Input placeholder="25" type="number" value={form.target_cpa} onChange={set("target_cpa")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Revenue Goal ($)</Label>
                  <Input placeholder="225000" type="number" value={form.target_revenue} onChange={set("target_revenue")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Goal Start</Label>
                  <Input type="date" value={form.timeframe_start} onChange={set("timeframe_start")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Goal End</Label>
                  <Input type="date" value={form.timeframe_end} onChange={set("timeframe_end")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes for AI optimizer (optional)</Label>
                <textarea
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g. Focus on ROAS above all else. Avoid pausing brand campaigns without approval."
                  value={form.goal_notes}
                  onChange={set("goal_notes")}
                />
              </div>
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg text-xs text-violet-700">
                <p className="font-semibold mb-0.5">How AI uses these goals</p>
                <p>The AI optimizer treats these targets as the north star. It will prioritize budget allocation, bid strategies, and creative decisions to achieve these metrics within the timeframe.</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>Back</Button>}
            <Button variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM); setStep(1); }}>Cancel</Button>
            {step === 1 ? (
              <Button onClick={() => setStep(2)} disabled={!form.name} className="bg-violet-600 hover:bg-violet-500">
                Next: Set Goals
              </Button>
            ) : (
              <Button onClick={handleAdd} className="bg-violet-600 hover:bg-violet-500">
                Create Client
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
