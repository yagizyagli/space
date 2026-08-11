/**
 * Space
 * Astronomy — Solar Position
 *
 * Calculates the apparent position of the Sun for a given UTC date.
 *
 * Coordinate conventions:
 * - Longitude: degrees, [0, 360)
 * - Latitude / declination: degrees
 * - Right ascension: degrees, [0, 360)
 * - Azimuth: degrees, [0, 360), measured clockwise from north
 * - Altitude: degrees above / below the horizon
 *
 * The implementation uses a compact solar-position model suitable for
 * visualization, sky maps, event calculations and general-purpose
 * astronomical applications.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SolarPositionInput {
  date:
    Date;

  latitude:
    number;

  longitude:
    number;
}

export interface SolarEquatorialPosition {
  rightAscension:
    number;

  declination:
    number;
}

export interface SolarHorizontalPosition {
  azimuth:
    number;

  altitude:
    number;
}

export interface SolarPosition {
  julianDay:
    number;

  eclipticLongitude:
    number;

  equatorial:
    SolarEquatorialPosition;

  horizontal:
    SolarHorizontalPosition;

  distanceAU:
    number;

  distanceKm:
    number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEG_TO_RAD =
  Math.PI / 180;

const RAD_TO_DEG =
  180 / Math.PI;

const AU_KM =
  149_597_870.7;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function calculateSolarPosition(
  input:
    SolarPositionInput
):
  SolarPosition {
  validateInput(
    input
  );

  const jd =
    calculateJulianDay(
      input.date
    );

  const solar =
    calculateSolarCoordinates(
      jd
    );

  const horizontal =
    equatorialToHorizontal(
      solar.rightAscension,
      solar.declination,
      input.latitude,
      input.longitude,
      jd
    );

  return {
    julianDay:
      jd,

    eclipticLongitude:
      solar.eclipticLongitude,

    equatorial: {
      rightAscension:
        solar.rightAscension,

      declination:
        solar.declination
    },

    horizontal,

    distanceAU:
      solar.distanceAU,

    distanceKm:
      solar.distanceAU *
      AU_KM
  };
}

/**
 * Calculates only the apparent solar equatorial coordinates.
 */
export function calculateSolarEquatorialPosition(
  date:
    Date
):
  SolarEquatorialPosition {
  const jd =
    calculateJulianDay(
      date
    );

  const solar =
    calculateSolarCoordinates(
      jd
    );

  return {
    rightAscension:
      solar.rightAscension,

    declination:
      solar.declination
  };
}

/**
 * Calculates solar altitude for an observer.
 */
export function calculateSolarAltitude(
  date:
    Date,
  latitude:
    number,
  longitude:
    number
):
  number {
  return calculateSolarPosition({
    date,
    latitude,
    longitude
  }).horizontal.altitude;
}

/**
 * Calculates solar azimuth for an observer.
 */
export function calculateSolarAzimuth(
  date:
    Date,
  latitude:
    number,
  longitude:
    number
):
  number {
  return calculateSolarPosition({
    date,
    latitude,
    longitude
  }).horizontal.azimuth;
}

/* -------------------------------------------------------------------------- */
/* Julian Day                                                                 */
/* -------------------------------------------------------------------------- */

export function calculateJulianDay(
  date:
    Date
):
  number {
  const time =
    date.getTime();

  return (
    time / 86_400_000
  ) +
    2_440_587.5;
}

/* -------------------------------------------------------------------------- */
/* Solar Coordinates                                                          */
/* -------------------------------------------------------------------------- */

interface SolarCoordinates {
  eclipticLongitude:
    number;

  rightAscension:
    number;

  declination:
    number;

  distanceAU:
    number;
}

function calculateSolarCoordinates(
  julianDay:
    number
):
  SolarCoordinates {
  const t =
    (
      julianDay -
      2_451_545.0
    ) /
    36_525;

  const meanLongitude =
    normalizeDegrees(
      280.46646 +
      36_000.76983 * t +
      0.0003032 * t * t
    );

  const meanAnomaly =
    normalizeDegrees(
      357.52911 +
      35_999.05029 * t -
      0.0001537 * t * t
    );

  const m =
    meanAnomaly *
    DEG_TO_RAD;

  const equationOfCenter =
    (
      1.914602 -
      0.004817 * t -
      0.000014 * t * t
    ) *
      Math.sin(m) +
    (
      0.019993 -
      0.000101 * t
    ) *
      Math.sin(2 * m) +
    0.000289 *
      Math.sin(3 * m);

  const trueLongitude =
    meanLongitude +
    equationOfCenter;

  const omega =
    (
      125.04 -
      1934.136 * t
    ) *
    DEG_TO_RAD;

  const apparentLongitude =
    trueLongitude -
    0.00569 -
    0.00478 *
      Math.sin(omega);

  const obliquity =
    calculateObliquity(
      t
    );

  const lambda =
    apparentLongitude *
    DEG_TO_RAD;

  const epsilon =
    obliquity *
    DEG_TO_RAD;

  const rightAscension =
    normalizeDegrees(
      Math.atan2(
        Math.cos(epsilon) *
          Math.sin(lambda),
        Math.cos(lambda)
      ) *
        RAD_TO_DEG
    );

  const declination =
    Math.asin(
      Math.sin(epsilon) *
        Math.sin(lambda)
    ) *
    RAD_TO_DEG;

  const eccentricity =
    0.016708634 -
    0.000042037 * t -
    0.0000001267 *
      t *
      t;

  const distanceAU =
    (
      1 -
      eccentricity *
        eccentricity
    ) /
    (
      1 +
      eccentricity *
        Math.cos(
          (
            meanAnomaly +
            equationOfCenter
          ) *
            DEG_TO_RAD
        )
    );

  return {
    eclipticLongitude:
      normalizeDegrees(
        apparentLongitude
      ),

    rightAscension,

    declination,

    distanceAU
  };
}

/* -------------------------------------------------------------------------- */
/* Obliquity                                                                  */
/* -------------------------------------------------------------------------- */

function calculateObliquity(
  centuries:
    number
):
  number {
  const seconds =
    21.448 -
    46.8150 * centuries -
    0.00059 *
      centuries *
      centuries +
    0.001813 *
      centuries *
      centuries *
      centuries;

  return (
    23 +
    26 / 60 +
    seconds /
      3600
  );
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
  SolarHorizontalPosition {
  const lst =
    calculateLocalSiderealTime(
      julianDay,
      longitude
    );

  const hourAngle =
    normalizeDegrees(
      lst -
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
      360.98564736629 * d +
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
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateInput(
  input:
    SolarPositionInput
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
      "Solar position requires a valid Date."
    );
  }

  if (
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    throw new RangeError(
      "Latitude must be between -90 and 90 degrees."
    );
  }

  if (
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    throw new RangeError(
      "Longitude must be between -180 and 180 degrees."
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

export default calculateSolarPosition;
