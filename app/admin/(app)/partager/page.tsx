import { QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ShareQr } from "@/components/admin/share-qr";
import { PROGRAM_DATE_LABEL } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/app-url";

export const metadata = { title: "Partager l'inscription" };

export default function PartagerPage() {
  const inscriptionUrl = `${getAppBaseUrl()}/inscription`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Partager l'inscription
          </h1>
          <p className="text-muted-foreground">
            Diffuse ce QR code et ce lien pour inviter à s'inscrire.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Scanne ou partage pour accéder au formulaire d'inscription au
            programme du {PROGRAM_DATE_LABEL}.
          </p>
          <ShareQr url={inscriptionUrl || "/inscription"} />
        </CardContent>
      </Card>
    </div>
  );
}
