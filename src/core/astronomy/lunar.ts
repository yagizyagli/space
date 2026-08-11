/**
 * Space
 * Lunar Astronomy
 *
 * Approximate geocentric lunar position and illumination utilities.
 *
 * Coordinate conventions:
 * - Angles are radians unless explicitly stated otherwise.
 * - Distances are kilometers unless explicitly stated otherwise.
 * - Julian Date is used as the time argument.
 *
 * Intended for:
 * - Interactive sky maps
 * - Moon phase rendering
 * - Lunar tracking
 * - Rise/set calculations
 * - Terminator visualization
 * - Earth-Moon system visualization
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const EARTH_RADIUS_KM =
  6_378.137;

export const MOON_RADIUS_KM =
  1_737.4;

export const MOON_MEAN_DISTANCE_KM =
  384_400;

export const SYNODIC_MONTH_DAYS =
  29.530588853;

export const SIDEREAL_MONTH_DAYS =
  27.321661;

export const JULIAN_J2000 =
  2_451_545.0;

const TWO_PI =
  Math.PI * 2;

const DEG_TO_RAD =
  Math.PI / 180;

const RAD_TO_DEG =
  180 / Math.PI;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface LunarEclipticCoordinates {
  longitude: number;
  latitude: number;
  distance: number;
}

export interface LunarEquatorialCoordinates {
  rightAscension: number;
  declination: number;
  distance: number;
}

export interface LunarPosition {
  julianDate: number;

  eclipticLongitude: number;
  eclipticLatitude: number;

  rightAscension: number;
  declination: number;

  distanceKm: number;

  angularRadius: number;
  angularDiameter: number;

  elongation: number;

  phaseAngle: number;
  illumination: number;

  age: number;

  phase: LunarPhase;
}

export type LunarPhase =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "third-quarter"
  | "waning-crescent";

/* -------------------------------------------------------------------------- */
/* Utilities                                                                   */
/* -------------------------------------------------------------------------- */

function normalizeRadians(
  angle: number
): number {
  const result =
    angle % TWO_PI;

  return result < 0
    ? result + TWO_PI
    : result;
}

function normalizeDegrees(
  angle: number
): number {
  const result =
    angle % 360;

  return result < 0
    ? result + 360
    : result;
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function solarJulianCenturies(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_J2000
  ) / 36_525;
}

/* -------------------------------------------------------------------------- */
/* Lunar orbital arguments                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Mean longitude of the Moon.
 */
export function lunarMeanLongitude(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    218.3164477 +
    481267.88123421 * T -
    0.0015786 * T * T +
    T * T * T / 538841 -
    T * T * T * T / 65194000;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Mean elongation of the Moon from the Sun.
 */
export function lunarMeanElongation(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    T * T * T / 545868 -
    T * T * T * T / 113065000;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Mean anomaly of the Moon.
 */
export function lunarMeanAnomaly(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    T * T * T / 69699 -
    T * T * T * T / 14712000;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Mean anomaly of the Sun.
 */
export function lunarSolarMeanAnomaly(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    357.5291092 +
    35999.0502909 * T -
    0.0001536 * T * T +
    T * T * T / 24490000;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Mean argument of lunar latitude.
 */
export function lunarLatitudeArgument(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    93.2720950 +
    483202.0175233 * T -
    0.0036539 * T * T -
    T * T * T / 3526000 +
    T * T * T * T / 863310000;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Longitude of the ascending lunar node.
 */
export function lunarAscendingNode(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    125.0445550 -
    1934.1361849 * T +
    0.0020762 * T * T +
    T * T * T / 467410 -
    T * T * T * T / 60616000;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/* -------------------------------------------------------------------------- */
/* Lunar longitude                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Approximate geocentric ecliptic longitude of the Moon.
 *
 * Uses the dominant periodic terms.
 */
export function lunarEclipticLongitude(
  julianDate: number
): number {
  const L =
    lunarMeanLongitude(
      julianDate
    );

  const D =
    lunarMeanElongation(
      julianDate
    );

  const M =
    lunarSolarMeanAnomaly(
      julianDate
    );

  const Mp =
    lunarMeanAnomaly(
      julianDate
    );

  const F =
    lunarLatitudeArgument(
      julianDate
    );

  const longitudeCorrection =
    6.289 *
      Math.sin(Mp) +

    1.274 *
      Math.sin(
        2 * D - Mp
      ) +

    0.658 *
      Math.sin(
        2 * D
      ) +

    0.214 *
      Math.sin(
        2 * Mp
      ) -

    0.186 *
      Math.sin(M) -

    0.059 *
      Math.sin(
        2 * D - 2 * Mp
      ) -

    0.057 *
      Math.sin(
        2 * D - M - Mp
      ) +

    0.053 *
      Math.sin(
        2 * D + Mp
      ) +

    0.046 *
      Math.sin(
        2 * D - M
      ) +

    0.041 *
      Math.sin(
        M - Mp
      ) -

    0.035 *
      Math.sin(D) -

    0.031 *
      Math.sin(
        M + Mp
      ) -

    0.015 *
      Math.sin(
        2 * F - 2 * D
      ) +

    0.011 *
      Math.sin(
        Mp - 4 * D
      );

  void F;

  return normalizeRadians(
    L +
    longitudeCorrection *
    DEG_TO_RAD
  );
}

/* -------------------------------------------------------------------------- */
/* Lunar latitude                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Approximate geocentric ecliptic latitude of the Moon.
 */
export function lunarEclipticLatitude(
  julianDate: number
): number {
  const D =
    lunarMeanElongation(
      julianDate
    );

  const M =
    lunarSolarMeanAnomaly(
      julianDate
    );

  const Mp =
    lunarMeanAnomaly(
      julianDate
    );

  const F =
    lunarLatitudeArgument(
      julianDate
    );

  const latitude =
    5.128 *
      Math.sin(F) +

    0.280 *
      Math.sin(
        Mp + F
      ) +

    0.277 *
      Math.sin(
        Mp - F
      ) +

    0.173 *
      Math.sin(
        2 * D - F
      ) +

    0.055 *
      Math.sin(
        2 * D - Mp + F
      ) +

    0.046 *
      Math.sin(
        2 * D - Mp - F
      ) +

    0.033 *
      Math.sin(
        2 * D + F
      ) +

    0.017 *
      Math.sin(
        2 * Mp + F
      ) +

    0.009 *
      Math.sin(
        2 * D + Mp - F
      ) +

    0.009 *
      Math.sin(
        2 * D - Mp - F
      ) +

    0.008 *
      Math.sin(
        2 * D + Mp + F
      );

  return latitude *
    DEG_TO_RAD;
}

/* -------------------------------------------------------------------------- */
/* Lunar distance                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Approximate geocentric lunar distance in kilometers.
 */
export function lunarDistanceKm(
  julianDate: number
): number {
  const D =
    lunarMeanElongation(
      julianDate
    );

  const M =
    lunarSolarMeanAnomaly(
      julianDate
    );

  const Mp =
    lunarMeanAnomaly(
      julianDate
    );

  const distance =
    385000.56 -

    20905.355 *
      Math.cos(Mp) -

    3699.111 *
      Math.cos(
        2 * D - Mp
      ) -

    2955.968 *
      Math.cos(
        2 * D
      ) -

    569.925 *
      Math.cos(
        2 * Mp
      ) +

    246.158 *
      Math.cos(
        2 * D - 2 * Mp
      ) -

    205.436 *
      Math.cos(
        2 * D - M - Mp
      ) -

    170.733 *
      Math.cos(
        2 * D + Mp
      ) -

    152.137 *
      Math.cos(
        2 * D - M
      ) -

    129.620 *
      Math.cos(
        M - Mp
      ) +

    108.743 *
      Math.cos(
        D
      );

  return distance;
}

/* -------------------------------------------------------------------------- */
/* Ecliptic coordinates                                                        */
/* -------------------------------------------------------------------------- */

export function lunarEclipticCoordinates(
  julianDate: number
): LunarEclipticCoordinates {
  return {
    longitude:
      lunarEclipticLongitude(
        julianDate
      ),

    latitude:
      lunarEclipticLatitude(
        julianDate
      ),

    distance:
      lunarDistanceKm(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Obliquity                                                                  */
/* -------------------------------------------------------------------------- */

function meanObliquity(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const seconds =
    21.448 -
    T *
    (
      46.815 +
      T *
      (
        0.00059 -
        T * 0.001813
      )
    );

  return (
    (
      23 +
      26 / 60 +
      seconds / 3600
    ) *
    DEG_TO_RAD
  );
}

/* -------------------------------------------------------------------------- */
/* Equatorial coordinates                                                      */
/* -------------------------------------------------------------------------- */

export function lunarEquatorialCoordinates(
  julianDate: number
): LunarEquatorialCoordinates {
  const ecliptic =
    lunarEclipticCoordinates(
      julianDate
    );

  const epsilon =
    meanObliquity(
      julianDate
    );

  const sinLongitude =
    Math.sin(
      ecliptic.longitude
    );

  const cosLongitude =
    Math.cos(
      ecliptic.longitude
    );

  const sinLatitude =
    Math.sin(
      ecliptic.latitude
    );

  const cosLatitude =
    Math.cos(
      ecliptic.latitude
    );

  const rightAscension =
    Math.atan2(
      sinLongitude *
        cosLatitude *
        Math.cos(epsilon) -
        sinLatitude *
        Math.sin(epsilon),
      cosLongitude *
        cosLatitude
    );

  const declination =
    Math.asin(
      sinLatitude *
        Math.cos(epsilon) +
      cosLatitude *
        Math.sin(epsilon) *
        sinLongitude
    );

  return {
    rightAscension:
      normalizeRadians(
        rightAscension
      ),

    declination,

    distance:
      ecliptic.distance
  };
}

/* -------------------------------------------------------------------------- */
/* Phase                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Calculate lunar age in days.
 *
 * 0 = new moon
 * ~14.765 = full moon
 */
export function lunarAge(
  julianDate: number
): number {
  const referenceNewMoon =
    2_451_550.1;

  const age =
    (
      julianDate -
      referenceNewMoon
    ) %
    SYNODIC_MONTH_DAYS;

  return age < 0
    ? age +
      SYNODIC_MONTH_DAYS
    : age;
}

/**
 * Lunar phase angle.
 *
 * 0 = full moon
 * π = new moon
 */
export function lunarPhaseAngle(
  julianDate: number
): number {
  const age =
    lunarAge(
      julianDate
    );

  return normalizeRadians(
    TWO_PI *
    (
      age /
      SYNODIC_MONTH_DAYS
    )
  );
}

/**
 * Illumination fraction.
 *
 * 0 = completely dark
 * 1 = fully illuminated
 */
export function lunarIllumination(
  julianDate: number
): number {
  const phase =
    lunarPhaseAngle(
      julianDate
    );

  return (
    1 -
    Math.cos(phase)
  ) / 2;
}

/**
 * Illuminated percentage [0, 100].
 */
export function lunarIlluminationPercent(
  julianDate: number
): number {
  return (
    lunarIllumination(
      julianDate
    ) * 100
  );
}

/* -------------------------------------------------------------------------- */
/* Phase name                                                                  */
/* -------------------------------------------------------------------------- */

export function lunarPhase(
  julianDate: number
): LunarPhase {
  const age =
    lunarAge(
      julianDate
    );

  const fraction =
    age /
    SYNODIC_MONTH_DAYS;

  if (
    fraction < 0.0625 ||
    fraction >= 0.9375
  ) {
    return "new";
  }

  if (
    fraction < 0.1875
  ) {
    return "waxing-crescent";
  }

  if (
    fraction < 0.3125
  ) {
    return "first-quarter";
  }

  if (
    fraction < 0.4375
  ) {
    return "waxing-gibbous";
  }

  if (
    fraction < 0.5625
  ) {
    return "full";
  }

  if (
    fraction < 0.6875
  ) {
    return "waning-gibbous";
  }

  if (
    fraction < 0.8125
  ) {
    return "third-quarter";
  }

  return "waning-crescent";
}

/* -------------------------------------------------------------------------- */
/* Elongation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Angular separation between the Moon and Sun.
 *
 * Requires the solar ecliptic longitude.
 */
export function lunarElongation(
  julianDate: number,
  solarLongitude: number
): number {
  return normalizeRadians(
    lunarEclipticLongitude(
      julianDate
    ) -
    solarLongitude
  );
}

/**
 * Absolute angular separation from the Sun.
 */
export function lunarSolarSeparation(
  julianDate: number,
  solarLongitude: number
): number {
  const elongation =
    lunarElongation(
      julianDate,
      solarLongitude
    );

  return Math.min(
    elongation,
    TWO_PI - elongation
  );
}

/* -------------------------------------------------------------------------- */
/* Angular size                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Apparent angular radius of the Moon.
 */
export function lunarAngularRadius(
  julianDate: number
): number {
  return Math.asin(
    MOON_RADIUS_KM /
    lunarDistanceKm(
      julianDate
    )
  );
}

/**
 * Apparent angular diameter of the Moon.
 */
export function lunarAngularDiameter(
  julianDate: number
): number {
  return (
    lunarAngularRadius(
      julianDate
    ) * 2
  );
}

/**
 * Apparent angular diameter in degrees.
 */
export function lunarAngularDiameterDegrees(
  julianDate: number
): number {
  return (
    lunarAngularDiameter(
      julianDate
    ) *
    RAD_TO_DEG
  );
}

/* -------------------------------------------------------------------------- */
/* Terminator                                                                  */
/* -------------------------------------------------------------------------- */

export interface LunarTerminator {
  phaseAngle: number;
  illumination: number;
  terminatorAngle: number;
}

/**
 * Approximate lunar terminator angle.
 *
 * This is useful for rendering a 2D moon phase.
 */
export function lunarTerminator(
  julianDate: number
): LunarTerminator {
  const phaseAngle =
    lunarPhaseAngle(
      julianDate
    );

  const illumination =
    lunarIllumination(
      julianDate
    );

  const terminatorAngle =
    Math.acos(
      clamp(
        1 -
          2 * illumination,
        -1,
        1
      )
    );

  return {
    phaseAngle,

    illumination,

    terminatorAngle
  };
}

/* -------------------------------------------------------------------------- */
/* Complete position                                                           */
/* -------------------------------------------------------------------------- */

export function lunarPosition(
  julianDate: number,
  solarLongitude = 0
): LunarPosition {
  const ecliptic =
    lunarEclipticCoordinates(
      julianDate
    );

  const equatorial =
    lunarEquatorialCoordinates(
      julianDate
    );

  const age =
    lunarAge(
      julianDate
    );

  const phaseAngle =
    lunarPhaseAngle(
      julianDate
    );

  const illumination =
    lunarIllumination(
      julianDate
    );

  const elongation =
    lunarSolarSeparation(
      julianDate,
      solarLongitude
    );

  return {
    julianDate,

    eclipticLongitude:
      ecliptic.longitude,

    eclipticLatitude:
      ecliptic.latitude,

    rightAscension:
      equatorial.rightAscension,

    declination:
      equatorial.declination,

    distanceKm:
      ecliptic.distance,

    angularRadius:
      lunarAngularRadius(
        julianDate
      ),

    angularDiameter:
      lunarAngularDiameter(
        julianDate
      ),

    elongation,

    phaseAngle,

    illumination,

    age,

    phase:
      lunarPhase(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Convenience utilities                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Convert lunar distance to Earth radii.
 */
export function lunarDistanceEarthRadii(
  julianDate: number
): number {
  return (
    lunarDistanceKm(
      julianDate
    ) /
    EARTH_RADIUS_KM
  );
}

/**
 * Determine whether the Moon is waxing.
 */
export function isMoonWaxing(
  julianDate: number
): boolean {
  const phase =
    lunarPhase(
      julianDate
    );

  return (
    phase ===
      "waxing-crescent" ||
    phase ===
      "first-quarter" ||
    phase ===
      "waxing-gibbous"
  );
}

/**
 * Determine whether the Moon is waning.
 */
export function isMoonWaning(
  julianDate: number
): boolean {
  const phase =
    lunarPhase(
      julianDate
    );

  return (
    phase ===
      "waning-gibbous" ||
    phase ===
      "third-quarter" ||
    phase ===
      "waning-crescent"
  );
}

/**
 * Convert radians to degrees.
 */
export function radiansToDegrees(
  radians: number
): number {
  return (
    radians *
    RAD_TO_DEG
  );
}

/**
 * Convert degrees to radians.
 */
export function degreesToRadians(
  degrees: number
): number {
  return (
    degrees *
    DEG_TO_RAD
  );
}
