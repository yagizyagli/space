/**
 * Space
 * Astronomy — Stars
 *
 * Core star model and common stellar properties.
 *
 * Catalog data belongs to catalog.ts.
 * Constellation definitions belong to constellations.ts.
 * Magnitude calculations belong to magnitude.ts.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SpectralClass =
  | "O"
  | "B"
  | "A"
  | "F"
  | "G"
  | "K"
  | "M"
  | "L"
  | "T"
  | "Y"
  | "unknown";

export type LuminosityClass =
  | "Ia"
  | "Ib"
  | "II"
  | "III"
  | "IV"
  | "V"
  | "VI"
  | "VII"
  | "unknown";

export interface EquatorialCoordinates {
  rightAscension:
    number;

  declination:
    number;
}

export interface Star {
  id:
    string;

  name?:
    string;

  designation?:
    string;

  coordinates:
    EquatorialCoordinates;

  apparentMagnitude?:
    number;

  absoluteMagnitude?:
    number;

  spectralClass?:
    SpectralClass;

  spectralType?:
    string;

  luminosityClass?:
    LuminosityClass;

  colorIndexBV?:
    number;

  distanceParsecs?:
    number;

  distanceLightYears?:
    number;

  parallaxMas?:
    number;
}

export interface StarSummary {
  id:
    string;

  name:
    string |
    null;

  rightAscension:
    number;

  declination:
    number;

  apparentMagnitude:
    number |
    null;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const SPECTRAL_CLASS_TEMPERATURES_KELVIN:
  Readonly<
    Record<
      Exclude<
        SpectralClass,
        "unknown"
      >,
      number
    >
  > = {
  O:
    30_000,

  B:
    15_000,

  A:
    8_500,

  F:
    6_500,

  G:
    5_500,

  K:
    4_500,

  M:
    3_200,

  L:
    2_000,

  T:
    1_300,

  Y:
    700
};

export const SPECTRAL_CLASS_ORDER:
  readonly SpectralClass[] = [
    "O",
    "B",
    "A",
    "F",
    "G",
    "K",
    "M",
    "L",
    "T",
    "Y"
  ];

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createStar(
  input:
    Star
):
  Star {
  validateStar(
    input
  );

  return {
    ...input,

    coordinates: {
      rightAscension:
        normalizeRightAscension(
          input.coordinates
            .rightAscension
        ),

      declination:
        input.coordinates
          .declination
    }
  };
}

/**
 * Creates a minimal star object from common catalog coordinates.
 */
export function createCatalogStar(
  id:
    string,
  rightAscension:
    number,
  declination:
    number,
  apparentMagnitude?:
    number,
  name?:
    string
):
  Star {
  return createStar({
    id,

    name,

    coordinates: {
      rightAscension,
      declination
    },

    apparentMagnitude
  });
}

/* -------------------------------------------------------------------------- */
/* Coordinate Helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Converts right ascension in hours to degrees.
 */
export function rightAscensionHoursToDegrees(
  hours:
    number
):
  number {
  if (
    !Number.isFinite(
      hours
    )
  ) {
    throw new TypeError(
      "Right ascension must be finite."
    );
  }

  return normalizeRightAscension(
    hours *
      15
  );
}

/**
 * Converts right ascension in degrees to hours.
 */
export function rightAscensionDegreesToHours(
  degrees:
    number
):
  number {
  return (
    normalizeRightAscension(
      degrees
    ) /
    15
  );
}

/**
 * Normalizes right ascension into [0, 360).
 */
export function normalizeRightAscension(
  degrees:
    number
):
  number {
  if (
    !Number.isFinite(
      degrees
    )
  ) {
    throw new TypeError(
      "Right ascension must be finite."
    );
  }

  return (
    (
      degrees %
      360
    ) +
    360
  ) %
  360;
}

/**
 * Validates declination.
 */
export function normalizeDeclination(
  degrees:
    number
):
  number {
  if (
    !Number.isFinite(
      degrees
    )
  ) {
    throw new TypeError(
      "Declination must be finite."
    );
  }

  if (
    degrees <
      -90 ||
    degrees >
      90
  ) {
    throw new RangeError(
      "Declination must be between -90 and 90 degrees."
    );
  }

  return degrees;
}

/* -------------------------------------------------------------------------- */
/* Stellar Classification                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns the principal spectral class from a spectral type.
 *
 * Examples:
 *   G2V → G
 *   M5III → M
 *   A0V → A
 */
export function getSpectralClass(
  spectralType:
    string |
    undefined
):
  SpectralClass {
  if (
    !spectralType
  ) {
    return "unknown";
  }

  const first =
    spectralType
      .trim()
      .charAt(
        0
      )
      .toUpperCase();

  if (
    SPECTRAL_CLASS_ORDER
      .includes(
        first as SpectralClass
      )
  ) {
    return first as SpectralClass;
  }

  return "unknown";
}

/**
 * Returns the approximate temperature associated with a spectral class.
 */
export function getApproximateTemperature(
  spectralClass:
    SpectralClass
):
  number |
  null {
  if (
    spectralClass ===
    "unknown"
  ) {
    return null;
  }

  return (
    SPECTRAL_CLASS_TEMPERATURES_KELVIN[
      spectralClass
    ] ??
    null
  );
}

/**
 * Returns the luminosity class portion of a spectral type.
 */
export function getLuminosityClass(
  spectralType:
    string |
    undefined
):
  LuminosityClass {
  if (
    !spectralType
  ) {
    return "unknown";
  }

  const match =
    spectralType
      .trim()
      .match(
        /(Ia|Ib|II|III|IV|V|VI|VII)\b/i
      );

  if (
    !match
  ) {
    return "unknown";
  }

  const value =
    match[1];

  switch (
    value
      .toUpperCase()
  ) {
    case "IA":
      return "Ia";

    case "IB":
      return "Ib";

    case "II":
      return "II";

    case "III":
      return "III";

    case "IV":
      return "IV";

    case "V":
      return "V";

    case "VI":
      return "VI";

    case "VII":
      return "VII";

    default:
      return "unknown";
  }
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Converts parallax in milliarcseconds to parsecs.
 */
export function parallaxMasToParsecs(
  parallaxMas:
    number
):
  number |
  null {
  if (
    !Number.isFinite(
      parallaxMas
    ) ||
    parallaxMas <=
      0
  ) {
    return null;
  }

  return (
    1_000 /
    parallaxMas
  );
}

/**
 * Converts parsecs to light years.
 */
export function parsecsToLightYears(
  parsecs:
    number
):
  number {
  if (
    !Number.isFinite(
      parsecs
    )
  ) {
    throw new TypeError(
      "Distance must be finite."
    );
  }

  return (
    parsecs *
    3.261563777
  );
}

/**
 * Converts light years to parsecs.
 */
export function lightYearsToParsecs(
  lightYears:
    number
):
  number {
  if (
    !Number.isFinite(
      lightYears
    )
  ) {
    throw new TypeError(
      "Distance must be finite."
    );
  }

  return (
    lightYears /
    3.261563777
  );
}

/* -------------------------------------------------------------------------- */
/* Star Summaries                                                             */
/* -------------------------------------------------------------------------- */

export function summarizeStar(
  star:
    Star
):
  StarSummary {
  return {
    id:
      star.id,

    name:
      star.name ??
      null,

    rightAscension:
      star.coordinates
        .rightAscension,

    declination:
      star.coordinates
        .declination,

    apparentMagnitude:
      star.apparentMagnitude ??
      null
  };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validateStar(
  star:
    Star
):
  void {
  if (
    !star.id ||
    typeof star.id !==
      "string"
  ) {
    throw new TypeError(
      "Star id must be a non-empty string."
    );
  }

  if (
    !star.coordinates
  ) {
    throw new TypeError(
      "Star coordinates are required."
    );
  }

  normalizeRightAscension(
    star.coordinates
      .rightAscension
  );

  normalizeDeclination(
    star.coordinates
      .declination
  );

  if (
    star.apparentMagnitude !==
      undefined &&
    !Number.isFinite(
      star.apparentMagnitude
    )
  ) {
    throw new TypeError(
      "Apparent magnitude must be finite."
    );
  }

  if (
    star.absoluteMagnitude !==
      undefined &&
    !Number.isFinite(
      star.absoluteMagnitude
    )
  ) {
    throw new TypeError(
      "Absolute magnitude must be finite."
    );
  }

  if (
    star.parallaxMas !==
      undefined &&
    (
      !Number.isFinite(
        star.parallaxMas
      ) ||
      star.parallaxMas <
        0
    )
  ) {
    throw new RangeError(
      "Parallax must be a non-negative finite number."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns true if a star can be represented by a known spectral class.
 */
export function hasKnownSpectralClass(
  star:
    Star
):
  boolean {
  return (
    getSpectralClass(
      star.spectralType
    ) !==
    "unknown" ||
    (
      star.spectralClass !==
        undefined &&
      star.spectralClass !==
        "unknown"
    )
  );
}

/**
 * Returns the best available distance in light years.
 */
export function getStarDistanceLightYears(
  star:
    Star
):
  number |
  null {
  if (
    star.distanceLightYears !==
      undefined &&
    Number.isFinite(
      star.distanceLightYears
    )
  ) {
    return star.distanceLightYears;
  }

  if (
    star.distanceParsecs !==
      undefined &&
    Number.isFinite(
      star.distanceParsecs
    )
  ) {
    return parsecsToLightYears(
      star.distanceParsecs
    );
  }

  if (
    star.parallaxMas !==
      undefined
  ) {
    const parsecs =
      parallaxMasToParsecs(
        star.parallaxMas
      );

    if (
      parsecs !==
        null
    ) {
      return parsecsToLightYears(
        parsecs
      );
    }
  }

  return null;
}

export default createStar;
