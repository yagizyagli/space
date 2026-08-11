/**
 * Space
 * Astronomy — Star Catalog
 *
 * Star catalog storage and querying utilities.
 *
 * This module provides:
 * - catalog registration
 * - lookup by id / name / designation
 * - magnitude filtering
 * - coordinate-region queries
 * - nearest-star queries
 *
 * Large external datasets should be loaded through the data layer
 * rather than hard-coded into this module.
 */

import {
  Star,
  createStar,
  getStarDistanceLightYears,
  normalizeRightAscension,
  summarizeStar,
  StarSummary
} from "./stars";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface StarCatalog {
  readonly name:
    string;

  readonly version:
    string;

  readonly stars:
    readonly Star[];
}

export interface StarCatalogOptions {
  name?:
    string;

  version?:
    string;

  stars?:
    readonly Star[];
}

export interface StarSearchOptions {
  name?:
    string;

  designation?:
    string;

  minMagnitude?:
    number;

  maxMagnitude?:
    number;

  spectralClass?:
    Star["spectralClass"];

  minRightAscension?:
    number;

  maxRightAscension?:
    number;

  minDeclination?:
    number;

  maxDeclination?:
    number;

  limit?:
    number;
}

export interface StarRegion {
  rightAscension:
    number;

  declination:
    number;

  radiusDegrees:
    number;
}

export interface NearestStarResult {
  star:
    Star;

  angularDistanceDegrees:
    number;
}

export interface CatalogStats {
  total:
    number;

  withMagnitude:
    number;

  withDistance:
    number;

  withSpectralClass:
    number;
}

/* -------------------------------------------------------------------------- */
/* Catalog Creation                                                           */
/* -------------------------------------------------------------------------- */

export function createStarCatalog(
  options:
    StarCatalogOptions =
      {}
):
  StarCatalog {
  const stars =
    options.stars ??
    [];

  const normalizedStars =
    stars.map(
      (
        star
      ) =>
        createStar(
          star
        )
    );

  return {
    name:
      options.name ??
      "default",

    version:
      options.version ??
      "1.0.0",

    stars:
      normalizedStars
  };
}

/* -------------------------------------------------------------------------- */
/* Catalog Lookup                                                             */
/* -------------------------------------------------------------------------- */

export function findStarById(
  catalog:
    StarCatalog,
  id:
    string
):
  Star |
  null {
  const normalizedId =
    id
      .trim()
      .toLowerCase();

  return (
    catalog.stars.find(
      (
        star
      ) =>
        star.id
          .toLowerCase() ===
        normalizedId
    ) ??
    null
  );
}

export function findStarByName(
  catalog:
    StarCatalog,
  name:
    string
):
  Star |
  null {
  const normalizedName =
    normalizeText(
      name
    );

  return (
    catalog.stars.find(
      (
        star
      ) =>
        star.name !==
          undefined &&
        normalizeText(
          star.name
        ) ===
        normalizedName
    ) ??
    null
  );
}

export function findStarByDesignation(
  catalog:
    StarCatalog,
  designation:
    string
):
  Star |
  null {
  const normalizedDesignation =
    normalizeText(
      designation
    );

  return (
    catalog.stars.find(
      (
        star
      ) =>
        star.designation !==
          undefined &&
        normalizeText(
          star.designation
        ) ===
        normalizedDesignation
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchStars(
  catalog:
    StarCatalog,
  options:
    StarSearchOptions =
      {}
):
  Star[] {
  let results =
    [...catalog.stars];

  if (
    options.name !==
      undefined
  ) {
    const query =
      normalizeText(
        options.name
      );

    results =
      results.filter(
        (
          star
        ) =>
          star.name !==
            undefined &&
          normalizeText(
            star.name
          ).includes(
            query
          )
      );
  }

  if (
    options.designation !==
      undefined
  ) {
    const query =
      normalizeText(
        options.designation
      );

    results =
      results.filter(
        (
          star
        ) =>
          star.designation !==
            undefined &&
          normalizeText(
            star.designation
          ).includes(
            query
          )
      );
  }

  if (
    options.minMagnitude !==
      undefined
  ) {
    results =
      results.filter(
        (
          star
        ) =>
          star.apparentMagnitude !==
            undefined &&
          star.apparentMagnitude >=
            options.minMagnitude!
      );
  }

  if (
    options.maxMagnitude !==
      undefined
  ) {
    results =
      results.filter(
        (
          star
        ) =>
          star.apparentMagnitude !==
            undefined &&
          star.apparentMagnitude <=
            options.maxMagnitude!
      );
  }

  if (
    options.spectralClass !==
      undefined
  ) {
    results =
      results.filter(
        (
          star
        ) =>
          star.spectralClass ===
          options.spectralClass
      );
  }

  if (
    options.minRightAscension !==
      undefined
  ) {
    results =
      filterRightAscensionMinimum(
        results,
        options.minRightAscension
      );
  }

  if (
    options.maxRightAscension !==
      undefined
  ) {
    results =
      filterRightAscensionMaximum(
        results,
        options.maxRightAscension
      );
  }

  if (
    options.minDeclination !==
      undefined
  ) {
    results =
      results.filter(
        (
          star
        ) =>
          star.coordinates
            .declination >=
          options.minDeclination!
      );
  }

  if (
    options.maxDeclination !==
      undefined
  ) {
    results =
      results.filter(
        (
          star
        ) =>
          star.coordinates
            .declination <=
          options.maxDeclination!
      );
  }

  if (
    options.limit !==
      undefined
  ) {
    const limit =
      Math.max(
        0,
        Math.floor(
          options.limit
        )
      );

    results =
      results.slice(
        0,
        limit
      );
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Magnitude Queries                                                          */
/* -------------------------------------------------------------------------- */

export function getBrightestStars(
  catalog:
    StarCatalog,
  limit:
    number =
      10
):
  Star[] {
  return [
    ...catalog.stars
  ]
    .filter(
      (
        star
      ) =>
        star.apparentMagnitude !==
          undefined
    )
    .sort(
      (
        a,
        b
      ) =>
        a.apparentMagnitude! -
        b.apparentMagnitude!
    )
    .slice(
      0,
      Math.max(
        0,
        Math.floor(
          limit
        )
      )
    );
}

/**
 * Returns stars visible above the requested apparent magnitude threshold.
 *
 * Lower magnitude means brighter.
 */
export function getStarsBrighterThan(
  catalog:
    StarCatalog,
  magnitude:
    number
):
  Star[] {
  return catalog.stars.filter(
    (
      star
    ) =>
      star.apparentMagnitude !==
        undefined &&
      star.apparentMagnitude <=
        magnitude
  );
}

/* -------------------------------------------------------------------------- */
/* Region Queries                                                             */
/* -------------------------------------------------------------------------- */

export function findStarsInRegion(
  catalog:
    StarCatalog,
  region:
    StarRegion
):
  Star[] {
  validateRegion(
    region
  );

  return catalog.stars.filter(
    (
      star
    ) => {
      const distance =
        angularDistance(
          region.rightAscension,
          region.declination,
          star.coordinates
            .rightAscension,
          star.coordinates
            .declination
        );

      return (
        distance <=
        region.radiusDegrees
      );
    }
  );
}

/**
 * Finds the nearest catalog star to a given sky coordinate.
 */
export function findNearestStar(
  catalog:
    StarCatalog,
  rightAscension:
    number,
  declination:
    number
):
  NearestStarResult |
  null {
  if (
    catalog.stars.length ===
    0
  ) {
    return null;
  }

  const normalizedRa =
    normalizeRightAscension(
      rightAscension
    );

  let nearest:
    Star |
    null =
    null;

  let nearestDistance =
    Infinity;

  for (
    const star of
      catalog.stars
  ) {
    const distance =
      angularDistance(
        normalizedRa,
        declination,
        star.coordinates
          .rightAscension,
        star.coordinates
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        star;
    }
  }

  if (
    nearest ===
    null
  ) {
    return null;
  }

  return {
    star:
      nearest,

    angularDistanceDegrees:
      nearestDistance
  };
}

/* -------------------------------------------------------------------------- */
/* Distance Queries                                                           */
/* -------------------------------------------------------------------------- */

export function getNearestStarsByDistance(
  catalog:
    StarCatalog,
  limit:
    number =
      10
):
  Star[] {
  return [
    ...catalog.stars
  ]
    .filter(
      (
        star
      ) =>
        getStarDistanceLightYears(
          star
        ) !==
        null
    )
    .sort(
      (
        a,
        b
      ) =>
        getStarDistanceLightYears(
          a
        )! -
        getStarDistanceLightYears(
          b
        )!
    )
    .slice(
      0,
      Math.max(
        0,
        Math.floor(
          limit
        )
      )
    );
}

/* -------------------------------------------------------------------------- */
/* Catalog Statistics                                                         */
/* -------------------------------------------------------------------------- */

export function getCatalogStats(
  catalog:
    StarCatalog
):
  CatalogStats {
  let withMagnitude =
    0;

  let withDistance =
    0;

  let withSpectralClass =
    0;

  for (
    const star of
      catalog.stars
  ) {
    if (
      star.apparentMagnitude !==
        undefined
    ) {
      withMagnitude++;
    }

    if (
      getStarDistanceLightYears(
        star
      ) !==
      null
    ) {
      withDistance++;
    }

    if (
      star.spectralClass !==
        undefined &&
      star.spectralClass !==
        "unknown"
    ) {
      withSpectralClass++;
    }
  }

  return {
    total:
      catalog.stars.length,

    withMagnitude,

    withDistance,

    withSpectralClass
  };
}

/* -------------------------------------------------------------------------- */
/* Catalog Serialization                                                      */
/* -------------------------------------------------------------------------- */

export function exportCatalog(
  catalog:
    StarCatalog
):
  string {
  return JSON.stringify(
    {
      name:
        catalog.name,

      version:
        catalog.version,

      stars:
        catalog.stars
    },
    null,
    2
  );
}

export function importCatalog(
  json:
    string
):
  StarCatalog {
  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(
        json
      );
  } catch {
    throw new TypeError(
      "Invalid star catalog JSON."
    );
  }

  if (
    !isCatalogObject(
      parsed
    )
  ) {
    throw new TypeError(
      "Invalid star catalog structure."
    );
  }

  return createStarCatalog({
    name:
      parsed.name,

    version:
      parsed.version,

    stars:
      parsed.stars as Star[]
  });
}

/* -------------------------------------------------------------------------- */
/* Summaries                                                                  */
/* -------------------------------------------------------------------------- */

export function summarizeCatalog(
  catalog:
    StarCatalog
):
  StarSummary[] {
  return catalog.stars.map(
    summarizeStar
  );
}

/* -------------------------------------------------------------------------- */
/* Right Ascension Filtering                                                  */
/* -------------------------------------------------------------------------- */

function filterRightAscensionMinimum(
  stars:
    Star[],
  minimum:
    number
):
  Star[] {
  const normalized =
    normalizeRightAscension(
      minimum
    );

  return stars.filter(
    (
      star
    ) =>
      normalizeRightAscension(
        star.coordinates
          .rightAscension
      ) >=
      normalized
  );
}

function filterRightAscensionMaximum(
  stars:
    Star[],
  maximum:
    number
):
  Star[] {
  const normalized =
    normalizeRightAscension(
      maximum
    );

  return stars.filter(
    (
      star
    ) =>
      normalizeRightAscension(
        star.coordinates
          .rightAscension
      ) <=
      normalized
  );
}

/* -------------------------------------------------------------------------- */
/* Angular Distance                                                           */
/* -------------------------------------------------------------------------- */

export function angularDistance(
  rightAscensionA:
    number,
  declinationA:
    number,
  rightAscensionB:
    number,
  declinationB:
    number
):
  number {
  const raA =
    normalizeRightAscension(
      rightAscensionA
    ) *
    Math.PI /
    180;

  const raB =
    normalizeRightAscension(
      rightAscensionB
    ) *
    Math.PI /
    180;

  const decA =
    declinationA *
    Math.PI /
    180;

  const decB =
    declinationB *
    Math.PI /
    180;

  const cosine =
    Math.sin(decA) *
      Math.sin(decB) +
    Math.cos(decA) *
      Math.cos(decB) *
      Math.cos(
        raA -
        raB
      );

  return (
    Math.acos(
      clamp(
        cosine,
        -1,
        1
      )
    ) *
    180 /
    Math.PI
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateRegion(
  region:
    StarRegion
):
  void {
  if (
    !Number.isFinite(
      region.rightAscension
    )
  ) {
    throw new TypeError(
      "Region right ascension must be finite."
    );
  }

  if (
    !Number.isFinite(
      region.declination
    ) ||
    region.declination <
      -90 ||
    region.declination >
      90
  ) {
    throw new RangeError(
      "Region declination must be between -90 and 90 degrees."
    );
  }

  if (
    !Number.isFinite(
      region.radiusDegrees
    ) ||
    region.radiusDegrees <
      0
  ) {
    throw new RangeError(
      "Region radius must be a non-negative finite number."
    );
  }
}

function isCatalogObject(
  value:
    unknown
):
  value is {
    name:
      string;

    version:
      string;

    stars:
      unknown[];
  } {
  if (
    typeof value !==
      "object" ||
    value ===
      null
  ) {
    return false;
  }

  const object =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof object.name ===
      "string" &&
    typeof object.version ===
      "string" &&
    Array.isArray(
      object.stars
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function normalizeText(
  value:
    string
):
  string {
  return value
    .trim()
    .toLocaleLowerCase();
}

function clamp(
  value:
    number,
  minimum:
    number,
  maximum:
    number
):
  number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

export default createStarCatalog;
