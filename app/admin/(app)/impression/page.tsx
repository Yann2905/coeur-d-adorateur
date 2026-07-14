import { getAllParticipantsForExport } from "@/lib/data";
import { PrintButton } from "@/components/admin/print-button";
import { BrandMark } from "@/components/brand";
import { PROGRAM_NAME, PROGRAM_DATE_LABEL } from "@/lib/constants";

export const metadata = { title: "Feuille de présence" };
export const dynamic = "force-dynamic";

export default async function ImpressionPage() {
  const rows = await getAllParticipantsForExport();
  // Tri alphabétique pour la feuille papier.
  const sorted = [...rows].sort((a, b) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr")
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="no-print mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {sorted.length} participant(s) — prêt pour l'impression ou l'export PDF.
        </p>
        <PrintButton />
      </div>

      <div className="print-sheet rounded-2xl border border-border bg-white p-6 text-black shadow-sm">
        {/* En-tête */}
        <div className="mb-5 flex items-center justify-between border-b border-gray-300 pb-4">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <h1 className="font-display text-xl font-bold">{PROGRAM_NAME}</h1>
              <p className="text-sm text-gray-600">
                Feuille de présence — {PROGRAM_DATE_LABEL}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Total : {sorted.length}</p>
            <p>Édité le {new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        {/* Tableau */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-400 text-left">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Nom & Prénom</th>
              <th className="py-2 pr-2">Ville / Quartier</th>
              <th className="py-2 pr-2">Téléphone</th>
              <th className="py-2 pr-2 text-center">Agapé</th>
              <th className="py-2 pr-2 text-center">Présent</th>
              <th className="py-2">Signature</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={p.id} className="border-b border-gray-200">
                <td className="py-2 pr-2 text-gray-500">{i + 1}</td>
                <td className="py-2 pr-2 font-medium">
                  {p.nom.toUpperCase()} {p.prenom}
                </td>
                <td className="py-2 pr-2 text-gray-700">
                  {p.ville}
                  {p.quartier ? ` / ${p.quartier}` : ""}
                </td>
                <td className="py-2 pr-2 text-gray-700">{p.telephone}</td>
                <td className="py-2 pr-2 text-center">{p.agape ? "Oui" : "—"}</td>
                <td className="py-2 pr-2 text-center">
                  <span className="inline-block h-4 w-4 rounded-sm border border-gray-500" />
                </td>
                <td className="py-2">
                  <span className="inline-block h-5 w-full min-w-[80px] border-b border-dotted border-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            Aucun participant inscrit pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
