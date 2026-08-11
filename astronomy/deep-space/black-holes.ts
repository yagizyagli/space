/**
 * Space
 * Astronomy — Deep Space / Black Holes
 *
 * Black-hole data models and fundamental relativistic utilities.
 */

export type BlackHoleType =
  | "stellar"
  | "intermediate"
  | "supermassive"
  | "primordial"
  | "candidate"
  | "unknown";

export interface BlackHoleCoordinates {
  rightAscension:
    number;

  declination:
    number;
}

export interface BlackHole {
  id:
    string;

  name:
    string;

  type:
    BlackHoleType;

  coordinates:
    BlackHoleCoordinates;

  massSolar:
    number;

  massUncertaintySolar?:
    number;

  distanceLightYears?:
    number;

  distanceParsecs?:
    number;

  redshift?:
    number;

  spin?:
    number;

  apparentMagnitude?:
    number;

  hostGalaxy?:
    string;

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

export interface SchwarzschildProperties {
  massSolar:
    number;

  radiusKilometers:
    number;

  radiusMeters:
    number;

  diameterKilometers:
    number;

  escapeVelocityAtRadiusKmPerSecond:
    number;
}

export interface BlackHoleAngularSize {
  radiusMicroarcseconds:
    number;

  diameterMicroarcseconds:
    number;

  radiusMilliarcseconds:
    number;

  diameterMilliarcseconds:
    number;
}

export interface BlackHoleSearchOptions {
  name?:
    string;

  type?:
    BlackHoleType;

  hostGalaxy?:
    string;

  constellationId?:
    string;

  minimumMassSolar?:
    number;

  maximumMassSolar?:
    number;

  maximumDistanceLightYears?:
    number;

  limit?:
    number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Solar mass in kilograms.
 */
export const SOLAR_MASS_KG =
  1.98847e30;

/**
 * Gravitational constant.
 */
export const GRAVITATIONAL_CONSTANT =
  6.67430e-11;

/**
 * Speed of light in meters per second.
 */
export const SPEED_OF_LIGHT_MPS =
  299_792_458;

/**
 * Schwarzschild radius of one solar mass.
 *
 * rₛ = 2GM / c²
 */
export const SOLAR_MASS_SCHWARZSCHILD_RADIUS_METERS =
  (
    2 *
    GRAVITATIONAL_CONSTANT *
    SOLAR_MASS_KG
  ) /
  (
    SPEED_OF_LIGHT_MPS **
    2
  );

/**
 * Schwarzschild radius of one solar mass in kilometers.
 */
export const SOLAR_MASS_SCHWARZSCHILD_RADIUS_KM =
  SOLAR_MASS_SCHWARZSCHILD_RADIUS_METERS /
  1000;

/**
 * One astronomical unit in meters.
 */
export const ASTRONOMICAL_UNIT_METERS =
  149_597_870_700;

/**
 * One parsec in meters.
 */
export const PARSEC_METERS =
  3.085677581491367e16;

/**
 * One parsec in light-years.
 */
export const PARSEC_LIGHT_YEARS =
  3.261563777;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createBlackHole(
  input:
    BlackHole
):
  BlackHole {
  validateBlackHole(
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
/* Schwarzschild Radius                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Calculates Schwarzschild radius in meters.
 *
 * rₛ = 2GM / c²
 */
export function schwarzschildRadiusMeters(
  massSolar:
    number
):
  number {
  validatePositiveMass(
    massSolar
  );

  return (
    massSolar *
    SOLAR_MASS_SCHWARZSCHILD_RADIUS_METERS
  );
}

/**
 * Calculates Schwarzschild radius in kilometers.
 */
export function schwarzschildRadiusKilometers(
  massSolar:
    number
):
  number {
  return (
    schwarzschildRadiusMeters(
      massSolar
    ) /
    1000
  );
}

/**
 * Calculates Schwarzschild radius in astronomical units.
 */
export function schwarzschildRadiusAstronomicalUnits(
  massSolar:
    number
):
  number {
  return (
    schwarzschildRadiusMeters(
      massSolar
    ) /
    ASTRONOMICAL_UNIT_METERS
  );
}

/* -------------------------------------------------------------------------- */
/* Schwarzschild Properties                                                   */
/* -------------------------------------------------------------------------- */

export function getSchwarzschildProperties(
  massSolar:
    number
):
  SchwarzschildProperties {
  validatePositiveMass(
    massSolar
  );

  const radiusMeters =
    schwarzschildRadiusMeters(
      massSolar
    );

  return {
    massSolar,

    radiusKilometers:
      radiusMeters /
      1000,

    radiusMeters,

    diameterKilometers:
      (
        radiusMeters *
        2
      ) /
      1000,

    escapeVelocityAtRadiusKmPerSecond:
      SPEED_OF_LIGHT_MPS /
      1000
  };
}

/* -------------------------------------------------------------------------- */
/* Gravity / Time                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Calculates the gravitational time-dilation factor for a stationary
 * observer outside a non-rotating Schwarzschild black hole:
 *
 * dτ/dt = sqrt(1 - rₛ/r)
 *
 * `radiusMeters` must be greater than the Schwarzschild radius.
 */
export function schwarzschildTimeDilationFactor(
  massSolar:
    number,
  radiusMeters:
    number
):
  number {
  const schwarzschildRadius =
    schwarzschildRadiusMeters(
      massSolar
    );

  if (
    !Number.isFinite(
      radiusMeters
    ) ||
    radiusMeters <=
      schwarzschildRadius
  ) {
    throw new RangeError(
      "Radius must be greater than the Schwarzschild radius."
    );
  }

  return Math.sqrt(
    1 -
    (
      schwarzschildRadius /
      radiusMeters
    )
  );
}

/**
 * Calculates escape velocity at a given radius.
 *
 * vₑ = sqrt(2GM/r)
 */
export function escapeVelocityMetersPerSecond(
  massSolar:
    number,
  radiusMeters:
    number
):
  number {
  validatePositiveMass(
    massSolar
  );

  if (
    !Number.isFinite(
      radiusMeters
    ) ||
    radiusMeters <=
      0
  ) {
    throw new RangeError(
      "Radius must be greater than zero."
    );
  }

  const massKg =
    massSolar *
    SOLAR_MASS_KG;

  return Math.sqrt(
    (
      2 *
      GRAVITATIONAL_CONSTANT *
      massKg
    ) /
    radiusMeters
  );
}

/* -------------------------------------------------------------------------- */
/* Angular Size                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Calculates the angular radius of the Schwarzschild radius.
 *
 * Small-angle approximation:
 *
 * θ ≈ r / d
 */
export function schwarzschildAngularRadiusMicroarcseconds(
  massSolar:
    number,
  distanceParsecs:
    number
):
  number {
  validatePositiveMass(
    massSolar
  );

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

  const radius =
    schwarzschildRadiusMeters(
      massSolar
    );

  const distance =
    distanceParsecs *
    PARSEC_METERS;

  const radians =
    radius /
    distance;

  return (
    radians *
    (
      180 /
      Math.PI
    ) *
    3600 *
    1_000_000
  );
}

export function getBlackHoleAngularSize(
  massSolar:
    number,
  distanceParsecs:
    number
):
  BlackHoleAngularSize {
  const radius =
    schwarzschildAngularRadiusMicroarcseconds(
      massSolar,
      distanceParsecs
    );

  const diameter =
    radius *
    2;

  return {
    radiusMicroarcseconds:
      radius,

    diameterMicroarcseconds:
      diameter,

    radiusMilliarcseconds:
      radius /
      1000,

    diameterMilliarcseconds:
      diameter /
      1000
  };
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
    PARSEC_LIGHT_YEARS
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
    lightYears /
    PARSEC_LIGHT_YEARS
  );
}

export function getBlackHoleDistanceLightYears(
  blackHole:
    BlackHole
):
  number |
  null {
  if (
    blackHole.distanceLightYears !==
      undefined
  ) {
    return (
      blackHole.distanceLightYears
    );
  }

  if (
    blackHole.distanceParsecs !==
      undefined
  ) {
    return parsecsToLightYears(
      blackHole.distanceParsecs
    );
  }

  return null;
}

export function getBlackHoleDistanceParsecs(
  blackHole:
    BlackHole
):
  number |
  null {
  if (
    blackHole.distanceParsecs !==
      undefined
  ) {
    return (
      blackHole.distanceParsecs
    );
  }

  if (
    blackHole.distanceLightYears !==
      undefined
  ) {
    return lightYearsToParsecs(
      blackHole.distanceLightYears
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                      */
/* -------------------------------------------------------------------------- */

export function findBlackHoleById(
  blackHoles:
    readonly BlackHole[],
  id:
    string
):
  BlackHole |
  null {
  const normalized =
    normalizeText(
      id
    );

  return (
    blackHoles.find(
      (
        blackHole
      ) =>
        normalizeText(
          blackHole.id
        ) ===
        normalized
    ) ??
    null
  );
}

export function findBlackHoleByName(
  blackHoles:
    readonly BlackHole[],
  name:
    string
):
  BlackHole |
  null {
  const normalized =
    normalizeText(
      name
    );

  return (
    blackHoles.find(
      (
        blackHole
      ) =>
        normalizeText(
          blackHole.name
        ) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export function searchBlackHoles(
  blackHoles:
    readonly BlackHole[],
  options:
    BlackHoleSearchOptions =
      {}
):
  BlackHole[] {
  let results =
    [...blackHoles];

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
          blackHole
        ) =>
          normalizeText(
            blackHole.name
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
          blackHole
        ) =>
          blackHole.type ===
          options.type
      );
  }

  if (
    options.hostGalaxy !==
      undefined
  ) {
    const host =
      normalizeText(
        options.hostGalaxy
      );

    results =
      results.filter(
        (
          blackHole
        ) =>
          blackHole.hostGalaxy !==
            undefined &&
          normalizeText(
            blackHole.hostGalaxy
          ).includes(
            host
          )
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
          blackHole
        ) =>
          blackHole.constellationId !==
            undefined &&
          normalizeText(
            blackHole.constellationId
          ) ===
            constellation
      );
  }

  if (
    options.minimumMassSolar !==
      undefined
  ) {
    results =
      results.filter(
        (
          blackHole
        ) =>
          blackHole.massSolar >=
          options.minimumMassSolar!
      );
  }

  if (
    options.maximumMassSolar !==
      undefined
  ) {
    results =
      results.filter(
        (
          blackHole
        ) =>
          blackHole.massSolar <=
          options.maximumMassSolar!
      );
  }

  if (
    options.maximumDistanceLightYears !==
      undefined
  ) {
    results =
      results.filter(
        (
          blackHole
        ) => {
          const distance =
            getBlackHoleDistanceLightYears(
              blackHole
            );

          return (
            distance !==
              null &&
            distance <=
              options.maximumDistanceLightYears!
          );
        }
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
/* Coordinates                                                                 */
/* -------------------------------------------------------------------------- */

export function findNearestBlackHole(
  blackHoles:
    readonly BlackHole[],
  rightAscension:
    number,
  declination:
    number
):
  BlackHole |
  null {
  validateCoordinates(
    rightAscension,
    declination
  );

  let nearest:
    BlackHole |
    null =
    null;

  let nearestDistance =
    Infinity;

  for (
    const blackHole of
      blackHoles
  ) {
    const distance =
      angularDistance(
        rightAscension,
        declination,
        blackHole.coordinates
          .rightAscension,
        blackHole.coordinates
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        blackHole;
    }
  }

  return nearest;
}

export function findBlackHolesWithinAngularRadius(
  blackHoles:
    readonly BlackHole[],
  rightAscension:
    number,
  declination:
    number,
  radiusDegrees:
    number
):
  BlackHole[] {
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

  return blackHoles.filter(
    (
      blackHole
    ) =>
      angularDistance(
        rightAscension,
        declination,
        blackHole.coordinates
          .rightAscension,
        blackHole.coordinates
          .declination
      ) <=
      radiusDegrees
  );
}

/* -------------------------------------------------------------------------- */
/* Redshift                                                                    */
/* -------------------------------------------------------------------------- */

export function redshiftToApproximateVelocityKmPerSecond(
  redshift:
    number
):
  number {
  validateFinite(
    redshift,
    "Redshift"
  );

  return (
    redshift *
    299_792.458
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function validateBlackHole(
  blackHole:
    BlackHole
):
  void {
  if (
    !blackHole.id ||
    typeof blackHole.id !==
      "string"
  ) {
    throw new TypeError(
      "Black-hole id must be a non-empty string."
    );
  }

  if (
    !blackHole.name ||
    typeof blackHole.name !==
      "string"
  ) {
    throw new TypeError(
      "Black-hole name must be a non-empty string."
    );
  }

  validatePositiveMass(
    blackHole.massSolar
  );

  validateCoordinates(
    blackHole.coordinates
      .rightAscension,
    blackHole.coordinates
      .declination
  );

  if (
    blackHole.distanceLightYears !==
      undefined
  ) {
    validatePositiveOrZero(
      blackHole.distanceLightYears,
      "Distance"
    );
  }

  if (
    blackHole.distanceParsecs !==
      undefined
  ) {
    validatePositiveOrZero(
      blackHole.distanceParsecs,
      "Distance"
    );
  }

  if (
    blackHole.spin !==
      undefined
  ) {
    if (
      !Number.isFinite(
        blackHole.spin
      ) ||
      blackHole.spin <
        0 ||
      blackHole.spin >
        1
    ) {
      throw new RangeError(
        "Spin must be between 0 and 1."
      );
    }
  }
}

function validatePositiveMass(
  massSolar:
    number
):
  void {
  if (
    !Number.isFinite(
      massSolar
    ) ||
    massSolar <=
      0
  ) {
    throw new RangeError(
      "Black-hole mass must be greater than zero."
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
  createBlackHole,

  schwarzschildRadiusMeters,

  schwarzschildRadiusKilometers,

  schwarzschildRadiusAstronomicalUnits,

  getSchwarzschildProperties,

  schwarzschildTimeDilationFactor,

  escapeVelocityMetersPerSecond,

  schwarzschildAngularRadiusMicroarcseconds,

  getBlackHoleAngularSize,

  parsecsToLightYears,

  lightYearsToParsecs,

  getBlackHoleDistanceLightYears,

  getBlackHoleDistanceParsecs,

  findBlackHoleById,

  findBlackHoleByName,

  searchBlackHoles,

  findNearestBlackHole,

  findBlackHolesWithinAngularRadius,

  redshiftToApproximateVelocityKmPerSecond
};
