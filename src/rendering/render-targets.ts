/**
 * Space
 * Rendering Render Targets
 *
 * Backend-agnostic render target abstraction.
 *
 * Supports:
 * - Color attachments
 * - Depth attachments
 * - Stencil attachments
 * - Multiple render targets
 * - HDR targets
 * - MSAA configuration
 * - Offscreen rendering
 * - Resize lifecycle
 * - Render target pooling metadata
 */

import type {
  RenderContext,
  Texture,
  TextureFormat,
  GPUFramebufferHandle,
  GPUTextureHandle
} from "../types/rendering";

import {
  RenderTexture,
  createTexture
} from "./textures";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RenderTargetAttachment {
  texture:
    RenderTexture;

  mipLevel?:
    number;

  layer?:
    number;
}

export interface RenderTargetOptions {
  id?: string;

  name?: string;

  width:
    number;

  height:
    number;

  colorFormat?:
    TextureFormat;

  depthFormat?:
    TextureFormat;

  stencil?:
    boolean;

  depth?:
    boolean;

  hdr?:
    boolean;

  samples?:
    number;

  colorAttachments?:
    number;

  autoResize?:
    boolean;

  label?:
    string;
}

export interface RenderTargetState {
  id:
    string;

  name:
    string;

  width:
    number;

  height:
    number;

  colorAttachments:
    number;

  hasDepth:
    boolean;

  hasStencil:
    boolean;

  hdr:
    boolean;

  samples:
    number;

  initialized:
    boolean;

  dirty:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Render Target                                                              */
/* -------------------------------------------------------------------------- */

export class RenderTarget {

  readonly id:
    string;

  private name:
    string;

  private width:
    number;

  private height:
    number;

  private colorFormat:
    TextureFormat;

  private depthFormat:
    TextureFormat;

  private useDepth:
    boolean;

  private useStencil:
    boolean;

  private hdr:
    boolean;

  private samples:
    number;

  private colorAttachments:
    RenderTargetAttachment[] =
      [];

  private depthAttachment:
    RenderTargetAttachment |
    null =
      null;

  private stencilAttachment:
    RenderTargetAttachment |
    null =
      null;

  private framebuffer:
    GPUFramebufferHandle |
    null =
      null;

  private initialized =
    false;

  private dirty =
    true;

  private autoResize:
    boolean;

  private disposed =
    false;

  private label:
    string;

  constructor(
    options:
      RenderTargetOptions
  ) {
    this.id =
      options.id ??
      `render-target-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.width =
      Math.max(
        1,
        options.width
      );

    this.height =
      Math.max(
        1,
        options.height
      );

    this.colorFormat =
      options.colorFormat ??
      (
        options.hdr
          ? "rgba16f"
          : "rgba8"
      );

    this.depthFormat =
      options.depthFormat ??
      "depth24";

    this.useDepth =
      options.depth ??
      true;

    this.useStencil =
      options.stencil ??
      false;

    this.hdr =
      options.hdr ??
      false;

    this.samples =
      Math.max(
        1,
        options.samples ??
          1
      );

    this.autoResize =
      options.autoResize ??
      false;

    this.label =
      options.label ??
      this.id;

    const attachmentCount =
      Math.max(
        1,
        options.colorAttachments ??
          1
      );

    for (
      let i = 0;
      i < attachmentCount;
      i++
    ) {
      this.colorAttachments.push({
        texture:
          createTexture({
            id:
              `${this.id}-color-${i}`,

            name:
              `${this.name}-color-${i}`,

            width:
              this.width,

            height:
              this.height,

            format:
              this.colorFormat,

            mipmaps:
              false,

            hdr:
              this.hdr,

            label:
              `${this.label}-color-${i}`
          })
      });
    }

    if (
      this.useDepth
    ) {
      this.depthAttachment = {
        texture:
          createTexture({
            id:
              `${this.id}-depth`,

            name:
              `${this.name}-depth`,

            width:
              this.width,

            height:
              this.height,

            format:
              this.depthFormat,

            mipmaps:
              false,

            label:
              `${this.label}-depth`
          })
      };
    }

    if (
      this.useStencil
    ) {
      this.stencilAttachment = {
        texture:
          createTexture({
            id:
              `${this.id}-stencil`,

            name:
              `${this.name}-stencil`,

            width:
              this.width,

            height:
              this.height,

            format:
              "depth24stencil8",

            mipmaps:
              false,

            label:
              `${this.label}-stencil`
          })
      };
    }
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

    for (
      const attachment of
      this.colorAttachments
    ) {
      attachment.texture
        .initialize(
          context
        );
    }

    this.depthAttachment
      ?.texture
      .initialize(
        context
      );

    this.stencilAttachment
      ?.texture
      .initialize(
        context
      );

    this.framebuffer =
      context.adapter
        .createFramebuffer({
          width:
            this.width,

          height:
            this.height,

          samples:
            this.samples,

          colorAttachments:
            this.colorAttachments.map(
              attachment =>
                attachment.texture
                  .getHandle()
            ),

          depthAttachment:
            this.depthAttachment
              ?.texture
              .getHandle() ??
            null,

          stencilAttachment:
            this.stencilAttachment
              ?.texture
              .getHandle() ??
            null,

          label:
            this.label
        });

    this.initialized =
      true;

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Bind                                                                     */
  /* ------------------------------------------------------------------------ */

  bind(
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
      !this.framebuffer
    ) {
      return;
    }

    context.adapter
      .bindFramebuffer(
        this.framebuffer,
        this.width,
        this.height
      );
  }

  unbind(
    context:
      RenderContext
  ): void {
    context.adapter
      .unbindFramebuffer();
  }

  /* ------------------------------------------------------------------------ */
  /* Color Attachments                                                        */
  /* ------------------------------------------------------------------------ */

  getColorAttachment(
    index:
      number = 0
  ):
    RenderTexture |
    undefined {
    return this.colorAttachments[
      index
    ]?.texture;
  }

  getColorAttachments():
    RenderTexture[] {
    return this.colorAttachments.map(
      attachment =>
        attachment.texture
    );
  }

  setColorAttachment(
    index:
      number,
    texture:
      RenderTexture
  ): void {
    this.assertActive();

    if (
      index < 0
    ) {
      throw new RangeError(
        "Color attachment index cannot be negative."
      );
    }

    this.colorAttachments[
      index
    ] = {
      texture
    };

    this.dirty =
      true;
  }

  addColorAttachment(
    texture:
      RenderTexture
  ): number {
    this.assertActive();

    const index =
      this.colorAttachments.length;

    this.colorAttachments.push({
      texture
    });

    this.dirty =
      true;

    return index;
  }

  removeColorAttachment(
    index:
      number
  ): boolean {
    if (
      index < 0 ||
      index >=
        this.colorAttachments.length
    ) {
      return false;
    }

    const [
      attachment
    ] =
      this.colorAttachments
        .splice(
          index,
          1
        );

    attachment?.texture.dispose();

    this.dirty =
      true;

    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* Depth                                                                     */
  /* ------------------------------------------------------------------------ */

  getDepthAttachment():
    RenderTexture |
    null {
    return (
      this.depthAttachment
        ?.texture ??
      null
    );
  }

  setDepthAttachment(
    texture:
      RenderTexture
  ): void {
    this.depthAttachment = {
      texture
    };

    this.useDepth =
      true;

    this.dirty =
      true;
  }

  removeDepthAttachment():
    void {
    this.depthAttachment
      ?.texture
      .dispose();

    this.depthAttachment =
      null;

    this.useDepth =
      false;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Stencil                                                                   */
  /* ------------------------------------------------------------------------ */

  getStencilAttachment():
    RenderTexture |
    null {
    return (
      this.stencilAttachment
        ?.texture ??
      null
    );
  }

  setStencilAttachment(
    texture:
      RenderTexture
  ): void {
    this.stencilAttachment = {
      texture
    };

    this.useStencil =
      true;

    this.dirty =
      true;
  }

  removeStencilAttachment():
    void {
    this.stencilAttachment
      ?.texture
      .dispose();

    this.stencilAttachment =
      null;

    this.useStencil =
      false;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Resize                                                                   */
  /* ------------------------------------------------------------------------ */

  resize(
    width:
      number,
    height:
      number,
    context?:
      RenderContext
  ): void {
    this.assertActive();

    const nextWidth =
      Math.max(
        1,
        width
      );

    const nextHeight =
      Math.max(
        1,
        height
      );

    if (
      this.width ===
        nextWidth &&
      this.height ===
        nextHeight
    ) {
      return;
    }

    this.width =
      nextWidth;

    this.height =
      nextHeight;

    for (
      const attachment of
      this.colorAttachments
    ) {
      attachment.texture.resize(
        this.width,
        this.height
      );
    }

    this.depthAttachment
      ?.texture
      .resize(
        this.width,
        this.height
      );

    this.stencilAttachment
      ?.texture
      .resize(
        this.width,
        this.height
      );

    if (
      this.framebuffer &&
      context
    ) {
      context.adapter
        .destroyFramebuffer(
          this.framebuffer
        );

      this.framebuffer =
        null;
    }

    this.initialized =
      false;

    this.dirty =
      true;
  }

  getWidth():
    number {
    return this.width;
  }

  getHeight():
    number {
    return this.height;
  }

  /* ------------------------------------------------------------------------ */
  /* Sampling                                                                  */
  /* ------------------------------------------------------------------------ */

  getColorTexture(
    index:
      number = 0
  ):
    RenderTexture |
    undefined {
    return this.getColorAttachment(
      index
    );
  }

  getDepthTexture():
    RenderTexture |
    null {
    return this.getDepthAttachment();
  }

  getColorHandle(
    index:
      number = 0
  ):
    GPUTextureHandle |
    null {
    return (
      this.getColorAttachment(
        index
      )?.getHandle() ??
      null
    );
  }

  getDepthHandle():
    GPUTextureHandle |
    null {
    return (
      this.getDepthAttachment()
        ?.getHandle() ??
      null
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Framebuffer                                                              */
  /* ------------------------------------------------------------------------ */

  getFramebuffer():
    GPUFramebufferHandle |
    null {
    return this.framebuffer;
  }

  isInitialized():
    boolean {
    return this.initialized;
  }

  isDirty():
    boolean {
    return this.dirty;
  }

  /* ------------------------------------------------------------------------ */
  /* Configuration                                                            */
  /* ------------------------------------------------------------------------ */

  getSamples():
    number {
    return this.samples;
  }

  setSamples(
    samples:
      number
  ): void {
    this.samples =
      Math.max(
        1,
        samples
      );

    this.dirty =
      true;
  }

  isHDR():
    boolean {
    return this.hdr;
  }

  hasDepth():
    boolean {
    return (
      this.depthAttachment !==
      null
    );
  }

  hasStencil():
    boolean {
    return (
      this.stencilAttachment !==
      null
    );
  }

  isAutoResize():
    boolean {
    return this.autoResize;
  }

  setAutoResize(
    enabled:
      boolean
  ): void {
    this.autoResize =
      enabled;
  }

  /* ------------------------------------------------------------------------ */
  /* Clear                                                                     */
  /* ------------------------------------------------------------------------ */

  clear(
    context:
      RenderContext,
    options:
      {
        color?:
          [number, number, number, number];

        depth?:
          number;

        stencil?:
          number;
      } = {}
  ): void {
    this.bind(
      context
    );

    context.adapter
      .clear({
        color:
          options.color ??
          [0, 0, 0, 0],

        depth:
          options.depth ??
          1,

        stencil:
          options.stencil ??
          0
      });
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  getState():
    RenderTargetState {
    return {
      id:
        this.id,

      name:
        this.name,

      width:
        this.width,

      height:
        this.height,

      colorAttachments:
        this.colorAttachments.length,

      hasDepth:
        this.hasDepth(),

      hasStencil:
        this.hasStencil(),

      hdr:
        this.hdr,

      samples:
        this.samples,

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

    if (
      this.framebuffer &&
      context
    ) {
      context.adapter
        .destroyFramebuffer(
          this.framebuffer
        );
    }

    for (
      const attachment of
      this.colorAttachments
    ) {
      attachment.texture.dispose(
        context
      );
    }

    this.depthAttachment
      ?.texture
      .dispose(
        context
      );

    this.stencilAttachment
      ?.texture
      .dispose(
        context
      );

    this.colorAttachments =
      [];

    this.depthAttachment =
      null;

    this.stencilAttachment =
      null;

    this.framebuffer =
      null;

    this.initialized =
      false;

    this.disposed =
      true;
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `RenderTarget "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Render Target Pool                                                         */
/* -------------------------------------------------------------------------- */

export class RenderTargetPool {

  private targets =
    new Map<
      string,
      RenderTarget[]
    >();

  acquire(
    options:
      RenderTargetOptions,
    context?:
      RenderContext
  ):
    RenderTarget {
    const key =
      this.createKey(
        options
      );

    const available =
      this.targets.get(
        key
      );

    const target =
      available?.pop();

    if (
      target
    ) {
      return target;
    }

    const created =
      new RenderTarget(
        options
      );

    if (
      context
    ) {
      created.initialize(
        context
      );
    }

    return created;
  }

  release(
    target:
      RenderTarget
  ): void {
    const state =
      target.getState();

    const key =
      this.createKey({
        width:
          state.width,

        height:
          state.height,

        colorAttachments:
          state.colorAttachments,

        depth:
          state.hasDepth,

        stencil:
          state.hasStencil,

        hdr:
          state.hdr,

        samples:
          state.samples
      });

    const bucket =
      this.targets.get(
        key
      ) ??
      [];

    bucket.push(
      target
    );

    this.targets.set(
      key,
      bucket
    );
  }

  clear(
    context?:
      RenderContext
  ): void {
    for (
      const bucket of
      this.targets.values()
    ) {
      for (
        const target of
        bucket
      ) {
        target.dispose(
          context
        );
      }
    }

    this.targets.clear();
  }

  private createKey(
    options:
      RenderTargetOptions
  ):
    string {
    return [
      options.width,

      options.height,

      options.colorAttachments ??
        1,

      options.depth ??
        true,

      options.stencil ??
        false,

      options.hdr ??
        false,

      options.samples ??
        1
    ].join(
      ":"
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Factories                                                                  */
/* -------------------------------------------------------------------------- */

export function createRenderTarget(
  options:
    RenderTargetOptions
):
  RenderTarget {
  return new RenderTarget(
    options
  );
}

export function createRenderTargetPool():
  RenderTargetPool {
  return new RenderTargetPool();
}

export function createHDRRenderTarget(
  width:
    number,
  height:
    number,
  options:
    Omit<
      RenderTargetOptions,
      "width" |
      "height" |
      "hdr"
    > = {}
):
  RenderTarget {
  return new RenderTarget({
    ...options,

    width,

    height,

    hdr:
      true,

    colorFormat:
      options.colorFormat ??
      "rgba16f"
  });
}

export default RenderTarget;
