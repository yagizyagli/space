/**
 * Space
 * Core Units
 *
 * Unit conversion utilities and strongly defined astronomical
 * scale constants used throughout the Space engine.
 */

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

export const METERS_PER_KILOMETER = 1_000;
export const KILOMETERS_PER_AU = 149_597_870.7;
export const METERS_PER_AU = KILOMETERS_PER_AU * METERS_PER_KILOMETER;

export const KILOMETERS_PER_LIGHT_YEAR = 9_460_730_472_580.8;
export const METERS_PER_LIGHT_YEAR =
  KILOMETERS_PER_LIGHT_YEAR * METERS_PER_KILOMETER;

export const KILOMETERS_PER_PARSEC = 30_856_775_814_913.673;
export const METERS_PER_PARSEC =
  KILOMETERS_PER_PARSEC * METERS_PER_KILOMETER;

export function metersToKilometers(meters: number): number {
  return meters / METERS_PER_KILOMETER;
}

export function kilometersToMeters(kilometers: number): number {
  return kilometers * METERS_PER_KILOMETER;
}

export function kilometersToAU(kilometers: number): number {
  return kilometers / KILOMETERS_PER_AU;
}

export function auToKilometers(au: number): number {
  return au * KILOMETERS_PER_AU;
}

export function metersToAU(meters: number): number {
  return meters / METERS_PER_AU;
}

export function auToMeters(au: number): number {
  return au * METERS_PER_AU;
}

export function kilometersToLightYears(
  kilometers: number
): number {
  return kilometers / KILOMETERS_PER_LIGHT_YEAR;
}

export function lightYearsToKilometers(
  lightYears: number
): number {
  return lightYears * KILOMETERS_PER_LIGHT_YEAR;
}

export function kilometersToParsecs(
  kilometers: number
): number {
  return kilometers / KILOMETERS_PER_PARSEC;
}

export function parsecsToKilometers(
  parsecs: number
): number {
  return parsecs * KILOMETERS_PER_PARSEC;
}

/* -------------------------------------------------------------------------- */
/* Astronomical distance helpers                                              */
/* -------------------------------------------------------------------------- */

export function metersToAstronomicalUnits(
  meters: number
): number {
  return metersToAU(meters);
}

export function astronomicalUnitsToMeters(
  au: number
): number {
  return auToMeters(au);
}

/* -------------------------------------------------------------------------- */
/* Time                                                                        */
/* -------------------------------------------------------------------------- */

export const MILLISECONDS_PER_SECOND = 1_000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;

export const SECONDS_PER_HOUR =
  SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

export const SECONDS_PER_DAY =
  SECONDS_PER_HOUR * HOURS_PER_DAY;

export const MILLISECONDS_PER_DAY =
  SECONDS_PER_DAY * MILLISECONDS_PER_SECOND;

export const JULIAN_DAY_UNIX_EPOCH = 2_440_587.5;

export function secondsToMilliseconds(
  seconds: number
): number {
  return seconds * MILLISECONDS_PER_SECOND;
}

export function millisecondsToSeconds(
  milliseconds: number
): number {
  return milliseconds / MILLISECONDS_PER_SECOND;
}

export function minutesToSeconds(
  minutes: number
): number {
  return minutes * SECONDS_PER_MINUTE;
}

export function secondsToMinutes(
  seconds: number
): number {
  return seconds / SECONDS_PER_MINUTE;
}

export function hoursToSeconds(
  hours: number
): number {
  return hours * SECONDS_PER_HOUR;
}

export function secondsToHours(
  seconds: number
): number {
  return seconds / SECONDS_PER_HOUR;
}

export function daysToSeconds(
  days: number
): number {
  return days * SECONDS_PER_DAY;
}

export function secondsToDays(
  seconds: number
): number {
  return seconds / SECONDS_PER_DAY;
}

export function daysToMilliseconds(
  days: number
): number {
  return days * MILLISECONDS_PER_DAY;
}

export function millisecondsToDays(
  milliseconds: number
): number {
  return milliseconds / MILLISECONDS_PER_DAY;
}

/* -------------------------------------------------------------------------- */
/* Speed                                                                       */
/* -------------------------------------------------------------------------- */

export const KILOMETERS_PER_SECOND_TO_METERS_PER_SECOND = 1_000;
export const SPEED_OF_LIGHT_KM_S = 299_792.458;
export const SPEED_OF_LIGHT_M_S = 299_792_458;

export function kilometersPerSecondToMetersPerSecond(
  value: number
): number {
  return value * KILOMETERS_PER_SECOND_TO_METERS_PER_SECOND;
}

export function metersPerSecondToKilometersPerSecond(
  value: number
): number {
  return value / KILOMETERS_PER_SECOND_TO_METERS_PER_SECOND;
}

export function kilometersPerSecondToAUPerDay(
  value: number
): number {
  return (
    value *
    SECONDS_PER_DAY /
    KILOMETERS_PER_AU
  );
}

export function auPerDayToKilometersPerSecond(
  value: number
): number {
  return (
    value *
    KILOMETERS_PER_AU /
    SECONDS_PER_DAY
  );
}

/* -------------------------------------------------------------------------- */
/* Mass                                                                        */
/* -------------------------------------------------------------------------- */

export const KILOGRAMS_PER_TONNE = 1_000;

export function kilogramsToTonnes(
  kilograms: number
): number {
  return kilograms / KILOGRAMS_PER_TONNE;
}

export function tonnesToKilograms(
  tonnes: number
): number {
  return tonnes * KILOGRAMS_PER_TONNE;
}

/* -------------------------------------------------------------------------- */
/* Temperature                                                                 */
/* -------------------------------------------------------------------------- */

export function celsiusToKelvin(
  celsius: number
): number {
  return celsius + 273.15;
}

export function kelvinToCelsius(
  kelvin: number
): number {
  return kelvin - 273.15;
}

export function celsiusToFahrenheit(
  celsius: number
): number {
  return celsius * 9 / 5 + 32;
}

export function fahrenheitToCelsius(
  fahrenheit: number
): number {
  return (fahrenheit - 32) * 5 / 9;
}

/* -------------------------------------------------------------------------- */
/* Angular velocity                                                             */
/* -------------------------------------------------------------------------- */

export function degreesPerDayToRadiansPerSecond(
  degreesPerDay: number
): number {
  return (
    degreesPerDay *
    Math.PI /
    180 /
    SECONDS_PER_DAY
  );
}

export function radiansPerSecondToDegreesPerDay(
  radiansPerSecond: number
): number {
  return (
    radiansPerSecond *
    180 /
    Math.PI *
    SECONDS_PER_DAY
  );
}

/* -------------------------------------------------------------------------- */
/* Generic unit helpers                                                        */
/* -------------------------------------------------------------------------- */

export function convert(
  value: number,
  factor: number
): number {
  return value * factor;
}

export function inverseConvert(
  value: number,
  factor: number
): number {
  return value / factor;
}
