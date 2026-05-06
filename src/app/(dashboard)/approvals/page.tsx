"use client";
import { useState } from "react";
import {
  Bot, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  DollarSign, PauseCircle, RefreshCw, Target, AlertCircle, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_AI_ACTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PLATFORM_LABELS, AI_ACTION_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { AIAction } from "@/types";
import { formatDistanceToNow } from "date-fns";

const ACTION_ICON: Record<string, React.ElementType> = {
  budget_increase: TrendingUp,
  budget_decrease: TrendingDown,
  bid_increase: TrendingUp,
  bid_decrease: TrendingDown,
  pause_ad: PauseCircle,
  enable_ad: Zap,
  update_targeting: Target,
  asset_swap: RefreshCw,
  campaign_created: Zap,
};

const ACTION_COLOR: Record<string, string> = {
  budget_increase: "bg-green-100 text-green-700",
  budget_decrease: "bg-amber-100 text-amber-700",
  bid_increase: "bg-blue-100 text-blue-700",
  bid_decrease: "bg-orange-100 text-orange-700",
  pause_ad: "bg-red-100 text-red-700",
  enable_ad: "bg-green-100 text-green-700",
  update_targeting: "bg-violet-100 text-violet-700",
  asset_swap: "bg-purple-100 text-purple-700",
  campaign_created: "bg-violet-100 text-violet-700",
};

function ApprovalCard({ action, onApprove, onReject }: {
  action: AIAction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const Icon = ACTION_ICON[action.action_type] ?? Bot;
  const iconColor = ACTION_COLOR[action.action_type] ?? "bg-slate-100 text-slate-600";

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-400">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2.5 rounded-xl flex-shrink-0", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-sm">{action.title}</h3>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  action.platform === "meta" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                )}>
                  {action.platform ? PLATFORM_LABELS[action.platform] : ""}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="font-medium text-slate-600">{action.campaign_name}</span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Pending Approval
          </span>
        </div>

        {/* AI Reasoning */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Bot className="w-3.5 h-3.5 text-violet-600" />
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">AI Reasoning</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{action.reasoning}</p>
        </div>

        {/* Predicted Impact */}
        {action.predicted_impact && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-700">Predicted Impact</p>
              <p className="text-sm text-emerald-700 mt-0.5">{action.predicted_impact}</p>
            </div>
          </div>
        )}

        {/* Action details */}
        {Object.keys(action.details).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(action.details).map(([key, val]) => (
              <div key={key} className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                {Array.isArray(val) ? val.join(", ") : String(val)}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <Button
            onClick={() => onApprove(action.id)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Execute
          </Button>
          <Button
            onClick={() => onReject(action.id)}
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const pending = MOCK_AI_ACTIONS.filter((a) => a.approval_status === "pending");
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = pending.filter((a) => !dismissed.includes(a.id));

  const handleApprove = (id: string) => {
    setDismissed((prev) => [...prev, id]);
    const action = pending.find((a) => a.id === id);
    toast.success(`"${action?.title}" approved and executing now…`);
  };

  const handleReject = (id: string) => {
    setDismissed((prev) => [...prev, id]);
    toast.error(`Action rejected. AI will not execute this change.`);
  };

  const handleApproveAll = () => {
    visible.forEach((a) => setDismissed((prev) => [...prev, a.id]));
    toast.success(`${visible.length} actions approved and queued for execution.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
            <p className="text-sm text-slate-500">{visible.length} AI actions waiting for your review</p>
          </div>
        </div>
        {visible.length > 1 && (
          <Button onClick={handleApproveAll} className="bg-emerald-600 hover:bg-emerald-500 gap-2">
            <CheckCircle className="w-4 h-4" />
            Approve All ({visible.length})
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">All caught up!</h3>
            <p className="text-slate-500 text-sm">No pending AI actions. The AI will notify you when new recommendations are ready.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((action) => (
            <ApprovalCard
              key={action.id}
              action={action}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Info box */}
      <Card className="border-violet-100 bg-violet-50 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bot className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-violet-800">How AI Approvals Work</p>
              <p className="text-sm text-violet-700 mt-1 leading-relaxed">
                The AI continuously monitors campaign performance. When it identifies an optimization opportunity, it creates a detailed action plan with its reasoning and predicted impact — and waits for your approval before making any changes. Once approved, changes execute immediately and are logged in the AI Audit Log.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
