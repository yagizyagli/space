/**
 * Space
 * Time API
 *
 * High-level astronomical time utilities.
 *
 * This module provides a single public-facing API over:
 * - Julian Date
 * - Modified Julian Date
 * - Julian/Besselian epochs
 * - Sidereal time
 * - Simulation clocks
 */

import {
  dateToJulianDate,
  julianDateToDate,
  calendarToJulianDate,
  julianDateToCalendar,
  julianDateToJulianCenturies,
  julianCenturiesToJulianDate,
  julianDateToModifiedJulianDate,
  modifiedJulianDateToJulianDate,
  daysSinceJ2000,
  addJulianDays,
  julianDateDifference,
  isValidJulianDate,
  JULIAN_DATE_J2000
} from "./julian";

import {
  greenwichMeanSiderealTime,
  greenwichMeanSiderealTimeHours,
  greenwichApparentSiderealTime,
  greenwichApparentSiderealTimeHours,
  localMeanSiderealTime,
  localMeanSiderealTimeHours,
  localApparentSiderealTime,
  localApparentSiderealTimeHours,
  hourAngle,
  hourAngleHours,
  siderealHoursToRadians,
  radiansToSiderealHours,
  earthRotationAngle
} from "./sidereal";

import {
  julianEpoch,
  besselianEpoch,
  epochFromJulianDate,
  convertEpoch,
  julianEpochToJulianDate,
  julianDateToJulianEpoch,
  besselianEpochToJulianDate,
  julianDateToBesselianEpoch,
  formatEpoch,
  EPOCH_J2000,
  EPOCH_J2050,
  EPOCH_J1900,
  EPOCH_B1950,
  type Epoch,
  type EpochType
} from "./epochs";

import {
  SimulationClock,
  RealTimeClock,
  createSimulationClock,
  createLiveClock,
  type ClockOptions,
  type ClockSnapshot,
  type ClockState,
  type ClockDirection
} from "./clocks";

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

export interface AstronomicalTime {
  readonly julianDate: number;

  readonly modifiedJulianDate: number;

  readonly julianCenturies: number;

  readonly daysSinceJ2000: number;

  readonly date: Date;
}

/* -------------------------------------------------------------------------- */
/* Current time                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Get the current UTC time as an astronomical time object.
 */
export function now(): AstronomicalTime {
  return fromDate(
    new Date()
  );
}

/**
 * Create astronomical time from a JavaScript Date.
 */
export function fromDate(
  date: Date
): AstronomicalTime {
  const julianDate =
    dateToJulianDate(date);

  return createAstronomicalTime(
    julianDate
  );
}

/**
 * Create astronomical time directly from Julian Date.
 */
export function fromJulianDate(
  julianDate: number
): AstronomicalTime {
  if (
    !isValidJulianDate(
      julianDate
    )
  ) {
    throw new Error(
      "Invalid Julian Date."
    );
  }

  return createAstronomicalTime(
    julianDate
  );
}

/* -------------------------------------------------------------------------- */
/* Calendar                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Create astronomical time from calendar components.
 *
 * All components are interpreted as UTC.
 */
export function fromCalendar(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): AstronomicalTime {
  return fromJulianDate(
    calendarToJulianDate(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    )
  );
}

/**
 * Convert astronomical time back to Date.
 */
export function toDate(
  time: AstronomicalTime
): Date {
  return julianDateToDate(
    time.julianDate
  );
}

/**
 * Convert astronomical time to calendar components.
 */
export function toCalendar(
  time: AstronomicalTime
) {
  return julianDateToCalendar(
    time.julianDate
  );
}

/* -------------------------------------------------------------------------- */
/* Julian Date                                                                 */
/* -------------------------------------------------------------------------- */

export {
  dateToJulianDate,
  julianDateToDate,
  calendarToJulianDate,
  julianDateToCalendar,
  julianDateToJulianCenturies,
  julianCenturiesToJulianDate,
  julianDateToModifiedJulianDate,
  modifiedJulianDateToJulianDate,
  daysSinceJ2000,
  addJulianDays,
  julianDateDifference,
  isValidJulianDate,
  JULIAN_DATE_J2000
};

/* -------------------------------------------------------------------------- */
/* Sidereal time                                                               */
/* -------------------------------------------------------------------------- */

export {
  greenwichMeanSiderealTime,
  greenwichMeanSiderealTimeHours,
  greenwichApparentSiderealTime,
  greenwichApparentSiderealTimeHours,
  localMeanSiderealTime,
  localMeanSiderealTimeHours,
  localApparentSiderealTime,
  localApparentSiderealTimeHours,
  hourAngle,
  hourAngleHours,
  siderealHoursToRadians,
  radiansToSiderealHours,
  earthRotationAngle
};

/**
 * Calculate the complete sidereal-time set for a given
 * Julian Date and observer longitude.
 */
export function siderealTime(
  julianDate: number,
  longitude = 0
) {
  return {
    gmst:
      greenwichMeanSiderealTime(
        julianDate
      ),

    gmstHours:
      greenwichMeanSiderealTimeHours(
        julianDate
      ),

    gast:
      greenwichApparentSiderealTime(
        julianDate
      ),

    gastHours:
      greenwichApparentSiderealTimeHours(
        julianDate
      ),

    lst:
      localMeanSiderealTime(
        julianDate,
        longitude
      ),

    lstHours:
      localMeanSiderealTimeHours(
        julianDate,
        longitude
      ),

    last:
      localApparentSiderealTime(
        julianDate,
        longitude
      ),

    lastHours:
      localApparentSiderealTimeHours(
        julianDate,
        longitude
      ),

    earthRotationAngle:
      earthRotationAngle(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Epochs                                                                      */
/* -------------------------------------------------------------------------- */

export {
  julianEpoch,
  besselianEpoch,
  epochFromJulianDate,
  convertEpoch,
  julianEpochToJulianDate,
  julianDateToJulianEpoch,
  besselianEpochToJulianDate,
  julianDateToBesselianEpoch,
  formatEpoch,
  EPOCH_J2000,
  EPOCH_J2050,
  EPOCH_J1900,
  EPOCH_B1950
};

export type {
  Epoch,
  EpochType
};

/* -------------------------------------------------------------------------- */
/* Epoch helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Return the current Julian epoch.
 */
export function currentJulianEpoch(): number {
  return julianDateToJulianEpoch(
    dateToJulianDate(
      new Date()
    )
  );
}

/**
 * Return the current Besselian epoch.
 */
export function currentBesselianEpoch(): number {
  return julianDateToBesselianEpoch(
    dateToJulianDate(
      new Date()
    )
  );
}

/**
 * Get a standard epoch by name.
 */
export function standardEpoch(
  name:
    | "J1900"
    | "B1950"
    | "J2000"
    | "J2050"
): Epoch {
  switch (name) {
    case "J1900":
      return EPOCH_J1900;

    case "B1950":
      return EPOCH_B1950;

    case "J2050":
      return EPOCH_J2050;

    case "J2000":
    default:
      return EPOCH_J2000;
  }
}

/* -------------------------------------------------------------------------- */
/* Time arithmetic                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Add seconds to astronomical time.
 */
export function addSeconds(
  time: AstronomicalTime,
  seconds: number
): AstronomicalTime {
  return fromJulianDate(
    time.julianDate +
    seconds /
    86_400
  );
}

/**
 * Add minutes to astronomical time.
 */
export function addMinutes(
  time: AstronomicalTime,
  minutes: number
): AstronomicalTime {
  return addSeconds(
    time,
    minutes * 60
  );
}

/**
 * Add hours to astronomical time.
 */
export function addHours(
  time: AstronomicalTime,
  hours: number
): AstronomicalTime {
  return addSeconds(
    time,
    hours * 3_600
  );
}

/**
 * Add days to astronomical time.
 */
export function addDays(
  time: AstronomicalTime,
  days: number
): AstronomicalTime {
  return fromJulianDate(
    addJulianDays(
      time.julianDate,
      days
    )
  );
}

/**
 * Difference between two astronomical times in days.
 */
export function differenceInDays(
  first: AstronomicalTime,
  second: AstronomicalTime
): number {
  return julianDateDifference(
    first.julianDate,
    second.julianDate
  );
}

/**
 * Difference between two astronomical times in seconds.
 */
export function differenceInSeconds(
  first: AstronomicalTime,
  second: AstronomicalTime
): number {
  return (
    differenceInDays(
      first,
      second
    ) *
    86_400
  );
}

/* -------------------------------------------------------------------------- */
/* Clock exports                                                              */
/* -------------------------------------------------------------------------- */

export {
  SimulationClock,
  RealTimeClock,
  createSimulationClock,
  createLiveClock
};

export type {
  ClockOptions,
  ClockSnapshot,
  ClockState,
  ClockDirection
};

/* -------------------------------------------------------------------------- */
/* Internal factory                                                            */
/* -------------------------------------------------------------------------- */

function createAstronomicalTime(
  julianDate: number
): AstronomicalTime {
  return {
    julianDate,

    modifiedJulianDate:
      julianDateToModifiedJulianDate(
        julianDate
      ),

    julianCenturies:
      julianDateToJulianCenturies(
        julianDate
      ),

    daysSinceJ2000:
      daysSinceJ2000(
        julianDate
      ),

    date:
      julianDateToDate(
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Default time API                                                            */
/* -------------------------------------------------------------------------- */

export const Time = {
  now,

  fromDate,

  fromJulianDate,

  fromCalendar,

  toDate,

  toCalendar,

  siderealTime,

  currentJulianEpoch,

  currentBesselianEpoch,

  standardEpoch,

  addSeconds,

  addMinutes,

  addHours,

  addDays,

  differenceInDays,

  differenceInSeconds,

  createSimulationClock,

  createLiveClock
} as const;
