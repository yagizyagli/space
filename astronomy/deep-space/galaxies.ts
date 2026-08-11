/**
 * Space
 * Astronomy — Deep Space / Galaxies
 *
 * Galaxy data models and utilities.
 */

export type GalaxyType =
  | "spiral"
  | "barred-spiral"
  | "elliptical"
  | "lenticular"
  | "irregular"
  | "dwarf"
  | "peculiar"
  | "unknown";

export type GalaxyActivity =
  | "normal"
  | "starburst"
  | "active"
  | "seyfert"
  | "quasar-host"
  | "unknown";

export interface GalaxyCoordinates {
  rightAscension:
    number;

  declination:
    number;
}

export interface Galaxy {
  id:
    string;

  name:
    string;

  type:
    GalaxyType;

  coordinates:
    GalaxyCoordinates;

  distanceMpc?:
    number;

  distanceLightYears?:
    number;

  redshift?:
    number;

  apparentMagnitude?:
    number;

  absoluteMagnitude?:
    number;

  angularDiameterArcminutes?:
    number;

  activity?:
    GalaxyActivity;

  constellationId?:
    string;

  description?:
    string;

  catalogIds?:
    Readonly<
      Record<
        string,
        string
      >
    >;
}

export interface GalaxySearchOptions {
  name?:
    string;

  type?:
    GalaxyType;

  activity?:
    GalaxyActivity;

  maxDistanceMpc?:
    number;

  maxMagnitude?:
    number;

  constellationId?:
    string;

  limit?:
    number;
}

export interface GalaxyDistance {
  megaparsecs:
    number;

  millionLightYears:
    number;

  lightYears:
    number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const MPC_TO_LIGHT_YEARS =
  3_261_563.777;

export const MPC_TO_MILLION_LIGHT_YEARS =
  3.261563777;

export const LIGHT_YEAR_TO_MPC =
  1 /
  MPC_TO_LIGHT_YEARS;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createGalaxy(
  input:
    Galaxy
):
  Galaxy {
  validateGalaxy(
    input
  );

  return {
    ...input,

    coordinates: {
      rightAscension:
        normalizeRightAscension(
          input.coordinates
            .rightAscension
        ),

      declination:
        input.coordinates
          .declination
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

export function megaparsecsToLightYears(
  megaparsecs:
    number
):
  number {
  validatePositiveOrZero(
    megaparsecs,
    "Megaparsecs"
  );

  return (
    megaparsecs *
    MPC_TO_LIGHT_YEARS
  );
}

export function lightYearsToMegaparsecs(
  lightYears:
    number
):
  number {
  validatePositiveOrZero(
    lightYears,
    "Light-years"
  );

  return (
    lightYears *
    LIGHT_YEAR_TO_MPC
  );
}

export function createGalaxyDistance(
  megaparsecs:
    number
):
  GalaxyDistance {
  validatePositiveOrZero(
    megaparsecs,
    "Megaparsecs"
  );

  const lightYears =
    megaparsecsToLightYears(
      megaparsecs
    );

  return {
    megaparsecs,

    millionLightYears:
      lightYears /
      1_000_000,

    lightYears
  };
}

/**
 * Returns the best available distance for a galaxy.
 */
export function getGalaxyDistance(
  galaxy:
    Galaxy
):
  GalaxyDistance |
  null {
  if (
    galaxy.distanceMpc !==
      undefined
  ) {
    return createGalaxyDistance(
      galaxy.distanceMpc
    );
  }

  if (
    galaxy.distanceLightYears !==
      undefined
  ) {
    return createGalaxyDistance(
      lightYearsToMegaparsecs(
        galaxy.distanceLightYears
      )
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                      */
/* -------------------------------------------------------------------------- */

export function findGalaxyById(
  galaxies:
    readonly Galaxy[],
  id:
    string
):
  Galaxy |
  null {
  const normalized =
    normalizeText(
      id
    );

  return (
    galaxies.find(
      (
        galaxy
      ) =>
        normalizeText(
          galaxy.id
        ) ===
        normalized
    ) ??
    null
  );
}

export function findGalaxyByName(
  galaxies:
    readonly Galaxy[],
  name:
    string
):
  Galaxy |
  null {
  const normalized =
    normalizeText(
      name
    );

  return (
    galaxies.find(
      (
        galaxy
      ) =>
        normalizeText(
          galaxy.name
        ) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export function searchGalaxies(
  galaxies:
    readonly Galaxy[],
  options:
    GalaxySearchOptions =
      {}
):
  Galaxy[] {
  let results =
    [...galaxies];

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
          galaxy
        ) =>
          normalizeText(
            galaxy.name
          ).includes(
            query
          )
      );
  }

  if (
    options.type !==
      undefined
  ) {
    results =
      results.filter(
        (
          galaxy
        ) =>
          galaxy.type ===
          options.type
      );
  }

  if (
    options.activity !==
      undefined
  ) {
    results =
      results.filter(
        (
          galaxy
        ) =>
          galaxy.activity ===
          options.activity
      );
  }

  if (
    options.maxDistanceMpc !==
      undefined
  ) {
    results =
      results.filter(
        (
          galaxy
        ) =>
          galaxy.distanceMpc !==
            undefined &&
          galaxy.distanceMpc <=
            options.maxDistanceMpc!
      );
  }

  if (
    options.maxMagnitude !==
      undefined
  ) {
    results =
      results.filter(
        (
          galaxy
        ) =>
          galaxy.apparentMagnitude !==
            undefined &&
          galaxy.apparentMagnitude <=
            options.maxMagnitude!
      );
  }

  if (
    options.constellationId !==
      undefined
  ) {
    const constellation =
      normalizeText(
        options.constellationId
      );

    results =
      results.filter(
        (
          galaxy
        ) =>
          galaxy.constellationId !==
            undefined &&
          normalizeText(
            galaxy.constellationId
          ) ===
            constellation
      );
  }

  if (
    options.limit !==
      undefined
  ) {
    results =
      results.slice(
        0,
        Math.max(
          0,
          Math.floor(
            options.limit
          )
        )
      );
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Coordinate Queries                                                          */
/* -------------------------------------------------------------------------- */

export function findNearestGalaxy(
  galaxies:
    readonly Galaxy[],
  rightAscension:
    number,
  declination:
    number
):
  Galaxy |
  null {
  validateCoordinates(
    rightAscension,
    declination
  );

  let nearest:
    Galaxy |
    null =
    null;

  let nearestDistance =
    Infinity;

  for (
    const galaxy of
      galaxies
  ) {
    const distance =
      angularDistance(
        rightAscension,
        declination,
        galaxy.coordinates
          .rightAscension,
        galaxy.coordinates
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        galaxy;
    }
  }

  return nearest;
}

/**
 * Finds galaxies inside an angular search radius.
 */
export function findGalaxiesWithinAngularRadius(
  galaxies:
    readonly Galaxy[],
  rightAscension:
    number,
  declination:
    number,
  radiusDegrees:
    number
):
  Galaxy[] {
  validateCoordinates(
    rightAscension,
    declination
  );

  if (
    !Number.isFinite(
      radiusDegrees
    ) ||
    radiusDegrees <
      0
  ) {
    throw new RangeError(
      "Radius must be zero or greater."
    );
  }

  return galaxies.filter(
    (
      galaxy
    ) =>
      angularDistance(
        rightAscension,
        declination,
        galaxy.coordinates
          .rightAscension,
        galaxy.coordinates
          .declination
      ) <=
      radiusDegrees
  );
}

/* -------------------------------------------------------------------------- */
/* Redshift                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Converts redshift to recession velocity using the low-z approximation:
 *
 * v ≈ zc
 *
 * This should not be used for high-redshift cosmology.
 */
export function redshiftToApproximateVelocityKmPerSecond(
  redshift:
    number
):
  number {
  if (
    !Number.isFinite(
      redshift
    )
  ) {
    throw new TypeError(
      "Redshift must be finite."
    );
  }

  const speedOfLight =
    299_792.458;

  return (
    redshift *
    speedOfLight
  );
}

/**
 * Converts a low-redshift recession velocity to approximate redshift.
 */
export function velocityKmPerSecondToApproximateRedshift(
  velocityKmPerSecond:
    number
):
  number {
  if (
    !Number.isFinite(
      velocityKmPerSecond
    )
  ) {
    throw new TypeError(
      "Velocity must be finite."
    );
  }

  return (
    velocityKmPerSecond /
    299_792.458
  );
}

/* -------------------------------------------------------------------------- */
/* Magnitude                                                                   */
/* -------------------------------------------------------------------------- */

export function magnitudeDistanceModulus(
  distanceMpc:
    number
):
  number {
  if (
    !Number.isFinite(
      distanceMpc
    ) ||
    distanceMpc <=
      0
  ) {
    throw new RangeError(
      "Distance must be greater than zero."
    );
  }

  const distanceParsecs =
    distanceMpc *
    1_000_000;

  return (
    5 *
      Math.log10(
        distanceParsecs
      ) -
    5
  );
}

export function apparentToAbsoluteGalaxyMagnitude(
  apparentMagnitude:
    number,
  distanceMpc:
    number
):
  number {
  validateFinite(
    apparentMagnitude,
    "Magnitude"
  );

  return (
    apparentMagnitude -
    magnitudeDistanceModulus(
      distanceMpc
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function validateGalaxy(
  galaxy:
    Galaxy
):
  void {
  if (
    !galaxy.id ||
    typeof galaxy.id !==
      "string"
  ) {
    throw new TypeError(
      "Galaxy id must be a non-empty string."
    );
  }

  if (
    !galaxy.name ||
    typeof galaxy.name !==
      "string"
  ) {
    throw new TypeError(
      "Galaxy name must be a non-empty string."
    );
  }

  if (
    !galaxy.coordinates
  ) {
    throw new TypeError(
      "Galaxy coordinates are required."
    );
  }

  validateCoordinates(
    galaxy.coordinates
      .rightAscension,
    galaxy.coordinates
      .declination
  );

  if (
    galaxy.distanceMpc !==
      undefined
  ) {
    validatePositiveOrZero(
      galaxy.distanceMpc,
      "Distance"
    );
  }

  if (
    galaxy.distanceLightYears !==
      undefined
  ) {
    validatePositiveOrZero(
      galaxy.distanceLightYears,
      "Distance"
    );
  }

  if (
    galaxy.redshift !==
      undefined
  ) {
    validateFinite(
      galaxy.redshift,
      "Redshift"
    );
  }

  if (
    galaxy.apparentMagnitude !==
      undefined
  ) {
    validateFinite(
      galaxy.apparentMagnitude,
      "Apparent magnitude"
    );
  }

  if (
    galaxy.absoluteMagnitude !==
      undefined
  ) {
    validateFinite(
      galaxy.absoluteMagnitude,
      "Absolute magnitude"
    );
  }
}

function validateCoordinates(
  rightAscension:
    number,
  declination:
    number
):
  void {
  validateFinite(
    rightAscension,
    "Right ascension"
  );

  if (
    declination <
      -90 ||
    declination >
      90
  ) {
    throw new RangeError(
      "Declination must be between -90 and 90 degrees."
    );
  }
}

function validateFinite(
  value:
    number,
  label:
    string
):
  void {
  if (
    !Number.isFinite(
      value
    )
  ) {
    throw new TypeError(
      `${label} must be finite.`
    );
  }
}

function validatePositiveOrZero(
  value:
    number,
  label:
    string
):
  void {
  if (
    !Number.isFinite(
      value
    ) ||
    value <
      0
  ) {
    throw new RangeError(
      `${label} must be zero or greater.`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

function angularDistance(
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
      Math.min(
        1,
        Math.max(
          -1,
          cosine
        )
      )
    ) *
    180 /
    Math.PI
  );
}

function normalizeRightAscension(
  degrees:
    number
):
  number {
  return (
    (
      degrees %
      360
    ) +
    360
  ) %
    360;
}

function normalizeText(
  value:
    string
):
  string {
  return value
    .trim()
    .toLocaleLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export default {
  createGalaxy,

  findGalaxyById,

  findGalaxyByName,

  searchGalaxies,

  findNearestGalaxy,

  findGalaxiesWithinAngularRadius,

  megaparsecsToLightYears,

  lightYearsToMegaparsecs,

  createGalaxyDistance,

  getGalaxyDistance,

  redshiftToApproximateVelocityKmPerSecond,

  velocityKmPerSecondToApproximateRedshift,

  magnitudeDistanceModulus,

  apparentToAbsoluteGalaxyMagnitude
};
