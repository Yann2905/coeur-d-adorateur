import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getParticipant, getParticipantHistory } from "@/lib/data";
import { ParticipantDetail } from "@/components/admin/participant-detail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = await getParticipant(id);
  return { title: p ? `${p.prenom} ${p.nom}` : "Participant" };
}

export default async function ParticipantPage({ params }: PageProps) {
  const { id } = await params;
  const [participant, history] = await Promise.all([
    getParticipant(id),
    getParticipantHistory(id),
  ]);

  if (!participant) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/admin/participants"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la liste
      </Link>
      <ParticipantDetail participant={participant} history={history} />
    </div>
  );
}
