import { supabase } from "@/integrations/supabase/client";

export async function callEdgeFunction<T>(functionName: string, payload: unknown): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!token) throw new Error("Please sign in again before using AI tools.");
  if (!baseUrl || !publishableKey) throw new Error("Backend connection is not configured.");

  const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: publishableKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || body?.message || `Request failed (${response.status})`);
  }
  return body as T;
}