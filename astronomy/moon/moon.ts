/**
 * Space
 * Astronomy — Moon
 *
 * Core lunar object and physical constants.
 *
 * Position, phase and illumination calculations are intentionally
 * separated into:
 *
 * - position.ts
 * - phases.ts
 * - illumination.ts
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MoonState {
  radiusKm:
    number;

  diameterKm:
    number;

  massKg:
    number;

  meanDistanceKm:
    number;

  siderealPeriodDays:
    number;

  synodicPeriodDays:
    number;

  meanOrbitalSpeedKmPerSecond:
    number;

  surfaceGravityMPerSecondSquared:
    number;

  escapeVelocityKmPerSecond:
    number;
}

export interface Moon {
  readonly name:
    "Moon";

  readonly state:
    MoonState;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MOON_RADIUS_KM =
  1_737.4;

const MOON_DIAMETER_KM =
  MOON_RADIUS_KM * 2;

const MOON_MASS_KG =
  7.342e22;

const MOON_MEAN_DISTANCE_KM =
  384_400;

const MOON_SIDEREAL_PERIOD_DAYS =
  27.321661;

const MOON_SYNODIC_PERIOD_DAYS =
  29.530588;

const MOON_MEAN_ORBITAL_SPEED_KM_PER_SECOND =
  1.022;

const MOON_SURFACE_GRAVITY_M_PER_SECOND_SQUARED =
  1.625;

const MOON_ESCAPE_VELOCITY_KM_PER_SECOND =
  2.38;

/* -------------------------------------------------------------------------- */
/* Moon                                                                       */
/* -------------------------------------------------------------------------- */

export const MOON_STATE: Readonly<MoonState> = {
  radiusKm:
    MOON_RADIUS_KM,

  diameterKm:
    MOON_DIAMETER_KM,

  massKg:
    MOON_MASS_KG,

  meanDistanceKm:
    MOON_MEAN_DISTANCE_KM,

  siderealPeriodDays:
    MOON_SIDEREAL_PERIOD_DAYS,

  synodicPeriodDays:
    MOON_SYNODIC_PERIOD_DAYS,

  meanOrbitalSpeedKmPerSecond:
    MOON_MEAN_ORBITAL_SPEED_KM_PER_SECOND,

  surfaceGravityMPerSecondSquared:
    MOON_SURFACE_GRAVITY_M_PER_SECOND_SQUARED,

  escapeVelocityKmPerSecond:
    MOON_ESCAPE_VELOCITY_KM_PER_SECOND
};

export const MOON: Moon = {
  name:
    "Moon",

  state:
    MOON_STATE
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function getMoonRadiusKm():
  number {
  return MOON_RADIUS_KM;
}

export function getMoonDiameterKm():
  number {
  return MOON_DIAMETER_KM;
}

export function getMoonMassKg():
  number {
  return MOON_MASS_KG;
}

export function getMoonMeanDistanceKm():
  number {
  return MOON_MEAN_DISTANCE_KM;
}

export function getMoonSiderealPeriodDays():
  number {
  return MOON_SIDEREAL_PERIOD_DAYS;
}

export function getMoonSynodicPeriodDays():
  number {
  return MOON_SYNODIC_PERIOD_DAYS;
}

export function getMoonMeanOrbitalSpeedKmPerSecond():
  number {
  return MOON_MEAN_ORBITAL_SPEED_KM_PER_SECOND;
}

export function getMoonSurfaceGravity():
  number {
  return (
    MOON_SURFACE_GRAVITY_M_PER_SECOND_SQUARED
  );
}

export function getMoonEscapeVelocityKmPerSecond():
  number {
  return MOON_ESCAPE_VELOCITY_KM_PER_SECOND;
}

export default MOON;
