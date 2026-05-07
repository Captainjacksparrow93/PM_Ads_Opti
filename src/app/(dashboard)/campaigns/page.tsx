"use client";
import { useState } from "react";
import {
  Search, Plus, Filter, Pause, Play, ExternalLink, Bot,
  TrendingUp, TrendingDown, ChevronDown, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useClient } from "@/components/providers/client-provider";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";
import { formatCurrency, formatROAS, formatPercent, formatCompact, cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, OBJECTIVE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { Campaign, CampaignStatus, OptimizationFrequency, Platform } from "@/types";

const FREQ_LABELS: Record<OptimizationFrequency, string> = {
  "15min": "15 min",
  "30min": "30 min",
  "1hour": "1 hour",
  "3hours": "3 hrs",
  "6hours": "6 hrs",
  "12hours": "12 hrs",
  "daily": "Daily",
};

const FREQ_OPTIONS: OptimizationFrequency[] = ["15min", "30min", "1hour", "3hours", "6hours", "12hours", "daily"];

const PLATFORM_BADGE: Record<Platform, string> = {
  meta: "bg-blue-500 text-white",
  google: "bg-green-500 text-white",
};

function MetricCell({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-sm font-semibold text-slate-800">{value}</p>
      {sub && (
        <p className={cn("text-xs flex items-center justify-end gap-0.5", good === true ? "text-emerald-600" : good === false ? "text-red-500" : "text-slate-400")}>
          {good === true && <TrendingUp className="w-3 h-3" />}
          {good === false && <TrendingDown className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  const { selectedClient } = useClient();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [newCampOpen, setNewCampOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [freqCamp, setFreqCamp] = useState<Campaign | null>(null);
  const [selectedFreq, setSelectedFreq] = useState<OptimizationFrequency>("1hour");

  const campaigns = MOCK_CAMPAIGNS.filter((c) => {
    const isClientMatch = !selectedClient || c.client_id === selectedClient.id;
    const isSearchMatch = c.name.toLowerCase().includes(search.toLowerCase());
    const isPlatformMatch = platformFilter === "all" || c.platform === platformFilter;
    const isStatusMatch = statusFilter === "all" || c.status === statusFilter;
    return isClientMatch && isSearchMatch && isPlatformMatch && isStatusMatch;
  });

  const handleToggleStatus = (camp: Campaign) => {
    const action = camp.status === "active" ? "paused" : "activated";
    toast.success(`Campaign "${camp.name}" ${action}`);
  };

  const handleAICreate = async () => {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 2500));
    setAiLoading(false);
    setNewCampOpen(false);
    toast.success("AI created a campaign plan! Review it in Approvals before it goes live.");
  };

  const totalSpend = campaigns.reduce((s, c) => s + c.metrics.spend, 0);
  const avgRoas = campaigns.length ? campaigns.reduce((s, c) => s + c.metrics.roas, 0) / campaigns.length : 0;
  const totalConv = campaigns.reduce((s, c) => s + c.metrics.conversions, 0);

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search campaigns…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56 h-9 text-sm" />
          </div>
          {/* Platform filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all", "meta", "google"] as const).map((f) => (
              <button key={f} onClick={() => setPlatformFilter(f)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors", platformFilter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}>
                {f === "all" ? "All" : PLATFORM_LABELS[f]}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all", "active", "paused", "draft"] as const).map((f) => (
              <button key={f} onClick={() => setStatusFilter(f as any)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize", statusFilter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}>
                {f === "all" ? "All" : STATUS_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setNewCampOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-500">
          <Bot className="w-4 h-4" />
          AI Create Campaign
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Campaigns shown", value: campaigns.length.toString() },
          { label: "Total Spend", value: formatCurrency(totalSpend) },
          { label: "Avg. ROAS", value: formatROAS(avgRoas) },
          { label: "Total Conversions", value: formatCompact(totalConv) },
        ].map(({ label, value }) => (
          <Card key={label} className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Campaign", "Platform", "Objective", "Status", "AI Frequency", "Daily Budget", "Spend", "ROAS", "CPA", "Conversions", "CTR", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-8 h-8 opacity-30" />
                      <p className="font-medium">No campaigns match your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        {camp.ai_managed && (
                          <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0" title="AI Managed">
                            <Bot className="w-2.5 h-2.5 text-violet-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-800 truncate">{camp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold", PLATFORM_BADGE[camp.platform])}>
                        {PLATFORM_LABELS[camp.platform]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {OBJECTIVE_LABELS[camp.objective]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", STATUS_COLORS[camp.status])}>
                        {STATUS_LABELS[camp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setFreqCamp(camp); setSelectedFreq(camp.optimization_frequency); }}
                        className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 px-2.5 py-1 rounded-full font-medium transition-colors border border-transparent hover:border-violet-200"
                      >
                        <Clock className="w-3 h-3" />
                        {FREQ_LABELS[camp.optimization_frequency]}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(camp.daily_budget)}/day</td>
                    <td className="px-4 py-3.5">
                      <MetricCell label="Spend" value={formatCurrency(camp.metrics.spend)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <MetricCell
                        label="ROAS"
                        value={camp.metrics.roas > 0 ? formatROAS(camp.metrics.roas) : "—"}
                        sub={camp.targets.roas ? `target ${formatROAS(camp.targets.roas)}` : undefined}
                        good={camp.targets.roas ? camp.metrics.roas >= camp.targets.roas : undefined}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <MetricCell
                        label="CPA"
                        value={camp.metrics.cpa > 0 ? formatCurrency(camp.metrics.cpa) : "—"}
                        sub={camp.targets.cpa ? `target ${formatCurrency(camp.targets.cpa)}` : undefined}
                        good={camp.targets.cpa ? camp.metrics.cpa <= camp.targets.cpa : undefined}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <MetricCell label="Conv." value={camp.metrics.conversions > 0 ? formatCompact(camp.metrics.conversions) : "—"} />
                    </td>
                    <td className="px-4 py-3.5">
                      <MetricCell label="CTR" value={camp.metrics.ctr > 0 ? formatPercent(camp.metrics.ctr) : "—"} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-700"
                          onClick={() => handleToggleStatus(camp)}
                          title={camp.status === "active" ? "Pause" : "Activate"}
                        >
                          {camp.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Optimization Frequency Dialog */}
      <Dialog open={!!freqCamp} onOpenChange={(o) => !o && setFreqCamp(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-600" /> AI Optimization Frequency
            </DialogTitle>
            <DialogDescription>
              How often the AI checks performance and applies optimizations for <span className="font-semibold text-slate-700">{freqCamp?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 py-2">
            {FREQ_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFreq(f)}
                className={cn("p-2.5 border rounded-lg text-xs font-medium text-center transition-colors",
                  selectedFreq === f ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">More frequent = faster reaction to performance changes. Less frequent = fewer API calls and more stable decisions.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFreqCamp(null)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-500" onClick={() => {
              toast.success(`Optimization frequency set to ${FREQ_LABELS[selectedFreq]} for "${freqCamp?.name}"`);
              setFreqCamp(null);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Create Campaign Dialog */}
      <Dialog open={newCampOpen} onOpenChange={setNewCampOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-violet-600" />
              AI Campaign Creator
            </DialogTitle>
            <DialogDescription>
              Tell the AI what you want to achieve and it will build a full campaign structure, select assets, generate copy, and create ad sets — ready for your approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Campaign objective</label>
              <div className="grid grid-cols-3 gap-2">
                {["Sales / ROAS", "Lead Generation", "Awareness"].map((o) => (
                  <button key={o} className="p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-colors text-center">
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Platforms</label>
              <div className="grid grid-cols-2 gap-2">
                {["Meta Ads", "Google Ads"].map((p) => (
                  <button key={p} className="p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Monthly budget (USD)</label>
              <Input placeholder="e.g. 10000" type="number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Target ROAS</label>
              <Input placeholder="e.g. 4.0" type="number" step="0.1" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Special instructions (optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Focus on 25-45 age group, exclude competitor keywords, push hero product…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg">
              <p className="text-xs text-violet-700 font-medium">AI will:</p>
              <ul className="text-xs text-violet-600 mt-1 space-y-0.5 list-disc pl-4">
                <li>Build campaign structure with ad sets & targeting</li>
                <li>Select best assets from your library</li>
                <li>Generate headline and copy variations</li>
                <li>Submit for your approval before launching</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCampOpen(false)}>Cancel</Button>
            <Button onClick={handleAICreate} disabled={aiLoading} className="bg-violet-600 hover:bg-violet-500 gap-2">
              {aiLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
              ) : (
                <><Bot className="w-4 h-4" /> Generate Campaign</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
