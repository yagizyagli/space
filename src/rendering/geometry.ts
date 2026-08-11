/**
 * Space
 * Rendering Geometry
 *
 * Backend-agnostic geometry abstraction.
 *
 * Supports:
 * - Indexed geometry
 * - Vertex attributes
 * - Index buffers
 * - Bounding boxes
 * - Bounding spheres
 * - Dynamic geometry
 * - GPU buffer synchronization
 * - Common primitive factories
 */

import type {
  RenderContext,
  Geometry as GeometryType,
  BufferType,
  VertexAttributeType,
  GPUBufferHandle
} from "../types/rendering";

import {
  RenderBuffer,
  createVertexBuffer,
  createIndexBuffer
} from "./buffers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface BoundingBox {
  min:
    Vector3;

  max:
    Vector3;
}

export interface BoundingSphere {
  center:
    Vector3;

  radius:
    number;
}

export interface Vector3 {
  x:
    number;

  y:
    number;

  z:
    number;
}

export interface GeometryAttribute {
  name:
    string;

  type:
    VertexAttributeType;

  size:
    number;

  data:
    ArrayBuffer |
    ArrayBufferView |
    number[];

  normalized?:
    boolean;

  stride?:
    number;

  offset?:
    number;

  divisor?:
    number;
}

export interface GeometryOptions {
  id?: string;

  name?: string;

  attributes?:
    GeometryAttribute[];

  indices?:
    ArrayBuffer |
    ArrayBufferView |
    number[];

  indexType?:
    "uint8" |
    "uint16" |
    "uint32";

  dynamic?:
    boolean;

  drawMode?:
    "points" |
    "lines" |
    "line-strip" |
    "triangles" |
    "triangle-strip" |
    "triangle-fan";

  label?:
    string;
}

export interface GeometryState {
  id:
    string;

  name:
    string;

  vertexCount:
    number;

  triangleCount:
    number;

  indexed:
    boolean;

  dynamic:
    boolean;

  drawMode:
    string;

  initialized:
    boolean;

  dirty:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

export class RenderGeometry
  implements GeometryType {

  readonly id:
    string;

  private name:
    string;

  private attributes =
    new Map<
      string,
      GeometryAttribute
    >();

  private vertexBuffers =
    new Map<
      string,
      RenderBuffer
    >();

  private indexBuffer:
    RenderBuffer | null =
      null;

  private indexType:
    "uint8" |
    "uint16" |
    "uint32" |
    null =
      null;

  private drawMode:
    "points" |
    "lines" |
    "line-strip" |
    "triangles" |
    "triangle-strip" |
    "triangle-fan";

  private dynamic:
    boolean;

  private vertexCount =
    0;

  private triangleCount =
    0;

  private boundingBox:
    BoundingBox | null =
      null;

  private boundingSphere:
    BoundingSphere | null =
      null;

  private initialized =
    false;

  private dirty =
    true;

  private disposed =
    false;

  private label:
    string;

  constructor(
    options:
      GeometryOptions = {}
  ) {
    this.id =
      options.id ??
      `geometry-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.drawMode =
      options.drawMode ??
      "triangles";

    this.dynamic =
      options.dynamic ??
      false;

    this.label =
      options.label ??
      this.id;

    for (
      const attribute of
      options.attributes ??
      []
    ) {
      this.setAttribute(
        attribute
      );
    }

    if (
      options.indices
    ) {
      this.setIndices(
        options.indices,
        options.indexType
      );
    }

    this.recalculateBounds();
  }

  /* ------------------------------------------------------------------------ */
  /* Attributes                                                               */
  /* ------------------------------------------------------------------------ */

  setAttribute(
    attribute:
      GeometryAttribute
  ): void {
    this.assertActive();

    if (
      attribute.size <= 0
    ) {
      throw new RangeError(
        "Geometry attribute size must be greater than zero."
      );
    }

    this.attributes.set(
      attribute.name,
      {
        ...attribute
      }
    );

    this.vertexCount =
      this.calculateVertexCount(
        attribute
      );

    this.dirty =
      true;

    this.recalculateBounds();
  }

  removeAttribute(
    name:
      string
  ): boolean {
    const removed =
      this.attributes.delete(
        name
      );

    if (
      removed
    ) {
      const buffer =
        this.vertexBuffers.get(
          name
        );

      buffer?.dispose();

      this.vertexBuffers.delete(
        name
      );

      this.recalculateVertexCount();

      this.recalculateBounds();

      this.dirty =
        true;
    }

    return removed;
  }

  getAttribute(
    name:
      string
  ):
    GeometryAttribute |
    undefined {
    return this.attributes.get(
      name
    );
  }

  getAttributes():
    GeometryAttribute[] {
    return Array.from(
      this.attributes.values()
    ).map(
      attribute => ({
        ...attribute
      })
    );
  }

  hasAttribute(
    name:
      string
  ): boolean {
    return this.attributes.has(
      name
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Indices                                                                  */
  /* ------------------------------------------------------------------------ */

  setIndices(
    indices:
      ArrayBuffer |
      ArrayBufferView |
      number[],
    indexType?:
      "uint8" |
      "uint16" |
      "uint32"
  ): void {
    this.assertActive();

    this.indexType =
      indexType ??
      this.inferIndexType(
        indices
      );

    this.indexBuffer =
      createIndexBuffer(
        indices,
        {
          dynamic:
            this.dynamic,

          label:
            `${this.label}-index`
        }
      );

    this.recalculateTriangleCount();

    this.dirty =
      true;
  }

  removeIndices(): void {
    this.indexBuffer?.dispose();

    this.indexBuffer =
      null;

    this.indexType =
      null;

    this.recalculateTriangleCount();

    this.dirty =
      true;
  }

  isIndexed():
    boolean {
    return (
      this.indexBuffer !==
      null
    );
  }

  getIndexBuffer():
    RenderBuffer | null {
    return this.indexBuffer;
  }

  getIndexType():
    "uint8" |
    "uint16" |
    "uint32" |
    null {
    return this.indexType;
  }

  /* ------------------------------------------------------------------------ */
  /* GPU Initialization                                                       */
  /* ------------------------------------------------------------------------ */

  initialize(
    context:
      RenderContext
  ): void {
    this.assertActive();

    if (
      this.initialized &&
      !this.dirty
    ) {
      return;
    }

    for (
      const attribute of
      this.attributes.values()
    ) {
      let buffer =
        this.vertexBuffers.get(
          attribute.name
        );

      if (
        !buffer
      ) {
        buffer =
          createVertexBuffer(
            attribute.data,
            {
              dynamic:
                this.dynamic,

              label:
                `${this.label}-${attribute.name}`
            }
          );

        this.vertexBuffers.set(
          attribute.name,
          buffer
        );
      } else {
        buffer.setData(
          attribute.data
        );
      }

      buffer.initialize(
        context
      );

      buffer.upload(
        context
      );
    }

    this.indexBuffer?.initialize(
      context
    );

    this.indexBuffer?.upload(
      context
    );

    this.initialized =
      true;

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* GPU Buffers                                                              */
  /* ------------------------------------------------------------------------ */

  getVertexBuffer(
    attributeName:
      string
  ):
    RenderBuffer | undefined {
    return this.vertexBuffers.get(
      attributeName
    );
  }

  getVertexBuffers():
    RenderBuffer[] {
    return Array.from(
      this.vertexBuffers.values()
    );
  }

  getBufferHandle(
    attributeName:
      string
  ):
    GPUBufferHandle |
    null {
    return (
      this.vertexBuffers
        .get(attributeName)
        ?.getHandle() ??
      null
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Counts                                                                   */
  /* ------------------------------------------------------------------------ */

  get vertexCount():
    number {
    return this.vertexCount;
  }

  get triangleCount():
    number {
    return this.triangleCount;
  }

  getVertexCount():
    number {
    return this.vertexCount;
  }

  getTriangleCount():
    number {
    return this.triangleCount;
  }

  /* ------------------------------------------------------------------------ */
  /* Draw Mode                                                                */
  /* ------------------------------------------------------------------------ */

  setDrawMode(
    mode:
      "points" |
      "lines" |
      "line-strip" |
      "triangles" |
      "triangle-strip" |
      "triangle-fan"
  ): void {
    this.drawMode =
      mode;

    this.dirty =
      true;
  }

  getDrawMode():
    string {
    return this.drawMode;
  }

  /* ------------------------------------------------------------------------ */
  /* Bounds                                                                   */
  /* ------------------------------------------------------------------------ */

  getBoundingBox():
    BoundingBox | null {
    if (
      !this.boundingBox
    ) {
      return null;
    }

    return {
      min: {
        ...this.boundingBox.min
      },

      max: {
        ...this.boundingBox.max
      }
    };
  }

  getBoundingSphere():
    BoundingSphere | null {
    if (
      !this.boundingSphere
    ) {
      return null;
    }

    return {
      center: {
        ...this.boundingSphere.center
      },

      radius:
        this.boundingSphere.radius
    };
  }

  recalculateBounds():
    void {
    const position =
      this.attributes.get(
        "position"
      );

    if (
      !position
    ) {
      this.boundingBox =
        null;

      this.boundingSphere =
        null;

      return;
    }

    const values =
      this.toNumberArray(
        position.data
      );

    const size =
      position.size;

    if (
      values.length <
      size
    ) {
      return;
    }

    const min: Vector3 = {
      x:
        Number.POSITIVE_INFINITY,

      y:
        Number.POSITIVE_INFINITY,

      z:
        Number.POSITIVE_INFINITY
    };

    const max: Vector3 = {
      x:
        Number.NEGATIVE_INFINITY,

      y:
        Number.NEGATIVE_INFINITY,

      z:
        Number.NEGATIVE_INFINITY
    };

    for (
      let i = 0;
      i < values.length;
      i += size
    ) {
      const x =
        values[i] ?? 0;

      const y =
        values[i + 1] ?? 0;

      const z =
        values[i + 2] ?? 0;

      min.x =
        Math.min(
          min.x,
          x
        );

      min.y =
        Math.min(
          min.y,
          y
        );

      min.z =
        Math.min(
          min.z,
          z
        );

      max.x =
        Math.max(
          max.x,
          x
        );

      max.y =
        Math.max(
          max.y,
          y
        );

      max.z =
        Math.max(
          max.z,
          z
        );
    }

    this.boundingBox = {
      min,
      max
    };

    const center: Vector3 = {
      x:
        (min.x + max.x) /
        2,

      y:
        (min.y + max.y) /
        2,

      z:
        (min.z + max.z) /
        2
    };

    let radiusSquared =
      0;

    for (
      let i = 0;
      i < values.length;
      i += size
    ) {
      const dx =
        (values[i] ?? 0) -
        center.x;

      const dy =
        (values[i + 1] ?? 0) -
        center.y;

      const dz =
        (values[i + 2] ?? 0) -
        center.z;

      radiusSquared =
        Math.max(
          radiusSquared,
          dx * dx +
          dy * dy +
          dz * dz
        );
    }

    this.boundingSphere = {
      center,

      radius:
        Math.sqrt(
          radiusSquared
        )
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  updateAttribute(
    name:
      string,
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ): void {
    const attribute =
      this.attributes.get(
        name
      );

    if (
      !attribute
    ) {
      throw new Error(
        `Geometry attribute "${name}" does not exist.`
      );
    }

    attribute.data =
      data;

    const buffer =
      this.vertexBuffers.get(
        name
      );

    buffer?.setData(
      data
    );

    if (
      name ===
      "position"
    ) {
      this.recalculateBounds();
    }

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  isInitialized():
    boolean {
    return this.initialized;
  }

  isDirty():
    boolean {
    return this.dirty;
  }

  getState():
    GeometryState {
    return {
      id:
        this.id,

      name:
        this.name,

      vertexCount:
        this.vertexCount,

      triangleCount:
        this.triangleCount,

      indexed:
        this.isIndexed(),

      dynamic:
        this.dynamic,

      drawMode:
        this.drawMode,

      initialized:
        this.initialized,

      dirty:
        this.dirty
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose(
    context?:
      RenderContext
  ): void {
    if (
      this.disposed
    ) {
      return;
    }

    for (
      const buffer of
      this.vertexBuffers.values()
    ) {
      buffer.dispose(
        context
      );
    }

    this.vertexBuffers.clear();

    this.indexBuffer?.dispose(
      context
    );

    this.indexBuffer =
      null;

    this.attributes.clear();

    this.initialized =
      false;

    this.disposed =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private calculateVertexCount(
    attribute:
      GeometryAttribute
  ):
    number {
    const values =
      this.toNumberArray(
        attribute.data
      );

    return Math.floor(
      values.length /
      attribute.size
    );
  }

  private recalculateVertexCount():
    void {
    const first =
      this.attributes.values()
        .next()
        .value as
        GeometryAttribute |
        undefined;

    this.vertexCount =
      first
        ? this.calculateVertexCount(
            first
          )
        : 0;
  }

  private recalculateTriangleCount():
    void {
    if (
      this.isIndexed()
    ) {
      const indexCount =
        this.indexBuffer
          ?.getSize() ?? 0;

      const bytesPerIndex =
        this.indexType ===
        "uint32"
          ? 4
          : this.indexType ===
            "uint16"
            ? 2
            : 1;

      const count =
        indexCount /
        bytesPerIndex;

      this.triangleCount =
        this.calculateTriangles(
          count
        );

      return;
    }

    this.triangleCount =
      this.calculateTriangles(
        this.vertexCount
      );
  }

  private calculateTriangles(
    count:
      number
  ):
    number {
    switch (
      this.drawMode
    ) {
      case "triangles":
        return Math.floor(
          count / 3
        );

      case "triangle-strip":
      case "triangle-fan":
        return Math.max(
          0,
          Math.floor(
            count - 2
          )
        );

      default:
        return 0;
    }
  }

  private inferIndexType(
    indices:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ):
    "uint8" |
    "uint16" |
    "uint32" {
    if (
      indices instanceof
      Uint8Array
    ) {
      return "uint8";
    }

    if (
      indices instanceof
      Uint16Array
    ) {
      return "uint16";
    }

    if (
      indices instanceof
      Uint32Array
    ) {
      return "uint32";
    }

    if (
      Array.isArray(
        indices
      )
    ) {
      const max =
        Math.max(
          0,
          ...indices
        );

      if (
        max <= 255
      ) {
        return "uint8";
      }

      if (
        max <= 65535
      ) {
        return "uint16";
      }

      return "uint32";
    }

    return "uint32";
  }

  private toNumberArray(
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ):
    number[] {
    if (
      Array.isArray(
        data
      )
    ) {
      return [
        ...data
      ];
    }

    if (
      ArrayBuffer.isView(
        data
      )
    ) {
      return Array.from(
        data as
          ArrayLike<number>
      );
    }

    return Array.from(
      new Float32Array(
        data
      )
    );
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `Geometry "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Primitive Factories                                                        */
/* -------------------------------------------------------------------------- */

export function createTriangleGeometry():
  RenderGeometry {
  return new RenderGeometry({
    name:
      "triangle",

    attributes: [
      {
        name:
          "position",

        type:
          "float32",

        size:
          3,

        data: [
          0, 1, 0,
          -1, -1, 0,
          1, -1, 0
        ]
      }
    ]
  });
}

export function createPlaneGeometry(
  width = 1,
  height = 1,
  segmentsX = 1,
  segmentsY = 1
):
  RenderGeometry {
  const positions:
    number[] = [];

  const uvs:
    number[] = [];

  const indices:
    number[] = [];

  for (
    let y = 0;
    y <= segmentsY;
    y++
  ) {
    const v =
      y / segmentsY;

    for (
      let x = 0;
      x <= segmentsX;
      x++
    ) {
      const u =
        x / segmentsX;

      positions.push(
        (u - 0.5) *
          width,

        0,

        (v - 0.5) *
          height
      );

      uvs.push(
        u,
        v
      );
    }
  }

  const row =
    segmentsX + 1;

  for (
    let y = 0;
    y < segmentsY;
    y++
  ) {
    for (
      let x = 0;
      x < segmentsX;
      x++
    ) {
      const a =
        y * row + x;

      const b =
        a + 1;

      const c =
        a + row;

      const d =
        c + 1;

      indices.push(
        a,
        c,
        b,

        b,
        c,
        d
      );
    }
  }

  return new RenderGeometry({
    name:
      "plane",

    attributes: [
      {
        name:
          "position",

        type:
          "float32",

        size:
          3,

        data:
          positions
      },

      {
        name:
          "uv",

        type:
          "float32",

        size:
          2,

        data:
          uvs
      }
    ],

    indices,

    indexType:
      indices.length <=
      65535
        ? "uint16"
        : "uint32"
  });
}

export function createSphereGeometry(
  radius = 1,
  widthSegments = 32,
  heightSegments = 16
):
  RenderGeometry {
  const positions:
    number[] = [];

  const normals:
    number[] = [];

  const uvs:
    number[] = [];

  const indices:
    number[] = [];

  for (
    let y = 0;
    y <= heightSegments;
    y++
  ) {
    const v =
      y / heightSegments;

    const theta =
      v * Math.PI;

    const sinTheta =
      Math.sin(theta);

    const cosTheta =
      Math.cos(theta);

    for (
      let x = 0;
      x <= widthSegments;
      x++
    ) {
      const u =
        x / widthSegments;

      const phi =
        u *
        Math.PI *
        2;

      const sinPhi =
        Math.sin(phi);

      const cosPhi =
        Math.cos(phi);

      const nx =
        sinTheta *
        cosPhi;

      const ny =
        cosTheta;

      const nz =
        sinTheta *
        sinPhi;

      positions.push(
        radius * nx,
        radius * ny,
        radius * nz
      );

      normals.push(
        nx,
        ny,
        nz
      );

      uvs.push(
        u,
        1 - v
      );
    }
  }

  const row =
    widthSegments + 1;

  for (
    let y = 0;
    y < heightSegments;
    y++
  ) {
    for (
      let x = 0;
      x < widthSegments;
      x++
    ) {
      const a =
        y * row + x;

      const b =
        a + 1;

      const c =
        a + row;

      const d =
        c + 1;

      indices.push(
        a,
        c,
        b,

        b,
        c,
        d
      );
    }
  }

  return new RenderGeometry({
    name:
      "sphere",

    attributes: [
      {
        name:
          "position",

        type:
          "float32",

        size:
          3,

        data:
          positions
      },

      {
        name:
          "normal",

        type:
          "float32",

        size:
          3,

        data:
          normals
      },

      {
        name:
          "uv",

        type:
          "float32",

        size:
          2,

        data:
          uvs
      }
    ],

    indices,

    indexType:
      indices.length <=
      65535
        ? "uint16"
        : "uint32"
  });
}

export default RenderGeometry;
