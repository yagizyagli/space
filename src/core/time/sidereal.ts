/**
 * Space
 * Sidereal Time
 *
 * Greenwich Mean Sidereal Time (GMST),
 * Greenwich Apparent Sidereal Time (GAST),
 * and Local Sidereal Time (LST) utilities.
 *
 * Internal angular units:
 * radians
 *
 * Sidereal time can also be represented as:
 * - radians
 * - hours [0, 24)
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TWO_PI =
  Math.PI * 2;

const HOURS_PER_DAY =
  24;

const RADIANS_PER_HOUR =
  TWO_PI / HOURS_PER_DAY;

const HOURS_PER_RADIAN =
  HOURS_PER_DAY / TWO_PI;

const JULIAN_DATE_J2000 =
  2_451_545.0;

const JULIAN_CENTURY_DAYS =
  36_525;

const JULIAN_DAY_SECONDS =
  86_400;

/* -------------------------------------------------------------------------- */
/* Normalization                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Normalize radians to [0, 2π).
 */
export function normalizeSiderealRadians(
  radians: number
): number {
  const result =
    radians % TWO_PI;

  return result < 0
    ? result + TWO_PI
    : result;
}

/**
 * Normalize sidereal hours to [0, 24).
 */
export function normalizeSiderealHours(
  hours: number
): number {
  const result =
    hours % HOURS_PER_DAY;

  return result < 0
    ? result + HOURS_PER_DAY
    : result;
}

/* -------------------------------------------------------------------------- */
/* Julian centuries                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Julian centuries from J2000.0.
 */
export function siderealJulianCenturies(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_DATE_J2000
  ) / JULIAN_CENTURY_DAYS;
}

/* -------------------------------------------------------------------------- */
/* GMST                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Calculate Greenwich Mean Sidereal Time.
 *
 * Returns radians in [0, 2π).
 *
 * Formula based on the IAU convention for
 * Earth rotation angle / GMST approximation.
 */
export function greenwichMeanSiderealTime(
  julianDate: number
): number {
  const T =
    siderealJulianCenturies(
      julianDate
    );

  const jd0 =
    Math.floor(
      julianDate - 0.5
    ) + 0.5;

  const daysSinceJ2000 =
    jd0 -
    JULIAN_DATE_J2000;

  const utHours =
    (
      julianDate -
      jd0
    ) * 24;

  const gmstHours =
    6.697374558 +
    0.06570982441908 *
      daysSinceJ2000 +
    1.00273790935 *
      utHours +
    0.000026 *
      T *
      T;

  return normalizeSiderealRadians(
    gmstHours *
    RADIANS_PER_HOUR
  );
}

/**
 * Calculate Greenwich Mean Sidereal Time
 * and return hours [0, 24).
 */
export function greenwichMeanSiderealTimeHours(
  julianDate: number
): number {
  return normalizeSiderealHours(
    greenwichMeanSiderealTime(
      julianDate
    ) *
    HOURS_PER_RADIAN
  );
}

/* -------------------------------------------------------------------------- */
/* Earth Rotation Angle                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Calculate Earth Rotation Angle (ERA).
 *
 * Returns radians in [0, 2π).
 */
export function earthRotationAngle(
  julianDate: number
): number {
  const daysSinceJ2000 =
    julianDate -
    JULIAN_DATE_J2000;

  const fraction =
    daysSinceJ2000 -
    Math.floor(daysSinceJ2000);

  const theta =
    TWO_PI *
    (
      0.7790572732640 +
      1.00273781191135448 *
      daysSinceJ2000
    );

  return normalizeSiderealRadians(
    theta
  );
}

/* -------------------------------------------------------------------------- */
/* Equation of Equinoxes                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Approximate equation of equinoxes.
 *
 * Uses a compact nutation approximation sufficient
 * for general-purpose sky visualization.
 */
export function equationOfEquinoxes(
  julianDate: number
): number {
  const T =
    siderealJulianCenturies(
      julianDate
    );

  const omega =
    degreesToRadians(
      125.04452 -
      1934.136261 * T
    );

  const sunLongitude =
    degreesToRadians(
      280.4665 +
      36000.7698 * T
    );

  const moonLongitude =
    degreesToRadians(
      218.3165 +
      481267.8813 * T
    );

  const deltaPsi =
    (
      -17.20 *
        Math.sin(omega) -
      1.32 *
        Math.sin(
          2 *
          sunLongitude
        ) -
      0.23 *
        Math.sin(
          2 *
          moonLongitude
        ) +
      0.21 *
        Math.sin(
          2 *
          omega
        )
    ) / 3600;

  const meanObliquity =
    degreesToRadians(
      23.439291 -
      0.0130042 * T
    );

  return (
    degreesToRadians(deltaPsi) *
    Math.cos(meanObliquity)
  );
}

/* -------------------------------------------------------------------------- */
/* GAST                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Greenwich Apparent Sidereal Time.
 */
export function greenwichApparentSiderealTime(
  julianDate: number
): number {
  return normalizeSiderealRadians(
    greenwichMeanSiderealTime(
      julianDate
    ) +
    equationOfEquinoxes(
      julianDate
    )
  );
}

/**
 * Greenwich Apparent Sidereal Time in hours.
 */
export function greenwichApparentSiderealTimeHours(
  julianDate: number
): number {
  return normalizeSiderealHours(
    greenwichApparentSiderealTime(
      julianDate
    ) *
    HOURS_PER_RADIAN
  );
}

/* -------------------------------------------------------------------------- */
/* Local Sidereal Time                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Calculate Local Mean Sidereal Time.
 *
 * Longitude is positive eastward.
 */
export function localMeanSiderealTime(
  julianDate: number,
  longitude: number
): number {
  return normalizeSiderealRadians(
    greenwichMeanSiderealTime(
      julianDate
    ) +
    longitude
  );
}

/**
 * Calculate Local Apparent Sidereal Time.
 */
export function localApparentSiderealTime(
  julianDate: number,
  longitude: number
): number {
  return normalizeSiderealRadians(
    greenwichApparentSiderealTime(
      julianDate
    ) +
    longitude
  );
}

/**
 * Local Mean Sidereal Time in hours.
 */
export function localMeanSiderealTimeHours(
  julianDate: number,
  longitude: number
): number {
  return normalizeSiderealHours(
    localMeanSiderealTime(
      julianDate,
      longitude
    ) *
    HOURS_PER_RADIAN
  );
}

/**
 * Local Apparent Sidereal Time in hours.
 */
export function localApparentSiderealTimeHours(
  julianDate: number,
  longitude: number
): number {
  return normalizeSiderealHours(
    localApparentSiderealTime(
      julianDate,
      longitude
    ) *
    HOURS_PER_RADIAN
  );
}

/* -------------------------------------------------------------------------- */
/* Hour Angle                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Calculate hour angle.
 *
 * Returns radians normalized to [-π, π).
 */
export function hourAngle(
  localSiderealTime: number,
  rightAscension: number
): number {
  let result =
    localSiderealTime -
    rightAscension;

  result =
    (
      result + Math.PI
    ) % TWO_PI;

  if (result < 0) {
    result += TWO_PI;
  }

  return result - Math.PI;
}

/**
 * Calculate hour angle in hours.
 */
export function hourAngleHours(
  localSiderealTimeHoursValue: number,
  rightAscensionHours: number
): number {
  let result =
    localSiderealTimeHoursValue -
    rightAscensionHours;

  result =
    (
      result + 12
    ) % 24;

  if (result < 0) {
    result += 24;
  }

  return result - 12;
}

/* -------------------------------------------------------------------------- */
/* RA / Sidereal conversion                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Convert sidereal hours to radians.
 */
export function siderealHoursToRadians(
  hours: number
): number {
  return normalizeSiderealRadians(
    hours * RADIANS_PER_HOUR
  );
}

/**
 * Convert radians to sidereal hours.
 */
export function radiansToSiderealHours(
  radians: number
): number {
  return normalizeSiderealHours(
    radians * HOURS_PER_RADIAN
  );
}

/* -------------------------------------------------------------------------- */
/* Utility                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Convert degrees to radians.
 */
function degreesToRadians(
  degrees: number
): number {
  return degrees *
    Math.PI /
    180;
}

/**
 * Estimate the number of sidereal rotations
 * corresponding to elapsed solar days.
 */
export function siderealRotations(
  elapsedDays: number
): number {
  return (
    elapsedDays *
    1.00273790935
  );
}

/**
 * Convert mean solar time interval to
 * approximate sidereal time interval.
 */
export function solarDaysToSiderealDays(
  solarDays: number
): number {
  return (
    solarDays *
    1.00273790935
  );
}

/**
 * Convert sidereal time interval to
 * approximate solar days.
 */
export function siderealDaysToSolarDays(
  siderealDays: number
): number {
  return (
    siderealDays /
    1.00273790935
  );
}

/**
 * Calculate sidereal time at Greenwich
 * from Unix timestamp in milliseconds.
 */
export function unixMillisecondsToGMST(
  milliseconds: number
): number {
  const julianDate =
    milliseconds /
    86_400_000 +
    2_440_587.5;

  return greenwichMeanSiderealTime(
    julianDate
  );
}

/**
 * Calculate local sidereal time from
 * Unix timestamp in milliseconds.
 */
export function unixMillisecondsToLST(
  milliseconds: number,
  longitude: number
): number {
  const julianDate =
    milliseconds /
    86_400_000 +
    2_440_587.5;

  return localMeanSiderealTime(
    julianDate,
    longitude
  );
}
