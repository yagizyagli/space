/**
 * Space
 * Astronomy Observer
 *
 * Observer and Earth-location utilities.
 *
 * Responsibilities:
 * - Observer geographic position
 * - Horizon / zenith / nadir
 * - Meridian
 * - Local sidereal time
 * - Equatorial -> horizontal conversion
 * - Horizontal -> equatorial conversion
 * - Rise / set approximations
 * - Visibility calculations
 * - Circumpolar checks
 * - Altitude / azimuth helpers
 */

import {
  DEG_TO_RAD,
  RAD_TO_DEG,
  RAD_TO_HOURS,
  dateToJulianDate,
  localMeanSiderealTime,
  localMeanSiderealTimeHours,
  normalizeAngle,
  normalizeHours
} from "./time";

import {
  EquatorialCoordinate,
  HorizontalCoordinate,
  equatorialToHorizontal,
  horizontalToEquatorial,
  angularDistance
} from "./coordinates";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const EARTH_RADIUS_KM =
  6378.137;

export const EARTH_MEAN_RADIUS_KM =
  6371.0088;

export const STANDARD_REFRACTION_ALTITUDE =
  -0.833 * DEG_TO_RAD;

export const SUN_RISE_SET_ALTITUDE =
  -0.833 * DEG_TO_RAD;

export const CIVIL_TWILIGHT_ALTITUDE =
  -6 * DEG_TO_RAD;

export const NAUTICAL_TWILIGHT_ALTITUDE =
  -12 * DEG_TO_RAD;

export const ASTRONOMICAL_TWILIGHT_ALTITUDE =
  -18 * DEG_TO_RAD;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface ObserverOptions {
  location: ObserverLocation;
  date?: Date;
}

export interface ObserverState {
  location: ObserverLocation;
  date: Date;
  julianDate: number;

  localSiderealTime: number;
  localSiderealTimeHours: number;

  latitude: number;
  longitude: number;
  elevation: number;
}

export interface RiseSetResult {
  rise: Date | null;
  set: Date | null;

  riseJulianDate: number | null;
  setJulianDate: number | null;

  alwaysAbove: boolean;
  alwaysBelow: boolean;
}

export interface VisibilityResult {
  altitude: number;
  azimuth: number;

  altitudeDegrees: number;
  azimuthDegrees: number;

  aboveHorizon: boolean;
  visible: boolean;

  hourAngle: number;
  hourAngleHours: number;
}

export interface HorizonCoordinate {
  altitude: number;
  azimuth: number;
}

export interface MeridianInfo {
  hourAngle: number;
  transitInHours: number;
  isUpperTransit: boolean;
}

export interface ObserverVector {
  x: number;
  y: number;
  z: number;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validateLatitude(
  latitude: number
): number {
  if (
    !Number.isFinite(latitude)
  ) {
    throw new Error(
      "Latitude must be a finite number."
    );
  }

  return Math.max(
    -Math.PI / 2,
    Math.min(
      Math.PI / 2,
      latitude
    )
  );
}

export function validateLongitude(
  longitude: number
): number {
  if (
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      "Longitude must be a finite number."
    );
  }

  return normalizeSignedAngle(
    longitude
  );
}

export function validateElevation(
  elevation = 0
): number {
  if (
    !Number.isFinite(elevation)
  ) {
    return 0;
  }

  return elevation;
}

export function normalizeSignedAngle(
  angle: number
): number {
  const normalized =
    normalizeAngle(angle);

  return normalized > Math.PI
    ? normalized - Math.PI * 2
    : normalized;
}

/* -------------------------------------------------------------------------- */
/* Observer location                                                          */
/* -------------------------------------------------------------------------- */

export function createObserverLocation(
  latitude: number,
  longitude: number,
  elevation = 0
): ObserverLocation {
  return {
    latitude:
      validateLatitude(latitude),

    longitude:
      validateLongitude(longitude),

    elevation:
      validateElevation(elevation)
  };
}

export function createObserverFromDegrees(
  latitude: number,
  longitude: number,
  elevation = 0
): ObserverLocation {
  return createObserverLocation(
    latitude * DEG_TO_RAD,
    longitude * DEG_TO_RAD,
    elevation
  );
}

export function locationToDegrees(
  location: ObserverLocation
): {
  latitude: number;
  longitude: number;
  elevation: number;
} {
  return {
    latitude:
      location.latitude *
      RAD_TO_DEG,

    longitude:
      location.longitude *
      RAD_TO_DEG,

    elevation:
      location.elevation ?? 0
  };
}

/* -------------------------------------------------------------------------- */
/* Observer state                                                             */
/* -------------------------------------------------------------------------- */

export function createObserver(
  options: ObserverOptions
): ObserverState {
  const date =
    options.date
      ? new Date(
          options.date.getTime()
        )
      : new Date();

  const location =
    createObserverLocation(
      options.location.latitude,
      options.location.longitude,
      options.location.elevation
    );

  const julianDate =
    dateToJulianDate(date);

  const lst =
    localMeanSiderealTime(
      julianDate,
      location.longitude
    );

  return {
    location,

    date,

    julianDate,

    localSiderealTime:
      lst,

    localSiderealTimeHours:
      normalizeHours(
        lst *
          RAD_TO_HOURS
      ),

    latitude:
      location.latitude,

    longitude:
      location.longitude,

    elevation:
      location.elevation ?? 0
  };
}

/* -------------------------------------------------------------------------- */
/* State updates                                                              */
/* -------------------------------------------------------------------------- */

export function updateObserverDate(
  observer: ObserverState,
  date: Date
): ObserverState {
  return createObserver({
    location:
      observer.location,

    date
  });
}

export function updateObserverLocation(
  observer: ObserverState,
  location: ObserverLocation
): ObserverState {
  return createObserver({
    location,

    date:
      observer.date
  });
}

/* -------------------------------------------------------------------------- */
/* Local sidereal time                                                        */
/* -------------------------------------------------------------------------- */

export function observerSiderealTime(
  observer: ObserverState
): number {
  return localMeanSiderealTime(
    observer.julianDate,
    observer.longitude
  );
}

export function observerSiderealTimeHours(
  observer: ObserverState
): number {
  return normalizeHours(
    observerSiderealTime(observer) *
      RAD_TO_HOURS
  );
}

/* -------------------------------------------------------------------------- */
/* Equatorial -> horizontal                                                   */
/* -------------------------------------------------------------------------- */

export function observe(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): VisibilityResult {
  const horizontal =
    equatorialToHorizontal(
      coordinate,
      {
        latitude:
          observer.latitude,

        localSiderealTime:
          observer.localSiderealTime
      }
    );

  const hourAngle =
    normalizeSignedAngle(
      observer.localSiderealTime -
      coordinate.rightAscension
    );

  const altitudeDegrees =
    horizontal.altitude *
    RAD_TO_DEG;

  const azimuthDegrees =
    normalizeAngle(
      horizontal.azimuth
    ) *
    RAD_TO_DEG;

  return {
    altitude:
      horizontal.altitude,

    azimuth:
      horizontal.azimuth,

    altitudeDegrees,

    azimuthDegrees,

    aboveHorizon:
      horizontal.altitude >= 0,

    visible:
      horizontal.altitude >=
      STANDARD_REFRACTION_ALTITUDE,

    hourAngle,

    hourAngleHours:
      hourAngle *
      RAD_TO_HOURS
  };
}

/* -------------------------------------------------------------------------- */
/* Horizontal -> equatorial                                                   */
/* -------------------------------------------------------------------------- */

export function unobserve(
  observer: ObserverState,
  coordinate: HorizontalCoordinate
): EquatorialCoordinate {
  return horizontalToEquatorial(
    coordinate,
    {
      latitude:
        observer.latitude,

      localSiderealTime:
        observer.localSiderealTime
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Horizon helpers                                                            */
/* -------------------------------------------------------------------------- */

export function zenith(
  observer: ObserverState
): HorizontalCoordinate {
  return {
    altitude:
      Math.PI / 2,

    azimuth:
      0
  };
}

export function nadir(
  observer: ObserverState
): HorizontalCoordinate {
  return {
    altitude:
      -Math.PI / 2,

    azimuth:
      0
  };
}

export function horizon(
  azimuth: number
): HorizontalCoordinate {
  return {
    altitude: 0,

    azimuth:
      normalizeAngle(
        azimuth
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Cardinal directions                                                        */
/* -------------------------------------------------------------------------- */

export const CARDINAL_AZIMUTHS = {
  north: 0,

  east:
    Math.PI / 2,

  south:
    Math.PI,

  west:
    Math.PI * 1.5
} as const;

export function azimuthToCardinal(
  azimuth: number
): string {
  const degrees =
    normalizeAngle(azimuth) *
    RAD_TO_DEG;

  if (
    degrees >= 337.5 ||
    degrees < 22.5
  ) {
    return "N";
  }

  if (
    degrees < 67.5
  ) {
    return "NE";
  }

  if (
    degrees < 112.5
  ) {
    return "E";
  }

  if (
    degrees < 157.5
  ) {
    return "SE";
  }

  if (
    degrees < 202.5
  ) {
    return "S";
  }

  if (
    degrees < 247.5
  ) {
    return "SW";
  }

  if (
    degrees < 292.5
  ) {
    return "W";
  }

  return "NW";
}

/* -------------------------------------------------------------------------- */
/* Hour angle                                                                  */
/* -------------------------------------------------------------------------- */

export function hourAngle(
  observer: ObserverState,
  rightAscension: number
): number {
  return normalizeSignedAngle(
    observer.localSiderealTime -
    rightAscension
  );
}

export function hourAngleHours(
  observer: ObserverState,
  rightAscension: number
): number {
  return (
    hourAngle(
      observer,
      rightAscension
    ) *
    RAD_TO_HOURS
  );
}

/* -------------------------------------------------------------------------- */
/* Meridian                                                                    */
/* -------------------------------------------------------------------------- */

export function meridianInfo(
  observer: ObserverState,
  rightAscension: number
): MeridianInfo {
  const ha =
    hourAngle(
      observer,
      rightAscension
    );

  const hoursUntilTransit =
    normalizeHours(
      -ha *
        RAD_TO_HOURS
    );

  return {
    hourAngle:
      ha,

    transitInHours:
      hoursUntilTransit,

    isUpperTransit:
      Math.abs(ha) <
      1e-8
  };
}

/* -------------------------------------------------------------------------- */
/* Transit altitude                                                           */
/* -------------------------------------------------------------------------- */

export function transitAltitude(
  observer: ObserverState,
  declination: number
): number {
  return Math.asin(
    clamp(
      Math.sin(
        observer.latitude
      ) *
        Math.sin(
          declination
        ) +
      Math.cos(
        observer.latitude
      ) *
        Math.cos(
          declination
        ),
      -1,
      1
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Rise / set                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Approximate rise/set hour angle.
 *
 * altitude is the desired horizon altitude.
 */
export function riseSetHourAngle(
  latitude: number,
  declination: number,
  altitude =
    STANDARD_REFRACTION_ALTITUDE
): number | null {
  const cosH =
    (
      Math.sin(altitude) -
      Math.sin(latitude) *
        Math.sin(declination)
    ) /
    (
      Math.cos(latitude) *
      Math.cos(declination)
    );

  if (
    cosH < -1
  ) {
    return Math.PI;
  }

  if (
    cosH > 1
  ) {
    return null;
  }

  return Math.acos(
    clamp(
      cosH,
      -1,
      1
    )
  );
}

/**
 * Approximate rise/set times.
 *
 * Uses the object's right ascension and declination
 * at the supplied date.
 */
export function calculateRiseSet(
  observer: ObserverState,
  coordinate: EquatorialCoordinate,
  altitude =
    STANDARD_REFRACTION_ALTITUDE
): RiseSetResult {
  const H =
    riseSetHourAngle(
      observer.latitude,
      coordinate.declination,
      altitude
    );

  if (
    H === Math.PI
  ) {
    return {
      rise: null,
      set: null,

      riseJulianDate: null,
      setJulianDate: null,

      alwaysAbove: true,
      alwaysBelow: false
    };
  }

  if (
    H === null
  ) {
    return {
      rise: null,
      set: null,

      riseJulianDate: null,
      setJulianDate: null,

      alwaysAbove: false,
      alwaysBelow: true
    };
  }

  const transit =
    normalizeAngle(
      coordinate.rightAscension -
      observer.localSiderealTime
    );

  const riseHourAngle =
    -H;

  const setHourAngle =
    H;

  const riseSidereal =
    normalizeAngle(
      observer.localSiderealTime +
      (
        riseHourAngle -
        (
          observer.localSiderealTime -
          coordinate.rightAscension
        )
      )
    );

  const setSidereal =
    normalizeAngle(
      observer.localSiderealTime +
      (
        setHourAngle -
        (
          observer.localSiderealTime -
          coordinate.rightAscension
        )
      )
    );

  const siderealDayFactor =
    1 / 1.00273790935;

  const riseHours =
    normalizeAngle(
      riseSidereal -
      observer.localSiderealTime
    ) *
    RAD_TO_HOURS *
    siderealDayFactor;

  const setHours =
    normalizeAngle(
      setSidereal -
      observer.localSiderealTime
    ) *
    RAD_TO_HOURS *
    siderealDayFactor;

  const rise =
    new Date(
      observer.date.getTime() +
      riseHours *
        60 *
        60 *
        1000
    );

  const set =
    new Date(
      observer.date.getTime() +
      setHours *
        60 *
        60 *
        1000
    );

  return {
    rise,

    set,

    riseJulianDate:
      dateToJulianDate(
        rise
      ),

    setJulianDate:
      dateToJulianDate(
        set
      ),

    alwaysAbove: false,

    alwaysBelow: false
  };
}

/* -------------------------------------------------------------------------- */
/* Visibility                                                                  */
/* -------------------------------------------------------------------------- */

export function isAboveHorizon(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): boolean {
  return observe(
    observer,
    coordinate
  ).aboveHorizon;
}

export function isVisible(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): boolean {
  return observe(
    observer,
    coordinate
  ).visible;
}

export function altitude(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): number {
  return observe(
    observer,
    coordinate
  ).altitude;
}

export function altitudeDegrees(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): number {
  return observe(
    observer,
    coordinate
  ).altitudeDegrees;
}

export function azimuth(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): number {
  return observe(
    observer,
    coordinate
  ).azimuth;
}

export function azimuthDegrees(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): number {
  return observe(
    observer,
    coordinate
  ).azimuthDegrees;
}

/* -------------------------------------------------------------------------- */
/* Circumpolar objects                                                        */
/* -------------------------------------------------------------------------- */

export function isCircumpolar(
  latitude: number,
  declination: number
): boolean {
  const sameHemisphere =
    latitude *
      declination >
    0;

  const threshold =
    Math.PI / 2 -
    Math.abs(latitude);

  return (
    sameHemisphere &&
    Math.abs(declination) >=
      threshold
  );
}

export function neverRises(
  latitude: number,
  declination: number
): boolean {
  return (
    Math.abs(
      latitude +
      declination
    ) <
    Math.PI / 2
  ) === false &&
    !isCircumpolar(
      latitude,
      declination
    );
}

/* -------------------------------------------------------------------------- */
/* Atmospheric refraction                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Approximate atmospheric refraction in radians.
 *
 * Input altitude is radians.
 *
 * Formula is intended for normal visual
 * sky-map rendering rather than precision astronomy.
 */
export function atmosphericRefraction(
  altitude: number
): number {
  const degrees =
    altitude *
    RAD_TO_DEG;

  if (
    degrees < -1 ||
    degrees > 90
  ) {
    return 0;
  }

  const refractionArcMinutes =
    1.02 /
    Math.tan(
      (
        degrees +
        10.3 /
          (
            degrees +
            5.11
          )
      ) *
      DEG_TO_RAD
    );

  return (
    refractionArcMinutes /
    60 *
    DEG_TO_RAD
  );
}

export function apparentAltitude(
  altitude: number
): number {
  return (
    altitude +
    atmosphericRefraction(
      altitude
    )
  );
}

export function geometricAltitude(
  apparentAltitudeValue: number
): number {
  const degrees =
    apparentAltitudeValue *
    RAD_TO_DEG;

  if (
    degrees < -1 ||
    degrees > 90
  ) {
    return apparentAltitudeValue;
  }

  const refraction =
    atmosphericRefraction(
      apparentAltitudeValue
    );

  return (
    apparentAltitudeValue -
    refraction
  );
}

/* -------------------------------------------------------------------------- */
/* Observer Earth-centered vector                                             */
/* -------------------------------------------------------------------------- */

export function observerEarthRadius(
  latitude: number,
  elevation = 0
): number {
  /**
   * WGS84 approximation.
   *
   * Result in kilometers.
   */
  const a =
    6378.137;

  const b =
    6356.752314245;

  const sinLat =
    Math.sin(latitude);

  const cosLat =
    Math.cos(latitude);

  const a2 =
    a * a;

  const b2 =
    b * b;

  const numerator =
    Math.sqrt(
      a2 * a2 *
        cosLat *
        cosLat +
      b2 * b2 *
        sinLat *
        sinLat
    );

  const denominator =
    Math.sqrt(
      a2 *
        cosLat *
        cosLat +
      b2 *
        sinLat *
        sinLat
    );

  return (
    numerator /
    denominator +
    elevation / 1000
  );
}

export function observerVector(
  observer: ObserverState
): ObserverVector {
  const radius =
    observerEarthRadius(
      observer.latitude,
      observer.elevation
    );

  return {
    x:
      radius *
      Math.cos(
        observer.latitude
      ) *
      Math.cos(
        observer.localSiderealTime
      ),

    y:
      radius *
      Math.cos(
        observer.latitude
      ) *
      Math.sin(
        observer.localSiderealTime
      ),

    z:
      radius *
      Math.sin(
        observer.latitude
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Angular separation from zenith                                             */
/* -------------------------------------------------------------------------- */

export function zenithDistance(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): number {
  const result =
    observe(
      observer,
      coordinate
    );

  return (
    Math.PI / 2 -
    result.altitude
  );
}

export function zenithDistanceDegrees(
  observer: ObserverState,
  coordinate: EquatorialCoordinate
): number {
  return (
    zenithDistance(
      observer,
      coordinate
    ) *
    RAD_TO_DEG
  );
}

/* -------------------------------------------------------------------------- */
/* Twilight helpers                                                           */
/* -------------------------------------------------------------------------- */

export function isCivilTwilight(
  altitude: number
): boolean {
  return (
    altitude >=
      CIVIL_TWILIGHT_ALTITUDE &&
    altitude < 0
  );
}

export function isNauticalTwilight(
  altitude: number
): boolean {
  return (
    altitude >=
      NAUTICAL_TWILIGHT_ALTITUDE &&
    altitude <
      CIVIL_TWILIGHT_ALTITUDE
  );
}

export function isAstronomicalTwilight(
  altitude: number
): boolean {
  return (
    altitude >=
      ASTRONOMICAL_TWILIGHT_ALTITUDE &&
    altitude <
      NAUTICAL_TWILIGHT_ALTITUDE
  );
}

export function isNight(
  altitude: number
): boolean {
  return (
    altitude <
    ASTRONOMICAL_TWILIGHT_ALTITUDE
  );
}

/* -------------------------------------------------------------------------- */
/* Coordinate helpers                                                         */
/* -------------------------------------------------------------------------- */

export function equatorialDistance(
  a: EquatorialCoordinate,
  b: EquatorialCoordinate
): number {
  return angularDistance(
    a,
    b
  );
}

export function equatorialDistanceDegrees(
  a: EquatorialCoordinate,
  b: EquatorialCoordinate
): number {
  return (
    equatorialDistance(
      a,
      b
    ) *
    RAD_TO_DEG
  );
}

/* -------------------------------------------------------------------------- */
/* Default API                                                                */
/* -------------------------------------------------------------------------- */

export const Observer = {
  createObserverLocation,

  createObserverFromDegrees,

  locationToDegrees,

  createObserver,

  updateObserverDate,

  updateObserverLocation,

  observerSiderealTime,

  observerSiderealTimeHours,

  observe,

  unobserve,

  zenith,

  nadir,

  horizon,

  azimuthToCardinal,

  hourAngle,

  hourAngleHours,

  meridianInfo,

  transitAltitude,

  riseSetHourAngle,

  calculateRiseSet,

  isAboveHorizon,

  isVisible,

  altitude,

  altitudeDegrees,

  azimuth,

  azimuthDegrees,

  isCircumpolar,

  neverRises,

  atmosphericRefraction,

  apparentAltitude,

  geometricAltitude,

  observerEarthRadius,

  observerVector,

  zenithDistance,

  zenithDistanceDegrees,

  isCivilTwilight,

  isNauticalTwilight,

  isAstronomicalTwilight,

  isNight,

  equatorialDistance,

  equatorialDistanceDegrees
} as const;

export default Observer;
