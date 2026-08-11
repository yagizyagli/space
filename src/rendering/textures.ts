/**
 * Space
 * Rendering Textures
 *
 * Backend-agnostic texture and sampler abstraction.
 *
 * Supports:
 * - 2D textures
 * - Cube textures
 * - HDR textures
 * - Data textures
 * - Render targets
 * - Samplers
 * - Mipmaps
 * - Filtering
 * - Wrapping
 */

import type {
  RenderContext,
  Texture,
  TextureFormat,
  TextureFilter,
  TextureWrap,
  TextureDimension,
  GPUTextureHandle,
  GPUSamplerHandle
} from "../types/rendering";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface TextureSource {
  data?:
    ArrayBuffer |
    ArrayBufferView |
    ImageBitmap |
    HTMLImageElement |
    HTMLCanvasElement |
    HTMLVideoElement;

  width?:
    number;

  height?:
    number;

  depth?:
    number;
}

export interface SamplerOptions {
  id?: string;

  minFilter?:
    TextureFilter;

  magFilter?:
    TextureFilter;

  wrapS?:
    TextureWrap;

  wrapT?:
    TextureWrap;

  wrapR?:
    TextureWrap;

  anisotropy?:
    number;

  compare?:
    boolean;
}

export interface TextureOptions {
  id?: string;

  name?: string;

  dimension?:
    TextureDimension;

  width:
    number;

  height:
    number;

  depth?: number;

  format?:
    TextureFormat;

  mipmaps?:
    boolean;

  mipLevels?:
    number;

  source?:
    TextureSource;

  sampler?:
    SamplerOptions;

  hdr?:
    boolean;

  srgb?:
    boolean;

  label?:
    string;
}

export interface CubeTextureOptions
  extends Omit<
    TextureOptions,
    "dimension" |
    "source"
  > {
  faces:
    TextureSource[];
}

export interface TextureState {
  id:
    string;

  name:
    string;

  dimension:
    TextureDimension;

  width:
    number;

  height:
    number;

  depth:
    number;

  format:
    TextureFormat;

  mipmaps:
    boolean;

  mipLevels:
    number;

  hdr:
    boolean;

  srgb:
    boolean;

  initialized:
    boolean;

  dirty:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Sampler                                                                    */
/* -------------------------------------------------------------------------- */

export class RenderSampler {
  readonly id:
    string;

  private options:
    Required<SamplerOptions>;

  private handle:
    GPUSamplerHandle | null =
      null;

  private initialized =
    false;

  private disposed =
    false;

  constructor(
    options:
      SamplerOptions = {}
  ) {
    this.id =
      options.id ??
      `sampler-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.options = {
      minFilter:
        options.minFilter ??
        "linear",

      magFilter:
        options.magFilter ??
        "linear",

      wrapS:
        options.wrapS ??
        "repeat",

      wrapT:
        options.wrapT ??
        "repeat",

      wrapR:
        options.wrapR ??
        "repeat",

      anisotropy:
        Math.max(
          1,
          options.anisotropy ??
            1
        ),

      compare:
        options.compare ??
        false
    };
  }

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
      context.adapter.createSampler(
        this.options
      );

    this.initialized =
      true;
  }

  getHandle():
    GPUSamplerHandle | null {
    return this.handle;
  }

  getOptions():
    Required<SamplerOptions> {
    return {
      ...this.options
    };
  }

  setMinFilter(
    filter:
      TextureFilter
  ): void {
    this.options.minFilter =
      filter;
    this.initialized =
      false;
  }

  setMagFilter(
    filter:
      TextureFilter
  ): void {
    this.options.magFilter =
      filter;
    this.initialized =
      false;
  }

  setWrapS(
    wrap:
      TextureWrap
  ): void {
    this.options.wrapS =
      wrap;
    this.initialized =
      false;
  }

  setWrapT(
    wrap:
      TextureWrap
  ): void {
    this.options.wrapT =
      wrap;
    this.initialized =
      false;
  }

  setWrapR(
    wrap:
      TextureWrap
  ): void {
    this.options.wrapR =
      wrap;
    this.initialized =
      false;
  }

  setAnisotropy(
    value:
      number
  ): void {
    this.options.anisotropy =
      Math.max(
        1,
        value
      );

    this.initialized =
      false;
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

    if (
      this.handle &&
      context
    ) {
      context.adapter
        .destroySampler?.(
          this.handle
        );
    }

    this.handle =
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
        `Sampler "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Texture                                                                    */
/* -------------------------------------------------------------------------- */

export class RenderTexture
  implements Texture {

  readonly id:
    string;

  private name:
    string;

  private dimension:
    TextureDimension;

  private width:
    number;

  private height:
    number;

  private depth:
    number;

  private format:
    TextureFormat;

  private mipmaps:
    boolean;

  private mipLevels:
    number;

  private hdr:
    boolean;

  private srgb:
    boolean;

  private source:
    TextureSource | null;

  private sampler:
    RenderSampler;

  private handle:
    GPUTextureHandle | null =
      null;

  private initialized =
    false;

  private dirty =
    true;

  private disposed =
    false;

  constructor(
    options:
      TextureOptions
  ) {
    this.id =
      options.id ??
      `texture-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.dimension =
      options.dimension ??
      "2d";

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

    this.depth =
      Math.max(
        1,
        options.depth ??
          1
      );

    this.format =
      options.format ??
      "rgba8";

    this.mipmaps =
      options.mipmaps ??
      true;

    this.mipLevels =
      options.mipLevels ??
      (
        this.mipmaps
          ? this.calculateMipLevels()
          : 1
      );

    this.hdr =
      options.hdr ??
      false;

    this.srgb =
      options.srgb ??
      false;

    this.source =
      options.source ??
      null;

    this.sampler =
      new RenderSampler({
        ...(options.sampler ??
          {})
      });
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

    this.handle =
      context.adapter.createTexture({
        dimension:
          this.dimension,

        width:
          this.width,

        height:
          this.height,

        depth:
          this.depth,

        format:
          this.format,

        mipLevels:
          this.mipLevels,

        hdr:
          this.hdr,

        srgb:
          this.srgb
      });

    this.sampler.initialize(
      context
    );

    if (
      this.source
    ) {
      this.uploadSource(
        context,
        this.source
      );
    }

    this.initialized =
      true;

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Source                                                                   */
  /* ------------------------------------------------------------------------ */

  setSource(
    source:
      TextureSource
  ): void {
    this.assertActive();

    this.source =
      source;

    this.dirty =
      true;
  }

  getSource():
    TextureSource | null {
    return this.source;
  }

  uploadSource(
    context:
      RenderContext,
    source:
      TextureSource
  ): void {
    this.assertActive();

    if (
      !this.handle
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

    context.adapter
      .uploadTexture(
        this.handle,
        source
      );

    if (
      this.mipmaps
    ) {
      context.adapter
        .generateMipmaps?.(
          this.handle
        );
    }

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  uploadData(
    context:
      RenderContext,
    data:
      ArrayBuffer |
      ArrayBufferView,
    width:
      number,
    height:
      number,
    depth:
      number = 1
  ): void {
    this.assertActive();

    if (
      !this.handle
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

    context.adapter
      .uploadTextureData(
        this.handle,
        data,
        width,
        height,
        depth
      );

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Size                                                                     */
  /* ------------------------------------------------------------------------ */

  resize(
    width:
      number,
    height:
      number,
    depth:
      number = this.depth
  ): void {
    this.assertActive();

    this.width =
      Math.max(
        1,
        width
      );

    this.height =
      Math.max(
        1,
        height
      );

    this.depth =
      Math.max(
        1,
        depth
      );

    if (
      this.mipmaps
    ) {
      this.mipLevels =
        this.calculateMipLevels();
    }

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

  getDepth():
    number {
    return this.depth;
  }

  /* ------------------------------------------------------------------------ */
  /* Format                                                                   */
  /* ------------------------------------------------------------------------ */

  getFormat():
    TextureFormat {
    return this.format;
  }

  setFormat(
    format:
      TextureFormat
  ): void {
    this.format =
      format;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Mipmaps                                                                  */
  /* ------------------------------------------------------------------------ */

  hasMipmaps():
    boolean {
    return this.mipmaps;
  }

  setMipmaps(
    enabled:
      boolean
  ): void {
    this.mipmaps =
      enabled;

    this.mipLevels =
      enabled
        ? this.calculateMipLevels()
        : 1;

    this.dirty =
      true;
  }

  getMipLevels():
    number {
    return this.mipLevels;
  }

  generateMipmaps(
    context:
      RenderContext
  ): void {
    if (
      !this.handle
    ) {
      return;
    }

    context.adapter
      .generateMipmaps?.(
        this.handle
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Sampler                                                                  */
  /* ------------------------------------------------------------------------ */

  getSampler():
    RenderSampler {
    return this.sampler;
  }

  setSampler(
    sampler:
      RenderSampler
  ): void {
    this.sampler =
      sampler;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* GPU Handle                                                               */
  /* ------------------------------------------------------------------------ */

  getHandle():
    GPUTextureHandle | null {
    return this.handle;
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
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  getState():
    TextureState {
    return {
      id:
        this.id,

      name:
        this.name,

      dimension:
        this.dimension,

      width:
        this.width,

      height:
        this.height,

      depth:
        this.depth,

      format:
        this.format,

      mipmaps:
        this.mipmaps,

      mipLevels:
        this.mipLevels,

      hdr:
        this.hdr,

      srgb:
        this.srgb,

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

    if (
      this.handle &&
      context
    ) {
      context.adapter
        .destroyTexture(
          this.handle
        );
    }

    this.sampler.dispose(
      context
    );

    this.handle =
      null;

    this.source =
      null;

    this.initialized =
      false;

    this.disposed =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private calculateMipLevels():
    number {
    const size =
      Math.max(
        this.width,
        this.height,
        this.depth
      );

    return (
      Math.floor(
        Math.log2(
          size
        )
      ) + 1
    );
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `Texture "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Cube Texture                                                               */
/* -------------------------------------------------------------------------- */

export class CubeTexture
  extends RenderTexture {

  private faces:
    TextureSource[];

  constructor(
    options:
      CubeTextureOptions
  ) {
    super({
      ...options,

      dimension:
        "cube"
    });

    if (
      options.faces.length !== 6
    ) {
      throw new Error(
        "Cube texture requires exactly six faces."
      );
    }

    this.faces =
      options.faces;
  }

  getFaces():
    TextureSource[] {
    return [
      ...this.faces
    ];
  }

  setFace(
    index:
      number,
    source:
      TextureSource
  ): void {
    if (
      index < 0 ||
      index > 5
    ) {
      throw new RangeError(
        "Cube texture face index must be between 0 and 5."
      );
    }

    this.faces[
      index
    ] = source;
  }

  initialize(
    context:
      RenderContext
  ): void {
    super.initialize(
      context
    );

    const handle =
      this.getHandle();

    if (
      !handle
    ) {
      return;
    }

    context.adapter
      .uploadCubeTexture?.(
        handle,
        this.faces
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Texture Manager                                                            */
/* -------------------------------------------------------------------------- */

export class TextureManager {
  private readonly textures =
    new Map<
      string,
      RenderTexture
    >();

  register(
    texture:
      RenderTexture
  ): void {
    if (
      this.textures.has(
        texture.id
      )
    ) {
      throw new Error(
        `Texture "${texture.id}" already exists.`
      );
    }

    this.textures.set(
      texture.id,
      texture
    );
  }

  get(
    id:
      string
  ):
    RenderTexture | undefined {
    return this.textures.get(
      id
    );
  }

  has(
    id:
      string
  ): boolean {
    return this.textures.has(
      id
    );
  }

  remove(
    id:
      string,
    context?:
      RenderContext
  ): boolean {
    const texture =
      this.textures.get(
        id
      );

    if (!texture) {
      return false;
    }

    texture.dispose(
      context
    );

    return this.textures.delete(
      id
    );
  }

  getAll():
    RenderTexture[] {
    return Array.from(
      this.textures.values()
    );
  }

  initializeAll(
    context:
      RenderContext
  ): void {
    for (
      const texture of
      this.textures.values()
    ) {
      texture.initialize(
        context
      );
    }
  }

  dispose(
    context?:
      RenderContext
  ): void {
    for (
      const texture of
      this.textures.values()
    ) {
      texture.dispose(
        context
      );
    }

    this.textures.clear();
  }

  get size():
    number {
    return this.textures.size;
  }
}

/* -------------------------------------------------------------------------- */
/* Factories                                                                  */
/* -------------------------------------------------------------------------- */

export function createTexture(
  options:
    TextureOptions
): RenderTexture {
  return new RenderTexture(
    options
  );
}

export function createCubeTexture(
  options:
    CubeTextureOptions
): CubeTexture {
  return new CubeTexture(
    options
  );
}

export function createSampler(
  options:
    SamplerOptions = {}
): RenderSampler {
  return new RenderSampler(
    options
  );
}

export function createTextureManager():
  TextureManager {
  return new TextureManager();
}

/* -------------------------------------------------------------------------- */
/* Common presets                                                             */
/* -------------------------------------------------------------------------- */

export function createHDRTexture(
  width:
    number,
  height:
    number,
  options:
    Omit<
      TextureOptions,
      "width" |
      "height"
    > = {}
): RenderTexture {
  return new RenderTexture({
    ...options,

    width,

    height,

    hdr:
      true,

    format:
      options.format ??
      "rgba16f"
  });
}

export function createDataTexture(
  data:
    ArrayBuffer |
    ArrayBufferView,
  width:
    number,
  height:
    number,
  options:
    Omit<
      TextureOptions,
      "width" |
      "height" |
      "source"
    > = {}
): RenderTexture {
  return new RenderTexture({
    ...options,

    width,

    height,

    source: {
      data,

      width,

      height
    }
  });
}

export default RenderTexture;
