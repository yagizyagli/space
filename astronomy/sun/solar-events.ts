/**
 * Space
 * Astronomy — Solar Events
 *
 * Calculates daily solar events for an observer:
 *
 * - Sunrise
 * - Sunset
 * - Solar noon
 * - Civil dawn / dusk
 * - Nautical dawn / dusk
 * - Astronomical dawn / dusk
 *
 * Times returned by this module are UTC Date instances.
 */

import {
  calculateSolarAltitude
} from "./solar-position";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SolarEventsInput {
  date:
    Date;

  latitude:
    number;

  longitude:
    number;
}

export interface SolarEventPair {
  dawn:
    Date |
    null;

  dusk:
    Date |
    null;
}

export interface SolarEvents {
  sunrise:
    Date |
    null;

  sunset:
    Date |
    null;

  solarNoon:
    Date |
    null;

  civil:
    SolarEventPair;

  nautical:
    SolarEventPair;

  astronomical:
    SolarEventPair;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MINUTES_PER_DAY =
  1_440;

const SOLAR_EVENT_ALTITUDES = {
  sunrise:
    -0.833,

  civil:
    -6,

  nautical:
    -12,

  astronomical:
    -18
} as const;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function calculateSolarEvents(
  input:
    SolarEventsInput
):
  SolarEvents {
  validateInput(
    input
  );

  const dayStart =
    startOfUtcDay(
      input.date
    );

  const sunrise =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.sunrise,
      true
    );

  const sunset =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.sunrise,
      false
    );

  const civilDawn =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.civil,
      true
    );

  const civilDusk =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.civil,
      false
    );

  const nauticalDawn =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.nautical,
      true
    );

  const nauticalDusk =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.nautical,
      false
    );

  const astronomicalDawn =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.astronomical,
      true
    );

  const astronomicalDusk =
    findAltitudeCrossing(
      dayStart,
      input.latitude,
      input.longitude,
      SOLAR_EVENT_ALTITUDES.astronomical,
      false
    );

  const solarNoon =
    findSolarNoon(
      dayStart,
      input.latitude,
      input.longitude
    );

  return {
    sunrise,
    sunset,

    solarNoon,

    civil: {
      dawn:
        civilDawn,
      dusk:
        civilDusk
    },

    nautical: {
      dawn:
        nauticalDawn,
      dusk:
        nauticalDusk
    },

    astronomical: {
      dawn:
        astronomicalDawn,
      dusk:
        astronomicalDusk
    }
  };
}

/**
 * Returns sunrise for a given observer and UTC date.
 */
export function calculateSunrise(
  date:
    Date,
  latitude:
    number,
  longitude:
    number
):
  Date |
  null {
  return calculateSolarEvents({
    date,
    latitude,
    longitude
  }).sunrise;
}

/**
 * Returns sunset for a given observer and UTC date.
 */
export function calculateSunset(
  date:
    Date,
  latitude:
    number,
  longitude:
    number
):
  Date |
  null {
  return calculateSolarEvents({
    date,
    latitude,
    longitude
  }).sunset;
}

/**
 * Returns solar noon for a given observer and UTC date.
 */
export function calculateSolarNoon(
  date:
    Date,
  latitude:
    number,
  longitude:
    number
):
  Date |
  null {
  return calculateSolarEvents({
    date,
    latitude,
    longitude
  }).solarNoon;
}

/* -------------------------------------------------------------------------- */
/* Altitude Crossing                                                          */
/* -------------------------------------------------------------------------- */

function findAltitudeCrossing(
  dayStart:
    Date,
  latitude:
    number,
  longitude:
    number,
  targetAltitude:
    number,
  rising:
    boolean
):
  Date |
  null {
  const stepMinutes =
    10;

  let previousTime =
    new Date(
      dayStart.getTime()
    );

  let previousAltitude =
    calculateSolarAltitude(
      previousTime,
      latitude,
      longitude
    ) -
    targetAltitude;

  for (
    let minute = stepMinutes;
    minute <= MINUTES_PER_DAY;
    minute += stepMinutes
  ) {
    const currentTime =
      new Date(
        dayStart.getTime() +
        minute *
          60_000
      );

    const currentAltitude =
      calculateSolarAltitude(
        currentTime,
        latitude,
        longitude
      ) -
      targetAltitude;

    const crossed =
      rising
        ? previousAltitude <= 0 &&
          currentAltitude >= 0
        : previousAltitude >= 0 &&
          currentAltitude <= 0;

    if (
      crossed
    ) {
      return refineCrossing(
        previousTime,
        currentTime,
        latitude,
        longitude,
        targetAltitude
      );
    }

    previousTime =
      currentTime;

    previousAltitude =
      currentAltitude;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Crossing Refinement                                                        */
/* -------------------------------------------------------------------------- */

function refineCrossing(
  start:
    Date,
  end:
    Date,
  latitude:
    number,
  longitude:
    number,
  targetAltitude:
    number
):
  Date {
  let low =
    start.getTime();

  let high =
    end.getTime();

  for (
    let iteration = 0;
    iteration < 25;
    iteration++
  ) {
    const middle =
      (
        low +
        high
      ) /
      2;

    const altitude =
      calculateSolarAltitude(
        new Date(
          middle
        ),
        latitude,
        longitude
      ) -
      targetAltitude;

    const lowAltitude =
      calculateSolarAltitude(
        new Date(
          low
        ),
        latitude,
        longitude
      ) -
      targetAltitude;

    if (
      sameSign(
        lowAltitude,
        altitude
      )
    ) {
      low =
        middle;
    } else {
      high =
        middle;
    }
  }

  return new Date(
    (
      low +
      high
    ) /
    2
  );
}

/* -------------------------------------------------------------------------- */
/* Solar Noon                                                                 */
/* -------------------------------------------------------------------------- */

function findSolarNoon(
  dayStart:
    Date,
  latitude:
    number,
  longitude:
    number
):
  Date |
  null {
  let bestTime:
    Date |
    null =
    null;

  let bestAltitude =
    -Infinity;

  /*
   * Solar noon is the moment of maximum solar altitude.
   * A coarse search followed by local refinement keeps this
   * calculation independent from a timezone database.
   */
  for (
    let minute = 0;
    minute < MINUTES_PER_DAY;
    minute += 10
  ) {
    const time =
      new Date(
        dayStart.getTime() +
        minute *
          60_000
      );

    const altitude =
      calculateSolarAltitude(
        time,
        latitude,
        longitude
      );

    if (
      altitude >
      bestAltitude
    ) {
      bestAltitude =
        altitude;

      bestTime =
        time;
    }
  }

  if (
    bestTime ===
    null
  ) {
    return null;
  }

  let low =
    bestTime.getTime() -
    10 *
      60_000;

  let high =
    bestTime.getTime() +
    10 *
      60_000;

  /*
   * Ternary-style refinement around the local maximum.
   */
  for (
    let iteration = 0;
    iteration < 30;
    iteration++
  ) {
    const left =
      low +
      (
        high -
        low
      ) /
      3;

    const right =
      high -
      (
        high -
        low
      ) /
      3;

    const leftAltitude =
      calculateSolarAltitude(
        new Date(
          left
        ),
        latitude,
        longitude
      );

    const rightAltitude =
      calculateSolarAltitude(
        new Date(
          right
        ),
        latitude,
        longitude
      );

    if (
      leftAltitude <
      rightAltitude
    ) {
      low =
        left;
    } else {
      high =
        right;
    }
  }

  return new Date(
    (
      low +
      high
    ) /
    2
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateInput(
  input:
    SolarEventsInput
):
  void {
  if (
    !(
      input.date instanceof
      Date
    ) ||
    Number.isNaN(
      input.date.getTime()
    )
  ) {
    throw new TypeError(
      "Solar events require a valid Date."
    );
  }

  if (
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    throw new RangeError(
      "Latitude must be between -90 and 90 degrees."
    );
  }

  if (
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    throw new RangeError(
      "Longitude must be between -180 and 180 degrees."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function startOfUtcDay(
  date:
    Date
):
  Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );
}

function sameSign(
  a:
    number,
  b:
    number
):
  boolean {
  return (
    (
      a < 0 &&
      b < 0
    ) ||
    (
      a >= 0 &&
      b >= 0
    )
  );
}

export default calculateSolarEvents;
