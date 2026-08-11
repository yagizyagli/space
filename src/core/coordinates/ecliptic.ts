/**
 * Space
 * Ecliptic Coordinates
 *
 * Ecliptic longitude, latitude, and distance utilities.
 *
 * Angles are represented in radians internally.
 */

import {
  Cartesian,
  type CartesianCoordinate,
  Ecliptic,
  Equatorial
} from "./coordinates";

import {
  normalizeRadians,
  degreesToRadians
} from "../math/angles";

export interface EclipticLike {
  longitude: number;
  latitude: number;
  distance?: number;
}

export interface ObliquityOptions {
  /**
   * Obliquity of the ecliptic in radians.
   *
   * Mean J2000 obliquity is used by default.
   */
  obliquity?: number;
}

/**
 * Mean obliquity of the ecliptic at J2000.
 */
export const J2000_OBLIQUITY =
  degreesToRadians(23.439291111);

/**
 * Create an ecliptic coordinate.
 */
export function createEcliptic(
  longitude: number,
  latitude: number,
  distance = 0
): Ecliptic {
  return new Ecliptic(
    normalizeRadians(longitude),
    latitude,
    distance
  );
}

/**
 * Convert ecliptic coordinates to Cartesian coordinates.
 */
export function eclipticToCartesian(
  coordinate: EclipticLike
): Cartesian {
  const distance =
    coordinate.distance ?? 1;

  const cosLatitude =
    Math.cos(coordinate.latitude);

  return new Cartesian(
    distance *
      cosLatitude *
      Math.cos(coordinate.longitude),

    distance *
      cosLatitude *
      Math.sin(coordinate.longitude),

    distance *
      Math.sin(coordinate.latitude)
  );
}

/**
 * Convert Cartesian coordinates to ecliptic coordinates.
 */
export function cartesianToEcliptic(
  coordinate: CartesianCoordinate
): Ecliptic {
  const distance = Math.sqrt(
    coordinate.x ** 2 +
    coordinate.y ** 2 +
    coordinate.z ** 2
  );

  if (distance === 0) {
    return new Ecliptic();
  }

  const longitude =
    normalizeRadians(
      Math.atan2(
        coordinate.y,
        coordinate.x
      )
    );

  const latitude =
    Math.asin(
      coordinate.z / distance
    );

  return new Ecliptic(
    longitude,
    latitude,
    distance
  );
}

/**
 * Convert ecliptic coordinates to equatorial coordinates.
 */
export function eclipticToEquatorial(
  coordinate: EclipticLike,
  options: ObliquityOptions = {}
): Equatorial {
  const obliquity =
    options.obliquity ??
    J2000_OBLIQUITY;

  const longitude =
    coordinate.longitude;

  const latitude =
    coordinate.latitude;

  const sinLongitude =
    Math.sin(longitude);

  const cosLongitude =
    Math.cos(longitude);

  const sinLatitude =
    Math.sin(latitude);

  const cosLatitude =
    Math.cos(latitude);

  const x =
    cosLatitude *
    cosLongitude;

  const y =
    cosLatitude *
    sinLongitude *
    Math.cos(obliquity) -
    sinLatitude *
    Math.sin(obliquity);

  const z =
    cosLatitude *
    sinLongitude *
    Math.sin(obliquity) +
    sinLatitude *
    Math.cos(obliquity);

  const rightAscension =
    normalizeRadians(
      Math.atan2(y, x)
    );

  const declination =
    Math.asin(
      Math.max(
        -1,
        Math.min(1, z)
      )
    );

  return new Equatorial(
    rightAscension,
    declination,
    coordinate.distance ?? 0
  );
}

/**
 * Convert equatorial coordinates to ecliptic coordinates.
 */
export function equatorialToEcliptic(
  coordinate: {
    rightAscension: number;
    declination: number;
    distance?: number;
  },
  options: ObliquityOptions = {}
): Ecliptic {
  const obliquity =
    options.obliquity ??
    J2000_OBLIQUITY;

  const rightAscension =
    coordinate.rightAscension;

  const declination =
    coordinate.declination;

  const sinRA =
    Math.sin(rightAscension);

  const cosRA =
    Math.cos(rightAscension);

  const sinDec =
    Math.sin(declination);

  const cosDec =
    Math.cos(declination);

  const x =
    cosDec * cosRA;

  const y =
    cosDec *
      sinRA *
      Math.cos(obliquity) +
    sinDec *
      Math.sin(obliquity);

  const z =
    -cosDec *
      sinRA *
      Math.sin(obliquity) +
    sinDec *
      Math.cos(obliquity);

  const longitude =
    normalizeRadians(
      Math.atan2(y, x)
    );

  const latitude =
    Math.asin(
      Math.max(
        -1,
        Math.min(1, z)
      )
    );

  return new Ecliptic(
    longitude,
    latitude,
    coordinate.distance ?? 0
  );
}

/**
 * Calculate the angular distance between
 * two ecliptic coordinates.
 *
 * Returns radians.
 */
export function angularSeparation(
  first: EclipticLike,
  second: EclipticLike
): number {
  const deltaLongitude =
    second.longitude -
    first.longitude;

  const sinLatitude1 =
    Math.sin(first.latitude);

  const sinLatitude2 =
    Math.sin(second.latitude);

  const cosLatitude1 =
    Math.cos(first.latitude);

  const cosLatitude2 =
    Math.cos(second.latitude);

  const cosine =
    sinLatitude1 * sinLatitude2 +
    cosLatitude1 *
      cosLatitude2 *
      Math.cos(deltaLongitude);

  return Math.acos(
    Math.max(
      -1,
      Math.min(1, cosine)
    )
  );
}

/**
 * Calculate the ecliptic longitude
 * difference between two positions.
 */
export function longitudeDifference(
  first: number,
  second: number
): number {
  const difference =
    normalizeRadians(second) -
    normalizeRadians(first);

  if (difference > Math.PI) {
    return difference - Math.PI * 2;
  }

  if (difference < -Math.PI) {
    return difference + Math.PI * 2;
  }

  return difference;
}

/**
 * Validate an ecliptic coordinate.
 */
export function isValidEcliptic(
  coordinate: EclipticLike
): boolean {
  return (
    Number.isFinite(coordinate.longitude) &&
    Number.isFinite(coordinate.latitude) &&
    coordinate.latitude >= -Math.PI / 2 &&
    coordinate.latitude <= Math.PI / 2 &&
    (
      coordinate.distance === undefined ||
      (
        Number.isFinite(coordinate.distance) &&
        coordinate.distance >= 0
      )
    )
  );
}
