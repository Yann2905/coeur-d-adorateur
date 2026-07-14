import { CheckSquare } from "lucide-react";
import { getParticipantsForPresence } from "@/lib/data";
import { PresenceBoard } from "@/components/admin/presence-board";
import { PROGRAM_DATE_LABEL } from "@/lib/constants";

export const metadata = { title: "Présence (jour J)" };
export const dynamic = "force-dynamic";

export default async function PresencePage() {
  const rows = await getParticipantsForPresence();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Présence — jour J
          </h1>
          <p className="text-muted-foreground">
            Marque les présents à l'accueil du {PROGRAM_DATE_LABEL}.
          </p>
        </div>
      </div>

      <PresenceBoard rows={rows} />
    </div>
  );
}
