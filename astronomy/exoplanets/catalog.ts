/**
 * Space
 * Astronomy — Exoplanet Catalog
 *
 * Built-in catalog utilities for exoplanet datasets.
 */

import {
  Exoplanet,
  ExoplanetType,
  DetectionMethod,
  createExoplanet,
  findExoplanetById,
  findExoplanetByName,
  searchExoplanets,
} from "./exoplanets";

export interface ExoplanetCatalogMetadata {
  id: string;
  name: string;
  version: string;
  source?: string;
  description?: string;
  updatedAt?: string;
}

export interface ExoplanetCatalog {
  metadata: ExoplanetCatalogMetadata;
  entries: readonly Exoplanet[];
}

export interface CatalogStatistics {
  total: number;
  confirmed: number;
  unconfirmed: number;

  byType: Readonly<
    Partial<Record<ExoplanetType, number>>
  >;

  byDetectionMethod: Readonly<
    Partial<Record<DetectionMethod, number>>
  >;

  byDiscoveryYear: Readonly<
    Record<string, number>
  >;

  habitableZoneCandidates: number;
}

/* -------------------------------------------------------------------------- */
/* Catalog Creation                                                           */
/* -------------------------------------------------------------------------- */

export function createCatalog(
  metadata: ExoplanetCatalogMetadata,
  entries: readonly Exoplanet[] = []
): ExoplanetCatalog {
  validateMetadata(metadata);

  const normalizedEntries =
    entries.map((entry) =>
      createExoplanet(entry)
    );

  return {
    metadata: {
      ...metadata
    },

    entries:
      normalizedEntries
  };
}

/* -------------------------------------------------------------------------- */
/* Catalog Operations                                                         */
/* -------------------------------------------------------------------------- */

export function addExoplanet(
  catalog: ExoplanetCatalog,
  exoplanet: Exoplanet
): ExoplanetCatalog {
  const normalized =
    createExoplanet(
      exoplanet
    );

  const existingIndex =
    catalog.entries.findIndex(
      (entry) =>
        entry.id ===
        normalized.id
    );

  const entries =
    [...catalog.entries];

  if (
    existingIndex >= 0
  ) {
    entries[
      existingIndex
    ] = normalized;
  } else {
    entries.push(
      normalized
    );
  }

  return {
    metadata: {
      ...catalog.metadata
    },
    entries
  };
}

export function removeExoplanet(
  catalog: ExoplanetCatalog,
  id: string
): ExoplanetCatalog {
  return {
    metadata: {
      ...catalog.metadata
    },

    entries:
      catalog.entries.filter(
        (entry) =>
          entry.id !== id
      )
  };
}

export function mergeCatalogs(
  primary: ExoplanetCatalog,
  secondary: ExoplanetCatalog
): ExoplanetCatalog {
  const map =
    new Map<string, Exoplanet>();

  for (
    const entry of
    primary.entries
  ) {
    map.set(
      entry.id,
      entry
    );
  }

  for (
    const entry of
    secondary.entries
  ) {
    map.set(
      entry.id,
      entry
    );
  }

  return {
    metadata: {
      ...primary.metadata
    },

    entries:
      [...map.values()]
  };
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export function getExoplanet(
  catalog: ExoplanetCatalog,
  id: string
): Exoplanet | null {
  return findExoplanetById(
    catalog.entries,
    id
  );
}

export function getExoplanetByName(
  catalog: ExoplanetCatalog,
  name: string
): Exoplanet | null {
  return findExoplanetByName(
    catalog.entries,
    name
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function queryCatalog(
  catalog: ExoplanetCatalog,
  options: Parameters<
    typeof searchExoplanets
  >[1] = {}
): Exoplanet[] {
  return searchExoplanets(
    catalog.entries,
    options
  );
}

export function getByHostStar(
  catalog: ExoplanetCatalog,
  hostStar: string
): Exoplanet[] {
  const query =
    hostStar
      .trim()
      .toLocaleLowerCase();

  return catalog.entries.filter(
    (entry) =>
      entry.hostStar.name
        .trim()
        .toLocaleLowerCase() ===
      query
  );
}

export function getConfirmed(
  catalog: ExoplanetCatalog
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) =>
      entry.confirmed ===
      true
  );
}

export function getUnconfirmed(
  catalog: ExoplanetCatalog
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) =>
      entry.confirmed !==
      true
  );
}

export function getHabitableZoneCandidates(
  catalog: ExoplanetCatalog
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) =>
      entry.habitableZone ===
      true
  );
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

export type ExoplanetSortKey =
  | "name"
  | "mass"
  | "radius"
  | "period"
  | "distance"
  | "discovery-year"
  | "temperature";

export type SortDirection =
  | "ascending"
  | "descending";

export function sortExoplanets(
  entries: readonly Exoplanet[],
  key: ExoplanetSortKey,
  direction:
    SortDirection =
      "ascending"
): Exoplanet[] {
  const multiplier =
    direction ===
    "ascending"
      ? 1
      : -1;

  return [
    ...entries
  ].sort(
    (a, b) =>
      compareExoplanets(
        a,
        b,
        key
      ) *
      multiplier
  );
}

function compareExoplanets(
  a: Exoplanet,
  b: Exoplanet,
  key: ExoplanetSortKey
): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(
        b.name
      );

    case "mass":
      return compareOptionalNumbers(
        a.massEarths,
        b.massEarths
      );

    case "radius":
      return compareOptionalNumbers(
        a.radiusEarths,
        b.radiusEarths
      );

    case "period":
      return compareOptionalNumbers(
        a.orbitalPeriodDays,
        b.orbitalPeriodDays
      );

    case "distance":
      return compareOptionalNumbers(
        getDistanceLightYears(a),
        getDistanceLightYears(b)
      );

    case "discovery-year":
      return compareOptionalNumbers(
        a.discoveryYear,
        b.discoveryYear
      );

    case "temperature":
      return compareOptionalNumbers(
        a.equilibriumTemperatureKelvin,
        b.equilibriumTemperatureKelvin
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export function getCatalogStatistics(
  catalog: ExoplanetCatalog
): CatalogStatistics {
  const byType:
    Partial<
      Record<
        ExoplanetType,
        number
      >
    > = {};

  const byDetectionMethod:
    Partial<
      Record<
        DetectionMethod,
        number
      >
    > = {};

  const byDiscoveryYear:
    Record<
      string,
      number
    > = {};

  let confirmed = 0;
  let habitableZoneCandidates =
    0;

  for (
    const entry of
    catalog.entries
  ) {
    if (
      entry.confirmed ===
      true
    ) {
      confirmed++;
    }

    if (
      entry.habitableZone ===
      true
    ) {
      habitableZoneCandidates++;
    }

    byType[
      entry.type
    ] =
      (
        byType[
          entry.type
        ] ??
        0
      ) + 1;

    for (
      const method of
      entry.detectionMethods
    ) {
      byDetectionMethod[
        method
      ] =
        (
          byDetectionMethod[
            method
          ] ??
          0
        ) + 1;
    }

    if (
      entry.discoveryYear !==
      undefined
    ) {
      const year =
        String(
          entry.discoveryYear
        );

      byDiscoveryYear[
        year
      ] =
        (
          byDiscoveryYear[
            year
          ] ??
          0
        ) + 1;
    }
  }

  return {
    total:
      catalog.entries.length,

    confirmed,

    unconfirmed:
      catalog.entries.length -
      confirmed,

    byType,

    byDetectionMethod,

    byDiscoveryYear,

    habitableZoneCandidates
  };
}

/* -------------------------------------------------------------------------- */
/* Catalog Validation                                                         */
/* -------------------------------------------------------------------------- */

export function validateCatalog(
  catalog: ExoplanetCatalog
): boolean {
  validateMetadata(
    catalog.metadata
  );

  const ids =
    new Set<string>();

  for (
    const entry of
    catalog.entries
  ) {
    createExoplanet(
      entry
    );

    if (
      ids.has(
        entry.id
      )
    ) {
      throw new Error(
        `Duplicate exoplanet id: ${entry.id}`
      );
    }

    ids.add(
      entry.id
    );
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Serialization                                                              */
/* -------------------------------------------------------------------------- */

export function catalogToJSON(
  catalog: ExoplanetCatalog,
  pretty = false
): string {
  validateCatalog(
    catalog
  );

  return JSON.stringify(
    catalog,
    null,
    pretty
      ? 2
      : 0
  );
}

export function catalogFromJSON(
  json: string
): ExoplanetCatalog {
  if (
    typeof json !==
    "string" ||
    json.trim() ===
    ""
  ) {
    throw new TypeError(
      "Catalog JSON must be a non-empty string."
    );
  }

  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(
        json
      );
  } catch {
    throw new Error(
      "Invalid exoplanet catalog JSON."
    );
  }

  if (
    !isCatalogShape(
      parsed
    )
  ) {
    throw new TypeError(
      "Invalid exoplanet catalog structure."
    );
  }

  return createCatalog(
    parsed.metadata,
    parsed.entries
  );
}

/* -------------------------------------------------------------------------- */
/* Filtering Helpers                                                          */
/* -------------------------------------------------------------------------- */

export function filterByType(
  catalog: ExoplanetCatalog,
  type: ExoplanetType
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) =>
      entry.type ===
      type
  );
}

export function filterByDetectionMethod(
  catalog: ExoplanetCatalog,
  method: DetectionMethod
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) =>
      entry.detectionMethods.includes(
        method
      )
  );
}

export function filterByMassRange(
  catalog: ExoplanetCatalog,
  minimumEarthMasses?: number,
  maximumEarthMasses?: number
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) => {
      if (
        entry.massEarths ===
        undefined
      ) {
        return false;
      }

      if (
        minimumEarthMasses !==
          undefined &&
        entry.massEarths <
          minimumEarthMasses
      ) {
        return false;
      }

      if (
        maximumEarthMasses !==
          undefined &&
        entry.massEarths >
          maximumEarthMasses
      ) {
        return false;
      }

      return true;
    }
  );
}

export function filterByOrbitalPeriodRange(
  catalog: ExoplanetCatalog,
  minimumDays?: number,
  maximumDays?: number
): Exoplanet[] {
  return catalog.entries.filter(
    (entry) => {
      if (
        entry.orbitalPeriodDays ===
        undefined
      ) {
        return false;
      }

      if (
        minimumDays !==
          undefined &&
        entry.orbitalPeriodDays <
          minimumDays
      ) {
        return false;
      }

      if (
        maximumDays !==
          undefined &&
        entry.orbitalPeriodDays >
          maximumDays
      ) {
        return false;
      }

      return true;
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

export function getDistanceLightYears(
  exoplanet: Exoplanet
): number | null {
  const host =
    exoplanet.hostStar;

  if (
    host.distanceLightYears !==
    undefined
  ) {
    return (
      host.distanceLightYears
    );
  }

  if (
    host.distanceParsecs !==
    undefined
  ) {
    return (
      host.distanceParsecs *
      3.261563777
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Export / Import Helpers                                                    */
/* -------------------------------------------------------------------------- */

export function cloneCatalog(
  catalog: ExoplanetCatalog
): ExoplanetCatalog {
  return {
    metadata: {
      ...catalog.metadata
    },

    entries:
      catalog.entries.map(
        (entry) => ({
          ...entry,

          detectionMethods:
            [
              ...entry.detectionMethods
            ],

          hostStar: {
            ...entry.hostStar
          },

          coordinates:
            entry.coordinates
              ? {
                  ...entry.coordinates
                }
              : undefined,

          catalogIds:
            entry.catalogIds
              ? {
                  ...entry.catalogIds
                }
              : undefined
        })
      )
  };
}

export function sortCatalog(
  catalog: ExoplanetCatalog,
  key: ExoplanetSortKey,
  direction:
    SortDirection =
      "ascending"
): ExoplanetCatalog {
  return {
    metadata: {
      ...catalog.metadata
    },

    entries:
      sortExoplanets(
        catalog.entries,
        key,
        direction
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Validation Internals                                                       */
/* -------------------------------------------------------------------------- */

function validateMetadata(
  metadata: ExoplanetCatalogMetadata
): void {
  if (
    !metadata ||
    typeof metadata !==
    "object"
  ) {
    throw new TypeError(
      "Catalog metadata is required."
    );
  }

  if (
    !metadata.id ||
    typeof metadata.id !==
    "string"
  ) {
    throw new TypeError(
      "Catalog id must be a non-empty string."
    );
  }

  if (
    !metadata.name ||
    typeof metadata.name !==
    "string"
  ) {
    throw new TypeError(
      "Catalog name must be a non-empty string."
    );
  }

  if (
    !metadata.version ||
    typeof metadata.version !==
    "string"
  ) {
    throw new TypeError(
      "Catalog version must be a non-empty string."
    );
  }
}

function isCatalogShape(
  value: unknown
): value is ExoplanetCatalog {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof candidate.metadata ===
      "object" &&
    candidate.metadata !==
      null &&
    Array.isArray(
      candidate.entries
    )
  );
}

function compareOptionalNumbers(
  a?: number | null,
  b?: number | null
): number {
  if (
    a === undefined ||
    a === null
  ) {
    return (
      b === undefined ||
      b === null
        ? 0
        : 1
    );
  }

  if (
    b === undefined ||
    b === null
  ) {
    return -1;
  }

  return a - b;
}

/* -------------------------------------------------------------------------- */
/* Default Export                                                             */
/* -------------------------------------------------------------------------- */

export default {
  createCatalog,

  addExoplanet,

  removeExoplanet,

  mergeCatalogs,

  getExoplanet,

  getExoplanetByName,

  queryCatalog,

  getByHostStar,

  getConfirmed,

  getUnconfirmed,

  getHabitableZoneCandidates,

  sortExoplanets,

  getCatalogStatistics,

  validateCatalog,

  catalogToJSON,

  catalogFromJSON,

  filterByType,

  filterByDetectionMethod,

  filterByMassRange,

  filterByOrbitalPeriodRange,

  cloneCatalog,

  sortCatalog
};
