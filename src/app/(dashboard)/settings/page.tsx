"use client";
import { useState } from "react";
import {
  Key, Bot, Globe, Shield, Users, CheckCircle2, Eye, EyeOff,
  Plus, Trash2, RefreshCw, AlertCircle, Wifi, WifiOff,
  Building2, Mail, Lock, Save, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { MOCK_TEAM } from "@/lib/mock-data";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { useClient } from "@/components/providers/client-provider";

type APIService = "anthropic" | "meta" | "google";

interface KeyState {
  value: string;
  saved: boolean;
  visible: boolean;
}

const SERVICES: { id: APIService; label: string; description: string; icon: React.ElementType; color: string; docs: string }[] = [
  {
    id: "anthropic",
    label: "Anthropic (Claude AI)",
    description: "Powers all AI campaign analysis, copy generation, and optimization decisions",
    icon: Bot,
    color: "text-violet-600 bg-violet-50 border-violet-200",
    docs: "https://console.anthropic.com/api-keys",
  },
  {
    id: "meta",
    label: "Meta Marketing API",
    description: "Connects to Meta Ads Manager for campaign creation and management on Facebook & Instagram",
    icon: Globe,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    docs: "https://developers.facebook.com/docs/marketing-api",
  },
  {
    id: "google",
    label: "Google Ads API",
    description: "Connects to Google Ads for Search, Display, Shopping, and Performance Max campaigns",
    icon: Globe,
    color: "text-green-600 bg-green-50 border-green-200",
    docs: "https://developers.google.com/google-ads/api/docs",
  },
];

function APIKeyCard({ service }: { service: typeof SERVICES[0] }) {
  const Icon = service.icon;
  const [state, setState] = useState<KeyState>({ value: "", saved: false, visible: false });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!state.value.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setState((s) => ({ ...s, saved: true }));
    toast.success(`${service.label} API key saved securely.`);
  };

  const handleRevoke = () => {
    setState({ value: "", saved: false, visible: false });
    toast.success("API key removed.");
  };

  return (
    <Card className={cn("border shadow-sm", state.saved ? "border-slate-200" : "border-dashed border-slate-300")}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("p-2.5 rounded-xl border flex-shrink-0", service.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 text-sm">{service.label}</h3>
              {state.saved ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Not configured
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">{service.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={state.visible ? "text" : "password"}
                    value={state.value}
                    onChange={(e) => setState((s) => ({ ...s, value: e.target.value, saved: false }))}
                    placeholder={state.saved ? "••••••••••••••••••••••••" : `Paste your ${service.label} API key…`}
                    className="pr-10 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, visible: !s.visible }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {state.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!state.value.trim() || saving}
                  className="bg-violet-600 hover:bg-violet-500 flex-shrink-0 gap-1.5"
                  size="sm"
                >
                  {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save</>}
                </Button>
                {state.saved && (
                  <Button onClick={handleRevoke} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <Lock className="w-3 h-3" />
                  Keys are encrypted at rest and never logged
                </span>
                <a
                  href={service.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-800 font-medium"
                >
                  Get API key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { selectedClient } = useClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("manager");

  const handleInvite = () => {
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteOpen(false);
    setInviteEmail("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="integrations">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="integrations" className="flex-1 gap-2"><Key className="w-4 h-4" />API Keys</TabsTrigger>
          <TabsTrigger value="connections" className="flex-1 gap-2"><Wifi className="w-4 h-4" />Ad Accounts</TabsTrigger>
          <TabsTrigger value="team" className="flex-1 gap-2"><Users className="w-4 h-4" />Team</TabsTrigger>
          <TabsTrigger value="agency" className="flex-1 gap-2"><Building2 className="w-4 h-4" />Agency</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 gap-2"><Bot className="w-4 h-4" />AI Config</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="integrations" className="space-y-4 animate-fade-in">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Add your API keys to enable full functionality</p>
              <p className="text-xs text-amber-700 mt-0.5">These keys allow AdsPilot to connect to your ad platforms and use Claude AI for campaign optimization. All keys are encrypted.</p>
            </div>
          </div>

          {SERVICES.map((service) => (
            <APIKeyCard key={service.id} service={service} />
          ))}
        </TabsContent>

        {/* Ad Account Connections Tab */}
        <TabsContent value="connections" className="space-y-4 animate-fade-in">
          <p className="text-sm text-slate-500">Connect your clients&apos; Meta and Google Ads accounts via OAuth. Each client manages their own connections.</p>

          {/* Meta Connection */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Meta Ads</CardTitle>
                    <p className="text-xs text-slate-500">Facebook & Instagram campaigns</p>
                  </div>
                </div>
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                  selectedClient?.meta_connected ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50 border-slate-200"
                )}>
                  {selectedClient?.meta_connected ? <><CheckCircle2 className="w-3.5 h-3.5" />Connected</> : <><WifiOff className="w-3.5 h-3.5" />Not connected</>}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedClient?.meta_connected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Account ID</span>
                    <span className="font-mono font-medium text-slate-800">act_23855501234</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Account Name</span>
                    <span className="font-medium text-slate-800">{selectedClient.name} — Main</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 mt-2">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-500 gap-2 w-full">
                  <Globe className="w-4 h-4" /> Connect Meta Ads via OAuth
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Google Connection */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Google Ads</CardTitle>
                    <p className="text-xs text-slate-500">Search, Display, Shopping, PMax</p>
                  </div>
                </div>
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                  selectedClient?.google_connected ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50 border-slate-200"
                )}>
                  {selectedClient?.google_connected ? <><CheckCircle2 className="w-3.5 h-3.5" />Connected</> : <><WifiOff className="w-3.5 h-3.5" />Not connected</>}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedClient?.google_connected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Customer ID</span>
                    <span className="font-mono font-medium text-slate-800">987-123-4567</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Account Name</span>
                    <span className="font-medium text-slate-800">{selectedClient.name} — Google Ads</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 mt-2">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button className="bg-green-600 hover:bg-green-500 gap-2 w-full">
                  <Globe className="w-4 h-4" /> Connect Google Ads via OAuth
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">{MOCK_TEAM.length} team members</p>
            <Button onClick={() => setInviteOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-500" size="sm">
              <Plus className="w-4 h-4" /> Invite Member
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_TEAM.map((member) => (
              <Card key={member.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{member.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {member.email}
                    </p>
                  </div>
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", ROLE_COLORS[member.role])}>
                    {ROLE_LABELS[member.role]}
                  </span>
                  {member.role !== "admin" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>They&apos;ll receive an email to join your agency workspace.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <Input type="email" placeholder="colleague@agency.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["admin", "manager", "viewer"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setInviteRole(r)}
                        className={cn("p-2 border rounded-lg text-xs font-medium transition-colors capitalize", inviteRole === r ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={handleInvite} disabled={!inviteEmail} className="bg-violet-600 hover:bg-violet-500">
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Agency Tab */}
        <TabsContent value="agency" className="space-y-4 animate-fade-in">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Agency Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <Button variant="outline" size="sm">Change Logo</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Agency Name</Label>
                  <Input defaultValue="Acme Digital Agency" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input defaultValue="acmedigital.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Contact Email</Label>
                  <Input defaultValue="hello@acmedigital.com" type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Currency</Label>
                  <Input defaultValue="USD" />
                </div>
              </div>
              <Button className="bg-violet-600 hover:bg-violet-500 gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Config Tab */}
        <TabsContent value="ai" className="space-y-4 animate-fade-in">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-600" />
                AI Behavior Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Require approval before any budget change", description: "AI will submit budget changes for human review before executing", default: true },
                { label: "Require approval before pausing campaigns", description: "AI will request approval before pausing any active campaigns", default: true },
                { label: "Auto-approve bid adjustments ≤ 10%", description: "Small bid tweaks execute automatically without approval", default: false },
                { label: "Auto-approve negative keyword additions", description: "AI can add negative keywords without approval", default: false },
                { label: "Enable AI copy generation", description: "Allow AI to generate ad headlines and descriptions", default: true },
                { label: "Enable asset swap suggestions", description: "AI recommends swapping underperforming creatives", default: true },
                { label: "Real-time optimization alerts", description: "Get notified immediately when AI detects optimization opportunities", default: true },
              ].map(({ label, description, default: def }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  <Switch defaultChecked={def} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Optimization Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {["Every 15 min", "Every 30 min", "Every hour"].map((f, i) => (
                  <button key={f} className={cn("p-3 border rounded-lg text-sm font-medium text-center transition-colors", i === 1 ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">AI polls Meta and Google APIs at this interval to fetch latest performance data and generate optimization recommendations.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
