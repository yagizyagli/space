/**
 * Space
 * Rendering Camera
 *
 * Rendering-side camera abstraction.
 *
 * Responsibilities:
 * - Projection matrix
 * - View matrix
 * - Camera position
 * - Direction / up vectors
 * - Near / far clipping
 * - Viewport
 * - Coordinate conversion helpers
 *
 * Camera controllers live in:
 *     src/camera/
 *
 * This file only defines the rendering-facing camera.
 */

import type {
  Matrix4,
  Vector3
} from "../types/common";

import type {
  RendererSize
} from "../types/rendering";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CameraProjection =
  | "perspective"
  | "orthographic";

export interface CameraOptions {
  projection?:
    CameraProjection;

  position?:
    Vector3;

  target?:
    Vector3;

  up?:
    Vector3;

  fov?:
    number;

  aspect?:
    number;

  near?:
    number;

  far?:
    number;

  zoom?:
    number;
}

export interface CameraViewport {
  x: number;

  y: number;

  width: number;

  height: number;
}

export interface CameraFrustum {
  left: number;

  right: number;

  top: number;

  bottom: number;

  near: number;

  far: number;
}

/* -------------------------------------------------------------------------- */
/* Math helpers                                                               */
/* -------------------------------------------------------------------------- */

function identityMatrix(): Matrix4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

function normalizeVector(
  vector: Vector3
): Vector3 {
  const length =
    Math.sqrt(
      vector.x * vector.x +
      vector.y * vector.y +
      vector.z * vector.z
    );

  if (
    length === 0
  ) {
    return {
      x: 0,
      y: 0,
      z: 1
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

function subtract(
  a: Vector3,
  b: Vector3
): Vector3 {
  return {
    x:
      a.x - b.x,

    y:
      a.y - b.y,

    z:
      a.z - b.z
  };
}

function cross(
  a: Vector3,
  b: Vector3
): Vector3 {
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

function dot(
  a: Vector3,
  b: Vector3
): number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z
  );
}

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

export class RenderCamera {
  private projection:
    CameraProjection;

  private position:
    Vector3;

  private target:
    Vector3;

  private up:
    Vector3;

  private fov:
    number;

  private aspect:
    number;

  private near:
    number;

  private far:
    number;

  private zoom:
    number;

  private viewport:
    CameraViewport = {
      x: 0,
      y: 0,
      width: 1,
      height: 1
    };

  private viewMatrix:
    Matrix4 =
      identityMatrix();

  private projectionMatrix:
    Matrix4 =
      identityMatrix();

  private viewProjectionMatrix:
    Matrix4 =
      identityMatrix();

  private dirty =
    true;

  constructor(
    options: CameraOptions = {}
  ) {
    this.projection =
      options.projection ??
      "perspective";

    this.position =
      options.position ?? {
        x: 0,
        y: 0,
        z: 10
      };

    this.target =
      options.target ?? {
        x: 0,
        y: 0,
        z: 0
      };

    this.up =
      options.up ?? {
        x: 0,
        y: 1,
        z: 0
      };

    this.fov =
      options.fov ??
      60;

    this.aspect =
      options.aspect ??
      1;

    this.near =
      options.near ??
      0.01;

    this.far =
      options.far ??
      1e12;

    this.zoom =
      options.zoom ??
      1;

    this.updateMatrices();
  }

  /* ------------------------------------------------------------------------ */
  /* Projection                                                               */
  /* ------------------------------------------------------------------------ */

  setProjection(
    projection: CameraProjection
  ): void {
    this.projection =
      projection;

    this.markDirty();
  }

  getProjection():
    CameraProjection {
    return this.projection;
  }

  /* ------------------------------------------------------------------------ */
  /* Position                                                                  */
  /* ------------------------------------------------------------------------ */

  setPosition(
    position: Vector3
  ): void {
    this.position = {
      ...position
    };

    this.markDirty();
  }

  getPosition():
    Vector3 {
    return {
      ...this.position
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Target                                                                    */
  /* ------------------------------------------------------------------------ */

  setTarget(
    target: Vector3
  ): void {
    this.target = {
      ...target
    };

    this.markDirty();
  }

  getTarget():
    Vector3 {
    return {
      ...this.target
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Up vector                                                                 */
  /* ------------------------------------------------------------------------ */

  setUp(
    up: Vector3
  ): void {
    this.up = {
      ...up
    };

    this.markDirty();
  }

  getUp():
    Vector3 {
    return {
      ...this.up
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Perspective                                                              */
  /* ------------------------------------------------------------------------ */

  setFOV(
    fov: number
  ): void {
    if (
      fov <= 0 ||
      fov >= 180
    ) {
      throw new RangeError(
        "FOV must be between 0 and 180 degrees."
      );
    }

    this.fov =
      fov;

    this.markDirty();
  }

  getFOV(): number {
    return this.fov;
  }

  setAspect(
    aspect: number
  ): void {
    if (
      !Number.isFinite(
        aspect
      ) ||
      aspect <= 0
    ) {
      return;
    }

    this.aspect =
      aspect;

    this.markDirty();
  }

  getAspect(): number {
    return this.aspect;
  }

  setNear(
    near: number
  ): void {
    this.near =
      Math.max(
        near,
        Number.EPSILON
      );

    this.markDirty();
  }

  getNear(): number {
    return this.near;
  }

  setFar(
    far: number
  ): void {
    this.far =
      Math.max(
        far,
        this.near
      );

    this.markDirty();
  }

  getFar(): number {
    return this.far;
  }

  /* ------------------------------------------------------------------------ */
  /* Zoom                                                                     */
  /* ------------------------------------------------------------------------ */

  setZoom(
    zoom: number
  ): void {
    if (
      zoom <= 0
    ) {
      return;
    }

    this.zoom =
      zoom;

    this.markDirty();
  }

  getZoom(): number {
    return this.zoom;
  }

  zoomBy(
    factor: number
  ): void {
    this.setZoom(
      this.zoom *
      factor
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Viewport                                                                  */
  /* ------------------------------------------------------------------------ */

  setViewport(
    viewport: CameraViewport
  ): void {
    this.viewport = {
      ...viewport
    };

    this.setAspect(
      viewport.width /
      Math.max(
        viewport.height,
        1
      )
    );
  }

  getViewport():
    CameraViewport {
    return {
      ...this.viewport
    };
  }

  resize(
    size: RendererSize
  ): void {
    this.setViewport({
      x: 0,
      y: 0,
      width:
        size.width,
      height:
        size.height
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Direction                                                                 */
  /* ------------------------------------------------------------------------ */

  getDirection():
    Vector3 {
    return normalizeVector(
      subtract(
        this.target,
        this.position
      )
    );
  }

  getRight():
    Vector3 {
    const direction =
      this.getDirection();

    return normalizeVector(
      cross(
        direction,
        this.up
      )
    );
  }

  getRealUp():
    Vector3 {
    return normalizeVector(
      cross(
        this.getRight(),
        this.getDirection()
      )
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Look at                                                                   */
  /* ------------------------------------------------------------------------ */

  lookAt(
    target: Vector3
  ): void {
    this.target = {
      ...target
    };

    this.markDirty();
  }

  /* ------------------------------------------------------------------------ */
  /* Matrices                                                                  */
  /* ------------------------------------------------------------------------ */

  getViewMatrix():
    Matrix4 {
    this.updateMatrices();

    return [
      ...this.viewMatrix
    ];
  }

  getProjectionMatrix():
    Matrix4 {
    this.updateMatrices();

    return [
      ...this.projectionMatrix
    ];
  }

  getViewProjectionMatrix():
    Matrix4 {
    this.updateMatrices();

    return [
      ...this.viewProjectionMatrix
    ];
  }

  /* ------------------------------------------------------------------------ */
  /* Matrix calculation                                                        */
  /* ------------------------------------------------------------------------ */

  private updateMatrices(): void {
    if (
      !this.dirty
    ) {
      return;
    }

    this.viewMatrix =
      this.calculateViewMatrix();

    this.projectionMatrix =
      this.calculateProjectionMatrix();

    this.viewProjectionMatrix =
      this.multiplyMatrices(
        this.projectionMatrix,
        this.viewMatrix
      );

    this.dirty =
      false;
  }

  private calculateViewMatrix():
    Matrix4 {
    const z =
      normalizeVector(
        subtract(
          this.position,
          this.target
        )
      );

    const x =
      normalizeVector(
        cross(
          this.up,
          z
        )
      );

    const y =
      cross(
        z,
        x
      );

    const p =
      this.position;

    return [
      x.x,
      y.x,
      z.x,
      0,

      x.y,
      y.y,
      z.y,
      0,

      x.z,
      y.z,
      z.z,
      0,

      -dot(x, p),
      -dot(y, p),
      -dot(z, p),
      1
    ];
  }

  private calculateProjectionMatrix():
    Matrix4 {
    if (
      this.projection ===
      "orthographic"
    ) {
      return this.calculateOrthographic();
    }

    return this.calculatePerspective();
  }

  private calculatePerspective():
    Matrix4 {
    const fovRadians =
      this.fov *
      Math.PI /
      180;

    const f =
      1 /
      Math.tan(
        fovRadians / 2
      );

    const range =
      this.far -
      this.near;

    return [
      f /
        this.aspect /
        this.zoom,
      0,
      0,
      0,

      0,
      f /
        this.zoom,
      0,
      0,

      0,
      0,
      -(
        this.far +
        this.near
      ) /
        range,
      -1,

      0,
      0,
      -(
        2 *
        this.far *
        this.near
      ) /
        range,
      0
    ];
  }

  private calculateOrthographic():
    Matrix4 {
    const width =
      this.viewport.width /
      this.zoom;

    const height =
      this.viewport.height /
      this.zoom;

    const left =
      -width / 2;

    const right =
      width / 2;

    const bottom =
      -height / 2;

    const top =
      height / 2;

    return [
      2 /
        (right - left),
      0,
      0,
      0,

      0,
      2 /
        (top - bottom),
      0,
      0,

      0,
      0,
      -2 /
        (this.far -
          this.near),
      0,

      -(
        right + left
      ) /
        (right - left),

      -(
        top + bottom
      ) /
        (top - bottom),

      -(
        this.far +
        this.near
      ) /
        (this.far -
          this.near),

      1
    ];
  }

  private multiplyMatrices(
    a: Matrix4,
    b: Matrix4
  ): Matrix4 {
    const result =
      new Array<number>(
        16
      ).fill(0);

    for (
      let row = 0;
      row < 4;
      row++
    ) {
      for (
        let column = 0;
        column < 4;
        column++
      ) {
        for (
          let index = 0;
          index < 4;
          index++
        ) {
          result[
            row * 4 +
            column
          ] +=
            a[
              row * 4 +
              index
            ] *
            b[
              index * 4 +
              column
            ];
        }
      }
    }

    return result as Matrix4;
  }

  /* ------------------------------------------------------------------------ */
  /* Coordinate helpers                                                        */
  /* ------------------------------------------------------------------------ */

  project(
    point: Vector3
  ): Vector3 {
    const matrix =
      this.getViewProjectionMatrix();

    const x =
      point.x;

    const y =
      point.y;

    const z =
      point.z;

    const w =
      matrix[3] * x +
      matrix[7] * y +
      matrix[11] * z +
      matrix[15];

    return {
      x:
        (
          matrix[0] * x +
          matrix[4] * y +
          matrix[8] * z +
          matrix[12]
        ) / w,

      y:
        (
          matrix[1] * x +
          matrix[5] * y +
          matrix[9] * z +
          matrix[13]
        ) / w,

      z:
        (
          matrix[2] * x +
          matrix[6] * y +
          matrix[10] * z +
          matrix[14]
        ) / w
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dirty state                                                               */
  /* ------------------------------------------------------------------------ */

  markDirty(): void {
    this.dirty =
      true;
  }

  update(): void {
    this.updateMatrices();
  }

  /* ------------------------------------------------------------------------ */
  /* Frustum                                                                   */
  /* ------------------------------------------------------------------------ */

  getFrustum():
    CameraFrustum {
    return {
      left:
        -this.aspect,

      right:
        this.aspect,

      top:
        1,

      bottom:
        -1,

      near:
        this.near,

      far:
        this.far
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                   */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    this.viewMatrix =
      identityMatrix();

    this.projectionMatrix =
      identityMatrix();

    this.viewProjectionMatrix =
      identityMatrix();

    this.dirty =
      true;
  }
}

export function createRenderCamera(
  options?: CameraOptions
): RenderCamera {
  return new RenderCamera(
    options
  );
}

export default RenderCamera;
