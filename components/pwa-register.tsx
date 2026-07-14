"use client";

import { useEffect } from "react";

/**
 * Enregistre le Service Worker et gère la MISE À JOUR AUTOMATIQUE :
 * quand une nouvelle version est déployée, l'app installée (écran d'accueil)
 * se met à jour et se recharge toute seule, sans action de l'utilisateur.
 */
export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let refreshing = false;
    // Y avait-il déjà une version active ? (pour ne pas recharger à la 1re install)
    const hadController = !!navigator.serviceWorker.controller;

    const onControllerChange = () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    const onLoad = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Une nouvelle version est trouvée → on l'active tout de suite.
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              nw.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // Vérifie régulièrement les mises à jour + au retour sur l'app.
        const check = () => reg.update().catch(() => {});
        const interval = window.setInterval(check, 60_000);
        const onVisible = () => {
          if (document.visibilityState === "visible") check();
        };
        document.addEventListener("visibilitychange", onVisible);

        window.addEventListener(
          "pagehide",
          () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
          },
          { once: true }
        );
      } catch {
        /* échec silencieux — l'app reste utilisable sans SW */
      }
    };

    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}
