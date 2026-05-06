"use client";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClient } from "@/components/providers/client-provider";
import { MOCK_CHART_DATA, MOCK_PLATFORM_SPLIT, MOCK_CAMPAIGNS } from "@/lib/mock-data";
import { formatCurrency, formatROAS, formatCompact, formatChange, cn } from "@/lib/utils";
import { OBJECTIVE_LABELS } from "@/lib/constants";

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];

const OBJECTIVE_DATA = [
  { name: "Sales", spend: 32600, conversions: 5100, roas: 4.8 },
  { name: "Lead Gen", spend: 22400, conversions: 270, roas: 2.8 },
  { name: "Awareness", spend: 4200, conversions: 0, roas: 0 },
  { name: "Traffic", spend: 5800, conversions: 2880, roas: 6.2 },
];

const PLATFORM_PIE = [
  { name: "Meta Ads", value: 38200, color: "#3b82f6" },
  { name: "Google Ads", value: 24200, color: "#22c55e" },
];

const DAILY_DATA = [
  { day: "Mon", meta: 1840, google: 1120 },
  { day: "Tue", meta: 2100, google: 980 },
  { day: "Wed", meta: 1960, google: 1280 },
  { day: "Thu", meta: 2340, google: 1440 },
  { day: "Fri", meta: 2680, google: 1560 },
  { day: "Sat", meta: 3100, google: 1280 },
  { day: "Sun", meta: 2420, google: 860 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { selectedClient } = useClient();
  const [dateRange, setDateRange] = useState("Last 30 days");

  const topCampaigns = MOCK_CAMPAIGNS
    .filter((c) => c.client_id === selectedClient?.id && c.metrics.spend > 0)
    .sort((a, b) => b.metrics.roas - a.metrics.roas)
    .slice(0, 5);

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", dateRange === r ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}
            >
              {r}
            </button>
          ))}
        </div>
        <Button variant="outline" className="gap-2 text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: formatCurrency(62400), change: 12.4, icon: DollarSign, good: null },
          { label: "Total Revenue", value: formatCurrency(262080), change: 19.2, icon: TrendingUp, good: true },
          { label: "Blended ROAS", value: formatROAS(4.2), change: 8.1, icon: Target, good: true },
          { label: "Total Conversions", value: formatCompact(7266), change: 15.3, icon: ShoppingCart, good: true },
        ].map(({ label, value, change, icon: Icon, good }) => {
          const isPositive = change >= 0;
          return (
            <Card key={label} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-500 font-medium">{label}</p>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium",
                  good === null ? "text-slate-500" : isPositive ? "text-emerald-600" : "text-red-500"
                )}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatChange(change)} vs prev. period
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Spend over time */}
        <Card className="col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Spend & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="spendG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#7c3aed" strokeWidth={2} fill="url(#spendG)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform split pie */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={PLATFORM_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PLATFORM_PIE.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {PLATFORM_PIE.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-slate-600">{p.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{formatCurrency(p.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily spend by platform */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Daily Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DAILY_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="meta" name="Meta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="google" name="Google" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend & ROAS by objective */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Performance by Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {OBJECTIVE_DATA.map((obj) => (
                <div key={obj.name} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-600 font-medium">{obj.name}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${(obj.spend / 40000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right w-20">
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(obj.spend)}</p>
                    {obj.roas > 0 && <p className="text-[10px] text-emerald-600 font-medium">{formatROAS(obj.roas)} ROAS</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top campaigns table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">Top Campaigns by ROAS</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Campaign", "Platform", "Spend", "Revenue", "ROAS", "Conversions", "CPA"].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topCampaigns.map((camp, i) => (
                <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                      <span className="font-medium text-slate-800 text-xs">{camp.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md text-white", camp.platform === "meta" ? "bg-blue-500" : "bg-green-500")}>
                      {camp.platform === "meta" ? "Meta" : "Google"}
                    </span>
                  </td>
                  <td className="py-3 text-xs font-medium text-slate-700">{formatCurrency(camp.metrics.spend)}</td>
                  <td className="py-3 text-xs font-medium text-slate-700">{formatCurrency(camp.metrics.spend * camp.metrics.roas)}</td>
                  <td className="py-3">
                    <span className={cn("text-xs font-bold", camp.metrics.roas >= (camp.targets.roas ?? 0) ? "text-emerald-600" : "text-amber-600")}>
                      {formatROAS(camp.metrics.roas)}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-slate-700">{formatCompact(camp.metrics.conversions)}</td>
                  <td className="py-3 text-xs text-slate-700">{formatCurrency(camp.metrics.cpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
