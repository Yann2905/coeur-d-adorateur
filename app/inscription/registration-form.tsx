"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { swalToast, swalError } from "@/lib/swal";
import {
  User,
  Phone,
  MapPin,
  Info,
  Loader2,
  Heart,
  Church,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/components/ui/phone-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SEXE_OPTIONS,
  AGE_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/constants";
import { registrationSchema } from "@/lib/validations";
import { registerParticipant } from "@/app/actions";

type Errors = Record<string, string>;

const initialState = {
  nom: "",
  prenom: "",
  whatsapp: "",
  telephone: "",
  ville: "",
  quartier: "",
  email: "",
  sexe: "",
  age: "",
  eglise: "",
  source: "",
  agape: false,
  website: "", // honeypot
};

const FIELD_LABELS: Record<string, string> = {
  prenom: "Prénom",
  nom: "Nom",
  whatsapp: "Numéro WhatsApp",
  telephone: "Téléphone joignable",
  email: "Email",
  ville: "Ville",
  quartier: "Quartier",
  sexe: "Sexe",
  age: "Tranche d'âge",
  eglise: "Église",
  source: "Source",
};

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </h2>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

export function RegistrationForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof typeof values, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client (miroir du serveur).
    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        // On ignore le honeypot ("website") : il ne doit jamais bloquer un vrai
        // utilisateur (le serveur s'en occupe silencieusement).
        if (typeof k === "string" && k !== "website" && !fe[k]) {
          fe[k] = issue.message;
        }
      }

      // S'il ne reste que l'erreur du honeypot, on laisse passer.
      if (Object.keys(fe).length > 0) {
        setErrors(fe);
        const labels = Object.keys(fe).map((k) => FIELD_LABELS[k] ?? k);
        swalError(
          "Formulaire incomplet",
          `Merci de vérifier : ${labels.join(", ")}.`
        );
        const first = document.querySelector<HTMLElement>(
          `[data-field="${Object.keys(fe)[0]}"]`
        );
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    startTransition(async () => {
      const result = await registerParticipant(values);
      if (result.ok) {
        swalToast("success", "Inscription enregistree");
        router.push("/confirmation");
      } else {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        swalError(
          "Inscription impossible",
          result.error ?? "Une erreur est survenue."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-9" noValidate>
      {/* Honeypot anti-spam (invisible, nom neutre pour éviter l'auto-remplissage) */}
      <div
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <input
          id="cad_extra"
          name="cad_extra"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      {/* IDENTITÉ */}
      <section className="space-y-4">
        <SectionTitle icon={User}>Identité</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="prenom">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              value={values.prenom}
              onChange={(e) => set("prenom", e.target.value)}
              placeholder="Ton prénom"
              className={cn("mt-1.5", errors.prenom && "border-destructive")}
            />
            <FieldError msg={errors.prenom} />
          </div>
          <div data-field="nom">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={values.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Ton nom"
              className={cn("mt-1.5", errors.nom && "border-destructive")}
            />
            <FieldError msg={errors.nom} />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="space-y-4">
        <SectionTitle icon={Phone}>Contact</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="whatsapp">
            <Label htmlFor="whatsapp">Numéro WhatsApp *</Label>
            <PhoneField
              id="whatsapp"
              value={values.whatsapp}
              onChange={(v) => set("whatsapp", v)}
              invalid={!!errors.whatsapp}
              className="mt-1.5"
            />
            <FieldError msg={errors.whatsapp} />
          </div>
          <div data-field="telephone">
            <Label htmlFor="telephone">Téléphone joignable *</Label>
            <PhoneField
              id="telephone"
              value={values.telephone}
              onChange={(v) => set("telephone", v)}
              invalid={!!errors.telephone}
              className="mt-1.5"
            />
            <FieldError msg={errors.telephone} />
          </div>
        </div>
        <div data-field="email">
          <Label htmlFor="email">Email (optionnel)</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="ton@email.com"
            className={cn("mt-1.5", errors.email && "border-destructive")}
          />
          <FieldError msg={errors.email} />
        </div>
      </section>

      {/* LOCALISATION */}
      <section className="space-y-4">
        <SectionTitle icon={MapPin}>Localisation</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="ville">
            <Label htmlFor="ville">Ville *</Label>
            <Input
              id="ville"
              value={values.ville}
              onChange={(e) => set("ville", e.target.value)}
              placeholder="Ex. Daloa"
              className={cn("mt-1.5", errors.ville && "border-destructive")}
            />
            <FieldError msg={errors.ville} />
          </div>
          <div data-field="quartier">
            <Label htmlFor="quartier">Quartier *</Label>
            <Input
              id="quartier"
              value={values.quartier}
              onChange={(e) => set("quartier", e.target.value)}
              placeholder="Ex. Tazibouo"
              className={cn("mt-1.5", errors.quartier && "border-destructive")}
            />
            <FieldError msg={errors.quartier} />
          </div>
        </div>
      </section>

      {/* INFORMATIONS SUPPLÉMENTAIRES */}
      <section className="space-y-4">
        <SectionTitle icon={Info}>Informations supplémentaires</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="sexe">
            <Label>Sexe *</Label>
            <Select value={values.sexe} onValueChange={(v) => set("sexe", v)}>
              <SelectTrigger
                className={cn("mt-1.5", errors.sexe && "border-destructive")}
              >
                <SelectValue placeholder="Sélectionne" />
              </SelectTrigger>
              <SelectContent>
                {SEXE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={errors.sexe} />
          </div>
          <div data-field="age">
            <Label>Tranche d'âge *</Label>
            <Select value={values.age} onValueChange={(v) => set("age", v)}>
              <SelectTrigger
                className={cn("mt-1.5", errors.age && "border-destructive")}
              >
                <SelectValue placeholder="Sélectionne" />
              </SelectTrigger>
              <SelectContent>
                {AGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={errors.age} />
          </div>
        </div>

        <div data-field="eglise">
          <Label htmlFor="eglise" className="flex items-center gap-1.5">
            <Church className="h-3.5 w-3.5" /> Église (optionnel)
          </Label>
          <Input
            id="eglise"
            value={values.eglise}
            onChange={(e) => set("eglise", e.target.value)}
            placeholder="Nom de ton église / assemblée"
            className="mt-1.5"
          />
        </div>

        <div data-field="source">
          <Label>Comment as-tu connu le programme ?</Label>
          <Select value={values.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* AGAPÉ */}
      <section>
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="font-medium">
                Es-tu disponible pour l'agapé après le programme ?
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Un repas de communion fraternelle suivra la journée d'adoration.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => set("agape", true)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all active:scale-[0.98]",
                    values.agape
                      ? "border-gold bg-gold text-gold-foreground shadow-md"
                      : "border-input bg-background hover:border-gold/50 hover:bg-accent"
                  )}
                >
                  Oui, je serai là
                </button>
                <button
                  type="button"
                  onClick={() => set("agape", false)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all active:scale-[0.98]",
                    !values.agape
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-input bg-background hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  Non / Pas sûr
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-14 w-full text-base font-semibold shadow-md"
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enregistrement…
          </>
        ) : (
          <>
            <Heart className="h-5 w-5" />
            Valider mon inscription
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En t'inscrivant, tu acceptes d'être contacté(e) par l'équipe
        organisatrice au sujet du programme.
      </p>
    </form>
  );
}
