/**
 * URL publique de l'application, sans slash final.
 * Priorité : NEXT_PUBLIC_APP_URL → domaine de production Vercel → URL du déploiement.
 * ⚠️ À utiliser côté serveur (les variables VERCEL_* ne sont pas exposées au navigateur).
 */
export function getAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}
