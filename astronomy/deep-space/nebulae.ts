/**
 * Space
 * Astronomy — Deep Space / Nebulae
 *
 * Nebula data models and astronomical utilities.
 */

export type NebulaType =
  | "emission"
  | "reflection"
  | "dark"
  | "planetary"
  | "supernova-remnant"
  | "hii-region"
  | "molecular-cloud"
  | "protoplanetary"
  | "mixed"
  | "unknown";

export interface NebulaCoordinates {
  rightAscension:
    number;

  declination:
    number;
}

export interface Nebula {
  id:
    string;

  name:
    string;

  type:
    NebulaType;

  coordinates:
    NebulaCoordinates;

  distanceLightYears?:
    number;

  distanceParsecs?:
    number;

  apparentMagnitude?:
    number;

  angularDiameterArcminutes?:
    number;

  constellationId?:
    string;

  catalogIds?:
    Readonly<
      Record<
        string,
        string
      >
    >;

  description?:
    string;
}

export interface NebulaSearchOptions {
  name?:
    string;

  type?:
    NebulaType;

  constellationId?:
    string;

  maxDistanceLightYears?:
    number;

  maxMagnitude?:
    number;

  limit?:
    number;
}

export interface NebulaAngularSize {
  diameterArcminutes:
    number;

  diameterDegrees:
    number;

  diameterArcseconds:
    number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const PARSEC_TO_LIGHT_YEARS =
  3.261563777;

export const LIGHT_YEAR_TO_PARSEC =
  1 /
  PARSEC_TO_LIGHT_YEARS;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createNebula(
  input:
    Nebula
):
  Nebula {
  validateNebula(
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
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export function findNebulaById(
  nebulae:
    readonly Nebula[],
  id:
    string
):
  Nebula |
  null {
  const normalized =
    normalizeText(
      id
    );

  return (
    nebulae.find(
      (
        nebula
      ) =>
        normalizeText(
          nebula.id
        ) ===
        normalized
    ) ??
    null
  );
}

export function findNebulaByName(
  nebulae:
    readonly Nebula[],
  name:
    string
):
  Nebula |
  null {
  const normalized =
    normalizeText(
      name
    );

  return (
    nebulae.find(
      (
        nebula
      ) =>
        normalizeText(
          nebula.name
        ) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchNebulae(
  nebulae:
    readonly Nebula[],
  options:
    NebulaSearchOptions =
      {}
):
  Nebula[] {
  let results =
    [...nebulae];

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
          nebula
        ) =>
          normalizeText(
            nebula.name
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
          nebula
        ) =>
          nebula.type ===
          options.type
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
          nebula
        ) =>
          nebula.constellationId !==
            undefined &&
          normalizeText(
            nebula.constellationId
          ) ===
            constellation
      );
  }

  if (
    options.maxDistanceLightYears !==
      undefined
  ) {
    results =
      results.filter(
        (
          nebula
        ) => {
          const distance =
            getNebulaDistanceLightYears(
              nebula
            );

          return (
            distance !==
              null &&
            distance <=
              options.maxDistanceLightYears!
          );
        }
      );
  }

  if (
    options.maxMagnitude !==
      undefined
  ) {
    results =
      results.filter(
        (
          nebula
        ) =>
          nebula.apparentMagnitude !==
            undefined &&
          nebula.apparentMagnitude <=
            options.maxMagnitude!
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
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

export function parsecsToLightYears(
  parsecs:
    number
):
  number {
  validatePositiveOrZero(
    parsecs,
    "Parsecs"
  );

  return (
    parsecs *
    PARSEC_TO_LIGHT_YEARS
  );
}

export function lightYearsToParsecs(
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
    LIGHT_YEAR_TO_PARSEC
  );
}

/**
 * Returns the best available distance in light-years.
 */
export function getNebulaDistanceLightYears(
  nebula:
    Nebula
):
  number |
  null {
  if (
    nebula.distanceLightYears !==
      undefined
  ) {
    return nebula.distanceLightYears;
  }

  if (
    nebula.distanceParsecs !==
      undefined
  ) {
    return parsecsToLightYears(
      nebula.distanceParsecs
    );
  }

  return null;
}

/**
 * Returns the best available distance in parsecs.
 */
export function getNebulaDistanceParsecs(
  nebula:
    Nebula
):
  number |
  null {
  if (
    nebula.distanceParsecs !==
      undefined
  ) {
    return nebula.distanceParsecs;
  }

  if (
    nebula.distanceLightYears !==
      undefined
  ) {
    return lightYearsToParsecs(
      nebula.distanceLightYears
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Angular Size                                                                */
/* -------------------------------------------------------------------------- */

export function createNebulaAngularSize(
  diameterArcminutes:
    number
):
  NebulaAngularSize {
  if (
    !Number.isFinite(
      diameterArcminutes
    ) ||
    diameterArcminutes <
      0
  ) {
    throw new RangeError(
      "Angular diameter must be zero or greater."
    );
  }

  return {
    diameterArcminutes,

    diameterDegrees:
      diameterArcminutes /
      60,

    diameterArcseconds:
      diameterArcminutes *
      60
  };
}

export function angularDiameterToDegrees(
  arcminutes:
    number
):
  number {
  if (
    !Number.isFinite(
      arcminutes
    ) ||
    arcminutes <
      0
  ) {
    throw new RangeError(
      "Angular diameter must be zero or greater."
    );
  }

  return (
    arcminutes /
    60
  );
}

/* -------------------------------------------------------------------------- */
/* Coordinate Queries                                                         */
/* -------------------------------------------------------------------------- */

export function findNearestNebula(
  nebulae:
    readonly Nebula[],
  rightAscension:
    number,
  declination:
    number
):
  Nebula |
  null {
  validateCoordinates(
    rightAscension,
    declination
  );

  let nearest:
    Nebula |
    null =
    null;

  let nearestDistance =
    Infinity;

  for (
    const nebula of
      nebulae
  ) {
    const distance =
      angularDistance(
        rightAscension,
        declination,
        nebula.coordinates
          .rightAscension,
        nebula.coordinates
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        nebula;
    }
  }

  return nearest;
}

export function findNebulaeWithinAngularRadius(
  nebulae:
    readonly Nebula[],
  rightAscension:
    number,
  declination:
    number,
  radiusDegrees:
    number
):
  Nebula[] {
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

  return nebulae.filter(
    (
      nebula
    ) =>
      angularDistance(
        rightAscension,
        declination,
        nebula.coordinates
          .rightAscension,
        nebula.coordinates
          .declination
      ) <=
      radiusDegrees
  );
}

/* -------------------------------------------------------------------------- */
/* Visibility                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Basic apparent-magnitude visibility test.
 *
 * This is deliberately independent of atmospheric extinction,
 * observer latitude and sky brightness. Those belong in the
 * visibility/calculation layers.
 */
export function isNebulaWithinMagnitudeLimit(
  nebula:
    Nebula,
  limitingMagnitude:
    number
):
  boolean {
  if (
    nebula.apparentMagnitude ===
      undefined
  ) {
    return false;
  }

  validateFinite(
    limitingMagnitude,
    "Limiting magnitude"
  );

  return (
    nebula.apparentMagnitude <=
    limitingMagnitude
  );
}

/* -------------------------------------------------------------------------- */
/* Magnitude / Distance                                                       */
/* -------------------------------------------------------------------------- */

export function distanceModulus(
  distanceParsecs:
    number
):
  number {
  if (
    !Number.isFinite(
      distanceParsecs
    ) ||
    distanceParsecs <=
      0
  ) {
    throw new RangeError(
      "Distance must be greater than zero."
    );
  }

  return (
    5 *
      Math.log10(
        distanceParsecs
      ) -
    5
  );
}

export function apparentToAbsoluteMagnitude(
  apparentMagnitude:
    number,
  distanceParsecs:
    number
):
  number {
  validateFinite(
    apparentMagnitude,
    "Apparent magnitude"
  );

  return (
    apparentMagnitude -
    distanceModulus(
      distanceParsecs
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateNebula(
  nebula:
    Nebula
):
  void {
  if (
    !nebula.id ||
    typeof nebula.id !==
      "string"
  ) {
    throw new TypeError(
      "Nebula id must be a non-empty string."
    );
  }

  if (
    !nebula.name ||
    typeof nebula.name !==
      "string"
  ) {
    throw new TypeError(
      "Nebula name must be a non-empty string."
    );
  }

  if (
    !nebula.coordinates
  ) {
    throw new TypeError(
      "Nebula coordinates are required."
    );
  }

  validateCoordinates(
    nebula.coordinates
      .rightAscension,
    nebula.coordinates
      .declination
  );

  if (
    nebula.distanceLightYears !==
      undefined
  ) {
    validatePositiveOrZero(
      nebula.distanceLightYears,
      "Distance"
    );
  }

  if (
    nebula.distanceParsecs !==
      undefined
  ) {
    validatePositiveOrZero(
      nebula.distanceParsecs,
      "Distance"
    );
  }

  if (
    nebula.apparentMagnitude !==
      undefined
  ) {
    validateFinite(
      nebula.apparentMagnitude,
      "Apparent magnitude"
    );
  }

  if (
    nebula.angularDiameterArcminutes !==
      undefined
  ) {
    validatePositiveOrZero(
      nebula.angularDiameterArcminutes,
      "Angular diameter"
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

  validateFinite(
    declination,
    "Declination"
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
/* Default Export                                                             */
/* -------------------------------------------------------------------------- */

export default {
  createNebula,

  findNebulaById,

  findNebulaByName,

  searchNebulae,

  parsecsToLightYears,

  lightYearsToParsecs,

  getNebulaDistanceLightYears,

  getNebulaDistanceParsecs,

  createNebulaAngularSize,

  angularDiameterToDegrees,

  findNearestNebula,

  findNebulaeWithinAngularRadius,

  isNebulaWithinMagnitudeLimit,

  distanceModulus,

  apparentToAbsoluteMagnitude
};
