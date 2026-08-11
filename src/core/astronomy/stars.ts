/**
 * Space
 * Stellar Astronomy
 *
 * Star catalog and apparent-position utilities.
 *
 * Provides:
 * - Stellar catalog model
 * - Right ascension / declination
 * - Proper motion
 * - Parallax
 * - Radial velocity
 * - Magnitude handling
 * - Color index
 * - Epoch propagation
 * - Equatorial → horizontal conversion
 * - Visibility helpers
 *
 * Coordinate conventions:
 * - Angles are radians unless explicitly stated otherwise.
 * - Proper motion is milliarcseconds/year.
 * - Distance is parsecs unless explicitly stated otherwise.
 * - Radial velocity is km/s.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const JULIAN_J2000 =
  2_451_545.0;

export const JULIAN_YEAR_DAYS =
  365.25;

export const ARCSECONDS_TO_RADIANS =
  Math.PI /
  (180 * 3600);

export const MILLIARCSECONDS_TO_RADIANS =
  ARCSECONDS_TO_RADIANS /
  1000;

export const PARSEC_TO_LIGHT_YEAR =
  3.26156;

export const PARSEC_TO_KM =
  3.0856775814913673e13;

const TWO_PI =
  Math.PI * 2;

const DEG_TO_RAD =
  Math.PI / 180;

const RAD_TO_DEG =
  180 / Math.PI;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface StarCatalogEntry {
  id: string;

  name?: string;

  hipparcosId?: number;

  gaiaId?: string;

  rightAscension: number;

  declination: number;

  properMotionRA?: number;

  properMotionDec?: number;

  parallax?: number;

  radialVelocity?: number;

  magnitude?: number;

  colorIndex?: number;

  spectralType?: string;

  epoch?: number;
}

export interface StarPosition {
  rightAscension: number;

  declination: number;

  distanceParsecs?: number;

  distanceLightYears?: number;

  magnitude?: number;

  colorIndex?: number;
}

export interface StarHorizontalPosition {
  altitude: number;

  azimuth: number;

  visible: boolean;
}

export interface StarMotion {
  deltaRightAscension: number;

  deltaDeclination: number;

  angularDistance: number;
}

export interface StarVisibilityOptions {
  minimumAltitude?: number;

  maximumMagnitude?: number;
}

export type SpectralClass =
  | "O"
  | "B"
  | "A"
  | "F"
  | "G"
  | "K"
  | "M"
  | "unknown";

/* -------------------------------------------------------------------------- */
/* Utilities                                                                   */
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

function julianYear(
  julianDate: number
): number {
  return (
    2000 +
    (
      julianDate -
      JULIAN_J2000
    ) /
    JULIAN_YEAR_DAYS
  );
}

/* -------------------------------------------------------------------------- */
/* Coordinate helpers                                                          */
/* -------------------------------------------------------------------------- */

export function hoursToRadians(
  hours: number
): number {
  return (
    hours *
    Math.PI /
    12
  );
}

export function radiansToHours(
  radians: number
): number {
  return (
    radians *
    12 /
    Math.PI
  );
}

export function degreesToRadians(
  degrees: number
): number {
  return (
    degrees *
    DEG_TO_RAD
  );
}

export function radiansToDegrees(
  radians: number
): number {
  return (
    radians *
    RAD_TO_DEG
  );
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Convert parallax in milliarcseconds to parsecs.
 */
export function parallaxToParsecs(
  parallaxMas: number
): number | undefined {
  if (
    !Number.isFinite(
      parallaxMas
    ) ||
    parallaxMas <= 0
  ) {
    return undefined;
  }

  const arcseconds =
    parallaxMas /
    1000;

  return 1 /
    arcseconds;
}

/**
 * Convert parsecs to light-years.
 */
export function parsecsToLightYears(
  parsecs: number
): number {
  return (
    parsecs *
    PARSEC_TO_LIGHT_YEAR
  );
}

/**
 * Convert light-years to parsecs.
 */
export function lightYearsToParsecs(
  lightYears: number
): number {
  return (
    lightYears /
    PARSEC_TO_LIGHT_YEAR
  );
}

/* -------------------------------------------------------------------------- */
/* Proper motion                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Propagate a star from its catalog epoch.
 *
 * Proper motion:
 * - mas/year
 */
export function propagateStar(
  star: StarCatalogEntry,
  targetJulianDate: number
): StarPosition {
  const epoch =
    star.epoch ??
    2000;

  const targetYear =
    julianYear(
      targetJulianDate
    );

  const deltaYears =
    targetYear -
    epoch;

  const pmRA =
    star.properMotionRA ??
    0;

  const pmDec =
    star.properMotionDec ??
    0;

  /*
   * RA proper motion is interpreted as
   * angular motion in RA including cos(dec),
   * matching the common catalog convention.
   */
  const deltaRA =
    pmRA *
    deltaYears *
    MILLIARCSECONDS_TO_RADIANS;

  const deltaDec =
    pmDec *
    deltaYears *
    MILLIARCSECONDS_TO_RADIANS;

  const rightAscension =
    normalizeRadians(
      star.rightAscension +
      deltaRA /
      Math.max(
        Math.cos(
          star.declination
        ),
        1e-12
      )
    );

  const declination =
    clamp(
      star.declination +
      deltaDec,
      -Math.PI / 2,
      Math.PI / 2
    );

  const distanceParsecs =
    parallaxToParsecs(
      star.parallax ?? 0
    );

  return {
    rightAscension,

    declination,

    distanceParsecs,

    distanceLightYears:
      distanceParsecs !== undefined
        ? parsecsToLightYears(
            distanceParsecs
          )
        : undefined,

    magnitude:
      star.magnitude,

    colorIndex:
      star.colorIndex
  };
}

/* -------------------------------------------------------------------------- */
/* Space motion                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Approximate angular motion between two catalog positions.
 */
export function starMotion(
  first: StarPosition,
  second: StarPosition
): StarMotion {
  const deltaRA =
    normalizeRadians(
      second.rightAscension -
      first.rightAscension
    );

  const deltaDec =
    second.declination -
    first.declination;

  const sinHalfDec =
    Math.sin(
      deltaDec / 2
    );

  const sinHalfRA =
    Math.sin(
      deltaRA / 2
    );

  const a =
    sinHalfDec *
      sinHalfDec +
    Math.cos(
      first.declination
    ) *
      Math.cos(
        second.declination
      ) *
      sinHalfRA *
      sinHalfRA;

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(
        clamp(
          a,
          0,
          1
        )
      ),
      Math.sqrt(
        1 -
        clamp(
          a,
          0,
          1
        )
      )
    );

  return {
    deltaRightAscension:
      deltaRA,

    deltaDeclination:
      deltaDec,

    angularDistance
  };
}

/* -------------------------------------------------------------------------- */
/* Equatorial → horizontal                                                     */
/* -------------------------------------------------------------------------- */

export function equatorialToHorizontal(
  rightAscension: number,
  declination: number,
  latitude: number,
  localSiderealTime: number
): StarHorizontalPosition {
  const hourAngle =
    normalizeRadians(
      localSiderealTime -
      rightAscension
    );

  const sinAltitude =
    Math.sin(latitude) *
      Math.sin(declination) +

    Math.cos(latitude) *
      Math.cos(declination) *
      Math.cos(hourAngle);

  const altitude =
    Math.asin(
      clamp(
        sinAltitude,
        -1,
        1
      )
    );

  const azimuth =
    Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) *
        Math.sin(latitude) -
        Math.tan(declination) *
        Math.cos(latitude)
    );

  return {
    altitude,

    azimuth:
      normalizeRadians(
        azimuth +
        Math.PI
      ),

    visible:
      altitude > 0
  };
}

/* -------------------------------------------------------------------------- */
/* Star visibility                                                             */
/* -------------------------------------------------------------------------- */

export function isStarVisible(
  position: StarHorizontalPosition,
  options: StarVisibilityOptions = {}
): boolean {
  const minimumAltitude =
    options.minimumAltitude ??
    0;

  return (
    position.altitude >=
    minimumAltitude
  );
}

export function isStarBrightEnough(
  star: StarCatalogEntry,
  maximumMagnitude = 6
): boolean {
  if (
    star.magnitude ===
    undefined
  ) {
    return true;
  }

  return (
    star.magnitude <=
    maximumMagnitude
  );
}

/* -------------------------------------------------------------------------- */
/* Magnitude                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Convert astronomical magnitude to relative flux.
 *
 * A difference of 5 magnitudes = factor 100.
 */
export function magnitudeToFlux(
  magnitude: number
): number {
  return Math.pow(
    10,
    -0.4 * magnitude
  );
}

/**
 * Convert relative flux to magnitude.
 */
export function fluxToMagnitude(
  flux: number
): number {
  if (
    flux <= 0
  ) {
    return Infinity;
  }

  return (
    -2.5 *
    Math.log10(flux)
  );
}

/**
 * Relative brightness between two stars.
 */
export function relativeBrightness(
  firstMagnitude: number,
  secondMagnitude: number
): number {
  return Math.pow(
    10,
    0.4 *
    (
      secondMagnitude -
      firstMagnitude
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Color index                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Approximate color temperature from B-V color index.
 *
 * Ballesteros approximation.
 */
export function colorIndexToTemperature(
  colorIndex: number
): number {
  const bv =
    colorIndex;

  return (
    4600 *
    (
      1 /
      (
        0.92 * bv +
        1.7
      ) +
      1 /
      (
        0.92 * bv +
        0.62
      )
    )
  );
}

/**
 * Approximate spectral class from B-V.
 */
export function colorIndexToSpectralClass(
  colorIndex: number
): SpectralClass {
  if (
    colorIndex < -0.2
  ) {
    return "O";
  }

  if (
    colorIndex < -0.05
  ) {
    return "B";
  }

  if (
    colorIndex < 0.25
  ) {
    return "A";
  }

  if (
    colorIndex < 0.50
  ) {
    return "F";
  }

  if (
    colorIndex < 0.80
  ) {
    return "G";
  }

  if (
    colorIndex < 1.40
  ) {
    return "K";
  }

  if (
    colorIndex < 2.00
  ) {
    return "M";
  }

  return "unknown";
}

/**
 * Approximate RGB-like display values from B-V.
 *
 * Returned values are normalized [0, 1].
 */
export function colorIndexToRGB(
  colorIndex: number
): {
  r: number;
  g: number;
  b: number;
} {
  const temperature =
    colorIndexToTemperature(
      colorIndex
    );

  /*
   * Compact approximation intended for
   * visualization rather than photometry.
   */
  const temperatureK =
    clamp(
      temperature,
      1_000,
      40_000
    );

  let red: number;
  let green: number;
  let blue: number;

  if (
    temperatureK <= 6600
  ) {
    red = 1;

    green =
      0.3900815788 *
      Math.log(
        temperatureK /
        100
      ) -
      0.6318414438;

    blue =
      temperatureK <= 1900
        ? 0
        : 1.055090151 *
          Math.log(
            temperatureK /
            100
          ) -
          1.196254089;
  } else {
    red =
      1.292936186 *
      Math.pow(
        temperatureK / 100 - 60,
        -0.1332047592
      );

    green =
      1.129890861 *
      Math.pow(
        temperatureK / 100 - 60,
        -0.0755148492
      );

    blue = 1;
  }

  return {
    r: clamp(
      red,
      0,
      1
    ),

    g: clamp(
      green,
      0,
      1
    ),

    b: clamp(
      blue,
      0,
      1
    )
  };
}

/* -------------------------------------------------------------------------- */
/* Spectral class                                                              */
/* -------------------------------------------------------------------------- */

export function spectralClass(
  star: StarCatalogEntry
): SpectralClass {
  if (
    star.spectralType
  ) {
    const value =
      star.spectralType
        .trim()
        .charAt(0)
        .toUpperCase();

    if (
      [
        "O",
        "B",
        "A",
        "F",
        "G",
        "K",
        "M"
      ].includes(value)
    ) {
      return value as SpectralClass;
    }
  }

  if (
    star.colorIndex !==
    undefined
  ) {
    return colorIndexToSpectralClass(
      star.colorIndex
    );
  }

  return "unknown";
}

/* -------------------------------------------------------------------------- */
/* Apparent magnitude                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Approximate distance modulus.
 */
export function distanceModulus(
  distanceParsecs: number
): number {
  if (
    distanceParsecs <= 0
  ) {
    return -Infinity;
  }

  return (
    5 *
    Math.log10(
      distanceParsecs
    ) -
    5
  );
}

/**
 * Convert absolute magnitude to apparent magnitude.
 */
export function absoluteToApparentMagnitude(
  absoluteMagnitude: number,
  distanceParsecs: number
): number {
  return (
    absoluteMagnitude +
    distanceModulus(
      distanceParsecs
    )
  );
}

/**
 * Convert apparent magnitude to absolute magnitude.
 */
export function apparentToAbsoluteMagnitude(
  apparentMagnitude: number,
  distanceParsecs: number
): number {
  return (
    apparentMagnitude -
    distanceModulus(
      distanceParsecs
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Star catalog utilities                                                      */
/* -------------------------------------------------------------------------- */

export function createStar(
  entry: StarCatalogEntry
): StarCatalogEntry {
  if (
    !entry.id
  ) {
    throw new Error(
      "Star catalog entry requires an id."
    );
  }

  if (
    !Number.isFinite(
      entry.rightAscension
    )
  ) {
    throw new Error(
      "Star right ascension must be finite."
    );
  }

  if (
    !Number.isFinite(
      entry.declination
    )
  ) {
    throw new Error(
      "Star declination must be finite."
    );
  }

  return {
    ...entry,

    rightAscension:
      normalizeRadians(
        entry.rightAscension
      ),

    declination:
      clamp(
        entry.declination,
        -Math.PI / 2,
        Math.PI / 2
      )
  };
}

/**
 * Propagate and convert a catalog star.
 */
export function starPosition(
  star: StarCatalogEntry,
  julianDate: number
): StarPosition {
  return propagateStar(
    star,
    julianDate
  );
}

/**
 * Convert star position to horizontal coordinates.
 */
export function starHorizontalPosition(
  star: StarCatalogEntry,
  julianDate: number,
  latitude: number,
  localSiderealTime: number
): StarHorizontalPosition {
  const position =
    starPosition(
      star,
      julianDate
    );

  return equatorialToHorizontal(
    position.rightAscension,
    position.declination,
    latitude,
    localSiderealTime
  );
}

/* -------------------------------------------------------------------------- */
/* Angular separation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Angular separation between two stars.
 */
export function angularSeparation(
  first: StarPosition,
  second: StarPosition
): number {
  const cosSeparation =
    Math.sin(
      first.declination
    ) *
      Math.sin(
        second.declination
      ) +

    Math.cos(
      first.declination
    ) *
      Math.cos(
        second.declination
      ) *
      Math.cos(
        first.rightAscension -
        second.rightAscension
      );

  return Math.acos(
    clamp(
      cosSeparation,
      -1,
      1
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Catalog filtering                                                           */
/* -------------------------------------------------------------------------- */

export interface StarFilterOptions {
  minimumMagnitude?: number;

  maximumMagnitude?: number;

  spectralClass?: SpectralClass;

  name?: string;
}

/**
 * Filter a catalog without mutating it.
 */
export function filterStars(
  stars: readonly StarCatalogEntry[],
  options: StarFilterOptions = {}
): StarCatalogEntry[] {
  return stars.filter(
    star => {
      if (
        options.minimumMagnitude !==
        undefined &&
        (
          star.magnitude ===
          undefined ||
          star.magnitude <
          options.minimumMagnitude
        )
      ) {
        return false;
      }

      if (
        options.maximumMagnitude !==
        undefined &&
        (
          star.magnitude ===
          undefined ||
          star.magnitude >
          options.maximumMagnitude
        )
      ) {
        return false;
      }

      if (
        options.spectralClass &&
        spectralClass(star) !==
          options.spectralClass
      ) {
        return false;
      }

      if (
        options.name &&
        !star.name
          ?.toLowerCase()
          .includes(
            options.name.toLowerCase()
          )
      ) {
        return false;
      }

      return true;
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Brightness sorting                                                          */
/* -------------------------------------------------------------------------- */

export function sortByMagnitude(
  stars: readonly StarCatalogEntry[]
): StarCatalogEntry[] {
  return [
    ...stars
  ].sort(
    (a, b) => {
      const aMagnitude =
        a.magnitude ??
        Infinity;

      const bMagnitude =
        b.magnitude ??
        Infinity;

      return (
        aMagnitude -
        bMagnitude
      );
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Distance sorting                                                            */
/* -------------------------------------------------------------------------- */

export function sortByDistance(
  stars: readonly StarCatalogEntry[]
): StarCatalogEntry[] {
  return [
    ...stars
  ].sort(
    (a, b) => {
      const aDistance =
        parallaxToParsecs(
          a.parallax ?? 0
        ) ??
        Infinity;

      const bDistance =
        parallaxToParsecs(
          b.parallax ?? 0
        ) ??
        Infinity;

      return (
        aDistance -
        bDistance
      );
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Built-in bright-star catalog                                                */
/* -------------------------------------------------------------------------- */

/**
 * Compact seed catalog.
 *
 * The architecture intentionally accepts external catalogs such as
 * Hipparcos, Gaia or custom datasets. This seed list is useful for
 * immediate demos and tests.
 */
export const BRIGHT_STARS:
  readonly StarCatalogEntry[] = [
    {
      id: "sirius",
      name: "Sirius",
      rightAscension:
        hoursToRadians(
          6 +
          45 / 60 +
          8.9 / 3600
        ),
      declination:
        degreesToRadians(
          -16 -
          42 / 60 -
          58 / 3600
        ),
      magnitude: -1.46,
      colorIndex: 0.00,
      spectralType: "A1V",
      epoch: 2000
    },

    {
      id: "canopus",
      name: "Canopus",
      rightAscension:
        hoursToRadians(
          6 +
          23 / 60 +
          57.1 / 3600
        ),
      declination:
        degreesToRadians(
          -52 -
          41 / 60 -
          44 / 3600
        ),
      magnitude: -0.74,
      colorIndex: 0.15,
      spectralType: "A9II",
      epoch: 2000
    },

    {
      id: "arcturus",
      name: "Arcturus",
      rightAscension:
        hoursToRadians(
          14 +
          15 / 60 +
          39.7 / 3600
        ),
      declination:
        degreesToRadians(
          19 +
          10 / 60 +
          56.7 / 3600
        ),
      magnitude: -0.05,
      colorIndex: 1.23,
      spectralType: "K0III",
      epoch: 2000
    },

    {
      id: "vega",
      name: "Vega",
      rightAscension:
        hoursToRadians(
          18 +
          36 / 60 +
          56.3 / 3600
        ),
      declination:
        degreesToRadians(
          38 +
          47 / 60 +
          1.3 / 3600
        ),
      magnitude: 0.03,
      colorIndex: 0.00,
      spectralType: "A0V",
      epoch: 2000
    },

    {
      id: "capella",
      name: "Capella",
      rightAscension:
        hoursToRadians(
          5 +
          16 / 60 +
          41.4 / 3600
        ),
      declination:
        degreesToRadians(
          45 +
          59 / 60 +
          52.8 / 3600
        ),
      magnitude: 0.08,
      colorIndex: 0.80,
      spectralType: "G8III",
      epoch: 2000
    },

    {
      id: "rigel",
      name: "Rigel",
      rightAscension:
        hoursToRadians(
          5 +
          14 / 60 +
          32.3 / 3600
        ),
      declination:
        degreesToRadians(
          -8 -
          12 / 60 -
          5.9 / 3600
        ),
      magnitude: 0.13,
      colorIndex: -0.03,
      spectralType: "B8Ia",
      epoch: 2000
    },

    {
      id: "procyon",
      name: "Procyon",
      rightAscension:
        hoursToRadians(
          7 +
          39 / 60 +
          18.1 / 3600
        ),
      declination:
        degreesToRadians(
          5 +
          13 / 60 +
          29.9 / 3600
        ),
      magnitude: 0.34,
      colorIndex: 0.42,
      spectralType: "F5IV",
      epoch: 2000
    },

    {
      id: "betelgeuse",
      name: "Betelgeuse",
      rightAscension:
        hoursToRadians(
          5 +
          55 / 60 +
          10.3 / 3600
        ),
      declination:
        degreesToRadians(
          7 +
          24 / 60 +
          25.4 / 3600
        ),
      magnitude: 0.50,
      colorIndex: 1.85,
      spectralType: "M1-M2Ia",
      epoch: 2000
    },

    {
      id: "aldebaran",
      name: "Aldebaran",
      rightAscension:
        hoursToRadians(
          4 +
          35 / 60 +
          55.2 / 3600
        ),
      declination:
        degreesToRadians(
          16 +
          30 / 60 +
          33.5 / 3600
        ),
      magnitude: 0.85,
      colorIndex: 1.54,
      spectralType: "K5III",
      epoch: 2000
    },

    {
      id: "spica",
      name: "Spica",
      rightAscension:
        hoursToRadians(
          13 +
          25 / 60 +
          11.6 / 3600
        ),
      declination:
        degreesToRadians(
          -11 -
          9 / 60 -
          40.8 / 3600
        ),
      magnitude: 0.98,
      colorIndex: -0.23,
      spectralType: "B1III-IV",
      epoch: 2000
    },

    {
      id: "antares",
      name: "Antares",
      rightAscension:
        hoursToRadians(
          16 +
          29 / 60 +
          24.5 / 3600
        ),
      declination:
        degreesToRadians(
          -26 -
          25 / 60 -
          55.2 / 3600
        ),
      magnitude: 1.06,
      colorIndex: 1.83,
      spectralType: "M1.5Iab",
      epoch: 2000
    },

    {
      id: "pollux",
      name: "Pollux",
      rightAscension:
        hoursToRadians(
          7 +
          45 / 60 +
          18.9 / 3600
        ),
      declination:
        degreesToRadians(
          28 +
          1 / 60 +
          34.3 / 3600
        ),
      magnitude: 1.14,
      colorIndex: 1.00,
      spectralType: "K0III",
      epoch: 2000
    }
  ];

/* -------------------------------------------------------------------------- */
/* Catalog class                                                               */
/* -------------------------------------------------------------------------- */

export class StarCatalog {
  private stars =
    new Map<
      string,
      StarCatalogEntry
    >();

  constructor(
    stars: readonly StarCatalogEntry[] = []
  ) {
    this.addMany(
      stars
    );
  }

  add(
    star: StarCatalogEntry
  ): void {
    const normalized =
      createStar(
        star
      );

    this.stars.set(
      normalized.id,
      normalized
    );
  }

  addMany(
    stars: readonly StarCatalogEntry[]
  ): void {
    for (
      const star of stars
    ) {
      this.add(star);
    }
  }

  remove(
    id: string
  ): boolean {
    return this.stars.delete(
      id
    );
  }

  get(
    id: string
  ): StarCatalogEntry |
    undefined {
    return this.stars.get(
      id
    );
  }

  has(
    id: string
  ): boolean {
    return this.stars.has(
      id
    );
  }

  all(): StarCatalogEntry[] {
    return Array.from(
      this.stars.values()
    );
  }

  size(): number {
    return this.stars.size;
  }

  bright(
    maximumMagnitude = 6
  ): StarCatalogEntry[] {
    return this.all().filter(
      star =>
        isStarBrightEnough(
          star,
          maximumMagnitude
        )
    );
  }

  search(
    query: string
  ): StarCatalogEntry[] {
    const normalized =
      query
        .trim()
        .toLowerCase();

    if (
      !normalized
    ) {
      return [];
    }

    return this.all().filter(
      star =>
        star.id
          .toLowerCase()
          .includes(
            normalized
          ) ||
        star.name
          ?.toLowerCase()
          .includes(
            normalized
          )
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Default catalog                                                             */
/* -------------------------------------------------------------------------- */

export const defaultStarCatalog =
  new StarCatalog(
    BRIGHT_STARS
  );

/* -------------------------------------------------------------------------- */
/* Default API                                                                 */
/* -------------------------------------------------------------------------- */

export const Stars = {
  create:
    createStar,

  position:
    starPosition,

  horizontal:
    starHorizontalPosition,

  propagate:
    propagateStar,

  motion:
    starMotion,

  separation:
    angularSeparation,

  visible:
    isStarVisible,

  magnitudeToFlux,

  fluxToMagnitude,

  brightness:
    relativeBrightness,

  colorTemperature:
    colorIndexToTemperature,

  colorClass:
    colorIndexToSpectralClass,

  colorRGB:
    colorIndexToRGB,

  spectralClass,

  distanceFromParallax:
    parallaxToParsecs,

  catalog:
    defaultStarCatalog
} as const;
