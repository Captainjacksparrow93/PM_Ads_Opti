"use client";
import { useState } from "react";
import {
  Plus, Search, Building2, Globe, TrendingUp, Megaphone,
  MoreVertical, CheckCircle2, XCircle, Wifi,
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
      {connected
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle className="w-3 h-3" />}
      {label}
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
        <div className="flex items-center gap-2 mb-4">
          <PlatformPill connected={client.meta_connected} label="Meta Ads" color="bg-blue-50 text-blue-600" />
          <PlatformPill connected={client.google_connected} label="Google Ads" color="bg-green-50 text-green-600" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">Spend</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(client.total_spend ?? 0)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">ROAS</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{formatROAS(client.roas ?? 0)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">Campaigns</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {client.active_campaigns}<span className="text-slate-400 font-normal">/{client.campaign_count}</span>
            </p>
          </div>
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
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  const { clients, setSelectedClient } = useClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "meta" | "google">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", industry: "", website: "" });

  const filtered = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesFilter =
      filter === "all" ||
      (filter === "meta" && c.meta_connected) ||
      (filter === "google" && c.google_connected);
    return matchesSearch && matchesFilter;
  });

  const handleAdd = () => {
    toast.success(`Client "${newClient.name}" created! Connect platforms in Settings.`);
    setAddOpen(false);
    setNewClient({ name: "", industry: "", website: "" });
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
            {(["all", "meta", "google"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
                  filter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f === "all" ? "All Clients" : f === "meta" ? "Meta Connected" : "Google Connected"}
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
          { label: "Total Active Campaigns", value: clients.reduce((sum, c) => sum + (c.active_campaigns ?? 0), 0), icon: Megaphone, color: "text-amber-600", bg: "bg-amber-50" },
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
            <ClientCard
              key={client.id}
              client={client}
              onSelect={() => setSelectedClient(client)}
            />
          ))}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Client / Brand Name</Label>
              <Input placeholder="e.g. Acme Corporation" value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input placeholder="e.g. E-commerce, SaaS, Fashion" value={newClient.industry} onChange={(e) => setNewClient((p) => ({ ...p, industry: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input placeholder="https://example.com" value={newClient.website} onChange={(e) => setNewClient((p) => ({ ...p, website: e.target.value }))} />
            </div>
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg text-sm text-violet-700">
              <p className="font-medium mb-1">Next step: Connect platforms</p>
              <p className="text-xs text-violet-600">After creating the client, you&apos;ll connect their Meta and Google Ads accounts in Settings → Integrations.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newClient.name} className="bg-violet-600 hover:bg-violet-500">
              Create Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
