"use client";
import { useState } from "react";
import {
  Key, Bot, Globe, Shield, Users, CheckCircle2, Eye, EyeOff,
  Plus, Trash2, RefreshCw, AlertCircle, Wifi, WifiOff,
  Building2, Mail, Lock, Save, ExternalLink, ShoppingBag,
  Send, Bell, BellOff, Clock, Hash,
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
                <Button onClick={handleSave} disabled={!state.value.trim() || saving} className="bg-violet-600 hover:bg-violet-500 flex-shrink-0 gap-1.5" size="sm">
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
                  <Lock className="w-3 h-3" /> Keys are encrypted at rest and never logged
                </span>
                <a href={service.docs} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 hover:text-violet-800 font-medium">
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

function ShopifyTab() {
  const { selectedClient } = useClient();
  const [storeUrl, setStoreUrl] = useState(selectedClient?.shopify_store_url ?? "");
  const [accessToken, setAccessToken] = useState("");
  const [tokenVisible, setTokenVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(selectedClient?.shopify_connected ?? false);

  const handleConnect = async () => {
    if (!storeUrl || !accessToken) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setConnected(true);
    toast.success("Shopify store connected! AI will now cross-reference ad performance with store revenue.");
  };

  const handleDisconnect = () => {
    setConnected(false);
    setStoreUrl("");
    setAccessToken("");
    toast.success("Shopify store disconnected.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <ShoppingBag className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Connect Shopify for deeper AI insights</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            When connected, the AI analyses actual Shopify revenue, orders, and conversion data alongside ad metrics — giving a true picture of campaign effectiveness beyond platform-reported conversions.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-sm">{selectedClient?.name ?? "Selected Client"} — Shopify</CardTitle>
                <p className="text-xs text-slate-500">Store revenue & order data</p>
              </div>
            </div>
            <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
              connected ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-50 border-slate-200"
            )}>
              {connected ? <><CheckCircle2 className="w-3.5 h-3.5" />Connected</> : <><WifiOff className="w-3.5 h-3.5" />Not connected</>}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {connected ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Store", value: selectedClient?.shopify_store_url ?? storeUrl },
                  { label: "Revenue (MTD)", value: "$284,600" },
                  { label: "Orders (MTD)", value: "1,842" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700">
                <p className="font-semibold mb-1">AI insights enabled</p>
                <ul className="space-y-0.5 list-disc pl-4">
                  <li>Real revenue attribution vs. ad spend</li>
                  <li>True ROAS based on Shopify orders (not pixel conversions)</li>
                  <li>Product-level performance tied to campaign creatives</li>
                  <li>Cart abandonment correlated with retargeting campaigns</li>
                </ul>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisconnect}>
                Disconnect Shopify
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Shopify Store URL</Label>
                <Input
                  placeholder="yourstore.myshopify.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                />
                <p className="text-xs text-slate-400">Your Shopify store domain (without https://)</p>
              </div>
              <div className="space-y-1.5">
                <Label>Admin API Access Token</Label>
                <div className="relative">
                  <Input
                    type={tokenVisible ? "text" : "password"}
                    placeholder="shpat_••••••••••••••••••••••••"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <button type="button" onClick={() => setTokenVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {tokenVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Token is encrypted at rest. Create one in Shopify Admin → Apps → Develop apps.
                </p>
              </div>
              <Button onClick={handleConnect} disabled={!storeUrl || !accessToken || saving} className="bg-emerald-600 hover:bg-emerald-500 gap-2 w-full">
                {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting…</> : <><ShoppingBag className="w-4 h-4" /> Connect Shopify</>}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {connected && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Shopify AI Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Use Shopify revenue as primary ROAS source", description: "Override platform-reported ROAS with actual Shopify revenue data", def: true },
              { label: "Include abandoned cart data in retargeting analysis", description: "AI uses cart abandonment events to size and prioritise retargeting budgets", def: true },
              { label: "Product-level performance attribution", description: "Link individual products to campaigns for granular AI recommendations", def: false },
              { label: "Weekly Shopify revenue report in Telegram", description: "Send store performance summary with ad attribution every Monday", def: true },
            ].map(({ label, description, def }) => (
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
      )}
    </div>
  );
}

function TelegramTab() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [tokenVisible, setTokenVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  const notifications = [
    { key: "pending_approvals", label: "Pending approvals", description: "Alert when AI submits an action for your review", icon: Bell, def: true },
    { key: "campaign_alerts", label: "Campaign performance alerts", description: "Notify when a campaign drops below targets", icon: AlertCircle, def: true },
    { key: "budget_alerts", label: "Budget alerts", description: "Warn when a client approaches 85% or 100% of monthly budget", icon: AlertCircle, def: true },
    { key: "ai_actions", label: "AI actions executed", description: "Confirm when an approved AI action is completed", icon: Bot, def: false },
    { key: "weekly_report", label: "Weekly performance report", description: "Summary of all clients every Monday at 9am", icon: RefreshCw, def: true },
  ];

  const handleSave = async () => {
    if (!botToken || !chatId) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    toast.success("Telegram bot configured! You'll now receive updates.");
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTesting(false);
    toast.success("Test message sent to your Telegram bot!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Send className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Telegram Bot Notifications</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Get instant updates on pending approvals, campaign alerts, and weekly performance reports directly in Telegram. Create a bot via <span className="font-semibold">@BotFather</span> on Telegram to get started.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-500" /> Bot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Bot Token</Label>
            <div className="relative">
              <Input
                type={tokenVisible ? "text" : "password"}
                placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
                value={botToken}
                onChange={(e) => { setBotToken(e.target.value); setSaved(false); }}
                className="pr-10 font-mono text-sm"
              />
              <button type="button" onClick={() => setTokenVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {tokenVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">Get this from @BotFather → /newbot or /token</p>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Chat ID</Label>
            <Input
              placeholder="-1001234567890 or your personal ID"
              value={chatId}
              onChange={(e) => { setChatId(e.target.value); setSaved(false); }}
            />
            <p className="text-xs text-slate-400">Your personal chat ID or a group/channel ID. Send a message to @userinfobot to find yours.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={!botToken || !chatId || saving} className="bg-blue-600 hover:bg-blue-500 gap-2 flex-1">
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Bot Config</>}
            </Button>
            {saved && (
              <Button variant="outline" onClick={handleTest} disabled={testing} className="gap-2">
                {testing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing…</> : <><Send className="w-3.5 h-3.5" /> Test</>}
              </Button>
            )}
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bot connected — {chatId}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map(({ key, label, description, icon: Icon, def }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                </div>
              </div>
              <Switch defaultChecked={def} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">Suppress non-critical notifications during these hours.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input type="time" defaultValue="22:00" />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Always send budget emergencies</p>
              <p className="text-xs text-slate-500 mt-0.5">Override quiet hours when a campaign exhausts its budget</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-500 gap-2" size="sm">
            <Save className="w-3.5 h-3.5" /> Save Quiet Hours
          </Button>
        </CardContent>
      </Card>
    </div>
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
        <TabsList className="w-full mb-6 grid grid-cols-7">
          <TabsTrigger value="integrations" className="gap-1.5 text-xs"><Key className="w-3.5 h-3.5" />API Keys</TabsTrigger>
          <TabsTrigger value="connections" className="gap-1.5 text-xs"><Wifi className="w-3.5 h-3.5" />Ad Accounts</TabsTrigger>
          <TabsTrigger value="shopify" className="gap-1.5 text-xs"><ShoppingBag className="w-3.5 h-3.5" />Shopify</TabsTrigger>
          <TabsTrigger value="telegram" className="gap-1.5 text-xs"><Send className="w-3.5 h-3.5" />Telegram</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Team</TabsTrigger>
          <TabsTrigger value="agency" className="gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" />Agency</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 text-xs"><Bot className="w-3.5 h-3.5" />AI Config</TabsTrigger>
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
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 mt-2">Disconnect</Button>
                </div>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-500 gap-2 w-full">
                  <Globe className="w-4 h-4" /> Connect Meta Ads via OAuth
                </Button>
              )}
            </CardContent>
          </Card>

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
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 mt-2">Disconnect</Button>
                </div>
              ) : (
                <Button className="bg-green-600 hover:bg-green-500 gap-2 w-full">
                  <Globe className="w-4 h-4" /> Connect Google Ads via OAuth
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopify Tab */}
        <TabsContent value="shopify" className="animate-fade-in">
          <ShopifyTab />
        </TabsContent>

        {/* Telegram Tab */}
        <TabsContent value="telegram" className="animate-fade-in">
          <TelegramTab />
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
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>
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
                      <button key={r} onClick={() => setInviteRole(r)} className={cn("p-2 border rounded-lg text-xs font-medium transition-colors capitalize", inviteRole === r ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={handleInvite} disabled={!inviteEmail} className="bg-violet-600 hover:bg-violet-500">Send Invite</Button>
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold">A</div>
                <Button variant="outline" size="sm">Change Logo</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Agency Name</Label><Input defaultValue="Acme Digital Agency" /></div>
                <div className="space-y-1.5"><Label>Website</Label><Input defaultValue="acmedigital.com" /></div>
                <div className="space-y-1.5"><Label>Primary Contact Email</Label><Input defaultValue="hello@acmedigital.com" type="email" /></div>
                <div className="space-y-1.5"><Label>Default Currency</Label><Input defaultValue="USD" /></div>
              </div>
              <Button className="bg-violet-600 hover:bg-violet-500 gap-2"><Save className="w-4 h-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Config Tab */}
        <TabsContent value="ai" className="space-y-4 animate-fade-in">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-600" /> AI Behavior Settings
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
                { label: "Use Shopify data in optimization decisions", description: "AI factors real Shopify revenue into ROAS calculations and budget decisions", default: true },
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
              <CardTitle className="text-sm">Default Optimization Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {["Every 15 min", "Every 30 min", "Every hour", "Every 3 hrs", "Every 6 hrs", "Every 12 hrs", "Daily"].map((f, i) => (
                  <button key={f} className={cn("p-3 border rounded-lg text-xs font-medium text-center transition-colors", i === 2 ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">This is the default for new campaigns. You can override it per-campaign on the Campaigns page.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
