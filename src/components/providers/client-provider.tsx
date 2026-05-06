"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Client, ClientContextValue } from "@/types";
import { MOCK_CLIENTS } from "@/lib/mock-data";

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedClientId");
    const match = clients.find((c) => c.id === saved) ?? clients[0] ?? null;
    setSelectedClient(match);
  }, [clients]);

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    localStorage.setItem("selectedClientId", client.id);
  };

  return (
    <ClientContext.Provider
      value={{ clients, selectedClient, setSelectedClient: handleSelect, isLoading: false }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
