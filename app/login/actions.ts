"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

const inputSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required."),
});

type SignInResult = { ok: false; error: string };

export async function signInWithPassword(formData: FormData): Promise<SignInResult> {
  const parsed = inputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const env = serverEnv();
  if (parsed.data.email !== env.ALLOWED_EMAIL.toLowerCase()) {
    return { ok: false, error: "This email is not authorised for this app." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: `${error.message} (${error.status ?? error.code})` };
  }

  redirect("/");
}
