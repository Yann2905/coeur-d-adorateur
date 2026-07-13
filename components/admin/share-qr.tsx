"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, Download } from "lucide-react";
import { swalToast, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShareQr({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      swalToast("success", "Lien copie");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      swalError("Impossible de copier le lien.");
    }
  };

  const download = () => {
    const canvas = document.querySelector<HTMLCanvasElement>("#share-qr canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "coeur-adorateur-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        id="share-qr"
        className="rounded-2xl border border-border bg-white p-5 shadow-sm"
      >
        <QRCodeCanvas
          value={url}
          size={220}
          level="M"
          marginSize={2}
          fgColor="#5b21b6"
        />
      </div>

      <div className="flex w-full max-w-md gap-2">
        <Input readOnly value={url} className="text-sm" />
        <Button variant="outline" size="icon" onClick={copy} aria-label="Copier">
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Button variant="secondary" onClick={download}>
        <Download className="h-4 w-4" /> Télécharger le QR code
      </Button>
    </div>
  );
}
