/**
 * Space
 * Julian Date Utilities
 *
 * Astronomical date/time calculations based on Julian Date.
 *
 * Julian Date:
 *   Continuous count of days since 4713 BCE-01-01 noon UTC
 *   in the proleptic Julian calendar.
 *
 * Internal representation:
 *   Julian Date as a floating-point number.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const JULIAN_DATE_UNIX_EPOCH =
  2_440_587.5;

export const JULIAN_DATE_J2000 =
  2_451_545.0;

export const UNIX_EPOCH_MILLISECONDS =
  0;

export const MILLISECONDS_PER_DAY =
  86_400_000;

export const DAYS_PER_JULIAN_YEAR =
  365.25;

/* -------------------------------------------------------------------------- */
/* Date → Julian Date                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Convert a JavaScript Date to Julian Date.
 */
export function dateToJulianDate(
  date: Date
): number {
  return (
    date.getTime() /
    MILLISECONDS_PER_DAY +
    JULIAN_DATE_UNIX_EPOCH
  );
}

/**
 * Convert a Unix timestamp in milliseconds
 * to Julian Date.
 */
export function unixMillisecondsToJulianDate(
  milliseconds: number
): number {
  return (
    milliseconds /
    MILLISECONDS_PER_DAY +
    JULIAN_DATE_UNIX_EPOCH
  );
}

/**
 * Convert Unix timestamp in seconds
 * to Julian Date.
 */
export function unixSecondsToJulianDate(
  seconds: number
): number {
  return unixMillisecondsToJulianDate(
    seconds * 1_000
  );
}

/* -------------------------------------------------------------------------- */
/* Julian Date → Date                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Convert Julian Date to JavaScript Date.
 */
export function julianDateToDate(
  julianDate: number
): Date {
  return new Date(
    (
      julianDate -
      JULIAN_DATE_UNIX_EPOCH
    ) *
    MILLISECONDS_PER_DAY
  );
}

/**
 * Convert Julian Date to Unix milliseconds.
 */
export function julianDateToUnixMilliseconds(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_DATE_UNIX_EPOCH
  ) *
  MILLISECONDS_PER_DAY;
}

/**
 * Convert Julian Date to Unix seconds.
 */
export function julianDateToUnixSeconds(
  julianDate: number
): number {
  return (
    julianDateToUnixMilliseconds(
      julianDate
    ) / 1_000
  );
}

/* -------------------------------------------------------------------------- */
/* Calendar date → Julian Date                                                */
/* -------------------------------------------------------------------------- */

/**
 * Convert a Gregorian calendar date to Julian Date.
 *
 * The month is 1-12.
 *
 * The returned value represents the start of the
 * supplied day at 00:00:00 UTC.
 */
export function calendarToJulianDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): number {
  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const century =
    Math.floor(y / 100);

  const correction =
    2 -
    century +
    Math.floor(century / 4);

  const dayFraction =
    (
      hour +
      minute / 60 +
      second / 3_600 +
      millisecond / 3_600_000
    ) / 24;

  return (
    Math.floor(
      365.25 * (y + 4716)
    ) +
    Math.floor(
      30.6001 * (m + 1)
    ) +
    day +
    correction -
    1524.5 +
    dayFraction
  );
}

/* -------------------------------------------------------------------------- */
/* Julian Date → calendar components                                          */
/* -------------------------------------------------------------------------- */

export interface JulianCalendarDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/**
 * Convert Julian Date to Gregorian calendar components.
 */
export function julianDateToCalendar(
  julianDate: number
): JulianCalendarDate {
  const jd =
    julianDate + 0.5;

  const integerPart =
    Math.floor(jd);

  const fraction =
    jd - integerPart;

  let a = integerPart;

  if (integerPart >= 2_299_161) {
    const alpha =
      Math.floor(
        (integerPart - 1_867_216.25) /
        36_524.25
      );

    a =
      integerPart +
      1 +
      alpha -
      Math.floor(alpha / 4);
  }

  const b =
    a + 1_524;

  const c =
    Math.floor(
      (b - 122.1) / 365.25
    );

  const d =
    Math.floor(
      365.25 * c
    );

  const e =
    Math.floor(
      (b - d) / 30.6001
    );

  const day =
    b -
    d -
    Math.floor(
      30.6001 * e
    );

  const month =
    e < 14
      ? e - 1
      : e - 13;

  const year =
    month > 2
      ? c - 4716
      : c - 4715;

  const totalMilliseconds =
    fraction *
    MILLISECONDS_PER_DAY;

  const hour =
    Math.floor(
      totalMilliseconds /
      3_600_000
    );

  const minute =
    Math.floor(
      (
        totalMilliseconds -
        hour * 3_600_000
      ) /
      60_000
    );

  const second =
    Math.floor(
      (
        totalMilliseconds -
        hour * 3_600_000 -
        minute * 60_000
      ) /
      1_000
    );

  const millisecond =
    Math.round(
      totalMilliseconds -
      hour * 3_600_000 -
      minute * 60_000 -
      second * 1_000
    );

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond
  };
}

/* -------------------------------------------------------------------------- */
/* Julian centuries                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Convert Julian Date to Julian centuries since J2000.0.
 */
export function julianDateToJulianCenturies(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_DATE_J2000
  ) / 36_525;
}

/**
 * Convert Julian centuries since J2000.0
 * back to Julian Date.
 */
export function julianCenturiesToJulianDate(
  centuries: number
): number {
  return (
    JULIAN_DATE_J2000 +
    centuries * 36_525
  );
}

/**
 * Convert Julian Date to Julian years
 * since J2000.0.
 */
export function julianDateToJulianYears(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_DATE_J2000
  ) / DAYS_PER_JULIAN_YEAR;
}

/* -------------------------------------------------------------------------- */
/* Modified Julian Date                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Convert Julian Date to Modified Julian Date.
 */
export function julianDateToModifiedJulianDate(
  julianDate: number
): number {
  return julianDate - 2_400_000.5;
}

/**
 * Convert Modified Julian Date to Julian Date.
 */
export function modifiedJulianDateToJulianDate(
  modifiedJulianDate: number
): number {
  return (
    modifiedJulianDate +
    2_400_000.5
  );
}

/* -------------------------------------------------------------------------- */
/* Day arithmetic                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Add days to a Julian Date.
 */
export function addJulianDays(
  julianDate: number,
  days: number
): number {
  return julianDate + days;
}

/**
 * Difference between two Julian Dates in days.
 */
export function julianDateDifference(
  first: number,
  second: number
): number {
  return second - first;
}

/**
 * Determine whether a Julian Date is valid.
 */
export function isValidJulianDate(
  julianDate: number
): boolean {
  return Number.isFinite(julianDate);
}

/* -------------------------------------------------------------------------- */
/* J2000 helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Days since J2000.0.
 */
export function daysSinceJ2000(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_DATE_J2000
  );
}

/**
 * Days before J2000.0.
 */
export function daysBeforeJ2000(
  julianDate: number
): number {
  return (
    JULIAN_DATE_J2000 -
    julianDate
  );
}
