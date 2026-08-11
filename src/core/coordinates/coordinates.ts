/**
 * Space
 * Core Coordinate Types
 *
 * Fundamental astronomical coordinate representations.
 */

import { Vector3 } from "../math/vectors";

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

export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface EquatorialCoordinate {
  rightAscension: number;
  declination: number;
  distance?: number;
}

export interface EclipticCoordinate {
  longitude: number;
  latitude: number;
  distance?: number;
}

export interface HorizontalCoordinate {
  azimuth: number;
  altitude: number;
  distance?: number;
}

export class Cartesian {
  public x: number;
  public y: number;
  public z: number;

  constructor(
    x = 0,
    y = 0,
    z = 0
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toVector(): Vector3 {
    return new Vector3(
      this.x,
      this.y,
      this.z
    );
  }

  clone(): Cartesian {
    return new Cartesian(
      this.x,
      this.y,
      this.z
    );
  }

  set(
    x: number,
    y: number,
    z: number
  ): this {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  distanceTo(
    coordinate: CartesianCoordinate
  ): number {
    return Math.sqrt(
      (this.x - coordinate.x) ** 2 +
      (this.y - coordinate.y) ** 2 +
      (this.z - coordinate.z) ** 2
    );
  }

  toArray(): [number, number, number] {
    return [
      this.x,
      this.y,
      this.z
    ];
  }

  static fromVector(
    vector: Vector3
  ): Cartesian {
    return new Cartesian(
      vector.x,
      vector.y,
      vector.z
    );
  }
}

export class Spherical {
  public radius: number;
  public theta: number;
  public phi: number;

  constructor(
    radius = 0,
    theta = 0,
    phi = 0
  ) {
    this.radius = radius;
    this.theta = theta;
    this.phi = phi;
  }

  toCartesian(): Cartesian {
    const sinPhi = Math.sin(this.phi);

    return new Cartesian(
      this.radius *
        sinPhi *
        Math.cos(this.theta),

      this.radius *
        sinPhi *
        Math.sin(this.theta),

      this.radius *
        Math.cos(this.phi)
    );
  }

  static fromCartesian(
    coordinate: CartesianCoordinate
  ): Spherical {
    const radius = Math.sqrt(
      coordinate.x ** 2 +
      coordinate.y ** 2 +
      coordinate.z ** 2
    );

    if (radius === 0) {
      return new Spherical();
    }

    return new Spherical(
      radius,
      Math.atan2(
        coordinate.y,
        coordinate.x
      ),
      Math.acos(
        coordinate.z / radius
      )
    );
  }
}

export class Geographic {
  public latitude: number;
  public longitude: number;
  public altitude: number;

  constructor(
    latitude = 0,
    longitude = 0,
    altitude = 0
  ) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
  }

  clone(): Geographic {
    return new Geographic(
      this.latitude,
      this.longitude,
      this.altitude
    );
  }

  set(
    latitude: number,
    longitude: number,
    altitude = 0
  ): this {
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;

    return this;
  }

  toArray(): [
    number,
    number,
    number
  ] {
    return [
      this.latitude,
      this.longitude,
      this.altitude
    ];
  }
}

export class Equatorial {
  public rightAscension: number;
  public declination: number;
  public distance: number;

  constructor(
    rightAscension = 0,
    declination = 0,
    distance = 0
  ) {
    this.rightAscension =
      rightAscension;

    this.declination =
      declination;

    this.distance =
      distance;
  }

  clone(): Equatorial {
    return new Equatorial(
      this.rightAscension,
      this.declination,
      this.distance
    );
  }

  set(
    rightAscension: number,
    declination: number,
    distance = 0
  ): this {
    this.rightAscension =
      rightAscension;

    this.declination =
      declination;

    this.distance =
      distance;

    return this;
  }

  toArray(): [
    number,
    number,
    number
  ] {
    return [
      this.rightAscension,
      this.declination,
      this.distance
    ];
  }
}

export class Ecliptic {
  public longitude: number;
  public latitude: number;
  public distance: number;

  constructor(
    longitude = 0,
    latitude = 0,
    distance = 0
  ) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.distance = distance;
  }

  clone(): Ecliptic {
    return new Ecliptic(
      this.longitude,
      this.latitude,
      this.distance
    );
  }

  set(
    longitude: number,
    latitude: number,
    distance = 0
  ): this {
    this.longitude = longitude;
    this.latitude = latitude;
    this.distance = distance;

    return this;
  }

  toArray(): [
    number,
    number,
    number
  ] {
    return [
      this.longitude,
      this.latitude,
      this.distance
    ];
  }
}

export class Horizontal {
  public azimuth: number;
  public altitude: number;
  public distance: number;

  constructor(
    azimuth = 0,
    altitude = 0,
    distance = 0
  ) {
    this.azimuth = azimuth;
    this.altitude = altitude;
    this.distance = distance;
  }

  clone(): Horizontal {
    return new Horizontal(
      this.azimuth,
      this.altitude,
      this.distance
    );
  }

  set(
    azimuth: number,
    altitude: number,
    distance = 0
  ): this {
    this.azimuth = azimuth;
    this.altitude = altitude;
    this.distance = distance;

    return this;
  }

  toArray(): [
    number,
    number,
    number
  ] {
    return [
      this.azimuth,
      this.altitude,
      this.distance
    ];
  }
}
