import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const env = serverEnv();
  if (!user || user.email?.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) {
    redirect("/login");
  }

  return (
    <div className="bg-bg min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Header email={user.email ?? ""} />
        <main>{children}</main>
      </div>
    </div>
  );
}
