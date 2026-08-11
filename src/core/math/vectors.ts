/**
 * Space
 * Core Vector Mathematics
 *
 * Fundamental vector operations used throughout the Space engine.
 */

export type Vector2Like = {
  x: number;
  y: number;
};

export type Vector3Like = {
  x: number;
  y: number;
  z: number;
};

export class Vector2 {
  public x: number;
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(vector: Vector2Like): this {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  add(vector: Vector2Like): this {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  subtract(vector: Vector2Like): this {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  multiply(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar: number): this {
    if (scalar === 0) {
      throw new Error("Cannot divide a vector by zero.");
    }

    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  dot(vector: Vector2Like): number {
    return this.x * vector.x + this.y * vector.y;
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  normalize(): this {
    const length = this.length();

    if (length === 0) {
      return this;
    }

    return this.divide(length);
  }

  distanceTo(vector: Vector2Like): number {
    return Math.sqrt(
      (this.x - vector.x) ** 2 +
      (this.y - vector.y) ** 2
    );
  }

  distanceToSquared(vector: Vector2Like): number {
    return (
      (this.x - vector.x) ** 2 +
      (this.y - vector.y) ** 2
    );
  }

  equals(vector: Vector2Like, epsilon = Number.EPSILON): boolean {
    return (
      Math.abs(this.x - vector.x) <= epsilon &&
      Math.abs(this.y - vector.y) <= epsilon
    );
  }

  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static one(): Vector2 {
    return new Vector2(1, 1);
  }
}

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(vector: Vector3Like): this {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  }

  add(vector: Vector3Like): this {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  }

  subtract(vector: Vector3Like): this {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  }

  multiply(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  divide(scalar: number): this {
    if (scalar === 0) {
      throw new Error("Cannot divide a vector by zero.");
    }

    this.x /= scalar;
    this.y /= scalar;
    this.z /= scalar;
    return this;
  }

  dot(vector: Vector3Like): number {
    return (
      this.x * vector.x +
      this.y * vector.y +
      this.z * vector.z
    );
  }

  cross(vector: Vector3Like): Vector3 {
    return new Vector3(
      this.y * vector.z - this.z * vector.y,
      this.z * vector.x - this.x * vector.z,
      this.x * vector.y - this.y * vector.x
    );
  }

  lengthSquared(): number {
    return (
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    );
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  normalize(): this {
    const length = this.length();

    if (length === 0) {
      return this;
    }

    return this.divide(length);
  }

  distanceTo(vector: Vector3Like): number {
    return Math.sqrt(
      (this.x - vector.x) ** 2 +
      (this.y - vector.y) ** 2 +
      (this.z - vector.z) ** 2
    );
  }

  distanceToSquared(vector: Vector3Like): number {
    return (
      (this.x - vector.x) ** 2 +
      (this.y - vector.y) ** 2 +
      (this.z - vector.z) ** 2
    );
  }

  angleTo(vector: Vector3Like): number {
    const denominator = this.length() * Math.sqrt(
      vector.x ** 2 +
      vector.y ** 2 +
      vector.z ** 2
    );

    if (denominator === 0) {
      return 0;
    }

    const cosine = this.dot(vector) / denominator;

    return Math.acos(
      Math.max(-1, Math.min(1, cosine))
    );
  }

  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  equals(vector: Vector3Like, epsilon = Number.EPSILON): boolean {
    return (
      Math.abs(this.x - vector.x) <= epsilon &&
      Math.abs(this.y - vector.y) <= epsilon &&
      Math.abs(this.z - vector.z) <= epsilon
    );
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  toString(): string {
    return `Vector3(${this.x}, ${this.y}, ${this.z})`;
  }

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static one(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  static unitX(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  static unitY(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static unitZ(): Vector3 {
    return new Vector3(0, 0, 1);
  }
}
