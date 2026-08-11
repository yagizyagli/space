/**
 * Space
 * Astronomy — Sun
 *
 * Core solar object and basic solar state.
 *
 * This module intentionally contains solar-domain data only.
 * Position calculations and solar events live in:
 *
 * - solar-position.ts
 * - solar-events.ts
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SunState {
  radiusKm: number;
  diameterKm: number;
  massKg: number;
  luminosityW: number;
  effectiveTemperatureK: number;
}

export interface Sun {
  readonly name: "Sun";
  readonly state: SunState;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SUN_RADIUS_KM =
  695_700;

const SUN_DIAMETER_KM =
  SUN_RADIUS_KM * 2;

const SUN_MASS_KG =
  1.98847e30;

const SUN_LUMINOSITY_W =
  3.828e26;

const SUN_EFFECTIVE_TEMPERATURE_K =
  5_772;

/* -------------------------------------------------------------------------- */
/* Sun                                                                       */
/* -------------------------------------------------------------------------- */

export const SUN_STATE: Readonly<SunState> = {
  radiusKm:
    SUN_RADIUS_KM,

  diameterKm:
    SUN_DIAMETER_KM,

  massKg:
    SUN_MASS_KG,

  luminosityW:
    SUN_LUMINOSITY_W,

  effectiveTemperatureK:
    SUN_EFFECTIVE_TEMPERATURE_K
};

export const SUN: Sun = {
  name:
    "Sun",

  state:
    SUN_STATE
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Returns the solar radius in kilometres.
 */
export function getSunRadiusKm():
  number {
  return SUN_RADIUS_KM;
}

/**
 * Returns the solar diameter in kilometres.
 */
export function getSunDiameterKm():
  number {
  return SUN_DIAMETER_KM;
}

/**
 * Returns the solar mass in kilograms.
 */
export function getSunMassKg():
  number {
  return SUN_MASS_KG;
}

/**
 * Returns the solar luminosity in watts.
 */
export function getSunLuminosityW():
  number {
  return SUN_LUMINOSITY_W;
}

/**
 * Returns the effective solar surface temperature in Kelvin.
 */
export function getSunEffectiveTemperatureK():
  number {
  return SUN_EFFECTIVE_TEMPERATURE_K;
}

export default SUN;
