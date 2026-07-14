import { MessageCircle } from "lucide-react";
import { getParticipantsForPresence } from "@/lib/data";
import { WhatsappHelper } from "@/components/admin/whatsapp-helper";

export const metadata = { title: "Message WhatsApp" };
export const dynamic = "force-dynamic";

export default async function WhatsappPage() {
  const rows = await getParticipantsForPresence();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Message WhatsApp de groupe
          </h1>
          <p className="text-muted-foreground">
            Prépare un message et contacte plusieurs personnes rapidement.
          </p>
        </div>
      </div>

      <WhatsappHelper rows={rows} />
    </div>
  );
}
