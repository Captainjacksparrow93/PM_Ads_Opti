"use client";
import {
  TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart,
  Megaphone, Bot, CheckCircle2, Clock, ArrowRight, Zap, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClient } from "@/components/providers/client-provider";
import {
  MOCK_DASHBOARD_METRICS, MOCK_CHART_DATA, MOCK_AI_ACTIONS,
  MOCK_CAMPAIGNS, MOCK_PLATFORM_SPLIT,
} from "@/lib/mock-data";
import { formatCurrency, formatCompact, formatROAS, formatChange, cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PLATFORM_LABELS } from "@/lib/constants";

const KPI_CARDS = [
  {
    label: "Total Spend",
    value: formatCurrency(MOCK_DASHBOARD_METRICS.total_spend),
    change: MOCK_DASHBOARD_METRICS.total_spend_change,
    icon: DollarSign,
    color: "text-blue-600",
    bg: "bg-blue-50",
    positive_is_good: false,
  },
  {
    label: "Avg. ROAS",
    value: formatROAS(MOCK_DASHBOARD_METRICS.avg_roas),
    change: MOCK_DASHBOARD_METRICS.avg_roas_change,
    icon: Target,
    color: "text-violet-600",
    bg: "bg-violet-50",
    positive_is_good: true,
  },
  {
    label: "Conversions",
    value: formatCompact(MOCK_DASHBOARD_METRICS.total_conversions),
    change: MOCK_DASHBOARD_METRICS.total_conversions_change,
    icon: ShoppingCart,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    positive_is_good: true,
  },
  {
    label: "Active Campaigns",
    value: MOCK_DASHBOARD_METRICS.active_campaigns.toString(),
    change: MOCK_DASHBOARD_METRICS.active_campaigns_change,
    icon: Megaphone,
    color: "text-amber-600",
    bg: "bg-amber-50",
    positive_is_good: true,
  },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">
            {p.dataKey === "spend" ? formatCurrency(p.value) : p.dataKey === "roas" ? formatROAS(p.value) : formatCompact(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const { selectedClient } = useClient();
  const recentActions = MOCK_AI_ACTIONS.slice(0, 4);
  const activeCampaigns = MOCK_CAMPAIGNS.filter(
    (c) => c.client_id === selectedClient?.id && c.status === "active"
  ).slice(0, 5);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Good morning, Sarah 👋
          </h2>
          <p className="text-slate-500 mt-0.5 text-sm">
            {selectedClient ? `Viewing ${selectedClient.name} — ` : ""}
            {MOCK_DASHBOARD_METRICS.pending_approvals} AI actions pending approval · {MOCK_DASHBOARD_METRICS.ai_actions_today} actions taken today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/approvals">
            <Button variant="outline" className="gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              {MOCK_DASHBOARD_METRICS.pending_approvals} Pending Approvals
            </Button>
          </Link>
          <Button className="gap-2 text-sm bg-violet-600 hover:bg-violet-500">
            <Zap className="h-4 w-4" />
            Run AI Analysis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, change, icon: Icon, color, bg, positive_is_good }) => {
          const isPositive = change >= 0;
          const isGood = positive_is_good ? isPositive : !isPositive;
          return (
            <Card key={label} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                    <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", isGood ? "text-emerald-600" : "text-red-500")}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {formatChange(change)} vs last month
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main performance chart */}
        <Card className="col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">Performance Trend</CardTitle>
              <div className="flex items-center gap-1 text-xs">
                {["1W", "1M", "3M"].map((p, i) => (
                  <button key={p} className={cn("px-2.5 py-1 rounded-md font-medium transition-colors", i === 1 ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:text-slate-700")}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MOCK_CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#7c3aed" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
                <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#10b981" strokeWidth={2} fill="url(#convGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform split */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Platform Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_PLATFORM_SPLIT.map((p) => (
              <div key={p.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", p.platform === "Meta" ? "bg-blue-500" : "bg-green-500")} />
                    <span className="text-sm font-medium text-slate-700">{p.platform}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(p.spend)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">ROAS</p>
                    <p className="text-sm font-bold text-slate-800">{formatROAS(p.roas)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Conv.</p>
                    <p className="text-sm font-bold text-slate-800">{formatCompact(p.conversions)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Camp.</p>
                    <p className="text-sm font-bold text-slate-800">{p.campaigns}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-2">AI Activity Today</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-violet-100 rounded-full h-2">
                  <div className="bg-violet-600 rounded-full h-2" style={{ width: "70%" }} />
                </div>
                <span className="text-xs font-semibold text-violet-700">{MOCK_DASHBOARD_METRICS.ai_actions_today} actions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Campaigns */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">Active Campaigns</CardTitle>
              <Link href="/campaigns">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-slate-500 h-7">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {activeCampaigns.map((camp) => (
              <div key={camp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0", camp.platform === "meta" ? "bg-blue-500" : "bg-green-500")}>
                  {camp.platform === "meta" ? "M" : "G"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{camp.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(camp.metrics.spend)} · ROAS {formatROAS(camp.metrics.roas)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", STATUS_COLORS[camp.status])}>
                    {STATUS_LABELS[camp.status]}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent AI Actions */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-800">Recent AI Actions</CardTitle>
                <span className="flex items-center gap-1 text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full font-medium">
                  <Bot className="w-3 h-3" /> Live
                </span>
              </div>
              <Link href="/ai-log">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-slate-500 h-7">
                  View log <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  action.approval_status === "approved" ? "bg-emerald-100" :
                  action.approval_status === "pending" ? "bg-amber-100" : "bg-red-100"
                )}>
                  {action.approval_status === "approved"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{action.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{action.campaign_name}</p>
                </div>
                {action.approval_status === "pending" && (
                  <Link href="/approvals">
                    <Button size="sm" className="h-6 text-[11px] px-2 bg-violet-600 hover:bg-violet-500 flex-shrink-0">
                      Review
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
