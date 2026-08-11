/**
 * Space
 * Planetary Constants
 *
 * Physical and orbital reference constants for the major bodies
 * of the Solar System.
 *
 * Units:
 * - Distance: meters unless otherwise stated
 * - Mass: kilograms
 * - Time: seconds
 * - Angles: radians unless otherwise stated
 */

import {
  ASTRONOMICAL_UNIT_METERS
} from "./astronomical";

import {
  GRAVITATIONAL_CONSTANT,
  SPEED_OF_LIGHT,
  SOLAR_MASS,
  SOLAR_RADIUS,
  EARTH_MASS,
  EARTH_EQUATORIAL_RADIUS,
  EARTH_POLAR_RADIUS,
  MOON_MASS,
  MOON_MEAN_RADIUS,
  SOLAR_GRAVITATIONAL_PARAMETER,
  EARTH_GRAVITATIONAL_PARAMETER,
  MOON_GRAVITATIONAL_PARAMETER
} from "./physical";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PlanetName =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type MajorBodyName =
  | "sun"
  | "moon"
  | PlanetName;

export interface PlanetaryConstants {
  name: PlanetName;

  mass: number;

  meanRadius: number;

  equatorialRadius: number;

  polarRadius: number;

  gravitationalParameter: number;

  surfaceGravity: number;

  rotationPeriod: number;

  orbitalPeriod: number;

  semiMajorAxis: number;

  orbitalEccentricity: number;

  orbitalInclination: number;

  axialTilt: number;
}

export interface MajorBodyConstants {
  name: MajorBodyName;

  mass: number;

  meanRadius: number;

  gravitationalParameter: number;
}

/* -------------------------------------------------------------------------- */
/* Mathematical helpers                                                       */
/* -------------------------------------------------------------------------- */

const DEG_TO_RAD =
  Math.PI / 180;

const DAY =
  86_400;

const YEAR =
  365.25 * DAY;

/**
 * Calculate gravitational parameter from mass.
 */
function gravitationalParameter(
  mass: number
): number {
  return (
    GRAVITATIONAL_CONSTANT *
    mass
  );
}

/**
 * Calculate surface gravity.
 */
function surfaceGravity(
  mass: number,
  radius: number
): number {
  return (
    GRAVITATIONAL_CONSTANT *
    mass /
    (radius * radius)
  );
}

/* -------------------------------------------------------------------------- */
/* Sun                                                                        */
/* -------------------------------------------------------------------------- */

export const SUN: MajorBodyConstants = {
  name: "sun",

  mass:
    SOLAR_MASS,

  meanRadius:
    SOLAR_RADIUS,

  gravitationalParameter:
    SOLAR_GRAVITATIONAL_PARAMETER
};

/* -------------------------------------------------------------------------- */
/* Mercury                                                                    */
/* -------------------------------------------------------------------------- */

export const MERCURY: PlanetaryConstants = {
  name: "mercury",

  mass:
    3.3011e23,

  meanRadius:
    2_439_700,

  equatorialRadius:
    2_439_700,

  polarRadius:
    2_439_700,

  gravitationalParameter:
    2.2032e13,

  surfaceGravity:
    3.70,

  rotationPeriod:
    58.646 * DAY,

  orbitalPeriod:
    87.969 * DAY,

  semiMajorAxis:
    0.38709893 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.205630,

  orbitalInclination:
    7.00487 * DEG_TO_RAD,

  axialTilt:
    0.034 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Venus                                                                      */
/* -------------------------------------------------------------------------- */

export const VENUS: PlanetaryConstants = {
  name: "venus",

  mass:
    4.8675e24,

  meanRadius:
    6_051_800,

  equatorialRadius:
    6_051_800,

  polarRadius:
    6_051_800,

  gravitationalParameter:
    3.24859e14,

  surfaceGravity:
    8.87,

  rotationPeriod:
    -243.025 * DAY,

  orbitalPeriod:
    224.701 * DAY,

  semiMajorAxis:
    0.72333199 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.006773,

  orbitalInclination:
    3.39471 * DEG_TO_RAD,

  axialTilt:
    177.36 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Earth                                                                      */
/* -------------------------------------------------------------------------- */

export const EARTH: PlanetaryConstants = {
  name: "earth",

  mass:
    EARTH_MASS,

  meanRadius:
    (EARTH_EQUATORIAL_RADIUS +
      EARTH_POLAR_RADIUS) / 2,

  equatorialRadius:
    EARTH_EQUATORIAL_RADIUS,

  polarRadius:
    EARTH_POLAR_RADIUS,

  gravitationalParameter:
    EARTH_GRAVITATIONAL_PARAMETER,

  surfaceGravity:
    9.80665,

  rotationPeriod:
    23.9344696 * 3600,

  orbitalPeriod:
    YEAR,

  semiMajorAxis:
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.0167086,

  orbitalInclination:
    0,

  axialTilt:
    23.4392911 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Moon                                                                       */
/* -------------------------------------------------------------------------- */

export const MOON: MajorBodyConstants = {
  name: "moon",

  mass:
    MOON_MASS,

  meanRadius:
    MOON_MEAN_RADIUS,

  gravitationalParameter:
    MOON_GRAVITATIONAL_PARAMETER
};

/* -------------------------------------------------------------------------- */
/* Mars                                                                       */
/* -------------------------------------------------------------------------- */

export const MARS: PlanetaryConstants = {
  name: "mars",

  mass:
    6.4171e23,

  meanRadius:
    3_389_500,

  equatorialRadius:
    3_396_200,

  polarRadius:
    3_376_200,

  gravitationalParameter:
    4.282837e13,

  surfaceGravity:
    3.72076,

  rotationPeriod:
    24.622962 * 3600,

  orbitalPeriod:
    686.980 * DAY,

  semiMajorAxis:
    1.52366231 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.093412,

  orbitalInclination:
    1.85061 * DEG_TO_RAD,

  axialTilt:
    25.19 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Jupiter                                                                    */
/* -------------------------------------------------------------------------- */

export const JUPITER: PlanetaryConstants = {
  name: "jupiter",

  mass:
    1.89813e27,

  meanRadius:
    69_911_000,

  equatorialRadius:
    71_492_000,

  polarRadius:
    66_854_000,

  gravitationalParameter:
    1.26686534e17,

  surfaceGravity:
    24.79,

  rotationPeriod:
    9.925 * 3600,

  orbitalPeriod:
    11.862 * YEAR,

  semiMajorAxis:
    5.20336301 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.04839266,

  orbitalInclination:
    1.30530 * DEG_TO_RAD,

  axialTilt:
    3.13 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Saturn                                                                     */
/* -------------------------------------------------------------------------- */

export const SATURN: PlanetaryConstants = {
  name: "saturn",

  mass:
    5.6834e26,

  meanRadius:
    58_232_000,

  equatorialRadius:
    60_268_000,

  polarRadius:
    54_364_000,

  gravitationalParameter:
    3.7931187e16,

  surfaceGravity:
    10.44,

  rotationPeriod:
    10.656 * 3600,

  orbitalPeriod:
    29.4571 * YEAR,

  semiMajorAxis:
    9.53707032 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.05415060,

  orbitalInclination:
    2.48446 * DEG_TO_RAD,

  axialTilt:
    26.73 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Uranus                                                                      */
/* -------------------------------------------------------------------------- */

export const URANUS: PlanetaryConstants = {
  name: "uranus",

  mass:
    8.6810e25,

  meanRadius:
    25_362_000,

  equatorialRadius:
    25_559_000,

  polarRadius:
    24_973_000,

  gravitationalParameter:
    5.793939e15,

  surfaceGravity:
    8.69,

  rotationPeriod:
    -17.24 * 3600,

  orbitalPeriod:
    84.0168 * YEAR,

  semiMajorAxis:
    19.19126393 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.04716771,

  orbitalInclination:
    0.76986 * DEG_TO_RAD,

  axialTilt:
    97.77 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Neptune                                                                     */
/* -------------------------------------------------------------------------- */

export const NEPTUNE: PlanetaryConstants = {
  name: "neptune",

  mass:
    1.02413e26,

  meanRadius:
    24_622_000,

  equatorialRadius:
    24_764_000,

  polarRadius:
    24_341_000,

  gravitationalParameter:
    6.836529e15,

  surfaceGravity:
    11.15,

  rotationPeriod:
    16.11 * 3600,

  orbitalPeriod:
    164.79132 * YEAR,

  semiMajorAxis:
    30.06896348 *
    ASTRONOMICAL_UNIT_METERS,

  orbitalEccentricity:
    0.00858587,

  orbitalInclination:
    1.76917 * DEG_TO_RAD,

  axialTilt:
    28.32 * DEG_TO_RAD
};

/* -------------------------------------------------------------------------- */
/* Planet registry                                                             */
/* -------------------------------------------------------------------------- */

export const PLANETS: Readonly<
  Record<PlanetName, PlanetaryConstants>
> = {
  mercury: MERCURY,
  venus: VENUS,
  earth: EARTH,
  mars: MARS,
  jupiter: JUPITER,
  saturn: SATURN,
  uranus: URANUS,
  neptune: NEPTUNE
};

/* -------------------------------------------------------------------------- */
/* Major body registry                                                         */
/* -------------------------------------------------------------------------- */

export const MAJOR_BODIES: Readonly<
  Record<MajorBodyName, MajorBodyConstants | PlanetaryConstants>
> = {
  sun: SUN,
  moon: MOON,
  mercury: MERCURY,
  venus: VENUS,
  earth: EARTH,
  mars: MARS,
  jupiter: JUPITER,
  saturn: SATURN,
  uranus: URANUS,
  neptune: NEPTUNE
};

/* -------------------------------------------------------------------------- */
/* Lookup helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Get a planet by its canonical name.
 */
export function getPlanet(
  name: PlanetName
): PlanetaryConstants {
  return PLANETS[name];
}

/**
 * Get any major Solar System body.
 */
export function getMajorBody(
  name: MajorBodyName
): MajorBodyConstants | PlanetaryConstants {
  return MAJOR_BODIES[name];
}

/**
 * Check whether a name is a planet.
 */
export function isPlanet(
  name: string
): name is PlanetName {
  return (
    name in PLANETS
  );
}

/**
 * Calculate the escape velocity from the surface
 * of a body.
 */
export function escapeVelocity(
  body:
    | PlanetaryConstants
    | MajorBodyConstants
): number {
  return Math.sqrt(
    2 *
    body.gravitationalParameter /
    (body.meanRadius)
  );
}

/**
 * Calculate the Schwarzschild radius.
 *
 * Useful for generic gravitational calculations.
 */
export function schwarzschildRadius(
  mass: number
): number {
  return (
    2 *
    GRAVITATIONAL_CONSTANT *
    mass /
    (SPEED_OF_LIGHT ** 2)
  );
}
