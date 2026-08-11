/**
 * Space
 * Astronomy — Exoplanets
 *
 * Exoplanet data models, classification and utility calculations.
 */

export type ExoplanetType =
  | "terrestrial"
  | "super-earth"
  | "mini-neptune"
  | "neptune-like"
  | "gas-giant"
  | "hot-jupiter"
  | "ice-giant"
  | "unknown";

export type DetectionMethod =
  | "transit"
  | "radial-velocity"
  | "direct-imaging"
  | "microlensing"
  | "astrometry"
  | "timing"
  | "transit-timing"
  | "orbital-brightness"
  | "unknown";

export interface ExoplanetCoordinates {
  rightAscension?: number;
  declination?: number;
}

export interface ExoplanetHostStar {
  name: string;

  massSolar?: number;
  radiusSolar?: number;
  temperatureKelvin?: number;

  metallicity?: number;

  distanceLightYears?: number;
  distanceParsecs?: number;
}

export interface Exoplanet {
  id: string;
  name: string;

  type: ExoplanetType;

  hostStar: ExoplanetHostStar;

  coordinates?: ExoplanetCoordinates;

  detectionMethods: readonly DetectionMethod[];

  massEarths?: number;
  radiusEarths?: number;

  massJupiter?: number;
  radiusJupiter?: number;

  orbitalPeriodDays?: number;

  semiMajorAxisAU?: number;

  eccentricity?: number;

  inclinationDegrees?: number;

  equilibriumTemperatureKelvin?: number;

  surfaceTemperatureKelvin?: number;

  discoveryYear?: number;

  transitDepthPercent?: number;

  transitDurationHours?: number;

  stellarFluxEarths?: number;

  densityEarths?: number;

  escapeVelocityKmPerSecond?: number;

  habitableZone?: boolean;

  confirmed?: boolean;

  catalogIds?: Readonly<Record<string, string>>;

  description?: string;
}

export interface ExoplanetSearchOptions {
  name?: string;
  hostStar?: string;

  type?: ExoplanetType;

  detectionMethod?: DetectionMethod;

  confirmed?: boolean;

  habitableZone?: boolean;

  minimumMassEarths?: number;
  maximumMassEarths?: number;

  minimumRadiusEarths?: number;
  maximumRadiusEarths?: number;

  minimumOrbitalPeriodDays?: number;
  maximumOrbitalPeriodDays?: number;

  minimumDistanceLightYears?: number;
  maximumDistanceLightYears?: number;

  discoveryYearFrom?: number;
  discoveryYearTo?: number;

  limit?: number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const EARTH_MASS_KG =
  5.9722e24;

export const EARTH_RADIUS_KM =
  6371;

export const JUPITER_MASS_EARTHS =
  317.828;

export const JUPITER_RADIUS_EARTHS =
  11.209;

export const ASTRONOMICAL_UNIT_KM =
  149_597_870.7;

export const EARTH_GRAVITY_M_PER_S2 =
  9.80665;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createExoplanet(
  input: Exoplanet
): Exoplanet {
  validateExoplanet(input);

  return {
    ...input,

    detectionMethods:
      [...input.detectionMethods],

    coordinates:
      input.coordinates
        ? {
            ...input.coordinates,

            rightAscension:
              input.coordinates
                .rightAscension !==
              undefined
                ? normalizeRightAscension(
                    input.coordinates
                      .rightAscension
                  )
                : undefined
          }
        : undefined
  };
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export function findExoplanetById(
  exoplanets: readonly Exoplanet[],
  id: string
): Exoplanet | null {
  const normalized =
    normalizeText(id);

  return (
    exoplanets.find(
      (planet) =>
        normalizeText(
          planet.id
        ) === normalized
    ) ??
    null
  );
}

export function findExoplanetByName(
  exoplanets: readonly Exoplanet[],
  name: string
): Exoplanet | null {
  const normalized =
    normalizeText(name);

  return (
    exoplanets.find(
      (planet) =>
        normalizeText(
          planet.name
        ) === normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchExoplanets(
  exoplanets: readonly Exoplanet[],
  options: ExoplanetSearchOptions = {}
): Exoplanet[] {
  let results =
    [...exoplanets];

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
        (planet) =>
          normalizeText(
            planet.name
          ).includes(query)
      );
  }

  if (
    options.hostStar !==
    undefined
  ) {
    const query =
      normalizeText(
        options.hostStar
      );

    results =
      results.filter(
        (planet) =>
          normalizeText(
            planet.hostStar.name
          ).includes(query)
      );
  }

  if (
    options.type !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.type ===
          options.type
      );
  }

  if (
    options.detectionMethod !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.detectionMethods
            .includes(
              options.detectionMethod!
            )
      );
  }

  if (
    options.confirmed !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.confirmed ===
          options.confirmed
      );
  }

  if (
    options.habitableZone !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.habitableZone ===
          options.habitableZone
      );
  }

  if (
    options.minimumMassEarths !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.massEarths !==
            undefined &&
          planet.massEarths >=
            options.minimumMassEarths!
      );
  }

  if (
    options.maximumMassEarths !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.massEarths !==
            undefined &&
          planet.massEarths <=
            options.maximumMassEarths!
      );
  }

  if (
    options.minimumRadiusEarths !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.radiusEarths !==
            undefined &&
          planet.radiusEarths >=
            options.minimumRadiusEarths!
      );
  }

  if (
    options.maximumRadiusEarths !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.radiusEarths !==
            undefined &&
          planet.radiusEarths <=
            options.maximumRadiusEarths!
      );
  }

  if (
    options.minimumOrbitalPeriodDays !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.orbitalPeriodDays !==
            undefined &&
          planet.orbitalPeriodDays >=
            options.minimumOrbitalPeriodDays!
      );
  }

  if (
    options.maximumOrbitalPeriodDays !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.orbitalPeriodDays !==
            undefined &&
          planet.orbitalPeriodDays <=
            options.maximumOrbitalPeriodDays!
      );
  }

  if (
    options.minimumDistanceLightYears !==
    undefined
  ) {
    results =
      results.filter(
        (planet) => {
          const distance =
            getDistanceLightYears(
              planet
            );

          return (
            distance !== null &&
            distance >=
              options.minimumDistanceLightYears!
          );
        }
      );
  }

  if (
    options.maximumDistanceLightYears !==
    undefined
  ) {
    results =
      results.filter(
        (planet) => {
          const distance =
            getDistanceLightYears(
              planet
            );

          return (
            distance !== null &&
            distance <=
              options.maximumDistanceLightYears!
          );
        }
      );
  }

  if (
    options.discoveryYearFrom !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.discoveryYear !==
            undefined &&
          planet.discoveryYear >=
            options.discoveryYearFrom!
      );
  }

  if (
    options.discoveryYearTo !==
    undefined
  ) {
    results =
      results.filter(
        (planet) =>
          planet.discoveryYear !==
            undefined &&
          planet.discoveryYear <=
            options.discoveryYearTo!
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
/* Mass Conversion                                                            */
/* -------------------------------------------------------------------------- */

export function earthMassesToKg(
  earthMasses: number
): number {
  validatePositiveOrZero(
    earthMasses,
    "Earth masses"
  );

  return (
    earthMasses *
    EARTH_MASS_KG
  );
}

export function kgToEarthMasses(
  kilograms: number
): number {
  validatePositiveOrZero(
    kilograms,
    "Kilograms"
  );

  return (
    kilograms /
    EARTH_MASS_KG
  );
}

export function earthMassesToJupiterMasses(
  earthMasses: number
): number {
  validatePositiveOrZero(
    earthMasses,
    "Earth masses"
  );

  return (
    earthMasses /
    JUPITER_MASS_EARTHS
  );
}

export function jupiterMassesToEarthMasses(
  jupiterMasses: number
): number {
  validatePositiveOrZero(
    jupiterMasses,
    "Jupiter masses"
  );

  return (
    jupiterMasses *
    JUPITER_MASS_EARTHS
  );
}

/* -------------------------------------------------------------------------- */
/* Radius Conversion                                                          */
/* -------------------------------------------------------------------------- */

export function earthRadiiToKm(
  earthRadii: number
): number {
  validatePositiveOrZero(
    earthRadii,
    "Earth radii"
  );

  return (
    earthRadii *
    EARTH_RADIUS_KM
  );
}

export function kmToEarthRadii(
  kilometers: number
): number {
  validatePositiveOrZero(
    kilometers,
    "Kilometers"
  );

  return (
    kilometers /
    EARTH_RADIUS_KM
  );
}

export function earthRadiiToJupiterRadii(
  earthRadii: number
): number {
  validatePositiveOrZero(
    earthRadii,
    "Earth radii"
  );

  return (
    earthRadii /
    JUPITER_RADIUS_EARTHS
  );
}

export function jupiterRadiiToEarthRadii(
  jupiterRadii: number
): number {
  validatePositiveOrZero(
    jupiterRadii,
    "Jupiter radii"
  );

  return (
    jupiterRadii *
    JUPITER_RADIUS_EARTHS
  );
}

/* -------------------------------------------------------------------------- */
/* Orbital Mechanics                                                          */
/* -------------------------------------------------------------------------- */

export function orbitalPeriodDaysFromSemiMajorAxis(
  semiMajorAxisAU: number,
  stellarMassSolar = 1
): number {
  if (
    !Number.isFinite(
      semiMajorAxisAU
    ) ||
    semiMajorAxisAU <=
    0
  ) {
    throw new RangeError(
      "Semi-major axis must be greater than zero."
    );
  }

  if (
    !Number.isFinite(
      stellarMassSolar
    ) ||
    stellarMassSolar <=
    0
  ) {
    throw new RangeError(
      "Stellar mass must be greater than zero."
    );
  }

  /*
   * Kepler's third law in solar units:
   *
   * P² = a³ / M
   *
   * P in years, a in AU, M in solar masses.
   */
  const periodYears =
    Math.sqrt(
      (
        semiMajorAxisAU ** 3
      ) /
      stellarMassSolar
    );

  return (
    periodYears *
    365.25
  );
}

export function semiMajorAxisAUFromOrbitalPeriodDays(
  orbitalPeriodDays: number,
  stellarMassSolar = 1
): number {
  if (
    !Number.isFinite(
      orbitalPeriodDays
    ) ||
    orbitalPeriodDays <=
    0
  ) {
    throw new RangeError(
      "Orbital period must be greater than zero."
    );
  }

  if (
    !Number.isFinite(
      stellarMassSolar
    ) ||
    stellarMassSolar <=
    0
  ) {
    throw new RangeError(
      "Stellar mass must be greater than zero."
    );
  }

  const periodYears =
    orbitalPeriodDays /
    365.25;

  return (
    (
      periodYears ** 2 *
      stellarMassSolar
    ) ** (
      1 / 3
    )
  );
}

export function orbitalVelocityKmPerSecond(
  semiMajorAxisAU: number,
  stellarMassSolar = 1
): number {
  if (
    !Number.isFinite(
      semiMajorAxisAU
    ) ||
    semiMajorAxisAU <=
    0
  ) {
    throw new RangeError(
      "Semi-major axis must be greater than zero."
    );
  }

  if (
    !Number.isFinite(
      stellarMassSolar
    ) ||
    stellarMassSolar <=
    0
  ) {
    throw new RangeError(
      "Stellar mass must be greater than zero."
    );
  }

  /*
   * Earth's orbital velocity is
   * approximately 29.7846918 km/s.
   */
  const earthOrbitalVelocity =
    29.7846918;

  return (
    earthOrbitalVelocity *
    Math.sqrt(
      stellarMassSolar /
      semiMajorAxisAU
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Planetary Properties                                                       */
/* -------------------------------------------------------------------------- */

export function calculateDensityRelativeToEarth(
  massEarths: number,
  radiusEarths: number
): number {
  if (
    !Number.isFinite(
      massEarths
    ) ||
    massEarths <=
    0
  ) {
    throw new RangeError(
      "Mass must be greater than zero."
    );
  }

  if (
    !Number.isFinite(
      radiusEarths
    ) ||
    radiusEarths <=
    0
  ) {
    throw new RangeError(
      "Radius must be greater than zero."
    );
  }

  return (
    massEarths /
    radiusEarths ** 3
  );
}

export function calculateSurfaceGravityRelativeToEarth(
  massEarths: number,
  radiusEarths: number
): number {
  if (
    !Number.isFinite(
      massEarths
    ) ||
    massEarths <=
    0
  ) {
    throw new RangeError(
      "Mass must be greater than zero."
    );
  }

  if (
    !Number.isFinite(
      radiusEarths
    ) ||
    radiusEarths <=
    0
  ) {
    throw new RangeError(
      "Radius must be greater than zero."
    );
  }

  return (
    massEarths /
    radiusEarths ** 2
  );
}

export function calculateEscapeVelocityKmPerSecond(
  massEarths: number,
  radiusEarths: number
): number {
  const earthEscapeVelocity =
    11.186;

  return (
    earthEscapeVelocity *
    Math.sqrt(
      massEarths /
      radiusEarths
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Transit                                                                    */
/* -------------------------------------------------------------------------- */

export function calculateTransitDepthPercent(
  planetRadiusEarths: number,
  starRadiusSolar: number
): number {
  if (
    !Number.isFinite(
      planetRadiusEarths
    ) ||
    planetRadiusEarths <=
    0
  ) {
    throw new RangeError(
      "Planet radius must be greater than zero."
    );
  }

  if (
    !Number.isFinite(
      starRadiusSolar
    ) ||
    starRadiusSolar <=
    0
  ) {
    throw new RangeError(
      "Star radius must be greater than zero."
    );
  }

  /*
   * Transit depth:
   *
   * δ ≈ (Rp / R*)²
   *
   * Earth-radius / solar-radius conversion:
   */
  const earthRadiiPerSolarRadius =
    109.076;

  const planetToStarRadius =
    planetRadiusEarths /
    (
      starRadiusSolar *
      earthRadiiPerSolarRadius
    );

  return (
    planetToStarRadius ** 2 *
    100
  );
}

/* -------------------------------------------------------------------------- */
/* Habitable Zone                                                             */
/* -------------------------------------------------------------------------- */

export function estimateHabitableZoneInnerAU(
  stellarLuminositySolar: number
): number {
  validatePositive(
    stellarLuminositySolar,
    "Stellar luminosity"
  );

  return Math.sqrt(
    stellarLuminositySolar /
    1.1
  );
}

export function estimateHabitableZoneOuterAU(
  stellarLuminositySolar: number
): number {
  validatePositive(
    stellarLuminositySolar,
    "Stellar luminosity"
  );

  return Math.sqrt(
    stellarLuminositySolar /
    0.53
  );
}

export function isInsideConservativeHabitableZone(
  semiMajorAxisAU: number,
  stellarLuminositySolar: number
): boolean {
  if (
    !Number.isFinite(
      semiMajorAxisAU
    ) ||
    semiMajorAxisAU <
    0
  ) {
    throw new RangeError(
      "Semi-major axis must be zero or greater."
    );
  }

  const inner =
    estimateHabitableZoneInnerAU(
      stellarLuminositySolar
    );

  const outer =
    estimateHabitableZoneOuterAU(
      stellarLuminositySolar
    );

  return (
    semiMajorAxisAU >=
    inner &&
    semiMajorAxisAU <=
    outer
  );
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

export function getDistanceLightYears(
  exoplanet: Exoplanet
): number | null {
  if (
    exoplanet.hostStar
      .distanceLightYears !==
    undefined
  ) {
    return (
      exoplanet.hostStar
        .distanceLightYears
    );
  }

  if (
    exoplanet.hostStar
      .distanceParsecs !==
    undefined
  ) {
    return (
      exoplanet.hostStar
        .distanceParsecs *
      3.261563777
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Classification                                                             */
/* -------------------------------------------------------------------------- */

export function classifyExoplanet(
  massEarths?: number,
  radiusEarths?: number
): ExoplanetType {
  if (
    massEarths ===
      undefined &&
    radiusEarths ===
      undefined
  ) {
    return "unknown";
  }

  const mass =
    massEarths ??
    Number.NaN;

  const radius =
    radiusEarths ??
    Number.NaN;

  if (
    Number.isFinite(mass)
  ) {
    if (
      mass <=
      2
    ) {
      return "terrestrial";
    }

    if (
      mass <=
      10
    ) {
      return "super-earth";
    }

    if (
      mass <=
      30
    ) {
      return "mini-neptune";
    }

    if (
      mass <=
      100
    ) {
      return "neptune-like";
    }

    return "gas-giant";
  }

  if (
    Number.isFinite(radius)
  ) {
    if (
      radius <=
      1.25
    ) {
      return "terrestrial";
    }

    if (
      radius <=
      2
    ) {
      return "super-earth";
    }

    if (
      radius <=
      4
    ) {
      return "mini-neptune";
    }

    if (
      radius <=
      8
    ) {
      return "neptune-like";
    }

    return "gas-giant";
  }

  return "unknown";
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateExoplanet(
  planet: Exoplanet
): void {
  if (
    !planet.id ||
    typeof planet.id !==
    "string"
  ) {
    throw new TypeError(
      "Exoplanet id must be a non-empty string."
    );
  }

  if (
    !planet.name ||
    typeof planet.name !==
    "string"
  ) {
    throw new TypeError(
      "Exoplanet name must be a non-empty string."
    );
  }

  if (
    !planet.hostStar ||
    !planet.hostStar.name
  ) {
    throw new TypeError(
      "Exoplanet must have a host star."
    );
  }

  for (
    const method of
    planet.detectionMethods
  ) {
    if (
      typeof method !==
      "string"
    ) {
      throw new TypeError(
        "Detection methods must be strings."
      );
    }
  }

  if (
    planet.massEarths !==
    undefined
  ) {
    validatePositive(
      planet.massEarths,
      "Mass"
    );
  }

  if (
    planet.radiusEarths !==
    undefined
  ) {
    validatePositive(
      planet.radiusEarths,
      "Radius"
    );
  }

  if (
    planet.orbitalPeriodDays !==
    undefined
  ) {
    validatePositive(
      planet.orbitalPeriodDays,
      "Orbital period"
    );
  }

  if (
    planet.semiMajorAxisAU !==
    undefined
  ) {
    validatePositive(
      planet.semiMajorAxisAU,
      "Semi-major axis"
    );
  }

  if (
    planet.eccentricity !==
    undefined
  ) {
    if (
      !Number.isFinite(
        planet.eccentricity
      ) ||
      planet.eccentricity <
      0 ||
      planet.eccentricity >=
      1
    ) {
      throw new RangeError(
        "Eccentricity must be between 0 and 1."
      );
    }
  }

  if (
    planet.coordinates
      ?.declination !==
    undefined
  ) {
    if (
      planet.coordinates
        .declination <
      -90 ||
      planet.coordinates
        .declination >
      90
    ) {
      throw new RangeError(
        "Declination must be between -90 and 90 degrees."
      );
    }
  }
}

function validatePositive(
  value: number,
  label: string
): void {
  if (
    !Number.isFinite(
      value
    ) ||
    value <=
    0
  ) {
    throw new RangeError(
      `${label} must be greater than zero.`
    );
  }
}

function validatePositiveOrZero(
  value: number,
  label: string
): void {
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

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase();
}

function normalizeRightAscension(
  degrees: number
): number {
  return (
    (
      degrees %
      360
    ) +
    360
  ) %
    360;
}

/* -------------------------------------------------------------------------- */
/* Default Export                                                             */
/* -------------------------------------------------------------------------- */

export default {
  createExoplanet,

  findExoplanetById,

  findExoplanetByName,

  searchExoplanets,

  earthMassesToKg,

  kgToEarthMasses,

  earthMassesToJupiterMasses,

  jupiterMassesToEarthMasses,

  earthRadiiToKm,

  kmToEarthRadii,

  earthRadiiToJupiterRadii,

  jupiterRadiiToEarthRadii,

  orbitalPeriodDaysFromSemiMajorAxis,

  semiMajorAxisAUFromOrbitalPeriodDays,

  orbitalVelocityKmPerSecond,

  calculateDensityRelativeToEarth,

  calculateSurfaceGravityRelativeToEarth,

  calculateEscapeVelocityKmPerSecond,

  calculateTransitDepthPercent,

  estimateHabitableZoneInnerAU,

  estimateHabitableZoneOuterAU,

  isInsideConservativeHabitableZone,

  getDistanceLightYears,

  classifyExoplanet
};
