"use client";
import { usePathname } from "next/navigation";
import { Bell, RefreshCw, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useClient } from "@/components/providers/client-provider";

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/": { title: "Overview", description: "Campaign performance at a glance" },
  "/clients": { title: "Clients", description: "Manage all your client accounts" },
  "/campaigns": { title: "Campaigns", description: "All campaigns across platforms" },
  "/assets": { title: "Asset Library", description: "Manage creative assets and copy" },
  "/approvals": { title: "Approvals", description: "Review pending AI recommendations" },
  "/ai-log": { title: "AI Audit Log", description: "All AI actions and changes" },
  "/reports": { title: "Reports", description: "Performance analytics and insights" },
  "/settings": { title: "Settings & Admin", description: "Configure your workspace" },
};

export function Topbar() {
  const pathname = usePathname();
  const { selectedClient } = useClient();

  const pageKey = Object.keys(PAGE_TITLES).find(
    (k) => k === "/" ? pathname === "/" : pathname.startsWith(k)
  ) ?? "/";
  const page = PAGE_TITLES[pageKey];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white/80 backdrop-blur-sm px-6 gap-4">
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-slate-900 leading-none">{page.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{page.description}</p>
      </div>

      {/* Client context pill */}
      {selectedClient && pathname !== "/clients" && (
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-600">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold">
            {selectedClient.name[0]}
          </div>
          <span className="font-medium">{selectedClient.name}</span>
        </div>
      )}

      {/* Last sync */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
        <RefreshCw className="w-3 h-3" />
        <span>Synced 4 min ago</span>
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-600">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full ring-2 ring-white" />
      </Button>

      {/* Settings shortcut */}
      <Link href="/settings">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
        SJ
      </div>
    </header>
  );
}
