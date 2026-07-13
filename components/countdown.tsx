"use client";

import { useEffect, useState } from "react";
import { PROGRAM_DATE_ISO } from "@/lib/constants";

function diff(target: number) {
  const now = Date.now();
  const d = Math.max(0, target - now);
  return {
    jours: Math.floor(d / 86_400_000),
    heures: Math.floor((d / 3_600_000) % 24),
    minutes: Math.floor((d / 60_000) % 60),
    secondes: Math.floor((d / 1000) % 60),
  };
}

export function Countdown() {
  const target = new Date(PROGRAM_DATE_ISO).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items: [string, number][] = t
    ? [
        ["Jours", t.jours],
        ["Heures", t.heures],
        ["Min", t.minutes],
        ["Sec", t.secondes],
      ]
    : [
        ["Jours", 0],
        ["Heures", 0],
        ["Min", 0],
        ["Sec", 0],
      ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="flex min-w-[64px] flex-col items-center rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur sm:min-w-[76px]"
        >
          <span className="font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/70">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
