/**
 * Space
 * Astronomy — Moon Position
 *
 * Calculates the apparent geocentric position of the Moon.
 *
 * Coordinate conventions:
 * - Longitude: degrees, [0, 360)
 * - Latitude: degrees
 * - Right ascension: degrees, [0, 360)
 * - Declination: degrees
 * - Azimuth: degrees, [0, 360), clockwise from north
 * - Altitude: degrees above / below horizon
 */

import {
  calculateJulianDay
} from "../sun/solar-position";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MoonPositionInput {
  date:
    Date;

  latitude?:
    number;

  longitude?:
    number;
}

export interface MoonEclipticPosition {
  longitude:
    number;

  latitude:
    number;

  distanceKm:
    number;
}

export interface MoonEquatorialPosition {
  rightAscension:
    number;

  declination:
    number;
}

export interface MoonHorizontalPosition {
  azimuth:
    number;

  altitude:
    number;
}

export interface MoonPosition {
  julianDay:
    number;

  ecliptic:
    MoonEclipticPosition;

  equatorial:
    MoonEquatorialPosition;

  horizontal:
    MoonHorizontalPosition |
    null;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEG_TO_RAD =
  Math.PI / 180;

const RAD_TO_DEG =
  180 / Math.PI;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function calculateMoonPosition(
  input:
    MoonPositionInput
):
  MoonPosition {
  validateInput(
    input
  );

  const julianDay =
    calculateJulianDay(
      input.date
    );

  const ecliptic =
    calculateLunarEclipticPosition(
      julianDay
    );

  const equatorial =
    eclipticToEquatorial(
      ecliptic.longitude,
      ecliptic.latitude,
      julianDay
    );

  const horizontal =
    input.latitude !== undefined &&
    input.longitude !== undefined
      ? equatorialToHorizontal(
          equatorial.rightAscension,
          equatorial.declination,
          input.latitude,
          input.longitude,
          julianDay
        )
      : null;

  return {
    julianDay,

    ecliptic,

    equatorial,

    horizontal
  };
}

/**
 * Calculates the geocentric ecliptic position of the Moon.
 */
export function calculateMoonEclipticPosition(
  date:
    Date
):
  MoonEclipticPosition {
  const julianDay =
    calculateJulianDay(
      date
    );

  return calculateLunarEclipticPosition(
    julianDay
  );
}

/**
 * Calculates geocentric right ascension and declination.
 */
export function calculateMoonEquatorialPosition(
  date:
    Date
):
  MoonEquatorialPosition {
  const julianDay =
    calculateJulianDay(
      date
    );

  const ecliptic =
    calculateLunarEclipticPosition(
      julianDay
    );

  return eclipticToEquatorial(
    ecliptic.longitude,
    ecliptic.latitude,
    julianDay
  );
}

/* -------------------------------------------------------------------------- */
/* Lunar Ecliptic Position                                                    */
/* -------------------------------------------------------------------------- */

function calculateLunarEclipticPosition(
  julianDay:
    number
):
  MoonEclipticPosition {
  const days =
    julianDay -
    2_451_543.5;

  /*
   * Low-order orbital model.
   *
   * The dominant lunar orbital terms are retained here so the module
   * remains lightweight while still producing useful apparent positions
   * for visualization and general astronomical calculations.
   */

  const longitudeOfAscendingNode =
    normalizeDegrees(
      125.1228 -
      0.0529538083 *
        days
    );

  const inclination =
    5.1454;

  const argumentOfPerigee =
    normalizeDegrees(
      318.0634 +
      0.1643573223 *
        days
    );

  const semiMajorAxisKm =
    60.2666;

  const eccentricity =
    0.054900;

  const meanAnomaly =
    normalizeDegrees(
      115.3654 +
      13.0649929509 *
        days
    );

  const eccentricAnomaly =
    solveKeplerEquation(
      meanAnomaly *
        DEG_TO_RAD,
      eccentricity
    );

  const xOrbital =
    semiMajorAxisKm *
    (
      Math.cos(
        eccentricAnomaly
      ) -
      eccentricity
    );

  const yOrbital =
    semiMajorAxisKm *
    Math.sqrt(
      1 -
      eccentricity *
        eccentricity
    ) *
    Math.sin(
      eccentricAnomaly
    );

  const trueAnomaly =
    Math.atan2(
      yOrbital,
      xOrbital
    );

  const radiusEarthRadii =
    Math.sqrt(
      xOrbital *
        xOrbital +
      yOrbital *
        yOrbital
    );

  const argument =
    (
      trueAnomaly *
      RAD_TO_DEG
    ) +
    argumentOfPerigee;

  const n =
    longitudeOfAscendingNode *
    DEG_TO_RAD;

  const i =
    inclination *
    DEG_TO_RAD;

  const w =
    argument *
    DEG_TO_RAD;

  const x =
    radiusEarthRadii *
    (
      Math.cos(n) *
        Math.cos(w) -
      Math.sin(n) *
        Math.sin(w) *
        Math.cos(i)
    );

  const y =
    radiusEarthRadii *
    (
      Math.sin(n) *
        Math.cos(w) +
      Math.cos(n) *
        Math.sin(w) *
        Math.cos(i)
    );

  const z =
    radiusEarthRadii *
    Math.sin(w) *
    Math.sin(i);

  const longitude =
    normalizeDegrees(
      Math.atan2(
        y,
        x
      ) *
        RAD_TO_DEG
    );

  const latitude =
    Math.atan2(
      z,
      Math.sqrt(
        x * x +
        y * y
      )
    ) *
    RAD_TO_DEG;

  /*
   * Earth radii to kilometres.
   */
  const distanceKm =
    radiusEarthRadii *
    6_378.14;

  /*
   * Main periodic corrections improve the apparent lunar longitude
   * and latitude without requiring a complete high-order lunar theory.
   */
  const solarMeanLongitude =
    normalizeDegrees(
      280.460 +
      0.9856474 *
        days
    );

  const lunarMeanLongitude =
    normalizeDegrees(
      218.316 +
      13.176396 *
        days
    );

  const lunarMeanAnomaly =
    normalizeDegrees(
      134.963 +
      13.064993 *
        days
    );

  const solarMeanAnomaly =
    normalizeDegrees(
      357.529 +
      0.98560028 *
        days
    );

  const elongation =
    normalizeDegrees(
      lunarMeanLongitude -
      solarMeanLongitude
    );

  const longitudeCorrection =
    6.289 *
      Math.sin(
        lunarMeanAnomaly *
          DEG_TO_RAD
      ) +
    1.274 *
      Math.sin(
        (
          2 * elongation -
          lunarMeanAnomaly
        ) *
          DEG_TO_RAD
      ) +
    0.658 *
      Math.sin(
        2 *
          elongation *
          DEG_TO_RAD
      ) +
    0.214 *
      Math.sin(
        2 *
          lunarMeanAnomaly *
          DEG_TO_RAD
      ) -
    0.186 *
      Math.sin(
        solarMeanAnomaly *
          DEG_TO_RAD
      );

  const latitudeCorrection =
    5.128 *
      Math.sin(
        (
          longitudeOfAscendingNode
        ) *
          DEG_TO_RAD
      ) +
    0.280 *
      Math.sin(
        (
          lunarMeanAnomaly +
          argumentOfPerigee
        ) *
          DEG_TO_RAD
      ) +
    0.277 *
      Math.sin(
        (
          lunarMeanAnomaly -
          argumentOfPerigee
        ) *
          DEG_TO_RAD
      );

  return {
    longitude:
      normalizeDegrees(
        longitude +
        longitudeCorrection
      ),

    latitude:
      latitude +
      latitudeCorrection,

    distanceKm
  };
}

/* -------------------------------------------------------------------------- */
/* Ecliptic → Equatorial                                                     */
/* -------------------------------------------------------------------------- */

function eclipticToEquatorial(
  longitude:
    number,
  latitude:
    number,
  julianDay:
    number
):
  MoonEquatorialPosition {
  const t =
    (
      julianDay -
      2_451_545.0
    ) /
    36_525;

  const obliquity =
    (
      23.43929111 -
      0.013004167 *
        t
    ) *
    DEG_TO_RAD;

  const lambda =
    longitude *
    DEG_TO_RAD;

  const beta =
    latitude *
    DEG_TO_RAD;

  const rightAscension =
    normalizeDegrees(
      Math.atan2(
        Math.sin(lambda) *
          Math.cos(obliquity) -
          Math.tan(beta) *
            Math.sin(obliquity),
        Math.cos(lambda)
      ) *
        RAD_TO_DEG
    );

  const declination =
    Math.asin(
      Math.sin(beta) *
        Math.cos(obliquity) +
      Math.cos(beta) *
        Math.sin(obliquity) *
        Math.sin(lambda)
    ) *
    RAD_TO_DEG;

  return {
    rightAscension,

    declination
  };
}

/* -------------------------------------------------------------------------- */
/* Horizontal Coordinates                                                     */
/* -------------------------------------------------------------------------- */

function equatorialToHorizontal(
  rightAscension:
    number,
  declination:
    number,
  latitude:
    number,
  longitude:
    number,
  julianDay:
    number
):
  MoonHorizontalPosition {
  const localSiderealTime =
    calculateLocalSiderealTime(
      julianDay,
      longitude
    );

  const hourAngle =
    normalizeSignedDegrees(
      localSiderealTime -
      rightAscension
    );

  const h =
    hourAngle *
    DEG_TO_RAD;

  const phi =
    latitude *
    DEG_TO_RAD;

  const dec =
    declination *
    DEG_TO_RAD;

  const sinAltitude =
    Math.sin(phi) *
      Math.sin(dec) +
    Math.cos(phi) *
      Math.cos(dec) *
      Math.cos(h);

  const altitude =
    Math.asin(
      clamp(
        sinAltitude,
        -1,
        1
      )
    ) *
    RAD_TO_DEG;

  const azimuth =
    normalizeDegrees(
      Math.atan2(
        Math.sin(h),
        Math.cos(h) *
          Math.sin(phi) -
          Math.tan(dec) *
            Math.cos(phi)
      ) *
        RAD_TO_DEG +
        180
    );

  return {
    azimuth,
    altitude
  };
}

/* -------------------------------------------------------------------------- */
/* Sidereal Time                                                              */
/* -------------------------------------------------------------------------- */

function calculateLocalSiderealTime(
  julianDay:
    number,
  longitude:
    number
):
  number {
  const d =
    julianDay -
    2_451_545.0;

  const gmst =
    normalizeDegrees(
      280.46061837 +
      360.98564736629 *
        d +
      0.000387933 *
        Math.pow(
          d / 36_525,
          2
        ) -
      Math.pow(
        d / 36_525,
        3
      ) /
        38_710_000
    );

  return normalizeDegrees(
    gmst +
    longitude
  );
}

/* -------------------------------------------------------------------------- */
/* Kepler Equation                                                            */
/* -------------------------------------------------------------------------- */

function solveKeplerEquation(
  meanAnomaly:
    number,
  eccentricity:
    number
):
  number {
  let eccentricAnomaly =
    meanAnomaly;

  for (
    let i = 0;
    i < 12;
    i++
  ) {
    eccentricAnomaly -=
      (
        eccentricAnomaly -
        eccentricity *
          Math.sin(
            eccentricAnomaly
          ) -
        meanAnomaly
      ) /
      (
        1 -
        eccentricity *
          Math.cos(
            eccentricAnomaly
          )
      );
  }

  return eccentricAnomaly;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateInput(
  input:
    MoonPositionInput
):
  void {
  if (
    !(
      input.date instanceof
      Date
    ) ||
    Number.isNaN(
      input.date.getTime()
    )
  ) {
    throw new TypeError(
      "Moon position requires a valid Date."
    );
  }

  if (
    input.latitude !==
      undefined &&
    (
      input.latitude < -90 ||
      input.latitude > 90
    )
  ) {
    throw new RangeError(
      "Latitude must be between -90 and 90 degrees."
    );
  }

  if (
    input.longitude !==
      undefined &&
    (
      input.longitude < -180 ||
      input.longitude > 180
    )
  ) {
    throw new RangeError(
      "Longitude must be between -180 and 180 degrees."
    );
  }

  if (
    (
      input.latitude ===
      undefined
    ) !==
    (
      input.longitude ===
      undefined
    )
  ) {
    throw new Error(
      "Latitude and longitude must be provided together."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function normalizeDegrees(
  value:
    number
):
  number {
  return (
    (
      value %
      360
    ) +
    360
  ) %
  360;
}

function normalizeSignedDegrees(
  value:
    number
):
  number {
  let normalized =
    normalizeDegrees(
      value
    );

  if (
    normalized >
    180
  ) {
    normalized -=
      360;
  }

  return normalized;
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

export default calculateMoonPosition;
