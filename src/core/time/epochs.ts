/**
 * Space
 * Astronomical Epochs
 *
 * Utilities for working with astronomical epochs.
 *
 * Supported:
 * - Julian epochs
 * - Besselian epochs
 * - J2000.0
 * - B1950.0
 *
 * Epoch values are represented as Julian Dates where appropriate.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const J2000_JD =
  2_451_545.0;

export const J1900_JD =
  2_415_020.31352;

export const B1950_JD =
  2_433_282.42345905;

export const J2050_JD =
  2_466_980.5;

export const JULIAN_YEAR_DAYS =
  365.25;

export const BESSELIAN_YEAR_DAYS =
  365.242198781;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type EpochType =
  | "J"
  | "B";

export interface Epoch {
  readonly type: EpochType;
  readonly value: number;
  readonly julianDate: number;
  readonly name?: string;
}

/* -------------------------------------------------------------------------- */
/* Julian epoch                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Convert a Julian epoch to Julian Date.
 *
 * Formula:
 *
 * JD = 2451545.0 + (epoch - 2000.0) × 365.25
 */
export function julianEpochToJulianDate(
  epoch: number
): number {
  return (
    J2000_JD +
    (
      epoch -
      2000.0
    ) *
    JULIAN_YEAR_DAYS
  );
}

/**
 * Convert Julian Date to Julian epoch.
 */
export function julianDateToJulianEpoch(
  julianDate: number
): number {
  return (
    2000.0 +
    (
      julianDate -
      J2000_JD
    ) /
    JULIAN_YEAR_DAYS
  );
}

/* -------------------------------------------------------------------------- */
/* Besselian epoch                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Convert Besselian epoch to Julian Date.
 *
 * Besselian epochs are based on the tropical year
 * near the beginning of the twentieth century.
 */
export function besselianEpochToJulianDate(
  epoch: number
): number {
  return (
    B1950_JD +
    (
      epoch -
      1950.0
    ) *
    BESSELIAN_YEAR_DAYS
  );
}

/**
 * Convert Julian Date to Besselian epoch.
 */
export function julianDateToBesselianEpoch(
  julianDate: number
): number {
  return (
    1950.0 +
    (
      julianDate -
      B1950_JD
    ) /
    BESSELIAN_YEAR_DAYS
  );
}

/* -------------------------------------------------------------------------- */
/* Epoch factory                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Create a Julian epoch.
 */
export function julianEpoch(
  value: number,
  name?: string
): Epoch {
  return {
    type: "J",
    value,
    julianDate:
      julianEpochToJulianDate(value),
    name
  };
}

/**
 * Create a Besselian epoch.
 */
export function besselianEpoch(
  value: number,
  name?: string
): Epoch {
  return {
    type: "B",
    value,
    julianDate:
      besselianEpochToJulianDate(value),
    name
  };
}

/**
 * Create an epoch directly from Julian Date.
 */
export function epochFromJulianDate(
  julianDate: number,
  type: EpochType = "J",
  name?: string
): Epoch {
  return {
    type,
    value:
      type === "J"
        ? julianDateToJulianEpoch(
            julianDate
          )
        : julianDateToBesselianEpoch(
            julianDate
          ),
    julianDate,
    name
  };
}

/* -------------------------------------------------------------------------- */
/* Standard epochs                                                             */
/* -------------------------------------------------------------------------- */

export const EPOCH_J2000 =
  julianEpoch(
    2000.0,
    "J2000.0"
  );

export const EPOCH_J2050 =
  julianEpoch(
    2050.0,
    "J2050.0"
  );

export const EPOCH_J1900 =
  julianEpoch(
    1900.0,
    "J1900.0"
  );

export const EPOCH_B1950 =
  besselianEpoch(
    1950.0,
    "B1950.0"
  );

/* -------------------------------------------------------------------------- */
/* Epoch differences                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Difference between two epochs in Julian years.
 */
export function epochDifference(
  first: Epoch,
  second: Epoch
): number {
  return (
    second.julianDate -
    first.julianDate
  ) /
  JULIAN_YEAR_DAYS;
}

/**
 * Number of Julian years from an epoch to a Julian Date.
 */
export function julianYearsSinceEpoch(
  julianDate: number,
  epoch: Epoch
): number {
  return (
    julianDate -
    epoch.julianDate
  ) /
  JULIAN_YEAR_DAYS;
}

/**
 * Number of days from an epoch to a Julian Date.
 */
export function daysSinceEpoch(
  julianDate: number,
  epoch: Epoch
): number {
  return (
    julianDate -
    epoch.julianDate
  );
}

/* -------------------------------------------------------------------------- */
/* Epoch conversion                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Convert an epoch from one epoch system to another.
 */
export function convertEpoch(
  epoch: Epoch,
  targetType: EpochType
): Epoch {
  if (
    epoch.type === targetType
  ) {
    return {
      ...epoch
    };
  }

  return epochFromJulianDate(
    epoch.julianDate,
    targetType,
    epoch.name
  );
}

/**
 * Convert Julian epoch to Besselian epoch.
 */
export function julianEpochToBesselianEpoch(
  epoch: number
): number {
  return julianDateToBesselianEpoch(
    julianEpochToJulianDate(
      epoch
    )
  );
}

/**
 * Convert Besselian epoch to Julian epoch.
 */
export function besselianEpochToJulianEpoch(
  epoch: number
): number {
  return julianDateToJulianEpoch(
    besselianEpochToJulianDate(
      epoch
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Epoch validation                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Determine whether an epoch is valid.
 */
export function isValidEpoch(
  epoch: Epoch
): boolean {
  return (
    (
      epoch.type === "J" ||
      epoch.type === "B"
    ) &&
    Number.isFinite(epoch.value) &&
    Number.isFinite(
      epoch.julianDate
    )
  );
}

/**
 * Determine whether a value represents
 * a valid Julian epoch.
 */
export function isValidJulianEpoch(
  value: number
): boolean {
  return Number.isFinite(value);
}

/**
 * Determine whether a value represents
 * a valid Besselian epoch.
 */
export function isValidBesselianEpoch(
  value: number
): boolean {
  return Number.isFinite(value);
}

/* -------------------------------------------------------------------------- */
/* Epoch formatting                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Format an epoch using astronomical notation.
 *
 * Example:
 *   J2000.00
 *   B1950.00
 */
export function formatEpoch(
  epoch: Epoch,
  precision = 2
): string {
  return (
    epoch.type +
    epoch.value.toFixed(
      precision
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Epoch metadata                                                              */
/* -------------------------------------------------------------------------- */

export const STANDARD_EPOCHS = {
  J1900: EPOCH_J1900,
  B1950: EPOCH_B1950,
  J2000: EPOCH_J2000,
  J2050: EPOCH_J2050
} as const;
