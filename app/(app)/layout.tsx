import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

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

  return <>{children}</>;
}
