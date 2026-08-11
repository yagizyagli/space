/**
 * Space
 * Astronomical Constants
 *
 * Standard astronomical constants and reference values.
 *
 * Sources / standards:
 * - IAU astronomical constants
 * - IAU 2015 Resolution B3
 * - IAU 2012 Resolution B1
 *
 * SI units are used unless otherwise stated.
 */

/* -------------------------------------------------------------------------- */
/* Astronomical Unit                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Astronomical Unit.
 *
 * Exact by IAU definition.
 */
export const ASTRONOMICAL_UNIT_METERS =
  149_597_870_700;

/**
 * Astronomical Unit in kilometers.
 */
export const ASTRONOMICAL_UNIT_KM =
  149_597_870.7;

/* -------------------------------------------------------------------------- */
/* Light                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Speed of light in vacuum.
 *
 * Exact SI value.
 */
export const SPEED_OF_LIGHT_M_S =
  299_792_458;

/**
 * Speed of light in km/s.
 */
export const SPEED_OF_LIGHT_KM_S =
  299_792.458;

/**
 * Length of a Julian light-year.
 */
export const LIGHT_YEAR_METERS =
  SPEED_OF_LIGHT_M_S *
  365.25 *
  86_400;

/**
 * Light-year in kilometers.
 */
export const LIGHT_YEAR_KM =
  LIGHT_YEAR_METERS / 1_000;

/* -------------------------------------------------------------------------- */
/* Parsec                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One parsec in meters.
 */
export const PARSEC_METERS =
  648_000 /
  Math.PI *
  ASTRONOMICAL_UNIT_METERS;

/**
 * One parsec in kilometers.
 */
export const PARSEC_KM =
  PARSEC_METERS / 1_000;

/**
 * One parsec in astronomical units.
 */
export const PARSEC_AU =
  PARSEC_METERS /
  ASTRONOMICAL_UNIT_METERS;

/**
 * Kiloparsec.
 */
export const KILOPARSEC_METERS =
  PARSEC_METERS * 1_000;

/**
 * Megaparsec.
 */
export const MEGAPARSEC_METERS =
  PARSEC_METERS * 1_000_000;

/* -------------------------------------------------------------------------- */
/* Julian time                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Length of a Julian year.
 */
export const JULIAN_YEAR_DAYS =
  365.25;

/**
 * Length of a Julian century.
 */
export const JULIAN_CENTURY_DAYS =
  36_525;

/**
 * Length of a Julian millennium.
 */
export const JULIAN_MILLENNIUM_DAYS =
  365_250;

/**
 * J2000.0 Julian Date.
 */
export const J2000_JULIAN_DATE =
  2_451_545.0;

/**
 * Modified Julian Date offset.
 */
export const MJD_OFFSET =
  2_400_000.5;

/* -------------------------------------------------------------------------- */
/* Earth orientation                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Mean obliquity of the ecliptic at J2000.0.
 *
 * Degrees.
 */
export const J2000_MEAN_OBLIQUITY_DEGREES =
  23.439291111;

/**
 * Mean obliquity of the ecliptic at J2000.0.
 *
 * Radians.
 */
export const J2000_MEAN_OBLIQUITY_RADIANS =
  J2000_MEAN_OBLIQUITY_DEGREES *
  Math.PI /
  180;

/* -------------------------------------------------------------------------- */
/* Angular constants                                                           */
/* -------------------------------------------------------------------------- */

export const DEGREES_PER_CIRCLE =
  360;

export const RADIANS_PER_CIRCLE =
  Math.PI * 2;

export const DEGREES_PER_HOUR =
  15;

export const HOURS_PER_CIRCLE =
  24;

export const ARCSECONDS_PER_DEGREE =
  3_600;

export const ARCSECONDS_PER_CIRCLE =
  1_296_000;

/* -------------------------------------------------------------------------- */
/* Distance conversions                                                        */
/* -------------------------------------------------------------------------- */

export const METERS_PER_KILOMETER =
  1_000;

export const METERS_PER_ASTRONOMICAL_UNIT =
  ASTRONOMICAL_UNIT_METERS;

export const KILOMETERS_PER_ASTRONOMICAL_UNIT =
  ASTRONOMICAL_UNIT_KM;

export const METERS_PER_LIGHT_YEAR =
  LIGHT_YEAR_METERS;

export const KILOMETERS_PER_LIGHT_YEAR =
  LIGHT_YEAR_KM;

/* -------------------------------------------------------------------------- */
/* Time conversions                                                            */
/* -------------------------------------------------------------------------- */

export const SECONDS_PER_MINUTE =
  60;

export const MINUTES_PER_HOUR =
  60;

export const HOURS_PER_DAY =
  24;

export const SECONDS_PER_HOUR =
  SECONDS_PER_MINUTE *
  MINUTES_PER_HOUR;

export const SECONDS_PER_DAY =
  SECONDS_PER_HOUR *
  HOURS_PER_DAY;

export const MILLISECONDS_PER_SECOND =
  1_000;

export const MILLISECONDS_PER_DAY =
  SECONDS_PER_DAY *
  MILLISECONDS_PER_SECOND;

/* -------------------------------------------------------------------------- */
/* Epochs                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Besselian epoch reference.
 */
export const BESSELIAN_EPOCH_1900 =
  2_415_020.3135;

/**
 * Julian epoch reference.
 */
export const JULIAN_EPOCH_2000 =
  J2000_JULIAN_DATE;

/* -------------------------------------------------------------------------- */
/* Common astronomical scales                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Astronomical distances.
 */
export const ASTRONOMICAL_SCALES = {
  kilometer: 1_000,
  astronomicalUnit: ASTRONOMICAL_UNIT_METERS,
  lightYear: LIGHT_YEAR_METERS,
  parsec: PARSEC_METERS,
  kiloparsec: KILOPARSEC_METERS,
  megaparsec: MEGAPARSEC_METERS
} as const;

/**
 * Astronomical time scales.
 */
export const ASTRONOMICAL_TIME_SCALES = {
  day: SECONDS_PER_DAY,
  year: JULIAN_YEAR_DAYS,
  century: JULIAN_CENTURY_DAYS,
  millennium: JULIAN_MILLENNIUM_DAYS
} as const;
