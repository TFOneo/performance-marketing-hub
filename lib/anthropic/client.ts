import "server-only";
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { z } from "zod";
import { serverEnv } from "@/lib/env";

// Pinned model — model upgrades are deliberate PRs, not env changes.
export const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const REQUEST_TIMEOUT_MS = 30_000;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  const env = serverEnv();
  client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    maxRetries: 0, // we handle retries explicitly so logging is clear
  });
  return client;
}

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
}

export type CallJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; stage: "api" | "parse" | "validate"; error: string };

export interface CallJsonOptions<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxTokens: number;
  label: string;
}

async function callOnce(opts: {
  system: string;
  user: string;
  maxTokens: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string; retryable: boolean }> {
  const c = getClient();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await c.messages.create(
      {
        model: ANTHROPIC_MODEL,
        temperature: 0,
        max_tokens: opts.maxTokens,
        system: opts.system,
        messages: [{ role: "user", content: opts.user }],
      },
      { signal: controller.signal },
    );
    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      return { ok: false, error: "No text block in response", retryable: false };
    }
    return { ok: true, text: block.text };
  } catch (e) {
    const err = e as APIError | Error;
    if (err instanceof APIError) {
      const retryable =
        err.status === 429 || (typeof err.status === "number" && err.status >= 500);
      return { ok: false, error: `${err.status ?? ""} ${err.message}`.trim(), retryable };
    }
    if ((err as Error).name === "AbortError") {
      return { ok: false, error: "Request timed out", retryable: true };
    }
    return { ok: false, error: (err as Error).message ?? "Unknown error", retryable: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function callJson<T>(opts: CallJsonOptions<T>): Promise<CallJsonResult<T>> {
  let attempt = await callOnce(opts);
  if (!attempt.ok && attempt.retryable) {
    await new Promise((r) => setTimeout(r, 1000));
    attempt = await callOnce(opts);
  }
  if (!attempt.ok) {
    return { ok: false, stage: "api", error: attempt.error };
  }

  const cleaned = stripFences(attempt.text);
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (e) {
    console.warn(`[ai:${opts.label}] parse failed:`, cleaned.slice(0, 500));
    return {
      ok: false,
      stage: "parse",
      error: `JSON parse failed: ${(e as Error).message}`,
    };
  }

  const validated = opts.schema.safeParse(parsedJson);
  if (!validated.success) {
    console.warn(
      `[ai:${opts.label}] validate failed:`,
      validated.error.issues.slice(0, 3),
      cleaned.slice(0, 500),
    );
    return {
      ok: false,
      stage: "validate",
      error: validated.error.issues[0]?.message ?? "Schema validation failed",
    };
  }

  return { ok: true, data: validated.data };
}
