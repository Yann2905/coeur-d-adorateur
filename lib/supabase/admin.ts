import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé SERVICE ROLE.
 * IMPORTANT : SERVEUR UNIQUEMENT — bypasse les policies RLS.
 * Utilisé pour : insertion d'inscription publique, cron ping, tâches privilégiées.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
