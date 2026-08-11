/**
 * Space
 * Astronomy — Stellar Magnitude
 *
 * Apparent/absolute magnitude, distance modulus, luminosity
 * and flux-ratio utilities for stars.
 */

import {
  Star,
  getStarDistanceLightYears
} from "./stars";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Reference apparent magnitude.
 */
export const MAGNITUDE_ZERO =
  0;

/**
 * Five magnitudes correspond to a factor of 100 in brightness.
 */
export const MAGNITUDE_BASE =
  100;

/**
 * Standard parsec distance.
 */
export const PARSEC_LIGHT_YEARS =
  3.261563777;

/**
 * Approximate absolute bolometric magnitude of the Sun.
 */
export const SOLAR_ABSOLUTE_MAGNITUDE =
  4.74;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MagnitudePair {
  apparent:
    number;

  absolute:
    number;

  distanceParsecs:
    number;
}

export interface MagnitudeRange {
  minimum:
    number;

  maximum:
    number;
}

export interface BrightnessComparison {
  magnitudeA:
    number;

  magnitudeB:
    number;

  ratio:
    number;

  brighter:
    "a" |
    "b" |
    "equal";
}

/* -------------------------------------------------------------------------- */
/* Apparent / Absolute Magnitude                                              */
/* -------------------------------------------------------------------------- */

/**
 * Calculates absolute magnitude from apparent magnitude and distance.
 *
 * Distance is expressed in parsecs.
 *
 * M = m - 5 log10(d / 10)
 */
export function apparentToAbsoluteMagnitude(
  apparentMagnitude:
    number,
  distanceParsecs:
    number
):
  number {
  validateMagnitude(
    apparentMagnitude
  );

  validatePositiveDistance(
    distanceParsecs
  );

  return (
    apparentMagnitude -
    5 *
      Math.log10(
        distanceParsecs /
          10
      )
  );
}

/**
 * Calculates apparent magnitude from absolute magnitude and distance.
 */
export function absoluteToApparentMagnitude(
  absoluteMagnitude:
    number,
  distanceParsecs:
    number
):
  number {
  validateMagnitude(
    absoluteMagnitude
  );

  validatePositiveDistance(
    distanceParsecs
  );

  return (
    absoluteMagnitude +
    5 *
      Math.log10(
        distanceParsecs /
          10
      )
  );
}

/**
 * Calculates distance modulus.
 */
export function distanceModulus(
  distanceParsecs:
    number
):
  number {
  validatePositiveDistance(
    distanceParsecs
  );

  return (
    5 *
      Math.log10(
        distanceParsecs
      ) -
    5
  );
}

/**
 * Calculates distance in parsecs from apparent and absolute magnitude.
 */
export function magnitudeToDistanceParsecs(
  apparentMagnitude:
    number,
  absoluteMagnitude:
    number
):
  number {
  validateMagnitude(
    apparentMagnitude
  );

  validateMagnitude(
    absoluteMagnitude
  );

  return (
    10 **
    (
      (
        apparentMagnitude -
        absoluteMagnitude +
        5
      ) /
      5
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Parallax                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Calculates distance in parsecs from parallax in arcseconds.
 */
export function parallaxToDistanceParsecs(
  parallaxArcseconds:
    number
):
  number {
  if (
    !Number.isFinite(
      parallaxArcseconds
    ) ||
    parallaxArcseconds <=
      0
  ) {
    throw new RangeError(
      "Parallax must be greater than zero."
    );
  }

  return (
    1 /
    parallaxArcseconds
  );
}

/**
 * Calculates distance in parsecs from parallax in milliarcseconds.
 */
export function parallaxMasToDistanceParsecs(
  parallaxMas:
    number
):
  number {
  if (
    !Number.isFinite(
      parallaxMas
    ) ||
    parallaxMas <=
      0
  ) {
    throw new RangeError(
      "Parallax must be greater than zero."
    );
  }

  return (
    1000 /
    parallaxMas
  );
}

/* -------------------------------------------------------------------------- */
/* Brightness                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns brightness ratio.
 *
 * A positive result greater than 1 means magnitude A is brighter than B.
 */
export function brightnessRatio(
  magnitudeA:
    number,
  magnitudeB:
    number
):
  number {
  validateMagnitude(
    magnitudeA
  );

  validateMagnitude(
    magnitudeB
  );

  return (
    10 **
    (
      0.4 *
      (
        magnitudeB -
        magnitudeA
      )
    )
  );
}

/**
 * Returns the magnitude difference corresponding to a brightness ratio.
 */
export function magnitudeDifferenceFromBrightnessRatio(
  ratio:
    number
):
  number {
  if (
    !Number.isFinite(
      ratio
    ) ||
    ratio <=
      0
  ) {
    throw new RangeError(
      "Brightness ratio must be greater than zero."
    );
  }

  return (
    -2.5 *
    Math.log10(
      ratio
    )
  );
}

/**
 * Compares two magnitudes.
 */
export function compareMagnitudes(
  magnitudeA:
    number,
  magnitudeB:
    number
):
  BrightnessComparison {
  const ratio =
    brightnessRatio(
      magnitudeA,
      magnitudeB
    );

  let brighter:
    BrightnessComparison[
      "brighter"
    ];

  if (
    magnitudeA <
    magnitudeB
  ) {
    brighter =
      "a";
  } else if (
    magnitudeB <
    magnitudeA
  ) {
    brighter =
      "b";
  } else {
    brighter =
      "equal";
  }

  return {
    magnitudeA,
    magnitudeB,
    ratio,
    brighter
  };
}

/* -------------------------------------------------------------------------- */
/* Flux                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Converts magnitude difference into relative flux.
 *
 * Returned value is relative to the reference object.
 */
export function magnitudeDifferenceToFluxRatio(
  magnitudeDifference:
    number
):
  number {
  if (
    !Number.isFinite(
      magnitudeDifference
    )
  ) {
    throw new TypeError(
      "Magnitude difference must be finite."
    );
  }

  return (
    10 **
    (
      -0.4 *
      magnitudeDifference
    )
  );
}

/**
 * Converts relative flux ratio into magnitude difference.
 */
export function fluxRatioToMagnitudeDifference(
  fluxRatio:
    number
):
  number {
  if (
    !Number.isFinite(
      fluxRatio
    ) ||
    fluxRatio <=
      0
  ) {
    throw new RangeError(
      "Flux ratio must be greater than zero."
    );
  }

  return (
    -2.5 *
    Math.log10(
      fluxRatio
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Luminosity                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Estimates luminosity relative to the Sun from absolute bolometric
 * magnitude.
 *
 * L / L☉ = 10 ^ (0.4 * (M☉ - M))
 */
export function luminosityFromAbsoluteMagnitude(
  absoluteMagnitude:
    number,
  solarAbsoluteMagnitude:
    number =
      SOLAR_ABSOLUTE_MAGNITUDE
):
  number {
  validateMagnitude(
    absoluteMagnitude
  );

  validateMagnitude(
    solarAbsoluteMagnitude
  );

  return (
    10 **
    (
      0.4 *
      (
        solarAbsoluteMagnitude -
        absoluteMagnitude
      )
    )
  );
}

/**
 * Estimates absolute bolometric magnitude from solar-relative luminosity.
 */
export function absoluteMagnitudeFromLuminosity(
  luminositySolar:
    number,
  solarAbsoluteMagnitude:
    number =
      SOLAR_ABSOLUTE_MAGNITUDE
):
  number {
  if (
    !Number.isFinite(
      luminositySolar
    ) ||
    luminositySolar <=
      0
  ) {
    throw new RangeError(
      "Solar-relative luminosity must be greater than zero."
    );
  }

  validateMagnitude(
    solarAbsoluteMagnitude
  );

  return (
    solarAbsoluteMagnitude -
    2.5 *
      Math.log10(
        luminositySolar
      )
  );
}

/* -------------------------------------------------------------------------- */
/* Star Helpers                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Calculates absolute magnitude from a Star object.
 *
 * Uses distanceParsecs, distanceLightYears or parallaxMas.
 */
export function calculateStarAbsoluteMagnitude(
  star:
    Star
):
  number |
  null {
  if (
    star.apparentMagnitude ===
      undefined
  ) {
    return null;
  }

  const distanceParsecs =
    getStarDistanceParsecs(
      star
    );

  if (
    distanceParsecs ===
    null
  ) {
    return null;
  }

  return apparentToAbsoluteMagnitude(
    star.apparentMagnitude,
    distanceParsecs
  );
}

/**
 * Calculates solar-relative luminosity from a Star.
 */
export function calculateStarRelativeLuminosity(
  star:
    Star
):
  number |
  null {
  const absoluteMagnitude =
    star.absoluteMagnitude ??
    calculateStarAbsoluteMagnitude(
      star
    );

  if (
    absoluteMagnitude ===
      null ||
    absoluteMagnitude ===
      undefined
  ) {
    return null;
  }

  return luminosityFromAbsoluteMagnitude(
    absoluteMagnitude
  );
}

/**
 * Returns the best available distance in parsecs.
 */
export function getStarDistanceParsecs(
  star:
    Star
):
  number |
  null {
  if (
    star.distanceParsecs !==
      undefined &&
    Number.isFinite(
      star.distanceParsecs
    ) &&
    star.distanceParsecs >
      0
  ) {
    return star.distanceParsecs;
  }

  if (
    star.parallaxMas !==
      undefined &&
    Number.isFinite(
      star.parallaxMas
    ) &&
    star.parallaxMas >
      0
  ) {
    return (
      1000 /
      star.parallaxMas
    );
  }

  const lightYears =
    getStarDistanceLightYears(
      star
    );

  if (
    lightYears !==
      null &&
    lightYears >
      0
  ) {
    return (
      lightYears /
      PARSEC_LIGHT_YEARS
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Magnitude Limits                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Returns whether an object is brighter than the requested magnitude.
 */
export function isBrighterThan(
  magnitude:
    number,
  threshold:
    number
):
  boolean {
  validateMagnitude(
    magnitude
  );

  validateMagnitude(
    threshold
  );

  return (
    magnitude <
    threshold
  );
}

/**
 * Returns whether an object is visible under a magnitude limit.
 *
 * A lower magnitude means a brighter object.
 */
export function isWithinMagnitudeLimit(
  magnitude:
    number,
  limit:
    number
):
  boolean {
  validateMagnitude(
    magnitude
  );

  validateMagnitude(
    limit
  );

  return (
    magnitude <=
    limit
  );
}

/**
 * Filters stars by apparent magnitude.
 */
export function filterStarsByMagnitude<
  T extends {
    apparentMagnitude?:
      number;
  }
>(
  stars:
    readonly T[],
  minimum:
    number =
      -Infinity,
  maximum:
    number =
      Infinity
):
  T[] {
  if (
    !Number.isFinite(
      minimum
    ) &&
    minimum !==
      -Infinity
  ) {
    throw new TypeError(
      "Minimum magnitude must be finite or -Infinity."
    );
  }

  if (
    !Number.isFinite(
      maximum
    ) &&
    maximum !==
      Infinity
  ) {
    throw new TypeError(
      "Maximum magnitude must be finite or Infinity."
    );
  }

  if (
    minimum >
    maximum
  ) {
    throw new RangeError(
      "Minimum magnitude cannot exceed maximum magnitude."
    );
  }

  return stars.filter(
    (
      star
    ) =>
      star.apparentMagnitude !==
        undefined &&
      star.apparentMagnitude >=
        minimum &&
      star.apparentMagnitude <=
        maximum
  );
}

/* -------------------------------------------------------------------------- */
/* Magnitude Ranges                                                            */
/* -------------------------------------------------------------------------- */

export function createMagnitudeRange(
  minimum:
    number,
  maximum:
    number
):
  MagnitudeRange {
  validateMagnitude(
    minimum
  );

  validateMagnitude(
    maximum
  );

  if (
    minimum >
    maximum
  ) {
    throw new RangeError(
      "Minimum magnitude cannot exceed maximum magnitude."
    );
  }

  return {
    minimum,
    maximum
  };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function validateMagnitude(
  magnitude:
    number
):
  void {
  if (
    !Number.isFinite(
      magnitude
    )
  ) {
    throw new TypeError(
      "Magnitude must be finite."
    );
  }
}

function validatePositiveDistance(
  distance:
    number
):
  void {
  if (
    !Number.isFinite(
      distance
    ) ||
    distance <=
      0
  ) {
    throw new RangeError(
      "Distance must be greater than zero."
    );
  }
}

export default {
  apparentToAbsoluteMagnitude,
  absoluteToApparentMagnitude,
  distanceModulus,
  magnitudeToDistanceParsecs,
  parallaxToDistanceParsecs,
  parallaxMasToDistanceParsecs,
  brightnessRatio,
  compareMagnitudes,
  magnitudeDifferenceFromBrightnessRatio,
  magnitudeDifferenceToFluxRatio,
  fluxRatioToMagnitudeDifference,
  luminosityFromAbsoluteMagnitude,
  absoluteMagnitudeFromLuminosity,
  calculateStarAbsoluteMagnitude,
  calculateStarRelativeLuminosity,
  getStarDistanceParsecs,
  isBrighterThan,
  isWithinMagnitudeLimit,
  filterStarsByMagnitude,
  createMagnitudeRange
};
