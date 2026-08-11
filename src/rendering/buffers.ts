/**
 * Space
 * Rendering Buffers
 *
 * GPU buffer abstractions.
 *
 * Supported buffer categories:
 * - Vertex
 * - Index
 * - Uniform
 * - Storage
 * - Instance
 *
 * The implementation is backend-agnostic. The actual GPU resource
 * is owned by the rendering adapter.
 */

import type {
  RenderContext,
  GPUBufferHandle,
  BufferUsage,
  BufferType
} from "../types/rendering";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface BufferOptions {
  id?: string;

  type:
    BufferType;

  usage?:
    BufferUsage;

  data?:
    ArrayBuffer |
    ArrayBufferView |
    number[];

  size?:
    number;

  dynamic?:
    boolean;

  label?:
    string;
}

export interface BufferUpdate {
  offset:
    number;

  data:
    ArrayBuffer |
    ArrayBufferView |
    number[];
}

export interface BufferState {
  id:
    string;

  type:
    BufferType;

  usage:
    BufferUsage;

  size:
    number;

  dynamic:
    boolean;

  initialized:
    boolean;

  dirty:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Buffer                                                                     */
/* -------------------------------------------------------------------------- */

export class RenderBuffer {
  readonly id:
    string;

  readonly type:
    BufferType;

  readonly usage:
    BufferUsage;

  readonly dynamic:
    boolean;

  private size:
    number;

  private label:
    string;

  private data:
    ArrayBuffer | null =
      null;

  private handle:
    GPUBufferHandle | null =
      null;

  private initialized =
    false;

  private dirty =
    true;

  private disposed =
    false;

  constructor(
    options:
      BufferOptions
  ) {
    this.id =
      options.id ??
      `buffer-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.type =
      options.type;

    this.usage =
      options.usage ??
      "static";

    this.dynamic =
      options.dynamic ??
      false;

    this.label =
      options.label ??
      this.id;

    this.data =
      this.normalizeData(
        options.data
      );

    this.size =
      options.size ??
      this.data?.byteLength ??
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
      this.initialized
    ) {
      return;
    }

    this.handle =
      context.adapter
        .createBuffer({
          type:
            this.type,

          usage:
            this.usage,

          size:
            this.size,

          dynamic:
            this.dynamic,

          label:
            this.label
        });

    if (
      this.data
    ) {
      context.adapter
        .writeBuffer(
          this.handle,
          this.data,
          0
        );
    }

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

    const normalized =
      this.normalizeData(
        data
      );

    if (!normalized) {
      this.data =
        null;

      this.size =
        0;

      this.dirty =
        true;

      return;
    }

    this.data =
      normalized;

    this.size =
      normalized.byteLength;

    this.dirty =
      true;
  }

  update(
    update:
      BufferUpdate
  ): void {
    this.assertActive();

    if (
      !this.data
    ) {
      this.data =
        new ArrayBuffer(
          this.size
        );
    }

    const source =
      this.toUint8Array(
        update.data
      );

    const target =
      new Uint8Array(
        this.data
      );

    if (
      update.offset < 0 ||
      update.offset +
        source.byteLength >
        target.byteLength
    ) {
      throw new RangeError(
        `Buffer update exceeds buffer bounds.`
      );
    }

    target.set(
      source,
      update.offset
    );

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* GPU synchronization                                                      */
  /* ------------------------------------------------------------------------ */

  upload(
    context:
      RenderContext
  ): void {
    this.assertActive();

    if (
      !this.initialized
    ) {
      this.initialize(
        context
      );

      return;
    }

    if (
      !this.handle ||
      !this.data ||
      !this.dirty
    ) {
      return;
    }

    context.adapter
      .writeBuffer(
        this.handle,
        this.data,
        0
      );

    this.dirty =
      false;
  }

  uploadRange(
    context:
      RenderContext,
    offset:
      number,
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ): void {
    this.assertActive();

    if (
      !this.initialized
    ) {
      this.initialize(
        context
      );
    }

    if (
      !this.handle
    ) {
      return;
    }

    context.adapter.writeBuffer(
      this.handle,
      data,
      offset
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Resize                                                                   */
  /* ------------------------------------------------------------------------ */

  resize(
    size:
      number
  ): void {
    this.assertActive();

    if (
      size < 0
    ) {
      throw new RangeError(
        "Buffer size cannot be negative."
      );
    }

    if (
      size === this.size
    ) {
      return;
    }

    const next =
      new ArrayBuffer(
        size
      );

    if (
      this.data
    ) {
      const source =
        new Uint8Array(
          this.data
        );

      const target =
        new Uint8Array(
          next
        );

      target.set(
        source.subarray(
          0,
          Math.min(
            source.byteLength,
            target.byteLength
          )
        )
      );
    }

    this.data =
      next;

    this.size =
      size;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Accessors                                                                */
  /* ------------------------------------------------------------------------ */

  getSize(): number {
    return this.size;
  }

  getData():
    ArrayBuffer | null {
    if (
      !this.data
    ) {
      return null;
    }

    return this.data.slice(
      0
    );
  }

  getHandle():
    GPUBufferHandle | null {
    return this.handle;
  }

  getLabel(): string {
    return this.label;
  }

  setLabel(
    label:
      string
  ): void {
    this.label =
      label;
  }

  isInitialized():
    boolean {
    return this.initialized;
  }

  isDirty():
    boolean {
    return this.dirty;
  }

  getState():
    BufferState {
    return {
      id:
        this.id,

      type:
        this.type,

      usage:
        this.usage,

      size:
        this.size,

      dynamic:
        this.dynamic,

      initialized:
        this.initialized,

      dirty:
        this.dirty
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Mapping                                                                  */
  /* ------------------------------------------------------------------------ */

  map(): Uint8Array {
    this.assertActive();

    if (
      !this.data
    ) {
      this.data =
        new ArrayBuffer(
          this.size
        );
    }

    this.dirty =
      true;

    return new Uint8Array(
      this.data
    );
  }

  unmap(): void {
    this.dirty =
      true;
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

    if (
      this.handle &&
      context
    ) {
      context.adapter
        .destroyBuffer(
          this.handle
        );
    }

    this.handle =
      null;

    this.data =
      null;

    this.initialized =
      false;

    this.disposed =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private normalizeData(
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[] |
      undefined
  ):
    ArrayBuffer | null {
    if (
      data ===
      undefined
    ) {
      return null;
    }

    if (
      data instanceof
      ArrayBuffer
    ) {
      return data.slice(
        0
      );
    }

    if (
      ArrayBuffer.isView(
        data
      )
    ) {
      const view =
        data as
          ArrayBufferView;

      const bytes =
        new Uint8Array(
          view.buffer,
          view.byteOffset,
          view.byteLength
        );

      return bytes.slice()
        .buffer;
    }

    if (
      Array.isArray(
        data
      )
    ) {
      return new Float32Array(
        data
      ).buffer;
    }

    return null;
  }

  private toUint8Array(
    data:
      ArrayBuffer |
      ArrayBufferView |
      number[]
  ):
    Uint8Array {
    if (
      data instanceof
      ArrayBuffer
    ) {
      return new Uint8Array(
        data
      );
    }

    if (
      ArrayBuffer.isView(
        data
      )
    ) {
      const view =
        data as
          ArrayBufferView;

      return new Uint8Array(
        view.buffer,
        view.byteOffset,
        view.byteLength
      );
    }

    return new Uint8Array(
      new Float32Array(
        data
      ).buffer
    );
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `RenderBuffer "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Buffer Manager                                                             */
/* -------------------------------------------------------------------------- */

export class RenderBufferManager {
  private readonly buffers =
    new Map<
      string,
      RenderBuffer
    >();

  private disposed =
    false;

  create(
    options:
      BufferOptions
  ): RenderBuffer {
    this.assertActive();

    if (
      this.buffers.has(
        options.id ?? ""
      )
    ) {
      throw new Error(
        `Buffer "${options.id}" already exists.`
      );
    }

    const buffer =
      new RenderBuffer(
        options
      );

    this.buffers.set(
      buffer.id,
      buffer
    );

    return buffer;
  }

  get(
    id:
      string
  ):
    RenderBuffer | undefined {
    return this.buffers.get(
      id
    );
  }

  has(
    id:
      string
  ): boolean {
    return this.buffers.has(
      id
    );
  }

  delete(
    id:
      string,
    context?:
      RenderContext
  ): boolean {
    const buffer =
      this.buffers.get(
        id
      );

    if (!buffer) {
      return false;
    }

    buffer.dispose(
      context
    );

    this.buffers.delete(
      id
    );

    return true;
  }

  getAll():
    RenderBuffer[] {
    return Array.from(
      this.buffers.values()
    );
  }

  initializeAll(
    context:
      RenderContext
  ): void {
    for (
      const buffer of
      this.buffers.values()
    ) {
      buffer.initialize(
        context
      );
    }
  }

  uploadDirty(
    context:
      RenderContext
  ): void {
    for (
      const buffer of
      this.buffers.values()
    ) {
      if (
        buffer.isDirty()
      ) {
        buffer.upload(
          context
        );
      }
    }
  }

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

    this.disposed =
      true;
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        "RenderBufferManager has been disposed."
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Factories                                                                  */
/* -------------------------------------------------------------------------- */

export function createRenderBuffer(
  options:
    BufferOptions
): RenderBuffer {
  return new RenderBuffer(
    options
  );
}

export function createVertexBuffer(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[],
  options:
    Omit<
      BufferOptions,
      "type" |
      "data"
    > = {}
): RenderBuffer {
  return new RenderBuffer({
    ...options,

    type:
      "vertex",

    data
  });
}

export function createIndexBuffer(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[],
  options:
    Omit<
      BufferOptions,
      "type" |
      "data"
    > = {}
): RenderBuffer {
  return new RenderBuffer({
    ...options,

    type:
      "index",

    data
  });
}

export function createUniformBuffer(
  size:
    number,
  options:
    Omit<
      BufferOptions,
      "type" |
      "size"
    > = {}
): RenderBuffer {
  return new RenderBuffer({
    ...options,

    type:
      "uniform",

    size
  });
}

export function createStorageBuffer(
  size:
    number,
  options:
    Omit<
      BufferOptions,
      "type" |
      "size"
    > = {}
): RenderBuffer {
  return new RenderBuffer({
    ...options,

    type:
      "storage",

    size
  });
}

export function createInstanceBuffer(
  data:
    ArrayBuffer |
    ArrayBufferView |
    number[],
  options:
    Omit<
      BufferOptions,
      "type" |
      "data"
    > = {}
): RenderBuffer {
  return new RenderBuffer({
    ...options,

    type:
      "instance",

    data
  });
}

export default RenderBuffer;
