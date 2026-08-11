/**
 * Space
 * Astronomy — Moon Phases
 *
 * Calculates the lunar phase and illumination geometry.
 *
 * Phase angle convention:
 * - 0°   = New Moon
 * - 90°  = First Quarter
 * - 180° = Full Moon
 * - 270° = Last Quarter
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type MoonPhaseName =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export interface MoonPhase {
  angle:
    number;

  illumination:
    number;

  name:
    MoonPhaseName;

  ageDays:
    number;

  cycleFraction:
    number;
}

export interface MoonPhaseInput {
  date:
    Date;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SYNODIC_MONTH_DAYS =
  29.530588853;

const KNOWN_NEW_MOON_JD =
  2_451_550.09765;

const PHASE_BOUNDARIES = [
  {
    start:
      0,
    end:
      22.5,
    name:
      "new"
  },

  {
    start:
      22.5,
    end:
      67.5,
    name:
      "waxing-crescent"
  },

  {
    start:
      67.5,
    end:
      112.5,
    name:
      "first-quarter"
  },

  {
    start:
      112.5,
    end:
      157.5,
    name:
      "waxing-gibbous"
  },

  {
    start:
      157.5,
    end:
      202.5,
    name:
      "full"
  },

  {
    start:
      202.5,
    end:
      247.5,
    name:
      "waning-gibbous"
  },

  {
    start:
      247.5,
    end:
      292.5,
    name:
      "last-quarter"
  },

  {
    start:
      292.5,
    end:
      337.5,
    name:
      "waning-crescent"
  },

  {
    start:
      337.5,
    end:
      360,
    name:
      "new"
  }
] as const;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Calculates the current lunar phase.
 */
export function calculateMoonPhase(
  input:
    MoonPhaseInput
):
  MoonPhase {
  validateDate(
    input.date
  );

  const julianDay =
    calculateJulianDay(
      input.date
    );

  return calculatePhaseFromJulianDay(
    julianDay
  );
}

/**
 * Convenience function accepting a Date directly.
 */
export function getMoonPhase(
  date:
    Date
):
  MoonPhase {
  return calculateMoonPhase({
    date
  });
}

/**
 * Returns the phase angle in degrees.
 */
export function calculateMoonPhaseAngle(
  date:
    Date
):
  number {
  return getMoonPhase(
    date
  ).angle;
}

/**
 * Returns illuminated fraction from 0 to 1.
 */
export function calculateMoonIllumination(
  date:
    Date
):
  number {
  return getMoonPhase(
    date
  ).illumination;
}

/**
 * Returns the current phase name.
 */
export function getMoonPhaseName(
  date:
    Date
):
  MoonPhaseName {
  return getMoonPhase(
    date
  ).name;
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
/* Phase Calculation                                                          */
/* -------------------------------------------------------------------------- */

function calculatePhaseFromJulianDay(
  julianDay:
    number
):
  MoonPhase {
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

  const angle =
    cycleFraction *
    360;

  /*
   * Illuminated fraction:
   *
   * k = (1 - cos(phaseAngle)) / 2
   */
  const illumination =
    (
      1 -
      Math.cos(
        angle *
        Math.PI /
        180
      )
    ) /
    2;

  const name =
    determinePhaseName(
      angle
    );

  return {
    angle,
    illumination,
    name,
    ageDays,
    cycleFraction
  };
}

/* -------------------------------------------------------------------------- */
/* Phase Name                                                                 */
/* -------------------------------------------------------------------------- */

function determinePhaseName(
  angle:
    number
):
  MoonPhaseName {
  for (
    const boundary of
      PHASE_BOUNDARIES
  ) {
    if (
      angle >=
        boundary.start &&
      angle <
        boundary.end
    ) {
      return boundary.name;
    }
  }

  return "new";
}

/* -------------------------------------------------------------------------- */
/* Phase Events                                                               */
/* -------------------------------------------------------------------------- */

export interface MoonPhaseEvent {
  name:
    "new" |
    "first-quarter" |
    "full" |
    "last-quarter";

  date:
    Date;
}

/**
 * Estimates the next principal lunar phase.
 *
 * This is intentionally an estimate. High-precision event timing
 * belongs in the event-calculation layer.
 */
export function findNextPrincipalPhase(
  date:
    Date
):
  MoonPhaseEvent {
  validateDate(
    date
  );

  const current =
    getMoonPhase(
      date
    );

  const targets = [
    {
      angle:
        0,
      name:
        "new" as const
    },

    {
      angle:
        90,
      name:
        "first-quarter" as const
    },

    {
      angle:
        180,
      name:
        "full" as const
    },

    {
      angle:
        270,
      name:
        "last-quarter" as const
    }
  ];

  let bestTarget =
    targets[0];

  let smallestDelta =
    Infinity;

  for (
    const target of targets
  ) {
    let delta =
      target.angle -
      current.angle;

    if (
      delta <=
      0
    ) {
      delta +=
        360;
    }

    if (
      delta <
      smallestDelta
    ) {
      smallestDelta =
        delta;

      bestTarget =
        target;
    }
  }

  const daysUntil =
    (
      smallestDelta /
      360
    ) *
    SYNODIC_MONTH_DAYS;

  return {
    name:
      bestTarget.name,

    date:
      new Date(
        date.getTime() +
        daysUntil *
          86_400_000
      )
  };
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
      "Moon phase calculation requires a valid Date."
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

export default calculateMoonPhase;
