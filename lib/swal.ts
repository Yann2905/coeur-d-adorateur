"use client";

import Swal from "sweetalert2";

/** Détecte le thème sombre pour adapter les couleurs de SweetAlert2. */
function isDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function palette() {
  const dark = isDark();
  return {
    background: dark ? "#1a1222" : "#ffffff",
    color: dark ? "#efeaf6" : "#1c1424",
    confirmButtonColor: "#7c3aed",
    cancelButtonColor: dark ? "#3a2f47" : "#e6e2ef",
  };
}

/** Petit toast discret (haut de l'écran) — succès / erreur / info. */
export function swalToast(
  icon: "success" | "error" | "warning" | "info",
  title: string
) {
  const p = palette();
  return Swal.fire({
    toast: true,
    position: "top",
    icon,
    title,
    showConfirmButton: false,
    timer: 3200,
    timerProgressBar: true,
    background: p.background,
    color: p.color,
  });
}

/** Modale de succès (validation aboutie). */
export function swalSuccess(title: string, text?: string) {
  const p = palette();
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
    background: p.background,
    color: p.color,
    confirmButtonColor: p.confirmButtonColor,
  });
}

/** Modale d'erreur. */
export function swalError(title: string, text?: string) {
  const p = palette();
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
    background: p.background,
    color: p.color,
    confirmButtonColor: p.confirmButtonColor,
  });
}

/** Confirmation (Oui / Annuler). Renvoie true si confirmé. */
export async function swalConfirm(options: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info";
  danger?: boolean;
}): Promise<boolean> {
  const p = palette();
  const result = await Swal.fire({
    icon: options.icon ?? "warning",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Confirmer",
    cancelButtonText: options.cancelText ?? "Annuler",
    reverseButtons: true,
    focusCancel: true,
    background: p.background,
    color: p.color,
    confirmButtonColor: options.danger ? "#dc2626" : p.confirmButtonColor,
    cancelButtonColor: p.cancelButtonColor,
  });
  return result.isConfirmed;
}
