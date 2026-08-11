/**
 * Space
 * Astronomy Ephemeris
 *
 * High-level astronomical position data.
 *
 * Provides:
 * - Celestial body ephemeris
 * - Right ascension / declination
 * - Distance
 * - Ecliptic longitude / latitude
 * - Observer-independent position data
 * - Julian date based calculations
 */

import {
  julianDate,
  centuriesSinceJ2000
} from "./time";

import {
  calculatePlanetPosition,
  type PlanetName
} from "./planets";

import {
  eclipticToEquatorial
} from "./coordinates";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface EphemerisTime {
  date:
    Date;

  julianDate:
    number;

  centuries:
    number;
}

export interface EquatorialCoordinates {
  rightAscension:
    number;

  declination:
    number;
}

export interface EclipticCoordinates {
  longitude:
    number;

  latitude:
    number;
}

export interface EphemerisResult {
  body:
    string;

  time:
    EphemerisTime;

  ecliptic:
    EclipticCoordinates;

  equatorial:
    EquatorialCoordinates;

  distanceAU:
    number;

  distanceKm:
    number;
}

export interface PlanetEphemerisOptions {
  planet:
    PlanetName;

  date?:
    Date;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const AU_KM =
  149_597_870.7;

/* -------------------------------------------------------------------------- */
/* Time                                                                       */
/* -------------------------------------------------------------------------- */

export function createEphemerisTime(
  date:
    Date =
      new Date()
):
  EphemerisTime {
  const jd =
    julianDate(
      date
    );

  return {
    date:
      new Date(
        date.getTime()
      ),

    julianDate:
      jd,

    centuries:
      centuriesSinceJ2000(
        jd
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Planet Ephemeris                                                           */
/* -------------------------------------------------------------------------- */

export function calculatePlanetEphemeris(
  options:
    PlanetEphemerisOptions
):
  EphemerisResult {
  const date =
    options.date ??
    new Date();

  const time =
    createEphemerisTime(
      date
    );

  const position =
    calculatePlanetPosition(
      options.planet,
      time.centuries
    );

  const ecliptic = {
    longitude:
      position.longitude,

    latitude:
      position.latitude
  };

  const equatorial =
    eclipticToEquatorial(
      ecliptic,
      date
    );

  return {
    body:
      options.planet,

    time,

    ecliptic,

    equatorial,

    distanceAU:
      position.distance,

    distanceKm:
      position.distance *
      AU_KM
  };
}

/* -------------------------------------------------------------------------- */
/* Batch Ephemeris                                                            */
/* -------------------------------------------------------------------------- */

export function calculatePlanetEphemerides(
  planets:
    PlanetName[],
  date:
    Date =
      new Date()
):
  EphemerisResult[] {
  return planets.map(
    planet =>
      calculatePlanetEphemeris({
        planet,
        date
      })
  );
}

/* -------------------------------------------------------------------------- */
/* Convenience                                                                */
/* -------------------------------------------------------------------------- */

export function rightAscensionHours(
  rightAscension:
    number
):
  number {
  return (
    rightAscension *
    12 /
    Math.PI
  );
}

export function rightAscensionDegrees(
  rightAscension:
    number
):
  number {
  return (
    rightAscension *
    180 /
    Math.PI
  );
}

export function declinationDegrees(
  declination:
    number
):
  number {
  return (
    declination *
    180 /
    Math.PI
  );
}

export function formatEphemeris(
  result:
    EphemerisResult
):
  string {
  const ra =
    rightAscensionHours(
      result.equatorial
        .rightAscension
    );

  const dec =
    declinationDegrees(
      result.equatorial
        .declination
    );

  return [
    `${result.body}`,
    `RA: ${ra.toFixed(4)}h`,
    `Dec: ${dec.toFixed(4)}°`,
    `Distance: ${result.distanceAU.toFixed(6)} AU`
  ].join(
    " | "
  );
}

export default calculatePlanetEphemeris;
