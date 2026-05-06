"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, Search, Plus } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useClient } from "@/components/providers/client-provider";
import type { Client } from "@/types";

export function ClientSwitcher() {
  const { clients, selectedClient, setSelectedClient } = useClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const select = (client: Client) => {
    setSelectedClient(client);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] transition-all group"
      >
        {selectedClient ? (
          <>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(selectedClient.name)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate leading-none">{selectedClient.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-none truncate">{selectedClient.industry}</p>
            </div>
          </>
        ) : (
          <span className="text-sm text-slate-500">Select client…</span>
        )}
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.06] rounded-lg">
                <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients…"
                  className="flex-1 text-sm text-white bg-transparent outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto scrollbar-thin py-1.5">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No clients found</p>
              ) : (
                filtered.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => select(client)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.06] transition-colors",
                      selectedClient?.id === client.id && "bg-violet-600/10"
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(client.name)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-white font-medium truncate leading-none">{client.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {client.meta_connected && (
                          <span className="text-[10px] text-blue-400">Meta</span>
                        )}
                        {client.meta_connected && client.google_connected && (
                          <span className="text-[10px] text-slate-600">·</span>
                        )}
                        {client.google_connected && (
                          <span className="text-[10px] text-green-400">Google</span>
                        )}
                      </div>
                    </div>
                    {selectedClient?.id === client.id && (
                      <Check className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Add client */}
            <div className="p-2 border-t border-white/[0.06]">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                <Plus className="w-4 h-4" />
                Add new client
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
