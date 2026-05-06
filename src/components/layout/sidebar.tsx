"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Megaphone, ImageIcon, CheckSquare,
  Bot, BarChart3, Settings, ChevronRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientSwitcher } from "./client-switcher";
import { useClient } from "@/components/providers/client-provider";

const NAV = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Assets", href: "/assets", icon: ImageIcon },
  { label: "Approvals", href: "/approvals", icon: CheckSquare, badge: true },
  { label: "AI Log", href: "/ai-log", icon: Bot },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { selectedClient } = useClient();

  const pendingCount = 2;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 shadow-lg shadow-violet-500/30 flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-none">AdsPilot</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-none">AI Campaign Manager</p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-violet-500/20 text-violet-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-violet-500/30">
          <Zap className="w-2.5 h-2.5" />
          AI ON
        </div>
      </div>

      {/* Client Switcher */}
      <div className="px-3 py-3 border-b border-white/[0.06]">
        <ClientSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-violet-600/20 text-white font-medium"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-violet-400" />}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-white/[0.06]">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
            System
          </p>
          <Link
            href="/settings"
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              pathname.startsWith("/settings")
                ? "bg-violet-600/20 text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            <Settings className="w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-slate-300" />
            <span>Settings & Admin</span>
          </Link>
        </div>
      </nav>

      {/* Platform Connection Status */}
      {selectedClient && (
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
            Connected Platforms
          </p>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border", selectedClient.meta_connected ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-800 text-slate-600 border-slate-700")}>
              <div className={cn("w-1.5 h-1.5 rounded-full", selectedClient.meta_connected ? "bg-blue-400" : "bg-slate-600")} />
              Meta
            </div>
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border", selectedClient.google_connected ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-800 text-slate-600 border-slate-700")}>
              <div className={cn("w-1.5 h-1.5 rounded-full", selectedClient.google_connected ? "bg-green-400" : "bg-slate-600")} />
              Google
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Sarah Johnson</p>
            <p className="text-[11px] text-slate-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
