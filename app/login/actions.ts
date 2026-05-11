"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

const inputSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

type SignInResult = { ok: true } | { ok: false; error: string };

export async function requestMagicLink(formData: FormData): Promise<SignInResult> {
  const parsed = inputSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const env = serverEnv();
  if (parsed.data.email !== env.ALLOWED_EMAIL.toLowerCase()) {
    return { ok: false, error: "This email is not authorised for this app." };
  }

  const hdrs = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (() => {
      const proto = hdrs.get("x-forwarded-proto") ?? "http";
      const host = hdrs.get("host");
      return `${proto}://${host}`;
    })();

  const redirectTo = `${origin}/auth/callback`;
  console.log("[auth] origin:", origin, "redirectTo:", redirectTo);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    console.error("[auth] signInWithOtp error:", error.message, error.status, error.code);
    return { ok: false, error: `${error.message} (status: ${error.status})` };
  }

  return { ok: true };
}
