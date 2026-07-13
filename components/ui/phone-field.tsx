"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ─── Drapeaux dessinés en SVG (fiables sur Windows, contrairement aux emojis) ─── */

const STAR =
  "M 0 -1 L 0.2245 -0.309 L 0.9511 -0.309 L 0.3633 0.118 L 0.5878 0.809 L 0 0.382 L -0.5878 0.809 L -0.3633 0.118 L -0.9511 -0.309 L -0.2245 -0.309 Z";

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  return <path transform={`translate(${cx} ${cy}) scale(${r})`} d={STAR} fill={fill} />;
}

function VFlag({ colors }: { colors: string[] }) {
  return (
    <>
      {colors.map((c, i) => (
        <rect key={i} x={i} y={0} width={1} height={2} fill={c} />
      ))}
    </>
  );
}

function HFlag({ colors }: { colors: string[] }) {
  const h = 2 / colors.length;
  return (
    <>
      {colors.map((c, i) => (
        <rect key={i} x={0} y={i * h} width={3} height={h} fill={c} />
      ))}
    </>
  );
}

type Country = {
  code: string;
  dial: string;
  name: string;
  flag: React.ReactNode;
};

/* Liste ciblée Afrique de l'Ouest / Centrale + quelques autres. */
export const COUNTRIES: Country[] = [
  {
    code: "CI",
    dial: "+225",
    name: "Côte d'Ivoire",
    flag: <VFlag colors={["#F77F00", "#FFFFFF", "#009E60"]} />,
  },
  {
    code: "BJ",
    dial: "+229",
    name: "Bénin",
    flag: (
      <>
        <rect x={0} y={0} width={1} height={2} fill="#008751" />
        <rect x={1} y={0} width={2} height={1} fill="#FCD116" />
        <rect x={1} y={1} width={2} height={1} fill="#E8112D" />
      </>
    ),
  },
  {
    code: "TG",
    dial: "+228",
    name: "Togo",
    flag: (
      <>
        <HFlag colors={["#006A4E", "#FFCE00", "#006A4E", "#FFCE00", "#006A4E"]} />
        <rect x={0} y={0} width={1.2} height={1.2} fill="#D21034" />
        <Star cx={0.6} cy={0.6} r={0.42} fill="#FFFFFF" />
      </>
    ),
  },
  {
    code: "BF",
    dial: "+226",
    name: "Burkina Faso",
    flag: (
      <>
        <HFlag colors={["#EF2B2D", "#009E49"]} />
        <Star cx={1.5} cy={1} r={0.42} fill="#FCD116" />
      </>
    ),
  },
  {
    code: "ML",
    dial: "+223",
    name: "Mali",
    flag: <VFlag colors={["#14B53A", "#FCD116", "#CE1126"]} />,
  },
  {
    code: "SN",
    dial: "+221",
    name: "Sénégal",
    flag: (
      <>
        <VFlag colors={["#00853F", "#FDEF42", "#E31B23"]} />
        <Star cx={1.5} cy={1} r={0.42} fill="#00853F" />
      </>
    ),
  },
  {
    code: "GN",
    dial: "+224",
    name: "Guinée",
    flag: <VFlag colors={["#CE1126", "#FCD116", "#009460"]} />,
  },
  {
    code: "NE",
    dial: "+227",
    name: "Niger",
    flag: (
      <>
        <HFlag colors={["#E05206", "#FFFFFF", "#0DB02B"]} />
        <circle cx={1.5} cy={1} r={0.3} fill="#E05206" />
      </>
    ),
  },
  {
    code: "GH",
    dial: "+233",
    name: "Ghana",
    flag: (
      <>
        <HFlag colors={["#CE1126", "#FCD116", "#006B3F"]} />
        <Star cx={1.5} cy={1} r={0.42} fill="#000000" />
      </>
    ),
  },
  {
    code: "NG",
    dial: "+234",
    name: "Nigéria",
    flag: <VFlag colors={["#008751", "#FFFFFF", "#008751"]} />,
  },
  {
    code: "CM",
    dial: "+237",
    name: "Cameroun",
    flag: (
      <>
        <VFlag colors={["#007A5E", "#CE1126", "#FCD116"]} />
        <Star cx={1.5} cy={1} r={0.42} fill="#FCD116" />
      </>
    ),
  },
  {
    code: "TD",
    dial: "+235",
    name: "Tchad",
    flag: <VFlag colors={["#002664", "#FECB00", "#C60C30"]} />,
  },
  {
    code: "GA",
    dial: "+241",
    name: "Gabon",
    flag: <HFlag colors={["#009E60", "#FCD116", "#3A75C4"]} />,
  },
  {
    code: "CG",
    dial: "+242",
    name: "Congo",
    flag: <VFlag colors={["#009543", "#FBDE4A", "#DC241F"]} />,
  },
  {
    code: "CD",
    dial: "+243",
    name: "RD Congo",
    flag: <HFlag colors={["#007FFF", "#F7D618", "#007FFF"]} />,
  },
  {
    code: "FR",
    dial: "+33",
    name: "France",
    flag: <VFlag colors={["#0055A4", "#FFFFFF", "#EF4135"]} />,
  },
];

const DEFAULT = COUNTRIES[0]; // Côte d'Ivoire

function FlagIcon({ country }: { country: Country }) {
  return (
    <svg
      viewBox="0 0 3 2"
      className="h-3.5 w-[21px] shrink-0 rounded-[2px] ring-1 ring-black/10"
      preserveAspectRatio="xMidYMid slice"
    >
      {country.flag}
    </svg>
  );
}

/** Sépare une valeur enregistrée ("+225 0102030405") en pays + numéro local. */
function parseValue(value: string): { country: Country; local: string } {
  const raw = (value ?? "").trim();
  if (!raw) return { country: DEFAULT, local: "" };
  const digits = raw.replace(/[^\d+]/g, "");
  // Recherche du pays dont l'indicatif préfixe la valeur (le plus long d'abord).
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (digits.startsWith(c.dial)) {
      return { country: c, local: digits.slice(c.dial.length) };
    }
  }
  return { country: DEFAULT, local: digits.replace(/^\+/, "") };
}

interface PhoneFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  className?: string;
}

/**
 * Champ téléphone international : bloc [drapeau + indicatif] + champ numéro.
 * Pré-réglé sur la Côte d'Ivoire (+225). La valeur émise est "+225 0102030405".
 */
export function PhoneField({
  id,
  value,
  onChange,
  placeholder = "01 02 03 04 05",
  invalid,
  className,
}: PhoneFieldProps) {
  const initial = React.useMemo(() => parseValue(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [country, setCountry] = React.useState<Country>(initial.country);
  const [local, setLocal] = React.useState<string>(initial.local);

  const emit = (c: Country, l: string) => {
    const clean = l.replace(/[^\d\s]/g, "").trim();
    onChange(clean ? `${c.dial} ${clean}` : c.dial);
  };

  const handleCountry = (c: Country) => {
    setCountry(c);
    emit(c, local);
  };

  const handleLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const l = e.target.value.replace(/[^\d\s]/g, "");
    setLocal(l);
    emit(country, l);
  };

  return (
    <div
      className={cn(
        "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border bg-background shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
        invalid ? "border-destructive" : "border-input",
        className
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 border-r border-input bg-muted/40 px-2.5 text-sm font-medium outline-none transition-colors hover:bg-muted">
          <FlagIcon country={country} />
          <span className="tabular-nums">{country.dial}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-72 overflow-y-auto">
          {COUNTRIES.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onSelect={() => handleCountry(c)}
              className="gap-2.5"
            >
              <FlagIcon country={c} />
              <span className="flex-1">{c.name}</span>
              <span className="tabular-nums text-muted-foreground">{c.dial}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={local}
        onChange={handleLocal}
        placeholder={placeholder}
        className="w-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground md:text-sm"
      />
    </div>
  );
}
