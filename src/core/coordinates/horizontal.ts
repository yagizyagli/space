/**
 * Space
 * Horizontal Coordinates
 *
 * Altitude / Azimuth calculations for an observer on Earth.
 *
 * Angles are represented in radians internally.
 */

import {
  Horizontal,
  Equatorial
} from "./coordinates";

import {
  normalizeRadians,
  degreesToRadians
} from "../math/angles";

export interface Observer {
  /**
   * Geographic latitude in radians.
   */
  latitude: number;

  /**
   * Geographic longitude in radians.
   * Positive eastward.
   */
  longitude: number;

  /**
   * Observer altitude above sea level in meters.
   */
  altitude?: number;
}

export interface HorizontalLike {
  azimuth: number;
  altitude: number;
  distance?: number;
}

/**
 * Create an observer definition.
 */
export function createObserver(
  latitude: number,
  longitude: number,
  altitude = 0
): Observer {
  return {
    latitude,
    longitude,
    altitude
  };
}

/**
 * Convert geographic degrees to an observer.
 */
export function observerFromDegrees(
  latitude: number,
  longitude: number,
  altitude = 0
): Observer {
  return createObserver(
    degreesToRadians(latitude),
    degreesToRadians(longitude),
    altitude
  );
}

/**
 * Convert hour angle, declination, and observer latitude
 * to horizontal coordinates.
 *
 * Azimuth convention:
 *
 *   0        = North
 *   π/2      = East
 *   π        = South
 *   3π/2     = West
 */
export function equatorialToHorizontal(
  rightAscension: number,
  declination: number,
  latitude: number,
  localSiderealTime: number,
  distance = 0
): Horizontal {
  const hourAngle =
    normalizeRadians(
      localSiderealTime -
      rightAscension
    );

  const sinLatitude =
    Math.sin(latitude);

  const cosLatitude =
    Math.cos(latitude);

  const sinDeclination =
    Math.sin(declination);

  const cosDeclination =
    Math.cos(declination);

  const sinHourAngle =
    Math.sin(hourAngle);

  const cosHourAngle =
    Math.cos(hourAngle);

  const sinAltitude =
    sinLatitude * sinDeclination +
    cosLatitude *
      cosDeclination *
      cosHourAngle;

  const altitude = Math.asin(
    Math.max(
      -1,
      Math.min(1, sinAltitude)
    )
  );

  const y =
    -sinHourAngle *
    cosDeclination;

  const x =
    sinDeclination *
      cosLatitude -
    cosDeclination *
      sinLatitude *
      cosHourAngle;

  const azimuth =
    normalizeRadians(
      Math.atan2(y, x)
    );

  return new Horizontal(
    azimuth,
    altitude,
    distance
  );
}

/**
 * Convert horizontal coordinates back to
 * equatorial coordinates.
 *
 * Returns right ascension and declination.
 */
export function horizontalToEquatorial(
  azimuth: number,
  altitude: number,
  latitude: number,
  localSiderealTime: number,
  distance = 0
): Equatorial {
  const sinLatitude =
    Math.sin(latitude);

  const cosLatitude =
    Math.cos(latitude);

  const sinAltitude =
    Math.sin(altitude);

  const cosAltitude =
    Math.cos(altitude);

  const sinAzimuth =
    Math.sin(azimuth);

  const cosAzimuth =
    Math.cos(azimuth);

  const sinDeclination =
    sinAltitude * sinLatitude +
    cosAltitude *
      cosLatitude *
      cosAzimuth;

  const declination =
    Math.asin(
      Math.max(
        -1,
        Math.min(1, sinDeclination)
      )
    );

  const y =
    -sinAzimuth *
    cosAltitude;

  const x =
    sinAltitude *
      cosLatitude -
    cosAltitude *
      sinLatitude *
      cosAzimuth;

  const hourAngle =
    Math.atan2(y, x);

  const rightAscension =
    normalizeRadians(
      localSiderealTime -
      hourAngle
    );

  return new Equatorial(
    rightAscension,
    declination,
    distance
  );
}

/**
 * Calculate the altitude of an object.
 */
export function calculateAltitude(
  rightAscension: number,
  declination: number,
  latitude: number,
  localSiderealTime: number
): number {
  return equatorialToHorizontal(
    rightAscension,
    declination,
    latitude,
    localSiderealTime
  ).altitude;
}

/**
 * Calculate the azimuth of an object.
 */
export function calculateAzimuth(
  rightAscension: number,
  declination: number,
  latitude: number,
  localSiderealTime: number
): number {
  return equatorialToHorizontal(
    rightAscension,
    declination,
    latitude,
    localSiderealTime
  ).azimuth;
}

/**
 * Determine whether an object is above
 * the mathematical horizon.
 */
export function isAboveHorizon(
  altitude: number
): boolean {
  return altitude > 0;
}

/**
 * Determine whether an object is below
 * the mathematical horizon.
 */
export function isBelowHorizon(
  altitude: number
): boolean {
  return altitude < 0;
}

/**
 * Determine whether an object is exactly
 * on the mathematical horizon.
 */
export function isOnHorizon(
  altitude: number,
  tolerance = 1e-10
): boolean {
  return Math.abs(altitude) <= tolerance;
}

/**
 * Calculate the hour angle.
 */
export function calculateHourAngle(
  rightAscension: number,
  localSiderealTime: number
): number {
  return normalizeRadians(
    localSiderealTime -
    rightAscension
  );
}

/**
 * Normalize an azimuth to [0, 2π).
 */
export function normalizeAzimuth(
  azimuth: number
): number {
  return normalizeRadians(azimuth);
}

/**
 * Normalize altitude to the physically meaningful
 * range [-π/2, +π/2].
 */
export function normalizeAltitude(
  altitude: number
): number {
  return Math.max(
    -Math.PI / 2,
    Math.min(
      Math.PI / 2,
      altitude
    )
  );
}

/**
 * Validate an observer.
 */
export function isValidObserver(
  observer: Observer
): boolean {
  return (
    Number.isFinite(observer.latitude) &&
    Number.isFinite(observer.longitude) &&
    observer.latitude >= -Math.PI / 2 &&
    observer.latitude <= Math.PI / 2 &&
    (
      observer.altitude === undefined ||
      Number.isFinite(observer.altitude)
    )
  );
}

/**
 * Validate horizontal coordinates.
 */
export function isValidHorizontal(
  coordinate: HorizontalLike
): boolean {
  return (
    Number.isFinite(coordinate.azimuth) &&
    Number.isFinite(coordinate.altitude) &&
    coordinate.altitude >= -Math.PI / 2 &&
    coordinate.altitude <= Math.PI / 2 &&
    (
      coordinate.distance === undefined ||
      (
        Number.isFinite(coordinate.distance) &&
        coordinate.distance >= 0
      )
    )
  );
}
