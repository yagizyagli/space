/**
 * Space
 * Astronomy Coordinates
 *
 * Central coordinate conversion and normalization utilities.
 *
 * Supported systems:
 * - Equatorial (Right Ascension / Declination)
 * - Horizontal (Altitude / Azimuth)
 * - Ecliptic
 * - Galactic
 * - Cartesian
 * - Spherical
 *
 * Angles are represented in radians internally.
 */

export interface EquatorialCoordinate {
  rightAscension: number;
  declination: number;
}

export interface HorizontalCoordinate {
  altitude: number;
  azimuth: number;
}

export interface EclipticCoordinate {
  longitude: number;
  latitude: number;
}

export interface GalacticCoordinate {
  longitude: number;
  latitude: number;
}

export interface CartesianCoordinate {
  x: number;
  y: number;
  z: number;
}

export interface SphericalCoordinate {
  radius: number;
  theta: number;
  phi: number;
}

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface EquatorialToHorizontalOptions {
  latitude: number;
  localSiderealTime: number;
}

export interface CoordinateTransformOptions {
  obliquity?: number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export const HALF_PI = Math.PI / 2;

export const DEG_TO_RAD =
  Math.PI / 180;

export const RAD_TO_DEG =
  180 / Math.PI;

export const HOUR_TO_RAD =
  Math.PI / 12;

export const RAD_TO_HOUR =
  12 / Math.PI;

/**
 * Mean obliquity of the ecliptic around J2000.
 */
export const J2000_OBLIQUITY =
  23.439291111 *
  DEG_TO_RAD;

/**
 * IAU galactic coordinate transformation.
 *
 * Equatorial J2000 -> Galactic.
 */
const GALACTIC_MATRIX = [
  [
    -0.0548755604,
    -0.8734370902,
    -0.4838350155
  ],
  [
     0.4941094279,
    -0.4448296300,
     0.7469822445
  ],
  [
    -0.8676661490,
    -0.1980763734,
     0.4559837762
  ]
] as const;

/* -------------------------------------------------------------------------- */
/* Normalization                                                               */
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

export function normalizeSignedAngle(
  angle: number
): number {
  let value =
    normalizeAngle(angle);

  if (
    value > Math.PI
  ) {
    value -= TWO_PI;
  }

  return value;
}

export function normalizeRightAscension(
  rightAscension: number
): number {
  return normalizeAngle(
    rightAscension
  );
}

export function clampDeclination(
  declination: number
): number {
  return Math.max(
    -HALF_PI,
    Math.min(
      HALF_PI,
      declination
    )
  );
}

export function clampLatitude(
  latitude: number
): number {
  return Math.max(
    -HALF_PI,
    Math.min(
      HALF_PI,
      latitude
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Unit conversion                                                             */
/* -------------------------------------------------------------------------- */

export function degreesToRadians(
  degrees: number
): number {
  return degrees *
    DEG_TO_RAD;
}

export function radiansToDegrees(
  radians: number
): number {
  return radians *
    RAD_TO_DEG;
}

export function hoursToRadians(
  hours: number
): number {
  return hours *
    HOUR_TO_RAD;
}

export function radiansToHours(
  radians: number
): number {
  return radians *
    RAD_TO_HOUR;
}

export function degreesToHours(
  degrees: number
): number {
  return degrees / 15;
}

export function hoursToDegrees(
  hours: number
): number {
  return hours * 15;
}

/* -------------------------------------------------------------------------- */
/* Equatorial <-> Cartesian                                                    */
/* -------------------------------------------------------------------------- */

export function equatorialToCartesian(
  coordinate: EquatorialCoordinate,
  radius = 1
): CartesianCoordinate {
  const ra =
    coordinate.rightAscension;

  const dec =
    coordinate.declination;

  const cosDec =
    Math.cos(dec);

  return {
    x:
      radius *
      cosDec *
      Math.cos(ra),

    y:
      radius *
      cosDec *
      Math.sin(ra),

    z:
      radius *
      Math.sin(dec)
  };
}

export function cartesianToEquatorial(
  coordinate: CartesianCoordinate
): EquatorialCoordinate {
  const {
    x,
    y,
    z
  } = coordinate;

  const radius =
    Math.sqrt(
      x * x +
      y * y +
      z * z
    );

  if (
    radius === 0
  ) {
    return {
      rightAscension: 0,
      declination: 0
    };
  }

  return {
    rightAscension:
      normalizeRightAscension(
        Math.atan2(
          y,
          x
        )
      ),

    declination:
      Math.asin(
        clamp(
          z / radius,
          -1,
          1
        )
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Spherical <-> Cartesian                                                    */
/* -------------------------------------------------------------------------- */

export function sphericalToCartesian(
  coordinate: SphericalCoordinate
): CartesianCoordinate {
  const {
    radius,
    theta,
    phi
  } = coordinate;

  const sinPhi =
    Math.sin(phi);

  return {
    x:
      radius *
      sinPhi *
      Math.cos(theta),

    y:
      radius *
      sinPhi *
      Math.sin(theta),

    z:
      radius *
      Math.cos(phi)
  };
}

export function cartesianToSpherical(
  coordinate: CartesianCoordinate
): SphericalCoordinate {
  const {
    x,
    y,
    z
  } = coordinate;

  const radius =
    Math.sqrt(
      x * x +
      y * y +
      z * z
    );

  if (
    radius === 0
  ) {
    return {
      radius: 0,
      theta: 0,
      phi: 0
    };
  }

  return {
    radius,

    theta:
      normalizeAngle(
        Math.atan2(
          y,
          x
        )
      ),

    phi:
      Math.acos(
        clamp(
          z / radius,
          -1,
          1
        )
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Equatorial -> Horizontal                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Convert equatorial coordinates to horizontal coordinates.
 *
 * All angles are radians.
 *
 * latitude:
 * observer latitude
 *
 * localSiderealTime:
 * local sidereal time expressed as radians
 */
export function equatorialToHorizontal(
  coordinate: EquatorialCoordinate,
  options: EquatorialToHorizontalOptions
): HorizontalCoordinate {
  const {
    latitude,
    localSiderealTime
  } = options;

  const ra =
    coordinate.rightAscension;

  const dec =
    coordinate.declination;

  const hourAngle =
    normalizeSignedAngle(
      localSiderealTime -
      ra
    );

  const sinAltitude =
    Math.sin(latitude) *
      Math.sin(dec) +
    Math.cos(latitude) *
      Math.cos(dec) *
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
    normalizeAngle(
      Math.atan2(
        -Math.sin(hourAngle),
        Math.tan(dec) *
          Math.cos(latitude) -
          Math.sin(latitude) *
            Math.cos(hourAngle)
      )
    );

  return {
    altitude,
    azimuth
  };
}

/* -------------------------------------------------------------------------- */
/* Horizontal -> Equatorial                                                    */
/* -------------------------------------------------------------------------- */

export function horizontalToEquatorial(
  coordinate: HorizontalCoordinate,
  options: EquatorialToHorizontalOptions
): EquatorialCoordinate {
  const {
    latitude,
    localSiderealTime
  } = options;

  const {
    altitude,
    azimuth
  } = coordinate;

  const sinDec =
    Math.sin(latitude) *
      Math.sin(altitude) +
    Math.cos(latitude) *
      Math.cos(altitude) *
      Math.cos(azimuth);

  const declination =
    Math.asin(
      clamp(
        sinDec,
        -1,
        1
      )
    );

  const hourAngle =
    Math.atan2(
      -Math.sin(azimuth),
      Math.tan(altitude) *
        Math.cos(latitude) -
        Math.sin(latitude) *
          Math.cos(azimuth)
    );

  return {
    rightAscension:
      normalizeRightAscension(
        localSiderealTime -
        hourAngle
      ),

    declination
  };
}

/* -------------------------------------------------------------------------- */
/* Equatorial <-> Ecliptic                                                     */
/* -------------------------------------------------------------------------- */

export function equatorialToEcliptic(
  coordinate: EquatorialCoordinate,
  options: CoordinateTransformOptions = {}
): EclipticCoordinate {
  const epsilon =
    options.obliquity ??
    J2000_OBLIQUITY;

  const {
    rightAscension,
    declination
  } = coordinate;

  const sinDec =
    Math.sin(declination);

  const cosDec =
    Math.cos(declination);

  const sinRA =
    Math.sin(rightAscension);

  const cosRA =
    Math.cos(rightAscension);

  const longitude =
    Math.atan2(
      sinRA * Math.cos(epsilon) +
        Math.tan(declination) *
          Math.sin(epsilon),
      cosRA
    );

  const latitude =
    Math.asin(
      clamp(
        sinDec *
          Math.cos(epsilon) -
        cosDec *
          Math.sin(epsilon) *
          sinRA,
        -1,
        1
      )
    );

  return {
    longitude:
      normalizeAngle(
        longitude
      ),

    latitude
  };
}

export function eclipticToEquatorial(
  coordinate: EclipticCoordinate,
  options: CoordinateTransformOptions = {}
): EquatorialCoordinate {
  const epsilon =
    options.obliquity ??
    J2000_OBLIQUITY;

  const {
    longitude,
    latitude
  } = coordinate;

  const sinLat =
    Math.sin(latitude);

  const cosLat =
    Math.cos(latitude);

  const sinLon =
    Math.sin(longitude);

  const cosLon =
    Math.cos(longitude);

  const rightAscension =
    Math.atan2(
      sinLon * Math.cos(epsilon) -
        Math.tan(latitude) *
          Math.sin(epsilon),
      cosLon
    );

  const declination =
    Math.asin(
      clamp(
        sinLat *
          Math.cos(epsilon) +
        cosLat *
          Math.sin(epsilon) *
          sinLon,
        -1,
        1
      )
    );

  return {
    rightAscension:
      normalizeRightAscension(
        rightAscension
      ),

    declination
  };
}

/* -------------------------------------------------------------------------- */
/* Ecliptic <-> Cartesian                                                      */
/* -------------------------------------------------------------------------- */

export function eclipticToCartesian(
  coordinate: EclipticCoordinate,
  radius = 1
): CartesianCoordinate {
  const {
    longitude,
    latitude
  } = coordinate;

  const cosLat =
    Math.cos(latitude);

  return {
    x:
      radius *
      cosLat *
      Math.cos(longitude),

    y:
      radius *
      cosLat *
      Math.sin(longitude),

    z:
      radius *
      Math.sin(latitude)
  };
}

export function cartesianToEcliptic(
  coordinate: CartesianCoordinate
): EclipticCoordinate {
  const equatorial =
    cartesianToEquatorial(
      coordinate
    );

  return equatorialToEcliptic(
    equatorial
  );
}

/* -------------------------------------------------------------------------- */
/* Galactic                                                                    */
/* -------------------------------------------------------------------------- */

export function equatorialToGalactic(
  coordinate: EquatorialCoordinate
): GalacticCoordinate {
  const cartesian =
    equatorialToCartesian(
      coordinate
    );

  const x =
    GALACTIC_MATRIX[0][0] *
      cartesian.x +
    GALACTIC_MATRIX[0][1] *
      cartesian.y +
    GALACTIC_MATRIX[0][2] *
      cartesian.z;

  const y =
    GALACTIC_MATRIX[1][0] *
      cartesian.x +
    GALACTIC_MATRIX[1][1] *
      cartesian.y +
    GALACTIC_MATRIX[1][2] *
      cartesian.z;

  const z =
    GALACTIC_MATRIX[2][0] *
      cartesian.x +
    GALACTIC_MATRIX[2][1] *
      cartesian.y +
    GALACTIC_MATRIX[2][2] *
      cartesian.z;

  const longitude =
    normalizeAngle(
      Math.atan2(
        y,
        x
      )
    );

  const latitude =
    Math.asin(
      clamp(
        z,
        -1,
        1
      )
    );

  return {
    longitude,
    latitude
  };
}

/**
 * Galactic -> Equatorial.
 *
 * Uses the transpose of the orthogonal
 * transformation matrix.
 */
export function galacticToEquatorial(
  coordinate: GalacticCoordinate
): EquatorialCoordinate {
  const {
    longitude,
    latitude
  } = coordinate;

  const cosLat =
    Math.cos(latitude);

  const galacticVector: CartesianCoordinate = {
    x:
      cosLat *
      Math.cos(longitude),

    y:
      cosLat *
      Math.sin(longitude),

    z:
      Math.sin(latitude)
  };

  const x =
    GALACTIC_MATRIX[0][0] *
      galacticVector.x +
    GALACTIC_MATRIX[1][0] *
      galacticVector.y +
    GALACTIC_MATRIX[2][0] *
      galacticVector.z;

  const y =
    GALACTIC_MATRIX[0][1] *
      galacticVector.x +
    GALACTIC_MATRIX[1][1] *
      galacticVector.y +
    GALACTIC_MATRIX[2][1] *
      galacticVector.z;

  const z =
    GALACTIC_MATRIX[0][2] *
      galacticVector.x +
    GALACTIC_MATRIX[1][2] *
      galacticVector.y +
    GALACTIC_MATRIX[2][2] *
      galacticVector.z;

  return cartesianToEquatorial({
    x,
    y,
    z
  });
}

/* -------------------------------------------------------------------------- */
/* Angular distance                                                            */
/* -------------------------------------------------------------------------- */

export function angularDistance(
  a: EquatorialCoordinate,
  b: EquatorialCoordinate
): number {
  const deltaRA =
    b.rightAscension -
    a.rightAscension;

  const sinA =
    Math.sin(a.declination);

  const cosA =
    Math.cos(a.declination);

  const sinB =
    Math.sin(b.declination);

  const cosB =
    Math.cos(b.declination);

  return Math.acos(
    clamp(
      sinA * sinB +
        cosA *
          cosB *
          Math.cos(deltaRA),
      -1,
      1
    )
  );
}

export function angularDistanceDegrees(
  a: EquatorialCoordinate,
  b: EquatorialCoordinate
): number {
  return radiansToDegrees(
    angularDistance(
      a,
      b
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Position angle                                                              */
/* -------------------------------------------------------------------------- */

export function positionAngle(
  from: EquatorialCoordinate,
  to: EquatorialCoordinate
): number {
  const deltaRA =
    to.rightAscension -
    from.rightAscension;

  const y =
    Math.sin(deltaRA) *
    Math.cos(to.declination);

  const x =
    Math.cos(from.declination) *
      Math.sin(to.declination) -
    Math.sin(from.declination) *
      Math.cos(to.declination) *
      Math.cos(deltaRA);

  return normalizeAngle(
    Math.atan2(
      y,
      x
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Interpolation                                                               */
/* -------------------------------------------------------------------------- */

export function interpolateEquatorial(
  a: EquatorialCoordinate,
  b: EquatorialCoordinate,
  t: number
): EquatorialCoordinate {
  const first =
    equatorialToCartesian(a);

  const second =
    equatorialToCartesian(b);

  const x =
    first.x +
    (second.x - first.x) *
      t;

  const y =
    first.y +
    (second.y - first.y) *
      t;

  const z =
    first.z +
    (second.z - first.z) *
      t;

  return cartesianToEquatorial({
    x,
    y,
    z
  });
}

/* -------------------------------------------------------------------------- */
/* Vector operations                                                           */
/* -------------------------------------------------------------------------- */

export function dot(
  a: CartesianCoordinate,
  b: CartesianCoordinate
): number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z
  );
}

export function cross(
  a: CartesianCoordinate,
  b: CartesianCoordinate
): CartesianCoordinate {
  return {
    x:
      a.y * b.z -
      a.z * b.y,

    y:
      a.z * b.x -
      a.x * b.z,

    z:
      a.x * b.y -
      a.y * b.x
  };
}

export function magnitude(
  vector: CartesianCoordinate
): number {
  return Math.sqrt(
    dot(
      vector,
      vector
    )
  );
}

export function normalizeVector(
  vector: CartesianCoordinate
): CartesianCoordinate {
  const length =
    magnitude(vector);

  if (
    length === 0
  ) {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }

  return {
    x:
      vector.x / length,

    y:
      vector.y / length,

    z:
      vector.z / length
  };
}

/* -------------------------------------------------------------------------- */
/* Rotation matrices                                                           */
/* -------------------------------------------------------------------------- */

export type Matrix3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export function rotationX(
  angle: number
): Matrix3 {
  const c =
    Math.cos(angle);

  const s =
    Math.sin(angle);

  return [
    [1, 0, 0],
    [0, c, -s],
    [0, s, c]
  ];
}

export function rotationY(
  angle: number
): Matrix3 {
  const c =
    Math.cos(angle);

  const s =
    Math.sin(angle);

  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c]
  ];
}

export function rotationZ(
  angle: number
): Matrix3 {
  const c =
    Math.cos(angle);

  const s =
    Math.sin(angle);

  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1]
  ];
}

export function multiplyMatrixVector(
  matrix: Matrix3,
  vector: CartesianCoordinate
): CartesianCoordinate {
  return {
    x:
      matrix[0][0] * vector.x +
      matrix[0][1] * vector.y +
      matrix[0][2] * vector.z,

    y:
      matrix[1][0] * vector.x +
      matrix[1][1] * vector.y +
      matrix[1][2] * vector.z,

    z:
      matrix[2][0] * vector.x +
      matrix[2][1] * vector.y +
      matrix[2][2] * vector.z
  };
}

/* -------------------------------------------------------------------------- */
/* Rotation helpers                                                            */
/* -------------------------------------------------------------------------- */

export function rotateVector(
  vector: CartesianCoordinate,
  axis:
    | "x"
    | "y"
    | "z",
  angle: number
): CartesianCoordinate {
  let matrix: Matrix3;

  switch (axis) {
    case "x":
      matrix =
        rotationX(angle);
      break;

    case "y":
      matrix =
        rotationY(angle);
      break;

    case "z":
      matrix =
        rotationZ(angle);
      break;
  }

  return multiplyMatrixVector(
    matrix,
    vector
  );
}

export function rotateEquatorial(
  coordinate: EquatorialCoordinate,
  axis:
    | "x"
    | "y"
    | "z",
  angle: number
): EquatorialCoordinate {
  const vector =
    equatorialToCartesian(
      coordinate
    );

  const rotated =
    rotateVector(
      vector,
      axis,
      angle
    );

  return cartesianToEquatorial(
    rotated
  );
}

/* -------------------------------------------------------------------------- */
/* Utility                                                                     */
/* -------------------------------------------------------------------------- */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

/* -------------------------------------------------------------------------- */
/* High-level API                                                              */
/* -------------------------------------------------------------------------- */

export const Coordinates = {
  normalizeAngle,

  normalizeSignedAngle,

  normalizeRightAscension,

  clampDeclination,

  clampLatitude,

  degreesToRadians,

  radiansToDegrees,

  hoursToRadians,

  radiansToHours,

  degreesToHours,

  hoursToDegrees,

  equatorialToCartesian,

  cartesianToEquatorial,

  sphericalToCartesian,

  cartesianToSpherical,

  equatorialToHorizontal,

  horizontalToEquatorial,

  equatorialToEcliptic,

  eclipticToEquatorial,

  eclipticToCartesian,

  cartesianToEcliptic,

  equatorialToGalactic,

  galacticToEquatorial,

  angularDistance,

  angularDistanceDegrees,

  positionAngle,

  interpolateEquatorial,

  dot,

  cross,

  magnitude,

  normalizeVector,

  rotationX,

  rotationY,

  rotationZ,

  multiplyMatrixVector,

  rotateVector,

  rotateEquatorial
} as const;

export default Coordinates;
