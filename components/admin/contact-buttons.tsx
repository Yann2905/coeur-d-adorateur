"use client";

import Link from "next/link";
import { Phone, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/utils";
import { PROGRAM_DATE_LABEL } from "@/lib/constants";

interface Props {
  id: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
  size?: "sm" | "default";
  showDetails?: boolean;
}

export function ContactButtons({
  id,
  prenom,
  telephone,
  whatsapp,
  size = "sm",
  showDetails = true,
}: Props) {
  const waMessage = `Bonjour ${prenom}, c'est l'équipe de Cœur d'Adorateur. Merci pour ton inscription au programme d'adoration du ${PROGRAM_DATE_LABEL} !`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size={size} variant="outline" className="gap-1.5">
        <a href={telLink(telephone)} aria-label={`Appeler ${prenom}`}>
          <Phone className="h-4 w-4 text-primary" />
          Appeler
        </a>
      </Button>
      <Button asChild size={size} variant="outline" className="gap-1.5">
        <a
          href={whatsappLink(whatsapp, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${prenom}`}
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          WhatsApp
        </a>
      </Button>
      {showDetails && (
        <Button asChild size={size} variant="secondary" className="gap-1.5">
          <Link href={`/admin/participant/${id}`}>
            <Eye className="h-4 w-4" />
            Détails
          </Link>
        </Button>
      )}
    </div>
  );
}
