/**
 * Space
 * Astronomy — Moon Illumination
 *
 * Calculates lunar illuminated fraction, phase angle,
 * waxing/waning state and approximate visual magnitude.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type MoonIlluminationTrend =
  | "waxing"
  | "waning";

export interface MoonIllumination {
  fraction:
    number;

  percentage:
    number;

  phaseAngle:
    number;

  trend:
    MoonIlluminationTrend;

  ageDays:
    number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SYNODIC_MONTH_DAYS =
  29.530588853;

const KNOWN_NEW_MOON_JD =
  2_451_550.09765;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Calculates lunar illumination for a Date.
 *
 * The returned fraction is in [0, 1].
 */
export function calculateMoonIllumination(
  date:
    Date
):
  MoonIllumination {
  validateDate(
    date
  );

  const julianDay =
    calculateJulianDay(
      date
    );

  return calculateIlluminationFromJulianDay(
    julianDay
  );
}

/**
 * Returns only the illuminated fraction.
 */
export function getIlluminatedFraction(
  date:
    Date
):
  number {
  return calculateMoonIllumination(
    date
  ).fraction;
}

/**
 * Returns illuminated percentage.
 */
export function getIlluminatedPercentage(
  date:
    Date
):
  number {
  return calculateMoonIllumination(
    date
  ).percentage;
}

/**
 * Returns lunar phase angle.
 *
 * 0°   = New Moon
 * 180° = Full Moon
 */
export function getLunarPhaseAngle(
  date:
    Date
):
  number {
  return calculateMoonIllumination(
    date
  ).phaseAngle;
}

/**
 * Returns whether the Moon is waxing or waning.
 */
export function getMoonIlluminationTrend(
  date:
    Date
):
  MoonIlluminationTrend {
  return calculateMoonIllumination(
    date
  ).trend;
}

/* -------------------------------------------------------------------------- */
/* Julian Day                                                                 */
/* -------------------------------------------------------------------------- */

function calculateJulianDay(
  date:
    Date
):
  number {
  return (
    date.getTime() /
    86_400_000
  ) +
    2_440_587.5;
}

/* -------------------------------------------------------------------------- */
/* Calculation                                                                 */
/* -------------------------------------------------------------------------- */

function calculateIlluminationFromJulianDay(
  julianDay:
    number
):
  MoonIllumination {
  const elapsedDays =
    julianDay -
    KNOWN_NEW_MOON_JD;

  const cycleFraction =
    normalizeFraction(
      elapsedDays /
      SYNODIC_MONTH_DAYS
    );

  const ageDays =
    cycleFraction *
    SYNODIC_MONTH_DAYS;

  const phaseAngle =
    cycleFraction *
    360;

  const fraction =
    (
      1 -
      Math.cos(
        phaseAngle *
          Math.PI /
          180
      )
    ) /
    2;

  const trend =
    cycleFraction <
      0.5
      ? "waxing"
      : "waning";

  return {
    fraction:
      clamp(
        fraction,
        0,
        1
      ),

    percentage:
      clamp(
        fraction * 100,
        0,
        100
      ),

    phaseAngle,

    trend,

    ageDays
  };
}

/* -------------------------------------------------------------------------- */
/* Geometric Illumination                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Calculates illuminated fraction from a Sun-Moon-Earth elongation angle.
 *
 * This helper is useful when the caller already has the angular geometry.
 */
export function illuminationFromPhaseAngle(
  phaseAngle:
    number
):
  number {
  const normalized =
    normalizeDegrees(
      phaseAngle
    );

  return clamp(
    (
      1 -
      Math.cos(
        normalized *
          Math.PI /
          180
      )
    ) /
      2,
    0,
    1
  );
}

/**
 * Calculates phase angle from an illuminated fraction.
 *
 * Returns the principal angle in [0, 180].
 */
export function phaseAngleFromIllumination(
  fraction:
    number
):
  number {
  const normalized =
    clamp(
      fraction,
      0,
      1
    );

  return (
    Math.acos(
      1 -
      2 *
        normalized
    ) *
    180 /
    Math.PI
  );
}

/* -------------------------------------------------------------------------- */
/* Lunar Terminator                                                           */
/* -------------------------------------------------------------------------- */

export interface LunarTerminator {
  fraction:
    number;

  phaseAngle:
    number;

  terminatorAngle:
    number;
}

/**
 * Returns an approximate terminator orientation angle.
 *
 * The orientation is expressed in degrees and is intended for
 * visualization. A full topocentric libration model belongs in
 * the rendering layer.
 */
export function calculateLunarTerminator(
  date:
    Date
):
  LunarTerminator {
  const illumination =
    calculateMoonIllumination(
      date
    );

  const terminatorAngle =
    illumination.phaseAngle <=
      180
      ? illumination.phaseAngle
      : 360 -
        illumination.phaseAngle;

  return {
    fraction:
      illumination.fraction,

    phaseAngle:
      illumination.phaseAngle,

    terminatorAngle
  };
}

/* -------------------------------------------------------------------------- */
/* Approximate Visual Magnitude                                               */
/* -------------------------------------------------------------------------- */

/**
 * Estimates the Moon's visual magnitude.
 *
 * This is a compact empirical approximation intended for visualization
 * and relative brightness calculations rather than photometry.
 */
export function estimateMoonMagnitude(
  date:
    Date
):
  number {
  validateDate(
    date
  );

  const illumination =
    calculateMoonIllumination(
      date
    );

  const fraction =
    Math.max(
      illumination.fraction,
      0.0001
    );

  /*
   * Full-Moon reference magnitude is approximately -12.7.
   * The logarithmic term models the dominant brightness dependence
   * on illuminated area.
   */
  const magnitude =
    -12.7 -
    2.5 *
      Math.log10(
        fraction
      );

  return magnitude;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateDate(
  date:
    Date
):
  void {
  if (
    !(
      date instanceof
      Date
    ) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new TypeError(
      "Moon illumination calculation requires a valid Date."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function normalizeFraction(
  value:
    number
):
  number {
  return (
    (
      value %
      1
    ) +
    1
  ) %
  1;
}

function normalizeDegrees(
  value:
    number
):
  number {
  return (
    (
      value %
      360
    ) +
    360
  ) %
  360;
}

function clamp(
  value:
    number,
  minimum:
    number,
  maximum:
    number
):
  number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

export default calculateMoonIllumination;
