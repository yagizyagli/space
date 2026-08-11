/**
 * Space
 * Rendering Culling
 *
 * Backend-agnostic visibility and culling system.
 *
 * Supports:
 * - Frustum culling
 * - Distance culling
 * - Bounding sphere tests
 * - AABB tests
 * - Layer masks
 * - Visibility flags
 * - Batch visibility evaluation
 */

import type {
  Vector3,
  Camera
} from "../types/core";

import type {
  BoundingBox,
  BoundingSphere,
  Frustum,
  Plane
} from "../types/math";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface CullingObject {
  id:
    string;

  position:
    Vector3;

  bounds?:
    BoundingSphere |
    BoundingBox;

  layer?:
    number;

  visible?:
    boolean;

  enabled?:
    boolean;
}

export interface CullingOptions {
  frustum?:
    boolean;

  distance?:
    boolean;

  maxDistance?:
    number;

  layerMask?:
    number;

  includeDisabled?:
    boolean;

  includeInvisible?:
    boolean;
}

export interface CullingResult<T = CullingObject> {
  object:
    T;

  visible:
    boolean;

  distance:
    number;

  reason?:
    CullingReason;
}

export type CullingReason =
  | "visible"
  | "disabled"
  | "invisible"
  | "layer"
  | "distance"
  | "frustum"
  | "bounds";

/* -------------------------------------------------------------------------- */
/* Math Helpers                                                               */
/* -------------------------------------------------------------------------- */

function subtract(
  a:
    Vector3,
  b:
    Vector3
):
  Vector3 {
  return {
    x:
      a.x - b.x,

    y:
      a.y - b.y,

    z:
      a.z - b.z
  };
}

function length(
  value:
    Vector3
):
  number {
  return Math.sqrt(
    value.x * value.x +
    value.y * value.y +
    value.z * value.z
  );
}

function distance(
  a:
    Vector3,
  b:
    Vector3
):
  number {
  return length(
    subtract(
      a,
      b
    )
  );
}

function dot(
  a:
    Vector3,
  b:
    Vector3
):
  number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z
  );
}

function planeDistance(
  plane:
    Plane,
  point:
    Vector3
):
  number {
  return (
    plane.normal.x *
      point.x +
    plane.normal.y *
      point.y +
    plane.normal.z *
      point.z +
    plane.distance
  );
}

/* -------------------------------------------------------------------------- */
/* Bounding Sphere                                                            */
/* -------------------------------------------------------------------------- */

export function sphereInFrustum(
  sphere:
    BoundingSphere,
  frustum:
    Frustum
):
  boolean {
  for (
    const plane of
    frustum.planes
  ) {
    if (
      planeDistance(
        plane,
        sphere.center
      ) <
      -sphere.radius
    ) {
      return false;
    }
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Bounding Box                                                               */
/* -------------------------------------------------------------------------- */

export function boxInFrustum(
  box:
    BoundingBox,
  frustum:
    Frustum
):
  boolean {
  for (
    const plane of
    frustum.planes
  ) {
    const normal =
      plane.normal;

    const positive = {
      x:
        normal.x >= 0
          ? box.max.x
          : box.min.x,

      y:
        normal.y >= 0
          ? box.max.y
          : box.min.y,

      z:
        normal.z >= 0
          ? box.max.z
          : box.min.z
    };

    if (
      planeDistance(
        plane,
        positive
      ) < 0
    ) {
      return false;
    }
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Generic Bounds                                                             */
/* -------------------------------------------------------------------------- */

export function boundsInFrustum(
  bounds:
    BoundingSphere |
    BoundingBox,
  frustum:
    Frustum
):
  boolean {
  if (
    "radius" in bounds
  ) {
    return sphereInFrustum(
      bounds,
      frustum
    );
  }

  return boxInFrustum(
    bounds,
    frustum
  );
}

/* -------------------------------------------------------------------------- */
/* Culling System                                                             */
/* -------------------------------------------------------------------------- */

export class CullingSystem {

  private enabled =
    true;

  private frustumEnabled =
    true;

  private distanceEnabled =
    true;

  private maxDistance =
    Infinity;

  private layerMask =
    0xffffffff;

  private cameraPosition:
    Vector3 = {
      x:
        0,

      y:
        0,

      z:
        0
  };

  private frustum:
    Frustum |
    null =
      null;

  private lastResults:
    CullingResult[] =
      [];

  constructor(
    options:
      CullingOptions = {}
  ) {
    this.frustumEnabled =
      options.frustum ??
      true;

    this.distanceEnabled =
      options.distance ??
      true;

    this.maxDistance =
      options.maxDistance ??
      Infinity;

    this.layerMask =
      options.layerMask ??
      0xffffffff;
  }

  /* ------------------------------------------------------------------------ */
  /* Camera                                                                    */
  /* ------------------------------------------------------------------------ */

  updateCamera(
    camera:
      Camera
  ):
    void {
    this.cameraPosition =
      camera.position;

    if (
      "frustum" in camera &&
      camera.frustum
    ) {
      this.frustum =
        camera.frustum;
    }
  }

  setCameraPosition(
    position:
      Vector3
  ):
    void {
    this.cameraPosition = {
      ...position
    };
  }

  setFrustum(
    frustum:
      Frustum |
      null
  ):
    void {
    this.frustum =
      frustum;
  }

  /* ------------------------------------------------------------------------ */
  /* Configuration                                                            */
  /* ------------------------------------------------------------------------ */

  setEnabled(
    enabled:
      boolean
  ):
    void {
    this.enabled =
      enabled;
  }

  isEnabled():
    boolean {
    return this.enabled;
  }

  setFrustumEnabled(
    enabled:
      boolean
  ):
    void {
    this.frustumEnabled =
      enabled;
  }

  setDistanceEnabled(
    enabled:
      boolean
  ):
    void {
    this.distanceEnabled =
      enabled;
  }

  setMaxDistance(
    value:
      number
  ):
    void {
    this.maxDistance =
      Math.max(
        0,
        value
      );
  }

  getMaxDistance():
    number {
    return this.maxDistance;
  }

  setLayerMask(
    mask:
      number
  ):
    void {
    this.layerMask =
      mask >>> 0;
  }

  getLayerMask():
    number {
    return this.layerMask;
  }

  /* ------------------------------------------------------------------------ */
  /* Single Object                                                             */
  /* ------------------------------------------------------------------------ */

  test<T extends CullingObject>(
    object:
      T
  ):
    CullingResult<T> {
    if (
      !this.enabled
    ) {
      return {
        object,

        visible:
          true,

        distance:
          distance(
            object.position,
            this.cameraPosition
          ),

        reason:
          "visible"
      };
    }

    if (
      object.enabled ===
      false
    ) {
      return {
        object,

        visible:
          false,

        distance:
          distance(
            object.position,
            this.cameraPosition
          ),

        reason:
          "disabled"
      };
    }

    if (
      object.visible ===
      false
    ) {
      return {
        object,

        visible:
          false,

        distance:
          distance(
            object.position,
            this.cameraPosition
          ),

        reason:
          "invisible"
      };
    }

    const objectLayer =
      object.layer ??
      1;

    if (
      (
        objectLayer &
        this.layerMask
      ) === 0
    ) {
      return {
        object,

        visible:
          false,

        distance:
          distance(
            object.position,
            this.cameraPosition
          ),

        reason:
          "layer"
      };
    }

    const objectDistance =
      distance(
        object.position,
        this.cameraPosition
      );

    if (
      this.distanceEnabled &&
      objectDistance >
        this.maxDistance
    ) {
      return {
        object,

        visible:
          false,

        distance:
          objectDistance,

        reason:
          "distance"
      };
    }

    if (
      this.frustumEnabled &&
      this.frustum &&
      object.bounds
    ) {
      if (
        !boundsInFrustum(
          object.bounds,
          this.frustum
        )
      ) {
        return {
          object,

          visible:
            false,

          distance:
            objectDistance,

          reason:
            "frustum"
        };
      }
    }

    return {
      object,

      visible:
        true,

      distance:
        objectDistance,

      reason:
        "visible"
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Batch                                                                     */
  /* ------------------------------------------------------------------------ */

  testMany<T extends CullingObject>(
    objects:
      T[]
  ):
    CullingResult<T>[] {
    const results:
      CullingResult<T>[] =
      [];

    for (
      const object of
      objects
    ) {
      results.push(
        this.test(
          object
        )
      );
    }

    this.lastResults =
      results as CullingResult[];

    return results;
  }

  visible<T extends CullingObject>(
    objects:
      T[]
  ):
    T[] {
    const results =
      this.testMany(
        objects
      );

    return results
      .filter(
        result =>
          result.visible
      )
      .map(
        result =>
          result.object
      );
  }

  invisible<T extends CullingObject>(
    objects:
      T[]
  ):
    T[] {
    const results =
      this.testMany(
        objects
      );

    return results
      .filter(
        result =>
          !result.visible
      )
      .map(
        result =>
          result.object
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  getLastResults():
    CullingResult[] {
    return [
      ...this.lastResults
    ];
  }

  getLastVisibleCount():
    number {
    return this.lastResults.filter(
      result =>
        result.visible
    ).length;
  }

  getLastCulledCount():
    number {
    return this.lastResults.filter(
      result =>
        !result.visible
    ).length;
  }

  getLastCulledByReason():
    Record<
      CullingReason,
      number
    > {
    const result:
      Record<
        CullingReason,
        number
      > = {
        visible:
          0,

        disabled:
          0,

        invisible:
          0,

        layer:
          0,

        distance:
          0,

        frustum:
          0,

        bounds:
          0
      };

    for (
      const entry of
      this.lastResults
    ) {
      if (
        entry.reason
      ) {
        result[
          entry.reason
        ]++;
      }
    }

    return result;
  }
}

/* -------------------------------------------------------------------------- */
/* Distance Culling                                                           */
/* -------------------------------------------------------------------------- */

export class DistanceCuller {

  private maxDistance:
    number;

  private origin:
    Vector3 = {
      x:
        0,

      y:
        0,

      z:
        0
  };

  constructor(
    maxDistance:
      number =
        Infinity
  ) {
    this.maxDistance =
      Math.max(
        0,
        maxDistance
      );
  }

  setOrigin(
    origin:
      Vector3
  ):
    void {
    this.origin = {
      ...origin
    };
  }

  setMaxDistance(
    distance:
      number
  ):
    void {
    this.maxDistance =
      Math.max(
        0,
        distance
      );
  }

  test(
    position:
      Vector3
  ):
    boolean {
    return (
      distance(
        position,
        this.origin
      ) <=
      this.maxDistance
    );
  }

  getDistance(
    position:
      Vector3
  ):
    number {
    return distance(
      position,
      this.origin
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Layer Culling                                                              */
/* -------------------------------------------------------------------------- */

export class LayerCuller {

  private mask:
    number;

  constructor(
    mask:
      number =
        0xffffffff
  ) {
    this.mask =
      mask >>> 0;
  }

  setMask(
    mask:
      number
  ):
    void {
    this.mask =
      mask >>> 0;
  }

  getMask():
    number {
    return this.mask;
  }

  test(
    layer:
      number
  ):
    boolean {
    return (
      (
        layer &
        this.mask
      ) !== 0
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function createCullingSystem(
  options:
    CullingOptions = {}
):
  CullingSystem {
  return new CullingSystem(
    options
  );
}

export function createDistanceCuller(
  maxDistance:
    number =
      Infinity
):
  DistanceCuller {
  return new DistanceCuller(
    maxDistance
  );
}

export function createLayerCuller(
  mask:
    number =
      0xffffffff
):
  LayerCuller {
  return new LayerCuller(
    mask
  );
}

export default CullingSystem;
