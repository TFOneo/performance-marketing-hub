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
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host");
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { ok: false, error: "Could not send magic link. Please try again." };
  }

  return { ok: true };
}
