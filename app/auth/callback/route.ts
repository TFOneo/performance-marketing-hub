import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  // Defense-in-depth: even after a valid code exchange, enforce the allowlist.
  const env = serverEnv();
  if (data.user.email?.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
