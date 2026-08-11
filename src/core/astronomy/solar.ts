/**
 * Space
 * Solar Astronomy
 *
 * Solar position and apparent geometry utilities.
 *
 * Coordinate conventions:
 * - Angles are radians unless explicitly stated otherwise.
 * - Distances are astronomical units (AU) unless explicitly stated otherwise.
 * - Julian Date is UTC-like unless the caller provides a different timescale.
 *
 * This module provides compact analytical solar calculations suitable for:
 * - Interactive sky maps
 * - Solar-system visualization
 * - Day/night rendering
 * - Sun tracking
 * - Rise/set calculations
 * - Ephemeris approximations
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const ASTRONOMICAL_UNIT_KM =
  149_597_870.7;

export const SOLAR_RADIUS_KM =
  695_700;

export const SOLAR_RADIUS_AU =
  SOLAR_RADIUS_KM /
  ASTRONOMICAL_UNIT_KM;

export const SOLAR_LIGHT_TIME_SECONDS =
  499.0047838;

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

export interface SolarEclipticCoordinates {
  longitude: number;
  latitude: number;
  distance: number;
}

export interface SolarEquatorialCoordinates {
  rightAscension: number;
  declination: number;
  distance: number;
}

export interface SolarHorizontalCoordinates {
  altitude: number;
  azimuth: number;
  distance: number;
}

export interface SolarPosition {
  julianDate: number;

  eclipticLongitude: number;
  eclipticLatitude: number;

  rightAscension: number;
  declination: number;

  distanceAU: number;
  distanceKm: number;

  apparentLongitude: number;

  angularRadius: number;

  meanAnomaly: number;

  equationOfCenter: number;

  obliquity: number;
}

/* -------------------------------------------------------------------------- */
/* Normalization                                                               */
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

/* -------------------------------------------------------------------------- */
/* Julian centuries                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Julian centuries since J2000.0.
 */
export function solarJulianCenturies(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_J2000
  ) / 36_525;
}

/* -------------------------------------------------------------------------- */
/* Mean solar orbital elements                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mean geometric longitude of the Sun.
 */
export function solarMeanLongitude(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    280.46646 +
    36_000.76983 * T +
    0.0003032 * T * T;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Mean anomaly of Earth's orbit.
 */
export function solarMeanAnomaly(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const degrees =
    357.52911 +
    35_999.05029 * T -
    0.0001537 * T * T;

  return normalizeRadians(
    degrees * DEG_TO_RAD
  );
}

/**
 * Approximate orbital eccentricity of Earth.
 */
export function earthOrbitalEccentricity(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  return (
    0.016708634 -
    0.000042037 * T -
    0.0000001267 * T * T
  );
}

/* -------------------------------------------------------------------------- */
/* Equation of center                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Solar equation of center.
 */
export function solarEquationOfCenter(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const M =
    solarMeanAnomaly(
      julianDate
    );

  const C =
    (
      1.914602 -
      0.004817 * T -
      0.000014 * T * T
    ) *
    Math.sin(M) +

    (
      0.019993 -
      0.000101 * T
    ) *
    Math.sin(2 * M) +

    0.000289 *
    Math.sin(3 * M);

  return C * DEG_TO_RAD;
}

/**
 * True geometric solar longitude.
 */
export function solarTrueLongitude(
  julianDate: number
): number {
  return normalizeRadians(
    solarMeanLongitude(
      julianDate
    ) +
    solarEquationOfCenter(
      julianDate
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Approximate Earth-Sun distance in AU.
 */
export function solarDistanceAU(
  julianDate: number
): number {
  const M =
    solarMeanAnomaly(
      julianDate
    );

  const eccentricity =
    earthOrbitalEccentricity(
      julianDate
    );

  const trueAnomaly =
    M +
    solarEquationOfCenter(
      julianDate
    );

  return (
    1 -
    eccentricity * eccentricity
  ) /
  (
    1 +
    eccentricity *
    Math.cos(trueAnomaly)
  );
}

/**
 * Earth-Sun distance in kilometers.
 */
export function solarDistanceKm(
  julianDate: number
): number {
  return (
    solarDistanceAU(
      julianDate
    ) *
    ASTRONOMICAL_UNIT_KM
  );
}

/**
 * Earth-Sun distance in meters.
 */
export function solarDistanceMeters(
  julianDate: number
): number {
  return (
    solarDistanceKm(
      julianDate
    ) * 1_000
  );
}

/* -------------------------------------------------------------------------- */
/* Ecliptic coordinates                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Geometric ecliptic coordinates of the Sun.
 *
 * The Sun's geocentric ecliptic latitude is approximately zero.
 */
export function solarEclipticCoordinates(
  julianDate: number
): SolarEclipticCoordinates {
  return {
    longitude:
      solarTrueLongitude(
        julianDate
      ),

    latitude: 0,

    distance:
      solarDistanceAU(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Obliquity                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Mean obliquity of the ecliptic.
 */
export function meanObliquity(
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

  const degrees =
    23 +
    26 / 60 +
    seconds / 3600;

  return degrees *
    DEG_TO_RAD;
}

/**
 * Approximate true obliquity.
 */
export function trueObliquity(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const omega =
    (
      125.04 -
      1934.136 * T
    ) *
    DEG_TO_RAD;

  return (
    meanObliquity(
      julianDate
    ) -
    0.00256 *
    DEG_TO_RAD *
    Math.cos(omega)
  );
}

/* -------------------------------------------------------------------------- */
/* Apparent longitude                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Apparent solar longitude including
 * a compact nutation/aberration correction.
 */
export function solarApparentLongitude(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const omega =
    (
      125.04 -
      1934.136 * T
    ) *
    DEG_TO_RAD;

  const trueLongitude =
    solarTrueLongitude(
      julianDate
    );

  return normalizeRadians(
    trueLongitude -
    0.00569 * DEG_TO_RAD -
    0.00478 * DEG_TO_RAD *
    Math.sin(omega)
  );
}

/* -------------------------------------------------------------------------- */
/* Equatorial coordinates                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Convert solar ecliptic longitude to
 * equatorial coordinates.
 */
export function solarEquatorialCoordinates(
  julianDate: number
): SolarEquatorialCoordinates {
  const longitude =
    solarApparentLongitude(
      julianDate
    );

  const obliquity =
    trueObliquity(
      julianDate
    );

  const rightAscension =
    Math.atan2(
      Math.cos(obliquity) *
        Math.sin(longitude),
      Math.cos(longitude)
    );

  const declination =
    Math.asin(
      Math.sin(obliquity) *
      Math.sin(longitude)
    );

  return {
    rightAscension:
      normalizeRadians(
        rightAscension
      ),

    declination,

    distance:
      solarDistanceAU(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Equatorial → horizontal                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Convert solar equatorial coordinates
 * to local horizontal coordinates.
 *
 * @param latitude Observer latitude in radians.
 * @param longitude Observer longitude in radians.
 * @param siderealTime Local apparent sidereal time in radians.
 */
export function solarHorizontalCoordinates(
  julianDate: number,
  latitude: number,
  longitude: number,
  siderealTime: number
): SolarHorizontalCoordinates {
  const equatorial =
    solarEquatorialCoordinates(
      julianDate
    );

  const hourAngle =
    normalizeRadians(
      siderealTime -
      equatorial.rightAscension
    );

  const sinAltitude =
    Math.sin(latitude) *
      Math.sin(
        equatorial.declination
      ) +

    Math.cos(latitude) *
      Math.cos(
        equatorial.declination
      ) *
      Math.cos(hourAngle);

  const altitude =
    Math.asin(
      clamp(
        sinAltitude,
        -1,
        1
      )
    );

  const azimuth =
    Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) *
        Math.sin(latitude) -
        Math.tan(
          equatorial.declination
        ) *
        Math.cos(latitude)
    );

  return {
    altitude,

    azimuth:
      normalizeRadians(
        azimuth + Math.PI
      ),

    distance:
      equatorial.distance
  };
}

/* -------------------------------------------------------------------------- */
/* Angular radius                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Apparent angular radius of the Sun.
 */
export function solarAngularRadius(
  julianDate: number
): number {
  return Math.asin(
    SOLAR_RADIUS_AU /
    solarDistanceAU(
      julianDate
    )
  );
}

/**
 * Apparent angular diameter of the Sun.
 */
export function solarAngularDiameter(
  julianDate: number
): number {
  return (
    solarAngularRadius(
      julianDate
    ) * 2
  );
}

/**
 * Solar angular diameter in degrees.
 */
export function solarAngularDiameterDegrees(
  julianDate: number
): number {
  return (
    solarAngularDiameter(
      julianDate
    ) *
    RAD_TO_DEG
  );
}

/* -------------------------------------------------------------------------- */
/* Light travel time                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Approximate light travel time from Sun to Earth.
 */
export function solarLightTravelTimeSeconds(
  julianDate: number
): number {
  return (
    solarDistanceAU(
      julianDate
    ) *
    SOLAR_LIGHT_TIME_SECONDS
  );
}

/**
 * Solar distance expressed as light-minutes.
 */
export function solarDistanceLightMinutes(
  julianDate: number
): number {
  return (
    solarLightTravelTimeSeconds(
      julianDate
    ) / 60
  );
}

/* -------------------------------------------------------------------------- */
/* Solar position                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Calculate a complete approximate solar position.
 */
export function solarPosition(
  julianDate: number
): SolarPosition {
  const meanAnomaly =
    solarMeanAnomaly(
      julianDate
    );

  const equationOfCenter =
    solarEquationOfCenter(
      julianDate
    );

  const ecliptic =
    solarEclipticCoordinates(
      julianDate
    );

  const equatorial =
    solarEquatorialCoordinates(
      julianDate
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

    distanceAU:
      ecliptic.distance,

    distanceKm:
      solarDistanceKm(
        julianDate
      ),

    apparentLongitude:
      solarApparentLongitude(
        julianDate
      ),

    angularRadius:
      solarAngularRadius(
        julianDate
      ),

    meanAnomaly,

    equationOfCenter,

    obliquity:
      trueObliquity(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Solar noon / transit                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Approximate solar transit time as a fraction of a day.
 *
 * Returns UTC hour.
 *
 * @param longitude East-positive longitude in radians.
 * @param equationOfTime Equation of time in minutes.
 */
export function approximateSolarNoonUTC(
  longitude: number,
  equationOfTimeMinutes: number
): number {
  const longitudeDegrees =
    longitude *
    RAD_TO_DEG;

  return (
    12 -
    longitudeDegrees / 15 -
    equationOfTimeMinutes / 60
  );
}

/* -------------------------------------------------------------------------- */
/* Equation of time                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Approximate equation of time in minutes.
 */
export function equationOfTime(
  julianDate: number
): number {
  const T =
    solarJulianCenturies(
      julianDate
    );

  const epsilon =
    trueObliquity(
      julianDate
    );

  const L0 =
    solarMeanLongitude(
      julianDate
    );

  const M =
    solarMeanAnomaly(
      julianDate
    );

  const e =
    earthOrbitalEccentricity(
      julianDate
    );

  const y =
    Math.tan(
      epsilon / 2
    );

  const y2 =
    y * y;

  const E =
    y2 *
      Math.sin(2 * L0) -

    2 * e *
      Math.sin(M) +

    4 * e *
      y2 *
      Math.sin(M) *
      Math.cos(2 * L0) -

    0.5 *
      y2 *
      y2 *
      Math.sin(4 * L0) -

    1.25 *
      e *
      e *
      Math.sin(2 * M);

  void T;

  return (
    E *
    RAD_TO_DEG *
    4
  );
}

/* -------------------------------------------------------------------------- */
/* Solar declination                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Solar declination in radians.
 */
export function solarDeclination(
  julianDate: number
): number {
  return solarEquatorialCoordinates(
    julianDate
  ).declination;
}

/**
 * Solar right ascension in radians.
 */
export function solarRightAscension(
  julianDate: number
): number {
  return solarEquatorialCoordinates(
    julianDate
  ).rightAscension;
}

/* -------------------------------------------------------------------------- */
/* Solar season                                                                */
/* -------------------------------------------------------------------------- */

export type SolarSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter";

/**
 * Determine an approximate season from solar longitude.
 *
 * This is hemisphere-independent:
 * longitude 0°   = northern spring equinox
 * longitude 90°  = northern summer solstice
 * longitude 180° = northern autumn equinox
 * longitude 270° = northern winter solstice
 */
export function solarSeason(
  julianDate: number
): SolarSeason {
  const longitude =
    solarApparentLongitude(
      julianDate
    );

  const degrees =
    longitude *
    RAD_TO_DEG;

  if (
    degrees < 90
  ) {
    return "spring";
  }

  if (
    degrees < 180
  ) {
    return "summer";
  }

  if (
    degrees < 270
  ) {
    return "autumn";
  }

  return "winter";
}

/* -------------------------------------------------------------------------- */
/* Utility conversions                                                         */
/* -------------------------------------------------------------------------- */

export function degreesToRadians(
  degrees: number
): number {
  return degrees *
    DEG_TO_RAD;
}

export function radiansToDegrees(
  radians: number
): number {
  return radians *
    RAD_TO_DEG;
}

export function auToKm(
  au: number
): number {
  return (
    au *
    ASTRONOMICAL_UNIT_KM
  );
}

export function kmToAu(
  kilometers: number
): number {
  return (
    kilometers /
    ASTRONOMICAL_UNIT_KM
  );
}
