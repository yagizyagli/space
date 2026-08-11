/**
 * Space
 * Core Matrix Mathematics
 *
 * 3x3 and 4x4 matrix utilities for spatial transformations,
 * coordinate systems, cameras, and rendering.
 */

import { Vector3, type Vector3Like } from "./vectors";

export class Matrix3 {
  public elements: Float64Array;

  constructor(elements?: ArrayLike<number>) {
    this.elements = new Float64Array(
      elements ?? [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]
    );
  }

  identity(): this {
    this.elements.set([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);

    return this;
  }

  clone(): Matrix3 {
    return new Matrix3(this.elements);
  }

  copy(matrix: Matrix3): this {
    this.elements.set(matrix.elements);
    return this;
  }

  multiply(matrix: Matrix3): this {
    const a = this.elements;
    const b = matrix.elements;

    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];

    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[3];
    const b11 = b[4];
    const b12 = b[5];
    const b20 = b[6];
    const b21 = b[7];
    const b22 = b[8];

    a[0] = a00 * b00 + a01 * b10 + a02 * b20;
    a[1] = a00 * b01 + a01 * b11 + a02 * b21;
    a[2] = a00 * b02 + a01 * b12 + a02 * b22;

    a[3] = a10 * b00 + a11 * b10 + a12 * b20;
    a[4] = a10 * b01 + a11 * b11 + a12 * b21;
    a[5] = a10 * b02 + a11 * b12 + a12 * b22;

    a[6] = a20 * b00 + a21 * b10 + a22 * b20;
    a[7] = a20 * b01 + a21 * b11 + a22 * b21;
    a[8] = a20 * b02 + a21 * b12 + a22 * b22;

    return this;
  }

  transpose(): this {
    const e = this.elements;

    [e[1], e[3]] = [e[3], e[1]];
    [e[2], e[6]] = [e[6], e[2]];
    [e[5], e[7]] = [e[7], e[5]];

    return this;
  }

  determinant(): number {
    const e = this.elements;

    return (
      e[0] * (e[4] * e[8] - e[5] * e[7]) -
      e[1] * (e[3] * e[8] - e[5] * e[6]) +
      e[2] * (e[3] * e[7] - e[4] * e[6])
    );
  }

  applyToVector(vector: Vector3Like): Vector3 {
    const e = this.elements;

    return new Vector3(
      e[0] * vector.x + e[1] * vector.y + e[2] * vector.z,
      e[3] * vector.x + e[4] * vector.y + e[5] * vector.z,
      e[6] * vector.x + e[7] * vector.y + e[8] * vector.z
    );
  }

  static identity(): Matrix3 {
    return new Matrix3();
  }
}

export class Matrix4 {
  public elements: Float64Array;

  constructor(elements?: ArrayLike<number>) {
    this.elements = new Float64Array(
      elements ?? [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]
    );
  }

  identity(): this {
    this.elements.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);

    return this;
  }

  clone(): Matrix4 {
    return new Matrix4(this.elements);
  }

  copy(matrix: Matrix4): this {
    this.elements.set(matrix.elements);
    return this;
  }

  multiply(matrix: Matrix4): this {
    const a = this.elements;
    const b = matrix.elements;
    const result = new Float64Array(16);

    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        result[row * 4 + column] =
          a[row * 4] * b[column] +
          a[row * 4 + 1] * b[column + 4] +
          a[row * 4 + 2] * b[column + 8] +
          a[row * 4 + 3] * b[column + 12];
      }
    }

    this.elements.set(result);

    return this;
  }

  transpose(): this {
    const e = this.elements;

    for (let row = 0; row < 4; row++) {
      for (let column = row + 1; column < 4; column++) {
        const indexA = row * 4 + column;
        const indexB = column * 4 + row;

        [e[indexA], e[indexB]] = [e[indexB], e[indexA]];
      }
    }

    return this;
  }

  applyToVector(vector: Vector3Like): Vector3 {
    const e = this.elements;

    const x = vector.x;
    const y = vector.y;
    const z = vector.z;

    const w =
      e[3] * x +
      e[7] * y +
      e[11] * z +
      e[15];

    const divisor = w === 0 ? 1 : w;

    return new Vector3(
      (
        e[0] * x +
        e[4] * y +
        e[8] * z +
        e[12]
      ) / divisor,

      (
        e[1] * x +
        e[5] * y +
        e[9] * z +
        e[13]
      ) / divisor,

      (
        e[2] * x +
        e[6] * y +
        e[10] * z +
        e[14]
      ) / divisor
    );
  }

  translate(x: number, y: number, z: number): this {
    return this.multiply(
      new Matrix4([
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
      ])
    );
  }

  scale(x: number, y: number, z: number): this {
    return this.multiply(
      new Matrix4([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      ])
    );
  }

  rotateX(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return this.multiply(
      new Matrix4([
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
      ])
    );
  }

  rotateY(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return this.multiply(
      new Matrix4([
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
      ])
    );
  }

  rotateZ(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return this.multiply(
      new Matrix4([
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    );
  }

  static identity(): Matrix4 {
    return new Matrix4();
  }
}
