import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Public by design — RLS is the security boundary (insert + 24h select only). */
const SUPABASE_URL = "https://ppiqaqcseyorrsjarwfn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwaXFhcWNzZXlvcnJzamFyd2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA0MjksImV4cCI6MjA5MTk0NjQyOX0.qicDRBQnG0zztQjnWEMM3Af0rSV4enqk28RRcz5xFTY";

let client: SupabaseClient | null = null;

/** Lazy singleton: no connection is ever opened unless presence is enabled. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
