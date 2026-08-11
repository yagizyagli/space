/**
 * Space
 * Rendering Instancing
 *
 * Backend-agnostic GPU instancing abstraction.
 *
 * Supports:
 * - Per-instance transforms
 * - Per-instance colors
 * - Per-instance custom attributes
 * - Dynamic instance updates
 * - Instance buffers
 * - Draw metadata
 * - Batch management
 */

import type {
  RenderContext,
  VertexAttributeType,
  GPUBufferHandle
} from "../types/rendering";

import {
  RenderBuffer,
  createVertexBuffer
} from "./buffers";

import {
  RenderGeometry
} from "./geometry";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface InstanceAttribute {
  name:
    string;

  size:
    number;

  type:
    VertexAttributeType;

  data:
    ArrayBuffer |
    ArrayBufferView |
    number[];

  normalized?:
    boolean;

  divisor?:
    number;
}

export interface InstanceData {
  transform?:
    number[];

  position?:
    [number, number, number];

  rotation?:
    [number, number, number, number];

  scale?:
    [number, number, number];

  color?:
    [number, number, number, number];

  custom?:
    Record<
      string,
      number |
      number[]
    >;
}

export interface InstancedBatchOptions {
  id?: string;

  name?: string;

  geometry:
    RenderGeometry;

  instanceCount?:
    number;

  dynamic?:
    boolean;

  attributes?:
    InstanceAttribute[];

  label?:
    string;
}

export interface InstanceBufferState {
  name:
    string;

  count:
    number;

  size:
    number;

  initialized:
    boolean;

  dirty:
    boolean;
}

export interface InstancedBatchState {
  id:
    string;

  name:
    string;

  instanceCount:
    number;

  maxInstances:
    number;

  attributeCount:
    number;

  initialized:
    boolean;

  dirty:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Instance Buffer                                                            */
/* -------------------------------------------------------------------------- */

export class InstanceBuffer {

  readonly name:
    string;

  private data:
    ArrayBuffer |
    ArrayBufferView |
    number[];

  private size:
    number;

  private count:
    number;

  private buffer:
    RenderBuffer | null =
      null;

  private initialized =
    false;

  private dirty =
    true;

  private dynamic:
    boolean;

  private disposed =
    false;

  constructor(
    name:
      string,
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[],
    options:
      {
        dynamic?:
          boolean;

        label?:
          string;
      } = {}
  ) {
    this.name =
      name;

    this.data =
      data;

    this.dynamic =
      options.dynamic ??
      true;

    this.size =
      this.calculateSize(
        data
      );

    this.count =
      0;
  }

  /* ------------------------------------------------------------------------ */
  /* Initialization                                                           */
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

    if (
      !this.buffer
    ) {
      this.buffer =
        createVertexBuffer(
          this.data,
          {
            dynamic:
              this.dynamic,

            label:
              `instance-${this.name}`
          }
        );
    } else {
      this.buffer.setData(
        this.data
      );
    }

    this.buffer.initialize(
      context
    );

    this.buffer.upload(
      context
    );

    this.initialized =
      true;

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  setData(
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ): void {
    this.assertActive();

    this.data =
      data;

    this.size =
      this.calculateSize(
        data
      );

    this.dirty =
      true;
  }

  getData():
    ArrayBuffer |
    ArrayBufferView |
    number[] {
    return this.data;
  }

  updateRange(
    offset:
      number,
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ): void {
    this.assertActive();

    if (
      this.buffer
    ) {
      this.buffer.updateSubData(
        offset,
        data
      );
    }

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Buffer                                                                    */
  /* ------------------------------------------------------------------------ */

  getBuffer():
    RenderBuffer | null {
    return this.buffer;
  }

  getHandle():
    GPUBufferHandle |
    null {
    return (
      this.buffer?.getHandle() ??
      null
    );
  }

  getSize():
    number {
    return this.size;
  }

  getCount():
    number {
    return this.count;
  }

  setCount(
    count:
      number
  ): void {
    this.count =
      Math.max(
        0,
        Math.floor(
          count
        )
      );
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
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
    InstanceBufferState {
    return {
      name:
        this.name,

      count:
        this.count,

      size:
        this.size,

      initialized:
        this.initialized,

      dirty:
        this.dirty
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                   */
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

    this.buffer?.dispose(
      context
    );

    this.buffer =
      null;

    this.disposed =
      true;
  }

  private calculateSize(
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ):
    number {
    if (
      data instanceof
      ArrayBuffer
    ) {
      return data.byteLength;
    }

    if (
      ArrayBuffer.isView(
        data
      )
    ) {
      return data.byteLength;
    }

    return (
      data.length * 4
    );
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `InstanceBuffer "${this.name}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Instanced Batch                                                            */
/* -------------------------------------------------------------------------- */

export class InstancedBatch {

  readonly id:
    string;

  private name:
    string;

  private geometry:
    RenderGeometry;

  private attributes =
    new Map<
      string,
      InstanceAttribute
    >();

  private buffers =
    new Map<
      string,
      InstanceBuffer
    >();

  private instanceCount =
    0;

  private maxInstances =
    0;

  private dynamic:
    boolean;

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
      InstancedBatchOptions
  ) {
    this.id =
      options.id ??
      `instance-batch-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.geometry =
      options.geometry;

    this.dynamic =
      options.dynamic ??
      true;

    this.instanceCount =
      Math.max(
        0,
        options.instanceCount ??
          0
      );

    this.maxInstances =
      this.instanceCount;

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
  }

  /* ------------------------------------------------------------------------ */
  /* Geometry                                                                  */
  /* ------------------------------------------------------------------------ */

  getGeometry():
    RenderGeometry {
    return this.geometry;
  }

  setGeometry(
    geometry:
      RenderGeometry
  ): void {
    this.geometry =
      geometry;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Attributes                                                               */
  /* ------------------------------------------------------------------------ */

  setAttribute(
    attribute:
      InstanceAttribute
  ): void {
    this.assertActive();

    this.attributes.set(
      attribute.name,
      {
        ...attribute
      }
    );

    let buffer =
      this.buffers.get(
        attribute.name
      );

    if (
      !buffer
    ) {
      buffer =
        new InstanceBuffer(
          attribute.name,
          attribute.data,
          {
            dynamic:
              this.dynamic,

            label:
              `${this.label}-${attribute.name}`
          }
        );

      this.buffers.set(
        attribute.name,
        buffer
      );
    } else {
      buffer.setData(
        attribute.data
      );
    }

    buffer.setCount(
      this.instanceCount
    );

    this.maxInstances =
      Math.max(
        this.maxInstances,
        this.calculateAttributeCount(
          attribute
        )
      );

    this.dirty =
      true;
  }

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
        `Instance attribute "${name}" does not exist.`
      );
    }

    attribute.data =
      data;

    const buffer =
      this.buffers.get(
        name
      );

    buffer?.setData(
      data
    );

    this.dirty =
      true;
  }

  getAttribute(
    name:
      string
  ):
    InstanceAttribute |
    undefined {
    return this.attributes.get(
      name
    );
  }

  getAttributes():
    InstanceAttribute[] {
    return Array.from(
      this.attributes.values()
    ).map(
      attribute => ({
        ...attribute
      })
    );
  }

  getBuffer(
    name:
      string
  ):
    InstanceBuffer |
    undefined {
    return this.buffers.get(
      name
    );
  }

  getBuffers():
    InstanceBuffer[] {
    return Array.from(
      this.buffers.values()
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Instance Count                                                            */
  /* ------------------------------------------------------------------------ */

  setInstanceCount(
    count:
      number
  ): void {
    this.assertActive();

    this.instanceCount =
      Math.max(
        0,
        Math.floor(
          count
        )
      );

    this.maxInstances =
      Math.max(
        this.maxInstances,
        this.instanceCount
      );

    for (
      const buffer of
      this.buffers.values()
    ) {
      buffer.setCount(
        this.instanceCount
      );
    }

    this.dirty =
      true;
  }

  getInstanceCount():
    number {
    return this.instanceCount;
  }

  getMaxInstances():
    number {
    return this.maxInstances;
  }

  reserveInstances(
    count:
      number
  ): void {
    this.maxInstances =
      Math.max(
        this.maxInstances,
        Math.floor(
          count
        )
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Initialization                                                           */
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

    this.geometry.initialize(
      context
    );

    for (
      const buffer of
      this.buffers.values()
    ) {
      buffer.initialize(
        context
      );
    }

    this.initialized =
      true;

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Draw                                                                     */
  /* ------------------------------------------------------------------------ */

  draw(
    context:
      RenderContext
  ): void {
    this.assertActive();

    if (
      !this.initialized ||
      this.dirty
    ) {
      this.initialize(
        context
      );
    }

    if (
      this.instanceCount <=
      0
    ) {
      return;
    }

    context.adapter
      .drawInstanced({
        geometry:
          this.geometry,

        instanceBuffers:
          this.buffers,

        instanceCount:
          this.instanceCount
      });
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
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
    InstancedBatchState {
    return {
      id:
        this.id,

      name:
        this.name,

      instanceCount:
        this.instanceCount,

      maxInstances:
        this.maxInstances,

      attributeCount:
        this.attributes.size,

      initialized:
        this.initialized,

      dirty:
        this.dirty
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                   */
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
      this.buffers.values()
    ) {
      buffer.dispose(
        context
      );
    }

    this.buffers.clear();

    this.attributes.clear();

    this.initialized =
      false;

    this.disposed =
      true;
  }

  private calculateAttributeCount(
    attribute:
      InstanceAttribute
  ):
    number {
    const values =
      Array.isArray(
        attribute.data
      )
        ? attribute.data.length
        : ArrayBuffer.isView(
            attribute.data
          )
          ? attribute.data.byteLength /
            4
          : attribute.data.byteLength /
            4;

    return Math.floor(
      values /
      attribute.size
    );
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `InstancedBatch "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Instance Manager                                                           */
/* -------------------------------------------------------------------------- */

export class InstanceManager {

  private batches =
    new Map<
      string,
      InstancedBatch
    >();

  register(
    batch:
      InstancedBatch
  ): void {
    if (
      this.batches.has(
        batch.id
      )
    ) {
      throw new Error(
        `Instance batch "${batch.id}" already exists.`
      );
    }

    this.batches.set(
      batch.id,
      batch
    );
  }

  get(
    id:
      string
  ):
    InstancedBatch |
    undefined {
    return this.batches.get(
      id
    );
  }

  has(
    id:
      string
  ):
    boolean {
    return this.batches.has(
      id
    );
  }

  remove(
    id:
      string,
    context?:
      RenderContext
  ):
    boolean {
    const batch =
      this.batches.get(
        id
      );

    if (
      !batch
    ) {
      return false;
    }

    batch.dispose(
      context
    );

    return this.batches.delete(
      id
    );
  }

  initializeAll(
    context:
      RenderContext
  ):
    void {
    for (
      const batch of
      this.batches.values()
    ) {
      batch.initialize(
        context
      );
    }
  }

  drawAll(
    context:
      RenderContext
  ):
    void {
    for (
      const batch of
      this.batches.values()
    ) {
      batch.draw(
        context
      );
    }
  }

  getAll():
    InstancedBatch[] {
    return Array.from(
      this.batches.values()
    );
  }

  dispose(
    context?:
      RenderContext
  ):
    void {
    for (
      const batch of
      this.batches.values()
    ) {
      batch.dispose(
        context
      );
    }

    this.batches.clear();
  }

  get size():
    number {
    return this.batches.size;
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function createInstanceBuffer(
  name:
    string,
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[],
  options:
    {
      dynamic?:
        boolean;

      label?:
        string;
    } = {}
):
  InstanceBuffer {
  return new InstanceBuffer(
    name,
    data,
    options
  );
}

export function createInstancedBatch(
  options:
    InstancedBatchOptions
):
  InstancedBatch {
  return new InstancedBatch(
    options
  );
}

export function createInstanceManager():
  InstanceManager {
  return new InstanceManager();
}

/* -------------------------------------------------------------------------- */
/* Standard Instance Attributes                                               */
/* -------------------------------------------------------------------------- */

export function createTransformAttribute(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[]
):
  InstanceAttribute {
  return {
    name:
      "instanceTransform",

    size:
      16,

    type:
      "float32",

    data,

    divisor:
      1
  };
}

export function createPositionAttribute(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[]
):
  InstanceAttribute {
  return {
    name:
      "instancePosition",

    size:
      3,

    type:
      "float32",

    data,

    divisor:
      1
  };
}

export function createColorAttribute(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[]
):
  InstanceAttribute {
  return {
    name:
      "instanceColor",

    size:
      4,

    type:
      "float32",

    data,

    divisor:
      1
  };
}

export function createScaleAttribute(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[]
):
  InstanceAttribute {
  return {
    name:
      "instanceScale",

    size:
      3,

    type:
      "float32",

    data,

    divisor:
      1
  };
}

export default InstancedBatch;
