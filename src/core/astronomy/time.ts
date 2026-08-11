/**
 * Space
 * Astronomy Time
 *
 * Astronomical time utilities used throughout the Space engine.
 *
 * Supports:
 * - Julian Date
 * - Modified Julian Date
 * - J2000
 * - Julian centuries
 * - Unix <-> Julian conversions
 * - UTC / TT / UT1 helpers
 * - Greenwich Mean Sidereal Time
 * - Local Sidereal Time
 * - Mean solar time
 * - Decimal year
 * - Epoch conversion helpers
 *
 * Internal angular values are radians.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const MS_PER_SECOND = 1_000;

export const MS_PER_MINUTE =
  60 * MS_PER_SECOND;

export const MS_PER_HOUR =
  60 * MS_PER_MINUTE;

export const MS_PER_DAY =
  24 * MS_PER_HOUR;

export const SECONDS_PER_DAY =
  86_400;

export const MINUTES_PER_DAY =
  1_440;

export const HOURS_PER_DAY =
  24;

export const JULIAN_UNIX_EPOCH =
  2_440_587.5;

export const J2000_JULIAN_DATE =
  2_451_545.0;

export const MJD_OFFSET =
  2_400_000.5;

export const DAYS_PER_JULIAN_CENTURY =
  36_525;

export const DAYS_PER_JULIAN_MILLENNIUM =
  365_250;

export const JULIAN_YEAR_DAYS =
  365.25;

export const DEG_TO_RAD =
  Math.PI / 180;

export const RAD_TO_DEG =
  180 / Math.PI;

export const TWO_PI =
  Math.PI * 2;

export const HOURS_TO_RAD =
  Math.PI / 12;

export const RAD_TO_HOURS =
  12 / Math.PI;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type TimeScale =
  | "UTC"
  | "TAI"
  | "TT"
  | "UT1"
  | "TDB";

export interface JulianDate {
  value: number;
  scale: TimeScale;
}

export interface AstronomicalDate {
  date: Date;

  julianDate: number;

  modifiedJulianDate: number;

  julianCenturies: number;

  decimalYear: number;
}

export interface SiderealTime {
  radians: number;

  hours: number;

  degrees: number;
}

export interface Epoch {
  year: number;

  month: number;

  day: number;
}

export interface TimeComponents {
  year: number;

  month: number;

  day: number;

  hour: number;

  minute: number;

  second: number;

  millisecond: number;
}

/* -------------------------------------------------------------------------- */
/* Basic normalization                                                        */
/* -------------------------------------------------------------------------- */

export function normalizeAngle(
  angle: number
): number {
  const value =
    angle % TWO_PI;

  return value < 0
    ? value + TWO_PI
    : value;
}

export function normalizeHours(
  hours: number
): number {
  const value =
    hours % 24;

  return value < 0
    ? value + 24
    : value;
}

export function normalizeDegrees(
  degrees: number
): number {
  const value =
    degrees % 360;

  return value < 0
    ? value + 360
    : value;
}

/* -------------------------------------------------------------------------- */
/* Date validation                                                             */
/* -------------------------------------------------------------------------- */

export function isValidDate(
  date: Date
): boolean {
  return (
    date instanceof Date &&
    !Number.isNaN(
      date.getTime()
    )
  );
}

export function assertValidDate(
  date: Date
): void {
  if (
    !isValidDate(date)
  ) {
    throw new Error(
      "Invalid date."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Date -> Julian Date                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Convert JavaScript Date to Julian Date.
 *
 * JavaScript Date is interpreted as UTC.
 */
export function dateToJulianDate(
  date: Date
): number {
  assertValidDate(date);

  return (
    date.getTime() /
      MS_PER_DAY +
    JULIAN_UNIX_EPOCH
  );
}

/**
 * Convert Julian Date to JavaScript Date.
 */
export function julianDateToDate(
  julianDate: number
): Date {
  return new Date(
    (
      julianDate -
      JULIAN_UNIX_EPOCH
    ) *
      MS_PER_DAY
  );
}

/* -------------------------------------------------------------------------- */
/* Modified Julian Date                                                       */
/* -------------------------------------------------------------------------- */

export function julianToModifiedJulian(
  julianDate: number
): number {
  return (
    julianDate -
    MJD_OFFSET
  );
}

export function modifiedJulianToJulian(
  modifiedJulianDate: number
): number {
  return (
    modifiedJulianDate +
    MJD_OFFSET
  );
}

export function dateToModifiedJulian(
  date: Date
): number {
  return julianToModifiedJulian(
    dateToJulianDate(date)
  );
}

export function modifiedJulianToDate(
  modifiedJulianDate: number
): Date {
  return julianDateToDate(
    modifiedJulianToJulian(
      modifiedJulianDate
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Julian centuries                                                           */
/* -------------------------------------------------------------------------- */

export function julianCenturies(
  julianDate: number
): number {
  return (
    julianDate -
    J2000_JULIAN_DATE
  ) /
  DAYS_PER_JULIAN_CENTURY;
}

export function julianDateFromCenturies(
  centuries: number
): number {
  return (
    J2000_JULIAN_DATE +
    centuries *
      DAYS_PER_JULIAN_CENTURY
  );
}

/* -------------------------------------------------------------------------- */
/* J2000                                                                      */
/* -------------------------------------------------------------------------- */

export function daysSinceJ2000(
  julianDate: number
): number {
  return (
    julianDate -
    J2000_JULIAN_DATE
  );
}

export function dateToDaysSinceJ2000(
  date: Date
): number {
  return daysSinceJ2000(
    dateToJulianDate(date)
  );
}

export function j2000ToDate(
  days: number
): Date {
  return julianDateToDate(
    J2000_JULIAN_DATE +
    days
  );
}

/* -------------------------------------------------------------------------- */
/* Unix timestamp                                                             */
/* -------------------------------------------------------------------------- */

export function unixMillisecondsToJulian(
  milliseconds: number
): number {
  return (
    milliseconds /
      MS_PER_DAY +
    JULIAN_UNIX_EPOCH
  );
}

export function julianToUnixMilliseconds(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_UNIX_EPOCH
  ) *
  MS_PER_DAY;
}

export function unixSecondsToJulian(
  seconds: number
): number {
  return unixMillisecondsToJulian(
    seconds * 1_000
  );
}

export function julianToUnixSeconds(
  julianDate: number
): number {
  return (
    julianToUnixMilliseconds(
      julianDate
    ) / 1_000
  );
}

/* -------------------------------------------------------------------------- */
/* Time components                                                            */
/* -------------------------------------------------------------------------- */

export function getTimeComponents(
  date: Date
): TimeComponents {
  assertValidDate(date);

  return {
    year:
      date.getUTCFullYear(),

    month:
      date.getUTCMonth() + 1,

    day:
      date.getUTCDate(),

    hour:
      date.getUTCHours(),

    minute:
      date.getUTCMinutes(),

    second:
      date.getUTCSeconds(),

    millisecond:
      date.getUTCMilliseconds()
  };
}

/* -------------------------------------------------------------------------- */
/* Decimal year                                                               */
/* -------------------------------------------------------------------------- */

export function decimalYear(
  date: Date
): number {
  assertValidDate(date);

  const year =
    date.getUTCFullYear();

  const start =
    Date.UTC(
      year,
      0,
      1
    );

  const end =
    Date.UTC(
      year + 1,
      0,
      1
    );

  const fraction =
    (
      date.getTime() -
      start
    ) /
    (
      end -
      start
    );

  return (
    year +
    fraction
  );
}

/* -------------------------------------------------------------------------- */
/* Days in month / year                                                       */
/* -------------------------------------------------------------------------- */

export function isLeapYear(
  year: number
): boolean {
  return (
    year % 4 === 0 &&
    (
      year % 100 !== 0 ||
      year % 400 === 0
    )
  );
}

export function daysInYear(
  year: number
): number {
  return isLeapYear(year)
    ? 366
    : 365;
}

export function daysInMonth(
  year: number,
  month: number
): number {
  if (
    month === 2
  ) {
    return isLeapYear(year)
      ? 29
      : 28;
  }

  if (
    month === 4 ||
    month === 6 ||
    month === 9 ||
    month === 11
  ) {
    return 30;
  }

  return 31;
}

/* -------------------------------------------------------------------------- */
/* Gregorian calendar                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Calendar date -> Julian Date.
 *
 * Month is 1-12.
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

  if (
    m <= 2
  ) {
    y -= 1;
    m += 12;
  }

  const A =
    Math.floor(
      y / 100
    );

  const B =
    2 -
    A +
    Math.floor(
      A / 4
    );

  const integerDay =
    Math.floor(
      365.25 *
      (y + 4716)
    ) +
    Math.floor(
      30.6001 *
      (m + 1)
    ) +
    day +
    B -
    1524.5;

  const fraction =
    (
      hour +
      minute / 60 +
      second / 3600 +
      millisecond / 3_600_000
    ) / 24;

  return (
    integerDay +
    fraction
  );
}

/* -------------------------------------------------------------------------- */
/* Epoch                                                                       */
/* -------------------------------------------------------------------------- */

export function epochToJulianDate(
  epoch: Epoch
): number {
  return calendarToJulianDate(
    epoch.year,
    epoch.month,
    epoch.day
  );
}

export function julianDateToEpoch(
  julianDate: number
): Epoch {
  const date =
    julianDateToDate(
      julianDate
    );

  return {
    year:
      date.getUTCFullYear(),

    month:
      date.getUTCMonth() + 1,

    day:
      date.getUTCDate()
  };
}

export function julianEpoch(
  julianDate: number
): number {
  return (
    2000 +
    (
      julianDate -
      J2000_JULIAN_DATE
    ) /
      JULIAN_YEAR_DAYS
  );
}

export function epochToJulian(
  epoch: number
): number {
  return (
    J2000_JULIAN_DATE +
    (
      epoch -
      2000
    ) *
      JULIAN_YEAR_DAYS
  );
}

/* -------------------------------------------------------------------------- */
/* Delta time                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Difference between two dates in days.
 */
export function differenceInDays(
  a: Date,
  b: Date
): number {
  return (
    a.getTime() -
    b.getTime()
  ) /
  MS_PER_DAY;
}

export function differenceInHours(
  a: Date,
  b: Date
): number {
  return (
    a.getTime() -
    b.getTime()
  ) /
  MS_PER_HOUR;
}

export function differenceInMinutes(
  a: Date,
  b: Date
): number {
  return (
    a.getTime() -
    b.getTime()
  ) /
  MS_PER_MINUTE;
}

export function differenceInSeconds(
  a: Date,
  b: Date
): number {
  return (
    a.getTime() -
    b.getTime()
  ) /
  MS_PER_SECOND;
}

/* -------------------------------------------------------------------------- */
/* UTC / TAI / TT                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Approximate leap-second table.
 *
 * Values represent TAI - UTC in seconds.
 *
 * This table is intentionally kept internal so a more
 * complete IERS-backed implementation can replace it later.
 */
const LEAP_SECONDS: ReadonlyArray<{
  timestamp: number;
  offset: number;
}> = [
  {
    timestamp:
      Date.UTC(
        1972,
        0,
        1
      ),
    offset: 10
  },

  {
    timestamp:
      Date.UTC(
        1972,
        6,
        1
      ),
    offset: 11
  },

  {
    timestamp:
      Date.UTC(
        1973,
        0,
        1
      ),
    offset: 12
  },

  {
    timestamp:
      Date.UTC(
        1974,
        0,
        1
      ),
    offset: 13
  },

  {
    timestamp:
      Date.UTC(
        1975,
        0,
        1
      ),
    offset: 14
  },

  {
    timestamp:
      Date.UTC(
        1976,
        0,
        1
      ),
    offset: 15
  },

  {
    timestamp:
      Date.UTC(
        1977,
        0,
        1
      ),
    offset: 16
  },

  {
    timestamp:
      Date.UTC(
        1978,
        0,
        1
      ),
    offset: 17
  },

  {
    timestamp:
      Date.UTC(
        1979,
        0,
        1
      ),
    offset: 18
  },

  {
    timestamp:
      Date.UTC(
        1980,
        0,
        1
      ),
    offset: 19
  },

  {
    timestamp:
      Date.UTC(
        1981,
        6,
        1
      ),
    offset: 20
  },

  {
    timestamp:
      Date.UTC(
        1982,
        6,
        1
      ),
    offset: 21
  },

  {
    timestamp:
      Date.UTC(
        1983,
        6,
        1
      ),
    offset: 22
  },

  {
    timestamp:
      Date.UTC(
        1985,
        6,
        1
      ),
    offset: 23
  },

  {
    timestamp:
      Date.UTC(
        1988,
        0,
        1
      ),
    offset: 24
  },

  {
    timestamp:
      Date.UTC(
        1990,
        0,
        1
      ),
    offset: 25
  },

  {
    timestamp:
      Date.UTC(
        1991,
        0,
        1
      ),
    offset: 26
  },

  {
    timestamp:
      Date.UTC(
        1992,
        6,
        1
      ),
    offset: 27
  },

  {
    timestamp:
      Date.UTC(
        1993,
        6,
        1
      ),
    offset: 28
  },

  {
    timestamp:
      Date.UTC(
        1994,
        6,
        1
      ),
    offset: 29
  },

  {
    timestamp:
      Date.UTC(
        1996,
        0,
        1
      ),
    offset: 30
  },

  {
    timestamp:
      Date.UTC(
        1997,
        6,
        1
      ),
    offset: 31
  },

  {
    timestamp:
      Date.UTC(
        1999,
        0,
        1
      ),
    offset: 32
  },

  {
    timestamp:
      Date.UTC(
        2006,
        0,
        1
      ),
    offset: 33
  },

  {
    timestamp:
      Date.UTC(
        2009,
        0,
        1
      ),
    offset: 34
  },

  {
    timestamp:
      Date.UTC(
        2012,
        6,
        1
      ),
    offset: 35
  },

  {
    timestamp:
      Date.UTC(
        2015,
        6,
        1
      ),
    offset: 36
  },

  {
    timestamp:
      Date.UTC(
        2017,
        0,
        1
      ),
    offset: 37
  }
];

export function taiMinusUtc(
  date: Date
): number {
  assertValidDate(date);

  const timestamp =
    date.getTime();

  let offset = 10;

  for (
    const leap
      of LEAP_SECONDS
  ) {
    if (
      timestamp >=
      leap.timestamp
    ) {
      offset =
        leap.offset;
    } else {
      break;
    }
  }

  return offset;
}

export function utcToTai(
  date: Date
): Date {
  return new Date(
    date.getTime() +
    taiMinusUtc(date) *
      MS_PER_SECOND
  );
}

export function taiToUtc(
  date: Date
): Date {
  /**
   * Iterative approximation because
   * the leap-second offset depends on UTC.
   */
  let utc =
    new Date(
      date.getTime()
    );

  for (
    let i = 0;
    i < 3;
    i++
  ) {
    utc =
      new Date(
        date.getTime() -
        taiMinusUtc(utc) *
          MS_PER_SECOND
      );
  }

  return utc;
}

export function utcToTerrestrialTime(
  date: Date
): Date {
  /**
   * TT = TAI + 32.184 seconds.
   */
  const tai =
    utcToTai(date);

  return new Date(
    tai.getTime() +
    32.184 *
      MS_PER_SECOND
  );
}

export function terrestrialTimeToUtc(
  date: Date
): Date {
  /**
   * TT -> TAI -> UTC.
   */
  const tai =
    new Date(
      date.getTime() -
      32.184 *
        MS_PER_SECOND
    );

  return taiToUtc(tai);
}

/* -------------------------------------------------------------------------- */
/* Delta T                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Approximate ΔT = TT - UT.
 *
 * Intended for astronomical visualization,
 * not precision ephemeris work.
 */
export function deltaT(
  year: number
): number {
  let t: number;

  if (
    year < 948
  ) {
    t =
      (year - 2000) /
      100;

    return (
      2177 +
      497 * t +
      44.1 * t * t
    );
  }

  if (
    year < 1600
  ) {
    t =
      (year - 2000) /
      100;

    return (
      102 +
      102 * t +
      25.3 * t * t
    );
  }

  if (
    year < 1700
  ) {
    t =
      year - 1600;

    return (
      120 -
      0.9808 * t -
      0.01532 * t * t +
      t * t * t / 7129
    );
  }

  if (
    year < 1800
  ) {
    t =
      year - 1700;

    return (
      8.83 +
      0.1603 * t -
      0.0059285 * t * t +
      0.00013336 * t * t * t -
      t * t * t * t / 1174000
    );
  }

  if (
    year < 1860
  ) {
    t =
      year - 1800;

    return (
      13.72 -
      0.332447 * t +
      0.0068612 * t * t +
      0.0041116 * t * t * t -
      0.00037436 * t * t * t * t +
      0.0000121272 * t * t * t * t * t -
      0.0000001699 *
        t * t * t * t * t * t +
      0.000000000875 *
        t * t * t * t * t * t * t
    );
  }

  if (
    year < 1900
  ) {
    t =
      year - 1860;

    return (
      7.62 +
      0.5737 * t -
      0.251754 * t * t +
      0.01680668 * t * t * t -
      0.0004473624 *
        t * t * t * t +
      t * t * t * t * t /
        233174
    );
  }

  if (
    year < 1920
  ) {
    t =
      year - 1900;

    return (
      -2.79 +
      1.494119 * t -
      0.0598939 * t * t +
      0.0061966 * t * t * t -
      0.000197 * t * t * t * t
    );
  }

  if (
    year < 1941
  ) {
    t =
      year - 1920;

    return (
      21.20 +
      0.84493 * t -
      0.076100 * t * t +
      0.0020936 *
        t * t * t
    );
  }

  if (
    year < 1961
  ) {
    t =
      year - 1950;

    return (
      29.07 +
      0.407 * t -
      t * t / 233 +
      t * t * t / 2547
    );
  }

  if (
    year < 1986
  ) {
    t =
      year - 1975;

    return (
      45.45 +
      1.067 * t -
      t * t / 260 -
      t * t * t / 718
    );
  }

  if (
    year < 2005
  ) {
    t =
      year - 2000;

    return (
      63.86 +
      0.3345 * t -
      0.060374 * t * t +
      0.0017275 *
        t * t * t +
      0.000651814 *
        t * t * t * t +
      0.00002373599 *
        t * t * t * t * t
    );
  }

  if (
    year < 2050
  ) {
    t =
      year - 2000;

    return (
      62.92 +
      0.32217 * t +
      0.005589 * t * t
    );
  }

  if (
    year < 2150
  ) {
    return (
      -20 +
      32 *
        (
          (year - 1820) /
          100
        ) ** 2 -
      0.5628 *
        (2150 - year)
    );
  }

  t =
    (year - 2000) /
    100;

  return (
    102 +
    102 * t +
    25.3 * t * t
  );
}

/* -------------------------------------------------------------------------- */
/* Sidereal time                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Greenwich Mean Sidereal Time.
 *
 * Returns radians in [0, 2π).
 */
export function greenwichMeanSiderealTime(
  julianDate: number
): number {
  const T =
    julianCenturies(
      julianDate
    );

  const theta =
    280.46061837 +
    360.98564736629 *
      (
        julianDate -
        J2000_JULIAN_DATE
      ) +
    0.000387933 *
      T * T -
    T * T * T /
      38_710_000;

  return normalizeAngle(
    theta *
      DEG_TO_RAD
  );
}

/**
 * Greenwich Mean Sidereal Time in hours.
 */
export function greenwichMeanSiderealTimeHours(
  julianDate: number
): number {
  return normalizeHours(
    greenwichMeanSiderealTime(
      julianDate
    ) *
      RAD_TO_HOURS
  );
}

/**
 * Local Mean Sidereal Time.
 *
 * longitude is positive eastward.
 */
export function localMeanSiderealTime(
  julianDate: number,
  longitude: number
): number {
  return normalizeAngle(
    greenwichMeanSiderealTime(
      julianDate
    ) +
    longitude
  );
}

export function localMeanSiderealTimeHours(
  julianDate: number,
  longitude: number
): number {
  return normalizeHours(
    localMeanSiderealTime(
      julianDate,
      longitude
    ) *
      RAD_TO_HOURS
  );
}

/* -------------------------------------------------------------------------- */
/* Sidereal time object                                                       */
/* -------------------------------------------------------------------------- */

export function siderealTime(
  julianDate: number,
  longitude = 0
): SiderealTime {
  const radians =
    localMeanSiderealTime(
      julianDate,
      longitude
    );

  return {
    radians,

    hours:
      normalizeHours(
        radians *
          RAD_TO_HOURS
      ),

    degrees:
      normalizeDegrees(
        radians *
          RAD_TO_DEG
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Solar time                                                                 */
/* -------------------------------------------------------------------------- */

export function solarMeanTime(
  date: Date,
  longitude = 0
): number {
  assertValidDate(date);

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600 +
    date.getUTCMilliseconds() /
      3_600_000;

  const longitudeHours =
    longitude *
    RAD_TO_HOURS;

  return normalizeHours(
    utcHours +
    longitudeHours
  );
}

/* -------------------------------------------------------------------------- */
/* Astronomical date                                                           */
/* -------------------------------------------------------------------------- */

export function astronomicalDate(
  date: Date
): AstronomicalDate {
  const julianDate =
    dateToJulianDate(
      date
    );

  return {
    date:

      new Date(
        date.getTime()
      ),

    julianDate,

    modifiedJulianDate:
      julianToModifiedJulian(
        julianDate
      ),

    julianCenturies:
      julianCenturies(
        julianDate
      ),

    decimalYear:
      decimalYear(date)
  };
}

/* -------------------------------------------------------------------------- */
/* Time arithmetic                                                            */
/* -------------------------------------------------------------------------- */

export function addDays(
  date: Date,
  days: number
): Date {
  return new Date(
    date.getTime() +
    days *
      MS_PER_DAY
  );
}

export function addHours(
  date: Date,
  hours: number
): Date {
  return new Date(
    date.getTime() +
    hours *
      MS_PER_HOUR
  );
}

export function addMinutes(
  date: Date,
  minutes: number
): Date {
  return new Date(
    date.getTime() +
    minutes *
      MS_PER_MINUTE
  );
}

export function addSeconds(
  date: Date,
  seconds: number
): Date {
  return new Date(
    date.getTime() +
    seconds *
      MS_PER_SECOND
  );
}

/* -------------------------------------------------------------------------- */
/* Julian date arithmetic                                                     */
/* -------------------------------------------------------------------------- */

export function addJulianDays(
  julianDate: number,
  days: number
): number {
  return (
    julianDate +
    days
  );
}

export function addJulianHours(
  julianDate: number,
  hours: number
): number {
  return (
    julianDate +
    hours / 24
  );
}

export function addJulianMinutes(
  julianDate: number,
  minutes: number
): number {
  return (
    julianDate +
    minutes / 1_440
  );
}

/* -------------------------------------------------------------------------- */
/* Epoch utilities                                                            */
/* -------------------------------------------------------------------------- */

export function J2000Epoch(): Epoch {
  return {
    year: 2000,
    month: 1,
    day: 1
  };
}

export function currentJulianDate(): number {
  return dateToJulianDate(
    new Date()
  );
}

export function currentJulianCenturies(): number {
  return julianCenturies(
    currentJulianDate()
  );
}

export function currentSiderealTime(
  longitude = 0
): SiderealTime {
  return siderealTime(
    currentJulianDate(),
    longitude
  );
}

/* -------------------------------------------------------------------------- */
/* Time scale conversion                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Convert a Date interpreted as UTC to a Julian Date.
 */
export function utcToJulianDate(
  date: Date
): JulianDate {
  return {
    value:
      dateToJulianDate(date),

    scale:
      "UTC"
  };
}

export function ttToJulianDate(
  date: Date
): JulianDate {
  const tt =
    utcToTerrestrialTime(
      date
    );

  return {
    value:
      dateToJulianDate(tt),

    scale:
      "TT"
  };
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function formatJulianDate(
  julianDate: number,
  precision = 6
): string {
  return julianDate.toFixed(
    precision
  );
}

export function formatSiderealHours(
  hours: number,
  precision = 3
): string {
  const normalized =
    normalizeHours(hours);

  return normalized.toFixed(
    precision
  );
}

export function formatRightAscension(
  radians: number,
  precision = 2
): string {
  const totalHours =
    normalizeHours(
      radians *
        RAD_TO_HOURS
    );

  const hour =
    Math.floor(
      totalHours
    );

  const minuteFloat =
    (
      totalHours -
      hour
    ) * 60;

  const minute =
    Math.floor(
      minuteFloat
    );

  const second =
    (
      minuteFloat -
      minute
    ) * 60;

  return (
    `${hour.toString().padStart(2, "0")}:` +
    `${minute.toString().padStart(2, "0")}:` +
    `${second.toFixed(precision).padStart(precision + 3, "0")}`
  );
}

export function formatDeclination(
  radians: number,
  precision = 1
): string {
  const degrees =
    radians *
    RAD_TO_DEG;

  const sign =
    degrees < 0
      ? "-"
      : "+";

  const absolute =
    Math.abs(degrees);

  const degree =
    Math.floor(
      absolute
    );

  const minuteFloat =
    (
      absolute -
      degree
    ) * 60;

  const minute =
    Math.floor(
      minuteFloat
    );

  const second =
    (
      minuteFloat -
      minute
    ) * 60;

  return (
    `${sign}` +
    `${degree.toString().padStart(2, "0")}° ` +
    `${minute.toString().padStart(2, "0")}' ` +
    `${second.toFixed(precision)}"`
  );
}

/* -------------------------------------------------------------------------- */
/* Default API                                                                */
/* -------------------------------------------------------------------------- */

export const AstronomyTime = {
  normalizeAngle,

  normalizeHours,

  normalizeDegrees,

  dateToJulianDate,

  julianDateToDate,

  julianToModifiedJulian,

  modifiedJulianToJulian,

  dateToModifiedJulian,

  modifiedJulianToDate,

  julianCenturies,

  julianDateFromCenturies,

  daysSinceJ2000,

  dateToDaysSinceJ2000,

  j2000ToDate,

  unixMillisecondsToJulian,

  julianToUnixMilliseconds,

  unixSecondsToJulian,

  julianToUnixSeconds,

  getTimeComponents,

  decimalYear,

  isLeapYear,

  daysInYear,

  daysInMonth,

  calendarToJulianDate,

  epochToJulianDate,

  julianDateToEpoch,

  julianEpoch,

  epochToJulian,

  differenceInDays,

  differenceInHours,

  differenceInMinutes,

  differenceInSeconds,

  taiMinusUtc,

  utcToTai,

  taiToUtc,

  utcToTerrestrialTime,

  terrestrialTimeToUtc,

  deltaT,

  greenwichMeanSiderealTime,

  greenwichMeanSiderealTimeHours,

  localMeanSiderealTime,

  localMeanSiderealTimeHours,

  siderealTime,

  solarMeanTime,

  astronomicalDate,

  addDays,

  addHours,

  addMinutes,

  addSeconds,

  addJulianDays,

  addJulianHours,

  addJulianMinutes,

  J2000Epoch,

  currentJulianDate,

  currentJulianCenturies,

  currentSiderealTime,

  utcToJulianDate,

  ttToJulianDate,

  formatJulianDate,

  formatSiderealHours,

  formatRightAscension,

  formatDeclination
} as const;

export default AstronomyTime;
