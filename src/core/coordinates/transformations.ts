/**
 * Space
 * Coordinate Transformations
 *
 * Centralized coordinate-system conversion utilities.
 *
 * Internal angular units:
 * radians
 *
 * Distance:
 * arbitrary, preserved during coordinate transformations.
 */

import {
  Cartesian,
  Ecliptic,
  Equatorial,
  Horizontal,
  type CartesianCoordinate,
  type EclipticCoordinate,
  type EquatorialCoordinate,
  type HorizontalCoordinate
} from "./coordinates";

import {
  cartesianToEquatorial,
  equatorialToCartesian
} from "./equatorial";

import {
  cartesianToEcliptic,
  eclipticToCartesian,
  eclipticToEquatorial,
  equatorialToEcliptic
} from "./ecliptic";

import {
  equatorialToHorizontal,
  horizontalToEquatorial,
  type Observer
} from "./horizontal";

/* -------------------------------------------------------------------------- */
/* Cartesian ↔ Equatorial                                                     */
/* -------------------------------------------------------------------------- */

export function cartesianToEquatorialCoordinate(
  coordinate: CartesianCoordinate
): Equatorial {
  return cartesianToEquatorial(
    coordinate
  );
}

export function equatorialToCartesianCoordinate(
  coordinate: EquatorialCoordinate
): Cartesian {
  return equatorialToCartesian(
    coordinate
  );
}

/* -------------------------------------------------------------------------- */
/* Cartesian ↔ Ecliptic                                                       */
/* -------------------------------------------------------------------------- */

export function cartesianToEclipticCoordinate(
  coordinate: CartesianCoordinate
): Ecliptic {
  return cartesianToEcliptic(
    coordinate
  );
}

export function eclipticToCartesianCoordinate(
  coordinate: EclipticCoordinate
): Cartesian {
  return eclipticToCartesian(
    coordinate
  );
}

/* -------------------------------------------------------------------------- */
/* Equatorial ↔ Ecliptic                                                       */
/* -------------------------------------------------------------------------- */

export function equatorialCoordinateToEcliptic(
  coordinate: EquatorialCoordinate,
  obliquity?: number
): Ecliptic {
  return equatorialToEcliptic(
    coordinate,
    { obliquity }
  );
}

export function eclipticCoordinateToEquatorial(
  coordinate: EclipticCoordinate,
  obliquity?: number
): Equatorial {
  return eclipticToEquatorial(
    coordinate,
    { obliquity }
  );
}

/* -------------------------------------------------------------------------- */
/* Equatorial ↔ Horizontal                                                    */
/* -------------------------------------------------------------------------- */

export function equatorialCoordinateToHorizontal(
  coordinate: EquatorialCoordinate,
  observer: Observer,
  localSiderealTime: number
): Horizontal {
  return equatorialToHorizontal(
    coordinate.rightAscension,
    coordinate.declination,
    observer.latitude,
    localSiderealTime,
    coordinate.distance ?? 0
  );
}

export function horizontalCoordinateToEquatorial(
  coordinate: HorizontalCoordinate,
  observer: Observer,
  localSiderealTime: number
): Equatorial {
  return horizontalToEquatorial(
    coordinate.azimuth,
    coordinate.altitude,
    observer.latitude,
    localSiderealTime,
    coordinate.distance ?? 0
  );
}

/* -------------------------------------------------------------------------- */
/* Ecliptic ↔ Horizontal                                                      */
/* -------------------------------------------------------------------------- */

export function eclipticToHorizontal(
  coordinate: EclipticCoordinate,
  observer: Observer,
  localSiderealTime: number,
  obliquity?: number
): Horizontal {
  const equatorial =
    eclipticToEquatorial(
      coordinate,
      { obliquity }
    );

  return equatorialToHorizontal(
    equatorial.rightAscension,
    equatorial.declination,
    observer.latitude,
    localSiderealTime,
    coordinate.distance ?? 0
  );
}

export function horizontalToEcliptic(
  coordinate: HorizontalCoordinate,
  observer: Observer,
  localSiderealTime: number,
  obliquity?: number
): Ecliptic {
  const equatorial =
    horizontalToEquatorial(
      coordinate.azimuth,
      coordinate.altitude,
      observer.latitude,
      localSiderealTime,
      coordinate.distance ?? 0
    );

  return equatorialToEcliptic(
    equatorial,
    { obliquity }
  );
}

/* -------------------------------------------------------------------------- */
/* Generic coordinate transformation                                          */
/* -------------------------------------------------------------------------- */

export type CoordinateSystem =
  | "cartesian"
  | "equatorial"
  | "ecliptic"
  | "horizontal";

export interface TransformationOptions {
  observer?: Observer;
  localSiderealTime?: number;
  obliquity?: number;
}

export type CoordinateValue =
  | Cartesian
  | Equatorial
  | Ecliptic
  | Horizontal;

/**
 * Transform a coordinate between supported coordinate systems.
 *
 * Some transformations require additional context:
 *
 * - Equatorial ↔ Horizontal requires observer + local sidereal time.
 * - Ecliptic ↔ Horizontal requires observer + local sidereal time.
 */
export function transformCoordinate(
  coordinate: CoordinateValue,
  from: CoordinateSystem,
  to: CoordinateSystem,
  options: TransformationOptions = {}
): CoordinateValue {
  if (from === to) {
    return coordinate instanceof Cartesian
      ? coordinate.clone()
      : coordinate.clone();
  }

  const {
    observer,
    localSiderealTime,
    obliquity
  } = options;

  if (
    (
      from === "horizontal" ||
      to === "horizontal"
    ) &&
    (
      observer === undefined ||
      localSiderealTime === undefined
    )
  ) {
    throw new Error(
      "Observer and localSiderealTime are required " +
      "for horizontal coordinate transformations."
    );
  }

  if (
    from === "cartesian" &&
    to === "equatorial"
  ) {
    return cartesianToEquatorial(
      coordinate
    );
  }

  if (
    from === "equatorial" &&
    to === "cartesian"
  ) {
    return equatorialToCartesian(
      coordinate
    );
  }

  if (
    from === "cartesian" &&
    to === "ecliptic"
  ) {
    return cartesianToEcliptic(
      coordinate
    );
  }

  if (
    from === "ecliptic" &&
    to === "cartesian"
  ) {
    return eclipticToCartesian(
      coordinate
    );
  }

  if (
    from === "equatorial" &&
    to === "ecliptic"
  ) {
    return equatorialToEcliptic(
      coordinate,
      { obliquity }
    );
  }

  if (
    from === "ecliptic" &&
    to === "equatorial"
  ) {
    return eclipticToEquatorial(
      coordinate,
      { obliquity }
    );
  }

  if (
    from === "equatorial" &&
    to === "horizontal"
  ) {
    return equatorialCoordinateToHorizontal(
      coordinate,
      observer!,
      localSiderealTime!
    );
  }

  if (
    from === "horizontal" &&
    to === "equatorial"
  ) {
    return horizontalCoordinateToEquatorial(
      coordinate,
      observer!,
      localSiderealTime!
    );
  }

  if (
    from === "ecliptic" &&
    to === "horizontal"
  ) {
    return eclipticToHorizontal(
      coordinate,
      observer!,
      localSiderealTime!,
      obliquity
    );
  }

  if (
    from === "horizontal" &&
    to === "ecliptic"
  ) {
    return horizontalToEcliptic(
      coordinate,
      observer!,
      localSiderealTime!,
      obliquity
    );
  }

  throw new Error(
    `Unsupported coordinate transformation: ${from} → ${to}`
  );
}

/* -------------------------------------------------------------------------- */
/* Coordinate pipeline                                                         */
/* -------------------------------------------------------------------------- */

export function transformThrough(
  coordinate: CoordinateValue,
  systems: readonly CoordinateSystem[],
  options: TransformationOptions = {}
): CoordinateValue {
  if (systems.length < 2) {
    return coordinate;
  }

  let current = coordinate;

  for (let index = 0; index < systems.length - 1; index++) {
    current = transformCoordinate(
      current,
      systems[index],
      systems[index + 1],
      options
    );
  }

  return current;
}
