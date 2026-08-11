/**
 * Space
 * Equatorial Coordinates
 *
 * Right Ascension (RA) and Declination (Dec) utilities.
 *
 * Angles are represented in radians internally.
 */

import {
  Cartesian,
  type CartesianCoordinate,
  Equatorial
} from "./coordinates";

import {
  normalizeRadians,
  hoursToRadians,
  radiansToHours
} from "../math/angles";

export interface EquatorialLike {
  rightAscension: number;
  declination: number;
  distance?: number;
}

/**
 * Create an equatorial coordinate.
 */
export function createEquatorial(
  rightAscension: number,
  declination: number,
  distance = 0
): Equatorial {
  return new Equatorial(
    normalizeRadians(rightAscension),
    declination,
    distance
  );
}

/**
 * Convert equatorial coordinates to Cartesian coordinates.
 *
 * RA:
 *   0 -> 2π
 *
 * Dec:
 *   -π/2 -> +π/2
 *
 * Distance:
 *   Arbitrary unit.
 */
export function equatorialToCartesian(
  coordinate: EquatorialLike
): Cartesian {
  const cosDeclination =
    Math.cos(coordinate.declination);

  const distance =
    coordinate.distance ?? 1;

  return new Cartesian(
    distance *
      cosDeclination *
      Math.cos(coordinate.rightAscension),

    distance *
      cosDeclination *
      Math.sin(coordinate.rightAscension),

    distance *
      Math.sin(coordinate.declination)
  );
}

/**
 * Convert Cartesian coordinates to equatorial coordinates.
 */
export function cartesianToEquatorial(
  coordinate: CartesianCoordinate
): Equatorial {
  const distance = Math.sqrt(
    coordinate.x ** 2 +
    coordinate.y ** 2 +
    coordinate.z ** 2
  );

  if (distance === 0) {
    return new Equatorial();
  }

  const rightAscension =
    normalizeRadians(
      Math.atan2(
        coordinate.y,
        coordinate.x
      )
    );

  const declination =
    Math.asin(
      coordinate.z / distance
    );

  return new Equatorial(
    rightAscension,
    declination,
    distance
  );
}

/**
 * Convert right ascension in hours to radians.
 */
export function rightAscensionHoursToRadians(
  hours: number
): number {
  return normalizeRadians(
    hoursToRadians(hours)
  );
}

/**
 * Convert right ascension in radians to hours.
 */
export function rightAscensionRadiansToHours(
  radians: number
): number {
  return radiansToHours(
    normalizeRadians(radians)
  );
}

/**
 * Convert right ascension hours/minutes/seconds to radians.
 */
export function rightAscensionHMSToRadians(
  hours: number,
  minutes = 0,
  seconds = 0
): number {
  const totalHours =
    hours +
    minutes / 60 +
    seconds / 3600;

  return rightAscensionHoursToRadians(
    totalHours
  );
}

/**
 * Convert radians to right ascension
 * expressed as hours, minutes and seconds.
 */
export function rightAscensionRadiansToHMS(
  radians: number
): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalHours =
    rightAscensionRadiansToHours(radians);

  const hours = Math.floor(totalHours);

  const minuteValue =
    (totalHours - hours) * 60;

  const minutes =
    Math.floor(minuteValue);

  const seconds =
    (minuteValue - minutes) * 60;

  return {
    hours,
    minutes,
    seconds
  };
}

/**
 * Convert declination in degrees,
 * minutes and seconds to radians.
 */
export function declinationDMSToRadians(
  degrees: number,
  minutes = 0,
  seconds = 0
): number {
  const sign =
    degrees < 0 ? -1 : 1;

  const absoluteDegrees =
    Math.abs(degrees) +
    Math.abs(minutes) / 60 +
    Math.abs(seconds) / 3600;

  return (
    sign *
    absoluteDegrees *
    Math.PI /
    180
  );
}

/**
 * Convert declination radians to
 * degrees, minutes and seconds.
 */
export function declinationRadiansToDMS(
  radians: number
): {
  degrees: number;
  minutes: number;
  seconds: number;
  sign: 1 | -1;
} {
  const degrees =
    radians * 180 / Math.PI;

  const sign: 1 | -1 =
    degrees < 0 ? -1 : 1;

  const absolute =
    Math.abs(degrees);

  const wholeDegrees =
    Math.floor(absolute);

  const minuteValue =
    (absolute - wholeDegrees) * 60;

  const minutes =
    Math.floor(minuteValue);

  const seconds =
    (minuteValue - minutes) * 60;

  return {
    degrees: wholeDegrees,
    minutes,
    seconds,
    sign
  };
}

/**
 * Angular separation between two equatorial coordinates.
 *
 * Returns radians.
 */
export function angularSeparation(
  first: EquatorialLike,
  second: EquatorialLike
): number {
  const deltaRA =
    second.rightAscension -
    first.rightAscension;

  const sinDec1 =
    Math.sin(first.declination);

  const sinDec2 =
    Math.sin(second.declination);

  const cosDec1 =
    Math.cos(first.declination);

  const cosDec2 =
    Math.cos(second.declination);

  const cosine =
    sinDec1 * sinDec2 +
    cosDec1 *
      cosDec2 *
      Math.cos(deltaRA);

  return Math.acos(
    Math.max(
      -1,
      Math.min(1, cosine)
    )
  );
}

/**
 * Position angle from one equatorial coordinate
 * toward another.
 *
 * Returns radians measured eastward
 * from celestial north.
 */
export function positionAngle(
  origin: EquatorialLike,
  target: EquatorialLike
): number {
  const deltaRA =
    target.rightAscension -
    origin.rightAscension;

  const y =
    Math.sin(deltaRA) *
    Math.cos(target.declination);

  const x =
    Math.cos(origin.declination) *
      Math.sin(target.declination) -
    Math.sin(origin.declination) *
      Math.cos(target.declination) *
      Math.cos(deltaRA);

  return normalizeRadians(
    Math.atan2(y, x)
  );
}

/**
 * Validate an equatorial coordinate.
 */
export function isValidEquatorial(
  coordinate: EquatorialLike
): boolean {
  const validRightAscension =
    Number.isFinite(
      coordinate.rightAscension
    );

  const validDeclination =
    Number.isFinite(
      coordinate.declination
    ) &&
    coordinate.declination >=
      -Math.PI / 2 &&
    coordinate.declination <=
      Math.PI / 2;

  const validDistance =
    coordinate.distance === undefined ||
    (
      Number.isFinite(coordinate.distance) &&
      coordinate.distance >= 0
    );

  return (
    validRightAscension &&
    validDeclination &&
    validDistance
  );
}
