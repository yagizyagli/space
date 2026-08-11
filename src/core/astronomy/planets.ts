/**
 * Space
 * Planetary Astronomy
 *
 * Low-dependency analytical planetary position engine.
 *
 * Provides:
 * - Orbital elements
 * - Heliocentric ecliptic coordinates
 * - Geocentric ecliptic coordinates
 * - Equatorial coordinates
 * - Planetary distance
 * - Orbital velocity approximation
 * - Phase angle
 * - Angular diameter
 * - Planet visibility helpers
 *
 * Coordinate conventions:
 * - Angles are radians unless explicitly stated otherwise.
 * - Distances are astronomical units (AU) unless explicitly stated otherwise.
 * - Julian Date is the primary time argument.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const JULIAN_J2000 =
  2_451_545.0;

export const ASTRONOMICAL_UNIT_KM =
  149_597_870.7;

export const EARTH_RADIUS_KM =
  6_378.137;

const TWO_PI =
  Math.PI * 2;

const DEG_TO_RAD =
  Math.PI / 180;

const RAD_TO_DEG =
  180 / Math.PI;

const DAY_SECONDS =
  86_400;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PlanetName =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export interface OrbitalElement {
  a: number;
  e: number;
  I: number;
  L: number;
  longPeri: number;
  longNode: number;

  da: number;
  de: number;
  dI: number;
  dL: number;
  dLongPeri: number;
  dLongNode: number;
}

export interface HeliocentricCoordinates {
  x: number;
  y: number;
  z: number;

  longitude: number;
  latitude: number;

  distance: number;
}

export interface GeocentricCoordinates {
  x: number;
  y: number;
  z: number;

  longitude: number;
  latitude: number;

  distance: number;
}

export interface PlanetEquatorialCoordinates {
  rightAscension: number;
  declination: number;

  distance: number;
}

export interface PlanetPosition {
  planet: PlanetName;

  julianDate: number;

  heliocentric:
    HeliocentricCoordinates;

  geocentric:
    GeocentricCoordinates;

  equatorial:
    PlanetEquatorialCoordinates;

  phaseAngle: number;

  elongation: number;

  angularDiameter: number;

  orbitalPeriodDays: number;

  meanAnomaly: number;

  orbitalVelocityKmPerSecond: number;
}

export interface PlanetaryOrbit {
  semiMajorAxisAU: number;

  eccentricity: number;

  inclination: number;

  longitudeOfAscendingNode: number;

  longitudeOfPerihelion: number;

  meanLongitude: number;

  orbitalPeriodDays: number;
}

/* -------------------------------------------------------------------------- */
/* Planetary elements                                                          */
/*                                                                            */
/* Values are compact J2000-style mean orbital elements.                     */
/* They are intentionally kept lightweight for real-time visualization.      */
/* -------------------------------------------------------------------------- */

const PLANETARY_ELEMENTS:
  Record<PlanetName, OrbitalElement> = {
    mercury: {
      a: 0.38709927,
      e: 0.20563593,
      I: 7.00497902,
      L: 252.2503235,
      longPeri: 77.45779628,
      longNode: 48.33076593,

      da: 0.00000037,
      de: 0.00001906,
      dI: -0.00594749,
      dL: 149472.67411175,
      dLongPeri: 0.16047689,
      dLongNode: -0.12534081
    },

    venus: {
      a: 0.72333566,
      e: 0.00677672,
      I: 3.39467605,
      L: 181.9790995,
      longPeri: 131.6024672,
      longNode: 76.67984255,

      da: 0.0000039,
      de: -0.00004107,
      dI: -0.0007889,
      dL: 58517.81538729,
      dLongPeri: 0.00268329,
      dLongNode: -0.27769418
    },

    earth: {
      a: 1.00000261,
      e: 0.01671123,
      I: -0.00001531,
      L: 100.4645717,
      longPeri: 102.9376819,
      longNode: 0,

      da: 0.00000562,
      de: -0.00004392,
      dI: -0.01294668,
      dL: 35999.37244981,
      dLongPeri: 0.32327364,
      dLongNode: 0
    },

    mars: {
      a: 1.52371034,
      e: 0.0933941,
      I: 1.84969142,
      L: -4.55343205,
      longPeri: -23.94362959,
      longNode: 49.55953891,

      da: 0.00001847,
      de: 0.00007882,
      dI: -0.00813131,
      dL: 19140.30268499,
      dLongPeri: 0.44441088,
      dLongNode: -0.29257343
    },

    jupiter: {
      a: 5.202887,
      e: 0.04838624,
      I: 1.30439695,
      L: 34.39644051,
      longPeri: 14.72847983,
      longNode: 100.4739091,

      da: -0.00011607,
      de: -0.00013253,
      dI: -0.00183714,
      dL: 3034.74612775,
      dLongPeri: 0.21252668,
      dLongNode: 0.20469106
    },

    saturn: {
      a: 9.53667594,
      e: 0.05386179,
      I: 2.48599187,
      L: 49.95424423,
      longPeri: 92.59887831,
      longNode: 113.6624245,

      da: -0.0012506,
      de: -0.00050991,
      dI: 0.00193609,
      dL: 1222.49362201,
      dLongPeri: -0.41897216,
      dLongNode: -0.28867794
    },

    uranus: {
      a: 19.18916464,
      e: 0.04725744,
      I: 0.77263783,
      L: 313.2381045,
      longPeri: 170.9542763,
      longNode: 74.01692503,

      da: -0.00196176,
      de: -0.00004397,
      dI: -0.00242939,
      dL: 428.48202785,
      dLongPeri: 0.40805281,
      dLongNode: 0.04240589
    },

    neptune: {
      a: 30.06992276,
      e: 0.00859048,
      I: 1.77004347,
      L: -55.12002969,
      longPeri: 44.96476227,
      longNode: 131.7842257,

      da: 0.00026291,
      de: 0.00005105,
      dI: 0.00035372,
      dL: 218.45945325,
      dLongPeri: -0.32241464,
      dLongNode: -0.00508664
    }
  };

/* -------------------------------------------------------------------------- */
/* Utility functions                                                           */
/* -------------------------------------------------------------------------- */

function normalizeRadians(
  angle: number
): number {
  const result =
    angle % TWO_PI;

  return result < 0
    ? result + TWO_PI
    : result;
}

function normalizeDegrees(
  angle: number
): number {
  const result =
    angle % 360;

  return result < 0
    ? result + 360
    : result;
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function julianCenturies(
  julianDate: number
): number {
  return (
    julianDate -
    JULIAN_J2000
  ) / 36_525;
}

function degreesToRadians(
  degrees: number
): number {
  return degrees *
    DEG_TO_RAD;
}

function radiansToDegrees(
  radians: number
): number {
  return radians *
    RAD_TO_DEG;
}

/* -------------------------------------------------------------------------- */
/* Orbital elements                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Return time-adjusted orbital elements.
 */
export function orbitalElements(
  planet: PlanetName,
  julianDate: number
): OrbitalElement {
  const base =
    PLANETARY_ELEMENTS[
      planet
    ];

  const T =
    julianCenturies(
      julianDate
    );

  return {
    a:
      base.a +
      base.da * T,

    e:
      base.e +
      base.de * T,

    I:
      base.I +
      base.dI * T,

    L:
      base.L +
      base.dL * T,

    longPeri:
      base.longPeri +
      base.dLongPeri * T,

    longNode:
      base.longNode +
      base.dLongNode * T,

    da:
      base.da,

    de:
      base.de,

    dI:
      base.dI,

    dL:
      base.dL,

    dLongPeri:
      base.dLongPeri,

    dLongNode:
      base.dLongNode
  };
}

/* -------------------------------------------------------------------------- */
/* Mean anomaly                                                                */
/* -------------------------------------------------------------------------- */

export function planetMeanAnomaly(
  planet: PlanetName,
  julianDate: number
): number {
  const elements =
    orbitalElements(
      planet,
      julianDate
    );

  const meanAnomaly =
    normalizeDegrees(
      elements.L -
      elements.longPeri
    );

  return degreesToRadians(
    meanAnomaly
  );
}

/* -------------------------------------------------------------------------- */
/* Kepler solver                                                               */
/* -------------------------------------------------------------------------- */

export function solveKeplerEquation(
  meanAnomaly: number,
  eccentricity: number,
  tolerance = 1e-12,
  maxIterations = 20
): number {
  let E =
    eccentricity < 0.8
      ? meanAnomaly
      : Math.PI;

  for (
    let i = 0;
    i < maxIterations;
    i++
  ) {
    const delta =
      (
        E -
        eccentricity *
          Math.sin(E) -
        meanAnomaly
      ) /
      (
        1 -
        eccentricity *
          Math.cos(E)
      );

    E -= delta;

    if (
      Math.abs(delta) <
      tolerance
    ) {
      break;
    }
  }

  return E;
}

/* -------------------------------------------------------------------------- */
/* Heliocentric orbital position                                               */
/* -------------------------------------------------------------------------- */

export function heliocentricPosition(
  planet: PlanetName,
  julianDate: number
): HeliocentricCoordinates {
  const elements =
    orbitalElements(
      planet,
      julianDate
    );

  const a =
    elements.a;

  const e =
    elements.e;

  const inclination =
    degreesToRadians(
      elements.I
    );

  const node =
    degreesToRadians(
      elements.longNode
    );

  const perihelion =
    degreesToRadians(
      elements.longPeri
    );

  const argumentOfPerihelion =
    normalizeRadians(
      perihelion -
      node
    );

  const M =
    planetMeanAnomaly(
      planet,
      julianDate
    );

  const E =
    solveKeplerEquation(
      M,
      e
    );

  const xv =
    a *
    (
      Math.cos(E) -
      e
    );

  const yv =
    a *
    Math.sqrt(
      1 -
      e * e
    ) *
    Math.sin(E);

  const trueAnomaly =
    Math.atan2(
      yv,
      xv
    );

  const radius =
    Math.sqrt(
      xv * xv +
      yv * yv
    );

  const argument =
    trueAnomaly +
    argumentOfPerihelion;

  const x =
    radius *
    (
      Math.cos(node) *
        Math.cos(argument) -
      Math.sin(node) *
        Math.sin(argument) *
        Math.cos(inclination)
    );

  const y =
    radius *
    (
      Math.sin(node) *
        Math.cos(argument) +
      Math.cos(node) *
        Math.sin(argument) *
        Math.cos(inclination)
    );

  const z =
    radius *
    (
      Math.sin(argument) *
      Math.sin(inclination)
    );

  const longitude =
    normalizeRadians(
      Math.atan2(
        y,
        x
      )
    );

  const latitude =
    Math.atan2(
      z,
      Math.sqrt(
        x * x +
        y * y
      )
    );

  return {
    x,
    y,
    z,

    longitude,

    latitude,

    distance:
      radius
  };
}

/* -------------------------------------------------------------------------- */
/* Earth position                                                              */
/* -------------------------------------------------------------------------- */

export function earthHeliocentricPosition(
  julianDate: number
): HeliocentricCoordinates {
  return heliocentricPosition(
    "earth",
    julianDate
  );
}

/* -------------------------------------------------------------------------- */
/* Geocentric position                                                         */
/* -------------------------------------------------------------------------- */

export function geocentricPosition(
  planet: PlanetName,
  julianDate: number
): GeocentricCoordinates {
  const planetPosition =
    heliocentricPosition(
      planet,
      julianDate
    );

  const earthPosition =
    earthHeliocentricPosition(
      julianDate
    );

  const x =
    planetPosition.x -
    earthPosition.x;

  const y =
    planetPosition.y -
    earthPosition.y;

  const z =
    planetPosition.z -
    earthPosition.z;

  const distance =
    Math.sqrt(
      x * x +
      y * y +
      z * z
    );

  return {
    x,
    y,
    z,

    longitude:
      normalizeRadians(
        Math.atan2(
          y,
          x
        )
      ),

    latitude:
      Math.atan2(
        z,
        Math.sqrt(
          x * x +
          y * y
        )
      ),

    distance
  };
}

/* -------------------------------------------------------------------------- */
/* Ecliptic → equatorial                                                       */
/* -------------------------------------------------------------------------- */

export function eclipticToEquatorial(
  x: number,
  y: number,
  z: number,
  julianDate: number
): PlanetEquatorialCoordinates {
  const T =
    julianCenturies(
      julianDate
    );

  const obliquity =
    (
      23.439291 -
      0.0130042 * T
    ) *
    DEG_TO_RAD;

  const equatorialX =
    x;

  const equatorialY =
    y *
      Math.cos(obliquity) -
    z *
      Math.sin(obliquity);

  const equatorialZ =
    y *
      Math.sin(obliquity) +
    z *
      Math.cos(obliquity);

  return {
    rightAscension:
      normalizeRadians(
        Math.atan2(
          equatorialY,
          equatorialX
        )
      ),

    declination:
      Math.atan2(
        equatorialZ,
        Math.sqrt(
          equatorialX *
            equatorialX +
          equatorialY *
            equatorialY
        )
      ),

    distance:
      Math.sqrt(
        equatorialX *
          equatorialX +
        equatorialY *
          equatorialY +
        equatorialZ *
          equatorialZ
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Planetary orbital period                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Approximate orbital period from Kepler's third law.
 */
export function orbitalPeriodDays(
  planet: PlanetName,
  julianDate = JULIAN_J2000
): number {
  const elements =
    orbitalElements(
      planet,
      julianDate
    );

  return (
    365.2568983 *
    Math.pow(
      elements.a,
      1.5
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Orbital velocity                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Approximate heliocentric orbital speed.
 *
 * Uses the vis-viva equation.
 */
export function orbitalVelocityKmPerSecond(
  planet: PlanetName,
  julianDate: number
): number {
  const elements =
    orbitalElements(
      planet,
      julianDate
    );

  const position =
    heliocentricPosition(
      planet,
      julianDate
    );

  const mu =
    0.01720209895;

  const speedAUPerDay =
    mu *
    Math.sqrt(
      2 / position.distance -
      1 / elements.a
    );

  return (
    speedAUPerDay *
    ASTRONOMICAL_UNIT_KM /
    DAY_SECONDS
  );
}

/* -------------------------------------------------------------------------- */
/* Phase geometry                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Planet-Sun-Earth phase angle.
 *
 * This is the angle at the planet between
 * the Sun and Earth.
 */
export function planetPhaseAngle(
  planet: PlanetName,
  julianDate: number
): number {
  const planetPosition =
    heliocentricPosition(
      planet,
      julianDate
    );

  const earthPosition =
    earthHeliocentricPosition(
      julianDate
    );

  const geocentric =
    geocentricPosition(
      planet,
      julianDate
    );

  const sunToPlanetX =
    -planetPosition.x;

  const sunToPlanetY =
    -planetPosition.y;

  const sunToPlanetZ =
    -planetPosition.z;

  const planetToEarthX =
    earthPosition.x -
    planetPosition.x;

  const planetToEarthY =
    earthPosition.y -
    planetPosition.y;

  const planetToEarthZ =
    earthPosition.z -
    planetPosition.z;

  const dot =
    sunToPlanetX *
      planetToEarthX +
    sunToPlanetY *
      planetToEarthY +
    sunToPlanetZ *
      planetToEarthZ;

  const sunDistance =
    Math.sqrt(
      sunToPlanetX *
        sunToPlanetX +
      sunToPlanetY *
        sunToPlanetY +
      sunToPlanetZ *
        sunToPlanetZ
    );

  const earthDistance =
    Math.sqrt(
      planetToEarthX *
        planetToEarthX +
      planetToEarthY *
        planetToEarthY +
      planetToEarthZ *
        planetToEarthZ
    );

  void geocentric;

  return Math.acos(
    clamp(
      dot /
        (
          sunDistance *
          earthDistance
        ),
      -1,
      1
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Elongation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Angular separation between a planet and Sun as seen from Earth.
 */
export function planetElongation(
  planet: PlanetName,
  julianDate: number
): number {
  if (
    planet === "earth"
  ) {
    return 0;
  }

  const planetPosition =
    geocentricPosition(
      planet,
      julianDate
    );

  const earthToSunX =
    -earthHeliocentricPosition(
      julianDate
    ).x;

  const earthToSunY =
    -earthHeliocentricPosition(
      julianDate
    ).y;

  const earthToSunZ =
    -earthHeliocentricPosition(
      julianDate
    ).z;

  const dot =
    planetPosition.x *
      earthToSunX +
    planetPosition.y *
      earthToSunY +
    planetPosition.z *
      earthToSunZ;

  const planetDistance =
    planetPosition.distance;

  const sunDistance =
    Math.sqrt(
      earthToSunX *
        earthToSunX +
      earthToSunY *
        earthToSunY +
      earthToSunZ *
        earthToSunZ
    );

  return Math.acos(
    clamp(
      dot /
        (
          planetDistance *
          sunDistance
        ),
      -1,
      1
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Angular diameter                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Approximate planetary physical radii in kilometers.
 */
const PLANET_RADII_KM:
  Record<PlanetName, number> = {
    mercury: 2_439.7,
    venus: 6_051.8,
    earth: 6_378.137,
    mars: 3_396.19,
    jupiter: 71_492,
    saturn: 60_268,
    uranus: 25_559,
    neptune: 24_622
  };

/**
 * Apparent angular diameter in radians.
 */
export function planetAngularDiameter(
  planet: PlanetName,
  julianDate: number
): number {
  const distanceAU =
    planet === "earth"
      ? 1
      : geocentricPosition(
          planet,
          julianDate
        ).distance;

  const radiusAU =
    PLANET_RADII_KM[
      planet
    ] /
    ASTRONOMICAL_UNIT_KM;

  return (
    2 *
    Math.asin(
      clamp(
        radiusAU /
          distanceAU,
        -1,
        1
      )
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Complete planet position                                                    */
/* -------------------------------------------------------------------------- */

export function planetPosition(
  planet: PlanetName,
  julianDate: number
): PlanetPosition {
  const heliocentric =
    heliocentricPosition(
      planet,
      julianDate
    );

  const geocentric =
    geocentricPosition(
      planet,
      julianDate
    );

  const equatorial =
    eclipticToEquatorial(
      geocentric.x,
      geocentric.y,
      geocentric.z,
      julianDate
    );

  return {
    planet,

    julianDate,

    heliocentric,

    geocentric,

    equatorial,

    phaseAngle:
      planetPhaseAngle(
        planet,
        julianDate
      ),

    elongation:
      planetElongation(
        planet,
        julianDate
      ),

    angularDiameter:
      planetAngularDiameter(
        planet,
        julianDate
      ),

    orbitalPeriodDays:
      orbitalPeriodDays(
        planet,
        julianDate
      ),

    meanAnomaly:
      planetMeanAnomaly(
        planet,
        julianDate
      ),

    orbitalVelocityKmPerSecond:
      orbitalVelocityKmPerSecond(
        planet,
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Planet collections                                                          */
/* -------------------------------------------------------------------------- */

export const PLANETS:
  readonly PlanetName[] = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune"
  ];

/**
 * Return all major planets.
 */
export function allPlanetPositions(
  julianDate: number
): Record<
  PlanetName,
  PlanetPosition
> {
  const result =
    {} as Record<
      PlanetName,
      PlanetPosition
    >;

  for (
    const planet of PLANETS
  ) {
    result[planet] =
      planetPosition(
        planet,
        julianDate
      );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Planet lookup                                                               */
/* -------------------------------------------------------------------------- */

export function isPlanetName(
  value: string
): value is PlanetName {
  return (
    PLANETS.includes(
      value as PlanetName
    )
  );
}

/**
 * Return approximate physical radius.
 */
export function planetRadiusKm(
  planet: PlanetName
): number {
  return PLANET_RADII_KM[
    planet
  ];
}

/**
 * Return orbital elements in a UI-friendly format.
 */
export function planetaryOrbit(
  planet: PlanetName,
  julianDate = JULIAN_J2000
): PlanetaryOrbit {
  const elements =
    orbitalElements(
      planet,
      julianDate
    );

  return {
    semiMajorAxisAU:
      elements.a,

    eccentricity:
      elements.e,

    inclination:
      degreesToRadians(
        elements.I
      ),

    longitudeOfAscendingNode:
      degreesToRadians(
        normalizeDegrees(
          elements.longNode
        )
      ),

    longitudeOfPerihelion:
      degreesToRadians(
        normalizeDegrees(
          elements.longPeri
        )
      ),

    meanLongitude:
      degreesToRadians(
        normalizeDegrees(
          elements.L
        )
      ),

    orbitalPeriodDays:
      orbitalPeriodDays(
        planet,
        julianDate
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Visibility helpers                                                          */
/* -------------------------------------------------------------------------- */

export type PlanetVisibility =
  | "inferior"
  | "superior"
  | "conjunction"
  | "opposition"
  | "visible";

export function planetVisibility(
  planet: PlanetName,
  julianDate: number
): PlanetVisibility {
  if (
    planet === "earth"
  ) {
    return "visible";
  }

  const elongation =
    planetElongation(
      planet,
      julianDate
    );

  const degrees =
    radiansToDegrees(
      elongation
    );

  if (
    degrees < 5
  ) {
    return "conjunction";
  }

  if (
    planet === "mercury" ||
    planet === "venus"
  ) {
    if (
      degrees < 20
    ) {
      return "inferior";
    }

    return "visible";
  }

  if (
    Math.abs(
      degrees - 180
    ) < 10
  ) {
    return "opposition";
  }

  return "visible";
}

/* -------------------------------------------------------------------------- */
/* Unit conversions                                                            */
/* -------------------------------------------------------------------------- */

export function auToKm(
  au: number
): number {
  return (
    au *
    ASTRONOMICAL_UNIT_KM
  );
}

export function kmToAu(
  kilometers: number
): number {
  return (
    kilometers /
    ASTRONOMICAL_UNIT_KM
  );
}

export function degreesToRadiansPublic(
  degrees: number
): number {
  return degreesToRadians(
    degrees
  );
}

export function radiansToDegreesPublic(
  radians: number
): number {
  return radiansToDegrees(
    radians
  );
}

/* -------------------------------------------------------------------------- */
/* Default planetary API                                                       */
/* -------------------------------------------------------------------------- */

export const Planets = {
  all:
    PLANETS,

  elements:
    orbitalElements,

  orbit:
    planetaryOrbit,

  heliocentric:
    heliocentricPosition,

  geocentric:
    geocentricPosition,

  position:
    planetPosition,

  positions:
    allPlanetPositions,

  phaseAngle:
    planetPhaseAngle,

  elongation:
    planetElongation,

  angularDiameter:
    planetAngularDiameter,

  orbitalPeriod:
    orbitalPeriodDays,

  orbitalVelocity:
    orbitalVelocityKmPerSecond,

  radius:
    planetRadiusKm,

  visibility:
    planetVisibility
} as const;
