/**
 * Space
 * Astronomy — Deep Space / Quasars
 *
 * Quasar data models and astronomical utilities.
 */

export type QuasarType =
  | "radio-loud"
  | "radio-quiet"
  | "blazar"
  | "optically-violent-variable"
  | "broad-line"
  | "narrow-line"
  | "candidate"
  | "unknown";

export interface QuasarCoordinates {
  rightAscension:
    number;

  declination:
    number;
}

export interface Quasar {
  id:
    string;

  name:
    string;

  type:
    QuasarType;

  coordinates:
    QuasarCoordinates;

  redshift:
    number;

  luminositySolar?:
    number;

  absoluteMagnitude?:
    number;

  apparentMagnitude?:
    number;

  distanceLightYears?:
    number;

  distanceParsecs?:
    number;

  hostGalaxy?:
    string;

  blackHoleMassSolar?:
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

export interface QuasarSearchOptions {
  name?:
    string;

  type?:
    QuasarType;

  constellationId?:
    string;

  minimumRedshift?:
    number;

  maximumRedshift?:
    number;

  minimumLuminositySolar?:
    number;

  maximumMagnitude?:
    number;

  limit?:
    number;
}

export interface QuasarDistance {
  parsecs:
    number;

  lightYears:
    number;

  megaparsecs:
    number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const SPEED_OF_LIGHT_KM_PER_SECOND =
  299_792.458;

export const PARSEC_LIGHT_YEARS =
  3.261563777;

export const MEGAPARSEC_PARSEC =
  1_000_000;

export const HUBBLE_CONSTANT_KM_PER_SECOND_PER_MPC =
  70;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createQuasar(
  input:
    Quasar
):
  Quasar {
  validateQuasar(
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
/* Lookup                                                                      */
/* -------------------------------------------------------------------------- */

export function findQuasarById(
  quasars:
    readonly Quasar[],
  id:
    string
):
  Quasar |
  null {
  const normalized =
    normalizeText(
      id
    );

  return (
    quasars.find(
      (
        quasar
      ) =>
        normalizeText(
          quasar.id
        ) ===
        normalized
    ) ??
    null
  );
}

export function findQuasarByName(
  quasars:
    readonly Quasar[],
  name:
    string
):
  Quasar |
  null {
  const normalized =
    normalizeText(
      name
    );

  return (
    quasars.find(
      (
        quasar
      ) =>
        normalizeText(
          quasar.name
        ) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export function searchQuasars(
  quasars:
    readonly Quasar[],
  options:
    QuasarSearchOptions =
      {}
):
  Quasar[] {
  let results =
    [...quasars];

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
          quasar
        ) =>
          normalizeText(
            quasar.name
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
          quasar
        ) =>
          quasar.type ===
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
          quasar
        ) =>
          quasar.constellationId !==
            undefined &&
          normalizeText(
            quasar.constellationId
          ) ===
            constellation
      );
  }

  if (
    options.minimumRedshift !==
      undefined
  ) {
    results =
      results.filter(
        (
          quasar
        ) =>
          quasar.redshift >=
          options.minimumRedshift!
      );
  }

  if (
    options.maximumRedshift !==
      undefined
  ) {
    results =
      results.filter(
        (
          quasar
        ) =>
          quasar.redshift <=
          options.maximumRedshift!
      );
  }

  if (
    options.minimumLuminositySolar !==
      undefined
  ) {
    results =
      results.filter(
        (
          quasar
        ) =>
          quasar.luminositySolar !==
            undefined &&
          quasar.luminositySolar >=
            options.minimumLuminositySolar!
      );
  }

  if (
    options.maximumMagnitude !==
      undefined
  ) {
    results =
      results.filter(
        (
          quasar
        ) =>
          quasar.apparentMagnitude !==
            undefined &&
          quasar.apparentMagnitude <=
            options.maximumMagnitude!
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
/* Redshift                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Non-relativistic approximation:
 *
 * v ≈ zc
 *
 * This is useful only for relatively small redshifts.
 */
export function redshiftToApproximateVelocityKmPerSecond(
  redshift:
    number
):
  number {
  validateRedshift(
    redshift
  );

  return (
    redshift *
    SPEED_OF_LIGHT_KM_PER_SECOND
  );
}

/**
 * Relativistic recession-velocity approximation:
 *
 * β = ((1+z)² - 1) / ((1+z)² + 1)
 *
 * v = βc
 */
export function redshiftToRelativisticVelocityKmPerSecond(
  redshift:
    number
):
  number {
  validateRedshift(
    redshift
  );

  const onePlusZ =
    1 +
    redshift;

  const beta =
    (
      onePlusZ ** 2 -
      1
    ) /
    (
      onePlusZ ** 2 +
      1
    );

  return (
    beta *
    SPEED_OF_LIGHT_KM_PER_SECOND
  );
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Low-redshift Hubble-law approximation:
 *
 * d ≈ cz / H₀
 *
 * Returns megaparsecs.
 */
export function redshiftToApproximateDistanceMegaparsecs(
  redshift:
    number,
  hubbleConstant:
    number =
      HUBBLE_CONSTANT_KM_PER_SECOND_PER_MPC
):
  number {
  validateRedshift(
    redshift
  );

  if (
    !Number.isFinite(
      hubbleConstant
    ) ||
    hubbleConstant <=
      0
  ) {
    throw new RangeError(
      "Hubble constant must be greater than zero."
    );
  }

  return (
    redshift *
    SPEED_OF_LIGHT_KM_PER_SECOND /
    hubbleConstant
  );
}

export function megaparsecsToParsecs(
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
    MEGAPARSEC_PARSEC
  );
}

export function parsecsToMegaparsecs(
  parsecs:
    number
):
  number {
  validatePositiveOrZero(
    parsecs,
    "Parsecs"
  );

  return (
    parsecs /
    MEGAPARSEC_PARSEC
  );
}

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

export function getQuasarDistance(
  quasar:
    Quasar
):
  QuasarDistance |
  null {
  if (
    quasar.distanceParsecs !==
      undefined
  ) {
    const parsecs =
      quasar.distanceParsecs;

    return {
      parsecs,

      lightYears:
        parsecsToLightYears(
          parsecs
        ),

      megaparsecs:
        parsecsToMegaparsecs(
          parsecs
        )
    };
  }

  if (
    quasar.distanceLightYears !==
      undefined
  ) {
    const lightYears =
      quasar.distanceLightYears;

    const parsecs =
      lightYearsToParsecs(
        lightYears
      );

    return {
      parsecs,

      lightYears,

      megaparsecs:
        parsecsToMegaparsecs(
          parsecs
        )
    };
  }

  if (
    quasar.redshift >=
      0
  ) {
    const megaparsecs =
      redshiftToApproximateDistanceMegaparsecs(
        quasar.redshift
      );

    const parsecs =
      megaparsecsToParsecs(
        megaparsecs
      );

    return {
      parsecs,

      lightYears:
        parsecsToLightYears(
          parsecs
        ),

      megaparsecs
    };
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Luminosity                                                                  */
/* -------------------------------------------------------------------------- */

export function luminosityRatioFromAbsoluteMagnitude(
  absoluteMagnitude:
    number
):
  number {
  validateFinite(
    absoluteMagnitude,
    "Absolute magnitude"
  );

  return 10 **
    (
      (
        4.83 -
        absoluteMagnitude
      ) /
      2.5
    );
}

export function absoluteMagnitudeFromLuminosityRatio(
  luminositySolar:
    number
):
  number {
  if (
    !Number.isFinite(
      luminositySolar
    ) ||
    luminositySolar <=
      0
  ) {
    throw new RangeError(
      "Luminosity must be greater than zero."
    );
  }

  return (
    4.83 -
    2.5 *
      Math.log10(
        luminositySolar
      )
  );
}

/* -------------------------------------------------------------------------- */
/* Angular Coordinates                                                        */
/* -------------------------------------------------------------------------- */

export function findNearestQuasar(
  quasars:
    readonly Quasar[],
  rightAscension:
    number,
  declination:
    number
):
  Quasar |
  null {
  validateCoordinates(
    rightAscension,
    declination
  );

  let nearest:
    Quasar |
    null =
    null;

  let nearestDistance =
    Infinity;

  for (
    const quasar of
      quasars
  ) {
    const distance =
      angularDistance(
        rightAscension,
        declination,
        quasar.coordinates
          .rightAscension,
        quasar.coordinates
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        quasar;
    }
  }

  return nearest;
}

export function findQuasarsWithinAngularRadius(
  quasars:
    readonly Quasar[],
  rightAscension:
    number,
  declination:
    number,
  radiusDegrees:
    number
):
  Quasar[] {
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

  return quasars.filter(
    (
      quasar
    ) =>
      angularDistance(
        rightAscension,
        declination,
        quasar.coordinates
          .rightAscension,
        quasar.coordinates
          .declination
      ) <=
      radiusDegrees
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function validateQuasar(
  quasar:
    Quasar
):
  void {
  if (
    !quasar.id ||
    typeof quasar.id !==
      "string"
  ) {
    throw new TypeError(
      "Quasar id must be a non-empty string."
    );
  }

  if (
    !quasar.name ||
    typeof quasar.name !==
      "string"
  ) {
    throw new TypeError(
      "Quasar name must be a non-empty string."
    );
  }

  validateRedshift(
    quasar.redshift
  );

  validateCoordinates(
    quasar.coordinates
      .rightAscension,
    quasar.coordinates
      .declination
  );

  if (
    quasar.luminositySolar !==
      undefined
  ) {
    validatePositiveOrZero(
      quasar.luminositySolar,
      "Luminosity"
    );
  }

  if (
    quasar.blackHoleMassSolar !==
      undefined
  ) {
    if (
      !Number.isFinite(
        quasar.blackHoleMassSolar
      ) ||
      quasar.blackHoleMassSolar <=
        0
    ) {
      throw new RangeError(
        "Black-hole mass must be greater than zero."
      );
    }
  }

  if (
    quasar.distanceLightYears !==
      undefined
  ) {
    validatePositiveOrZero(
      quasar.distanceLightYears,
      "Distance"
    );
  }

  if (
    quasar.distanceParsecs !==
      undefined
  ) {
    validatePositiveOrZero(
      quasar.distanceParsecs,
      "Distance"
    );
  }
}

function validateRedshift(
  redshift:
    number
):
  void {
  if (
    !Number.isFinite(
      redshift
    ) ||
    redshift <
      0
  ) {
    throw new RangeError(
      "Redshift must be zero or greater."
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
/* Geometry                                                                    */
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
  createQuasar,

  findQuasarById,

  findQuasarByName,

  searchQuasars,

  redshiftToApproximateVelocityKmPerSecond,

  redshiftToRelativisticVelocityKmPerSecond,

  redshiftToApproximateDistanceMegaparsecs,

  megaparsecsToParsecs,

  parsecsToMegaparsecs,

  parsecsToLightYears,

  lightYearsToParsecs,

  getQuasarDistance,

  luminosityRatioFromAbsoluteMagnitude,

  absoluteMagnitudeFromLuminosityRatio,

  findNearestQuasar,

  findQuasarsWithinAngularRadius
};
