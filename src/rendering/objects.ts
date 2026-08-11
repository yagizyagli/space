/**
 * Space
 * Rendering Objects
 *
 * Base renderable object abstraction.
 *
 * A renderable object combines:
 * - Geometry
 * - Material
 * - Transform
 * - Visibility
 * - Layer
 * - Render lifecycle
 *
 * Celestial bodies, stars, orbit lines, grids, markers,
 * trajectories and other visual elements can build on top
 * of this abstraction.
 */

import type {
  Vector3,
  Quaternion,
  Matrix4
} from "../types/common";

import type {
  RenderContext,
  RenderableObject,
  RenderObjectStats,
  Geometry,
  RenderPass
} from "../types/rendering";

import {
  Material
} from "./materials";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RenderObjectOptions {
  id?: string;

  name?: string;

  geometry?: Geometry | null;

  material?: Material | null;

  position?: Vector3;

  rotation?: Quaternion;

  scale?: Vector3;

  visible?: boolean;

  castShadow?: boolean;

  receiveShadow?: boolean;

  renderOrder?: number;

  layer?: number;
}

export interface TransformState {
  position:
    Vector3;

  rotation:
    Quaternion;

  scale:
    Vector3;

  matrix:
    Matrix4;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_POSITION:
  Vector3 = {
    x: 0,
    y: 0,
    z: 0
  };

const DEFAULT_ROTATION:
  Quaternion = {
    x: 0,
    y: 0,
    z: 0,
    w: 1
  };

const DEFAULT_SCALE:
  Vector3 = {
    x: 1,
    y: 1,
    z: 1
  };

/* -------------------------------------------------------------------------- */
/* Render Object                                                              */
/* -------------------------------------------------------------------------- */

export class SpaceRenderObject
  implements RenderableObject {

  readonly id: string;

  private name: string;

  private geometry:
    Geometry | null;

  private material:
    Material | null;

  private position:
    Vector3;

  private rotation:
    Quaternion;

  private scale:
    Vector3;

  private matrix:
    Matrix4;

  private visible =
    true;

  private castShadow =
    false;

  private receiveShadow =
    false;

  private renderOrder =
    0;

  private layer =
    0;

  private dirty =
    true;

  private initialized =
    false;

  private disposed =
    false;

  private stats:
    RenderObjectStats = {
      drawCalls:
        0,

      triangles:
        0,

      vertices:
        0
    };

  constructor(
    options:
      RenderObjectOptions = {}
  ) {
    this.id =
      options.id ??
      `object-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.geometry =
      options.geometry ??
      null;

    this.material =
      options.material ??
      null;

    this.position =
      this.cloneVector(
        options.position ??
          DEFAULT_POSITION
      );

    this.rotation =
      this.cloneQuaternion(
        options.rotation ??
          DEFAULT_ROTATION
      );

    this.scale =
      this.cloneVector(
        options.scale ??
          DEFAULT_SCALE
      );

    this.matrix =
      this.createIdentityMatrix();

    this.visible =
      options.visible ??
      true;

    this.castShadow =
      options.castShadow ??
      false;

    this.receiveShadow =
      options.receiveShadow ??
      false;

    this.renderOrder =
      options.renderOrder ??
      0;

    this.layer =
      options.layer ??
      0;

    this.updateMatrix();
  }

  /* ------------------------------------------------------------------------ */
  /* Identity                                                                  */
  /* ------------------------------------------------------------------------ */

  setName(
    name: string
  ): void {
    this.name =
      name;
  }

  getName(): string {
    return this.name;
  }

  /* ------------------------------------------------------------------------ */
  /* Geometry                                                                  */
  /* ------------------------------------------------------------------------ */

  setGeometry(
    geometry:
      Geometry | null
  ): void {
    this.geometry =
      geometry;

    this.dirty =
      true;
  }

  getGeometry():
    Geometry | null {
    return this.geometry;
  }

  /* ------------------------------------------------------------------------ */
  /* Material                                                                  */
  /* ------------------------------------------------------------------------ */

  setMaterial(
    material:
      Material | null
  ): void {
    this.material =
      material;

    this.dirty =
      true;
  }

  getMaterial():
    Material | null {
    return this.material;
  }

  /* ------------------------------------------------------------------------ */
  /* Position                                                                  */
  /* ------------------------------------------------------------------------ */

  setPosition(
    position: Vector3
  ): void {
    this.position =
      this.cloneVector(
        position
      );

    this.markTransformDirty();
  }

  getPosition():
    Vector3 {
    return this.cloneVector(
      this.position
    );
  }

  translate(
    offset: Vector3
  ): void {
    this.position.x +=
      offset.x;

    this.position.y +=
      offset.y;

    this.position.z +=
      offset.z;

    this.markTransformDirty();
  }

  /* ------------------------------------------------------------------------ */
  /* Rotation                                                                  */
  /* ------------------------------------------------------------------------ */

  setRotation(
    rotation: Quaternion
  ): void {
    this.rotation =
      this.cloneQuaternion(
        rotation
      );

    this.markTransformDirty();
  }

  getRotation():
    Quaternion {
    return this.cloneQuaternion(
      this.rotation
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Scale                                                                     */
  /* ------------------------------------------------------------------------ */

  setScale(
    scale: Vector3
  ): void {
    this.scale =
      this.cloneVector(
        scale
      );

    this.markTransformDirty();
  }

  getScale():
    Vector3 {
    return this.cloneVector(
      this.scale
    );
  }

  setUniformScale(
    scale: number
  ): void {
    this.setScale({
      x: scale,
      y: scale,
      z: scale
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Transform                                                                 */
  /* ------------------------------------------------------------------------ */

  getMatrix():
    Matrix4 {
    if (
      this.dirty
    ) {
      this.updateMatrix();
    }

    return [
      ...this.matrix
    ];
  }

  markTransformDirty():
    void {
    this.dirty =
      true;
  }

  updateMatrix(): void {
    const {
      x,
      y,
      z,
      w
    } = this.rotation;

    const sx =
      this.scale.x;

    const sy =
      this.scale.y;

    const sz =
      this.scale.z;

    const xx =
      x * x;

    const yy =
      y * y;

    const zz =
      z * z;

    const xy =
      x * y;

    const xz =
      x * z;

    const yz =
      y * z;

    const wx =
      w * x;

    const wy =
      w * y;

    const wz =
      w * z;

    this.matrix = [
      (
        1 -
        2 *
        (yy + zz)
      ) * sx,

      (
        2 *
        (xy + wz)
      ) * sx,

      (
        2 *
        (xz - wy)
      ) * sx,

      0,

      (
        2 *
        (xy - wz)
      ) * sy,

      (
        1 -
        2 *
        (xx + zz)
      ) * sy,

      (
        2 *
        (yz + wx)
      ) * sy,

      0,

      (
        2 *
        (xz + wy)
      ) * sz,

      (
        2 *
        (yz - wx)
      ) * sz,

      (
        1 -
        2 *
        (xx + yy)
      ) * sz,

      0,

      this.position.x,
      this.position.y,
      this.position.z,
      1
    ];

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Visibility                                                               */
  /* ------------------------------------------------------------------------ */

  setVisible(
    visible: boolean
  ): void {
    this.visible =
      visible;
  }

  show(): void {
    this.visible =
      true;
  }

  hide(): void {
    this.visible =
      false;
  }

  isVisible(
    _context?: RenderContext
  ): boolean {
    return (
      this.visible &&
      !this.disposed
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Layers                                                                   */
  /* ------------------------------------------------------------------------ */

  setLayer(
    layer: number
  ): void {
    this.layer =
      layer;
  }

  getLayer(): number {
    return this.layer;
  }

  setRenderOrder(
    order: number
  ): void {
    this.renderOrder =
      order;
  }

  getRenderOrder(): number {
    return this.renderOrder;
  }

  /* ------------------------------------------------------------------------ */
  /* Shadows                                                                  */
  /* ------------------------------------------------------------------------ */

  setCastShadow(
    enabled: boolean
  ): void {
    this.castShadow =
      enabled;
  }

  isCastingShadow():
    boolean {
    return this.castShadow;
  }

  setReceiveShadow(
    enabled: boolean
  ): void {
    this.receiveShadow =
      enabled;
  }

  isReceivingShadow():
    boolean {
    return this.receiveShadow;
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  initialize(
    context:
      RenderContext
  ): void {
    if (
      this.initialized
    ) {
      return;
    }

    this.geometry?.initialize?.(
      context
    );

    this.material?.initialize?.(
      context
    );

    this.initialized =
      true;
  }

  update(
    _frame: unknown
  ): void {
    if (
      this.disposed
    ) {
      return;
    }

    if (
      this.dirty
    ) {
      this.updateMatrix();
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  render(
    context:
      RenderContext
  ): void {
    if (
      !this.isVisible(
        context
      )
    ) {
      return;
    }

    if (
      !this.initialized
    ) {
      this.initialize(
        context
      );
    }

    if (
      !this.geometry ||
      !this.material
    ) {
      return;
    }

    this.updateMatrix();

    context.adapter.renderObject(
      this
    );

    this.stats =
      this.calculateStats();
  }

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  private calculateStats():
    RenderObjectStats {
    const geometry =
      this.geometry;

    return {
      drawCalls:
        1,

      triangles:
        geometry?.triangleCount ??
        0,

      vertices:
        geometry?.vertexCount ??
        0
    };
  }

  getRenderStats():
    RenderObjectStats {
    return {
      ...this.stats
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Pass                                                                     */
  /* ------------------------------------------------------------------------ */

  getRenderPass():
    RenderPass | null {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Serialization                                                             */
  /* ------------------------------------------------------------------------ */

  toJSON() {
    return {
      id:
        this.id,

      name:
        this.name,

      position:
        this.getPosition(),

      rotation:
        this.getRotation(),

      scale:
        this.getScale(),

      visible:
        this.visible,

      castShadow:
        this.castShadow,

      receiveShadow:
        this.receiveShadow,

      renderOrder:
        this.renderOrder,

      layer:
        this.layer
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    if (
      this.disposed
    ) {
      return;
    }

    this.geometry?.dispose?.();

    this.material?.dispose?.();

    this.geometry =
      null;

    this.material =
      null;

    this.disposed =
      true;

    this.initialized =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private createIdentityMatrix():
    Matrix4 {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  private cloneVector(
    vector: Vector3
  ): Vector3 {
    return {
      x:
        vector.x,

      y:
        vector.y,

      z:
        vector.z
    };
  }

  private cloneQuaternion(
    quaternion: Quaternion
  ): Quaternion {
    return {
      x:
        quaternion.x,

      y:
        quaternion.y,

      z:
        quaternion.z,

      w:
        quaternion.w
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createRenderObject(
  options:
    RenderObjectOptions = {}
): SpaceRenderObject {
  return new SpaceRenderObject(
    options
  );
}

export default SpaceRenderObject;
