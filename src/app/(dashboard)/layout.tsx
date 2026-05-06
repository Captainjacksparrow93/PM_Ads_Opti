import { ClientProvider } from "@/components/providers/client-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-[260px]">
          <Topbar />
          <main className="flex-1 p-6 animate-fade-in">{children}</main>
        </div>
      </div>
    </ClientProvider>
  );
}
