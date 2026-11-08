"use client";

import { useState } from "react";
import { cn } from "cn";
import { Photo } from "@/components/photo";
import { Link } from "@/i18n/navigation";
import type { Photo as PhotoData } from "@/lib/types";

export interface StationData {
  name: string;
  region: string;
  photo: PhotoData;
  tours: number;
  stays: number;
  food: number;
  /** "3 tours, 2 stays, 1 place to eat", for screen readers and the phone list. */
  summary: string;
}

export interface MapStation {
  slug: string;
  /** Percent of the map box. */
  left: number;
  top: number;
  /** Placement classes for the name, from the map's label sides. */
  labelClass: string;
  /** Ring colour: the route the place sits on. */
  color: string;
  hub: boolean;
  data: StationData;
}

interface CountryMapStationsProps {
  stations: MapStation[];
  statLabels: { tours: string; stays: string; food: string };
  defaultStation: string;
}

/*
  The clickable layer over the map, desktop only: on a phone the dots are too
  close together to tap, so the route list below does that job. The map data
  itself stays on the server; this only gets positions and names.
*/
export function CountryMapStations({
  stations,
  statLabels,
  defaultStation,
}: CountryMapStationsProps) {
  const [active, setActive] = useState(defaultStation);
  const preview = stations.find((station) => station.slug === active);

  return (
    <div className="absolute inset-0 hidden lg:block">
      {stations.map((station) => {
        const selected = station.slug === active;
        return (
          <Link
            key={station.slug}
            href={`/places/${station.slug}`}
            prefetch={false}
            aria-label={`${station.data.name}: ${station.data.summary}`}
            onMouseEnter={() => setActive(station.slug)}
            onFocus={() => setActive(station.slug)}
            className="group absolute outline-none"
            style={{ left: `${station.left}%`, top: `${station.top}%` }}
          >
            {/* A bigger target than the dot, without moving the label. */}
            <span aria-hidden className="absolute -inset-3 rounded-full" />
            <span
              aria-hidden
              className={cn(
                "absolute -translate-1/2 rounded-full border-[3px] transition-[scale,background-color] duration-150 ease-out group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-on-deep",
                station.hub ? "size-5" : "size-4",
                selected ? "scale-125 bg-sun" : "bg-on-deep",
              )}
              style={{ borderColor: station.color }}
            />
            <span
              className={cn(
                "absolute text-sm font-semibold whitespace-nowrap transition-colors duration-150 [text-shadow:0_0_4px_var(--deep),0_0_8px_var(--deep)]",
                station.hub && "text-base",
                station.labelClass,
                selected ? "text-sun" : "text-on-deep",
              )}
            >
              {station.data.name}
            </span>
          </Link>
        );
      })}

      {/* Bottom right of the map is China: empty, so the preview sits there. */}
      {preview && (
        <div className="absolute right-0 bottom-0 hidden w-[31%] xl:block">
          <Link
            key={preview.slug}
            href={`/places/${preview.slug}`}
            prefetch={false}
            className="group flex overflow-hidden rounded-2xl bg-deep-raised"
          >
            <Photo
              photo={preview.data.photo}
              sizes="160px"
              aspect="square"
              interactive
              className="w-[38%] shrink-0"
            />
            <span className="flex min-w-0 flex-1 flex-col justify-center p-4">
              <span className="block truncate font-display text-display-sm font-extrabold">
                {preview.data.name}
              </span>
              <span className="block truncate text-sm text-on-deep-muted">
                {preview.data.region}
              </span>
              <span className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3">
                {(
                  [
                    [preview.data.tours, statLabels.tours],
                    [preview.data.stays, statLabels.stays],
                    [preview.data.food, statLabels.food],
                  ] as const
                ).map(([value, label]) => (
                  <span key={label} className="block">
                    <span className="block font-display text-xl leading-none font-extrabold text-sun">
                      {value}
                    </span>
                    <span className="mt-1 block text-xs text-on-deep-muted">
                      {label}
                    </span>
                  </span>
                ))}
              </span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
