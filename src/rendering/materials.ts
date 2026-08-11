/**
 * Space
 * Rendering Materials
 *
 * Material system for celestial bodies, stars, atmospheres,
 * orbit lines, grids, markers and other renderable objects.
 *
 * The material describes HOW an object is rendered.
 * Geometry describes WHAT is rendered.
 */

import type {
  Color,
  Texture,
  Shader,
  UniformValue,
  BlendMode,
  CullMode,
  DepthMode,
  MaterialRenderState
} from "../types/rendering";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MaterialOptions {
  id?: string;

  name?: string;

  color?: Color;

  opacity?: number;

  emissive?: Color;

  emissiveIntensity?: number;

  metallic?: number;

  roughness?: number;

  texture?: Texture | null;

  normalMap?: Texture | null;

  roughnessMap?: Texture | null;

  emissiveMap?: Texture | null;

  shader?: Shader | null;

  uniforms?: Record<
    string,
    UniformValue
  >;

  blendMode?: BlendMode;

  cullMode?: CullMode;

  depthMode?: DepthMode;

  transparent?: boolean;

  depthWrite?: boolean;

  depthTest?: boolean;

  wireframe?: boolean;
}

export interface MaterialState {
  id: string;

  name: string;

  color: Color;

  opacity: number;

  emissive: Color;

  emissiveIntensity: number;

  metallic: number;

  roughness: number;

  texture:
    Texture | null;

  normalMap:
    Texture | null;

  roughnessMap:
    Texture | null;

  emissiveMap:
    Texture | null;

  shader:
    Shader | null;

  uniforms:
    Record<
      string,
      UniformValue
    >;

  renderState:
    MaterialRenderState;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_COLOR: Color = {
  r: 1,
  g: 1,
  b: 1,
  a: 1
};

const DEFAULT_EMISSIVE: Color = {
  r: 0,
  g: 0,
  b: 0,
  a: 1
};

/* -------------------------------------------------------------------------- */
/* Material                                                                   */
/* -------------------------------------------------------------------------- */

export class Material {
  readonly id: string;

  private name: string;

  private color: Color;

  private opacity: number;

  private emissive: Color;

  private emissiveIntensity: number;

  private metallic: number;

  private roughness: number;

  private texture:
    Texture | null;

  private normalMap:
    Texture | null;

  private roughnessMap:
    Texture | null;

  private emissiveMap:
    Texture | null;

  private shader:
    Shader | null;

  private uniforms:
    Record<
      string,
      UniformValue
    >;

  private renderState:
    MaterialRenderState;

  private dirty =
    true;

  constructor(
    options: MaterialOptions = {}
  ) {
    this.id =
      options.id ??
      `material-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.color =
      this.cloneColor(
        options.color ??
          DEFAULT_COLOR
      );

    this.opacity =
      this.clamp(
        options.opacity ??
          1,
        0,
        1
      );

    this.emissive =
      this.cloneColor(
        options.emissive ??
          DEFAULT_EMISSIVE
      );

    this.emissiveIntensity =
      Math.max(
        0,
        options.emissiveIntensity ??
          0
      );

    this.metallic =
      this.clamp(
        options.metallic ??
          0,
        0,
        1
      );

    this.roughness =
      this.clamp(
        options.roughness ??
          0.5,
        0,
        1
      );

    this.texture =
      options.texture ??
      null;

    this.normalMap =
      options.normalMap ??
      null;

    this.roughnessMap =
      options.roughnessMap ??
      null;

    this.emissiveMap =
      options.emissiveMap ??
      null;

    this.shader =
      options.shader ??
      null;

    this.uniforms = {
      ...(options.uniforms ??
        {})
    };

    this.renderState = {
      blendMode:
        options.blendMode ??
        "normal",

      cullMode:
        options.cullMode ??
        "back",

      depthMode:
        options.depthMode ??
        "less",

      transparent:
        options.transparent ??
        this.opacity < 1,

      depthWrite:
        options.depthWrite ??
        true,

      depthTest:
        options.depthTest ??
        true,

      wireframe:
        options.wireframe ??
        false
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Name                                                                     */
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
  /* Color                                                                    */
  /* ------------------------------------------------------------------------ */

  setColor(
    color: Color
  ): void {
    this.color =
      this.cloneColor(
        color
      );

    this.markDirty();
  }

  getColor():
    Color {
    return this.cloneColor(
      this.color
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Opacity                                                                  */
  /* ------------------------------------------------------------------------ */

  setOpacity(
    opacity: number
  ): void {
    this.opacity =
      this.clamp(
        opacity,
        0,
        1
      );

    if (
      this.opacity < 1
    ) {
      this.renderState
        .transparent =
        true;
    }

    this.markDirty();
  }

  getOpacity(): number {
    return this.opacity;
  }

  /* ------------------------------------------------------------------------ */
  /* Emissive                                                                 */
  /* ------------------------------------------------------------------------ */

  setEmissive(
    color: Color
  ): void {
    this.emissive =
      this.cloneColor(
        color
      );

    this.markDirty();
  }

  getEmissive():
    Color {
    return this.cloneColor(
      this.emissive
    );
  }

  setEmissiveIntensity(
    intensity: number
  ): void {
    this.emissiveIntensity =
      Math.max(
        0,
        intensity
      );

    this.markDirty();
  }

  getEmissiveIntensity():
    number {
    return this.emissiveIntensity;
  }

  /* ------------------------------------------------------------------------ */
  /* PBR                                                                       */
  /* ------------------------------------------------------------------------ */

  setMetallic(
    metallic: number
  ): void {
    this.metallic =
      this.clamp(
        metallic,
        0,
        1
      );

    this.markDirty();
  }

  getMetallic(): number {
    return this.metallic;
  }

  setRoughness(
    roughness: number
  ): void {
    this.roughness =
      this.clamp(
        roughness,
        0,
        1
      );

    this.markDirty();
  }

  getRoughness(): number {
    return this.roughness;
  }

  /* ------------------------------------------------------------------------ */
  /* Textures                                                                 */
  /* ------------------------------------------------------------------------ */

  setTexture(
    texture:
      Texture | null
  ): void {
    this.texture =
      texture;

    this.markDirty();
  }

  getTexture():
    Texture | null {
    return this.texture;
  }

  setNormalMap(
    texture:
      Texture | null
  ): void {
    this.normalMap =
      texture;

    this.markDirty();
  }

  getNormalMap():
    Texture | null {
    return this.normalMap;
  }

  setRoughnessMap(
    texture:
      Texture | null
  ): void {
    this.roughnessMap =
      texture;

    this.markDirty();
  }

  getRoughnessMap():
    Texture | null {
    return this.roughnessMap;
  }

  setEmissiveMap(
    texture:
      Texture | null
  ): void {
    this.emissiveMap =
      texture;

    this.markDirty();
  }

  getEmissiveMap():
    Texture | null {
    return this.emissiveMap;
  }

  /* ------------------------------------------------------------------------ */
  /* Shader                                                                   */
  /* ------------------------------------------------------------------------ */

  setShader(
    shader:
      Shader | null
  ): void {
    this.shader =
      shader;

    this.markDirty();
  }

  getShader():
    Shader | null {
    return this.shader;
  }

  /* ------------------------------------------------------------------------ */
  /* Uniforms                                                                 */
  /* ------------------------------------------------------------------------ */

  setUniform(
    name: string,
    value: UniformValue
  ): void {
    this.uniforms[
      name
    ] = value;

    this.markDirty();
  }

  getUniform(
    name: string
  ):
    UniformValue |
    undefined {
    return this.uniforms[
      name
    ];
  }

  hasUniform(
    name: string
  ): boolean {
    return (
      name in
      this.uniforms
    );
  }

  removeUniform(
    name: string
  ): boolean {
    if (
      !this.hasUniform(
        name
      )
    ) {
      return false;
    }

    delete this.uniforms[
      name
    ];

    this.markDirty();

    return true;
  }

  getUniforms():
    Record<
      string,
      UniformValue
    > {
    return {
      ...this.uniforms
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Blend                                                                     */
  /* ------------------------------------------------------------------------ */

  setBlendMode(
    mode: BlendMode
  ): void {
    this.renderState
      .blendMode =
      mode;

    this.markDirty();
  }

  getBlendMode():
    BlendMode {
    return this.renderState
      .blendMode;
  }

  /* ------------------------------------------------------------------------ */
  /* Culling                                                                  */
  /* ------------------------------------------------------------------------ */

  setCullMode(
    mode: CullMode
  ): void {
    this.renderState
      .cullMode =
      mode;

    this.markDirty();
  }

  getCullMode():
    CullMode {
    return this.renderState
      .cullMode;
  }

  /* ------------------------------------------------------------------------ */
  /* Depth                                                                     */
  /* ------------------------------------------------------------------------ */

  setDepthMode(
    mode: DepthMode
  ): void {
    this.renderState
      .depthMode =
      mode;

    this.markDirty();
  }

  getDepthMode():
    DepthMode {
    return this.renderState
      .depthMode;
  }

  setDepthTest(
    enabled: boolean
  ): void {
    this.renderState
      .depthTest =
      enabled;

    this.markDirty();
  }

  isDepthTestEnabled():
    boolean {
    return this.renderState
      .depthTest;
  }

  setDepthWrite(
    enabled: boolean
  ): void {
    this.renderState
      .depthWrite =
      enabled;

    this.markDirty();
  }

  isDepthWriteEnabled():
    boolean {
    return this.renderState
      .depthWrite;
  }

  /* ------------------------------------------------------------------------ */
  /* Transparency                                                             */
  /* ------------------------------------------------------------------------ */

  setTransparent(
    transparent: boolean
  ): void {
    this.renderState
      .transparent =
      transparent;

    this.markDirty();
  }

  isTransparent():
    boolean {
    return this.renderState
      .transparent;
  }

  /* ------------------------------------------------------------------------ */
  /* Wireframe                                                                */
  /* ------------------------------------------------------------------------ */

  setWireframe(
    enabled: boolean
  ): void {
    this.renderState
      .wireframe =
      enabled;

    this.markDirty();
  }

  isWireframe():
    boolean {
    return this.renderState
      .wireframe;
  }

  /* ------------------------------------------------------------------------ */
  /* Render state                                                              */
  /* ------------------------------------------------------------------------ */

  getRenderState():
    MaterialRenderState {
    return {
      ...this.renderState
    };
  }

  setRenderState(
    state:
      Partial<MaterialRenderState>
  ): void {
    this.renderState = {
      ...this.renderState,
      ...state
    };

    this.markDirty();
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  isDirty(): boolean {
    return this.dirty;
  }

  markDirty(): void {
    this.dirty =
      true;
  }

  markClean(): void {
    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Serialization                                                             */
  /* ------------------------------------------------------------------------ */

  toJSON():
    MaterialState {
    return {
      id:
        this.id,

      name:
        this.name,

      color:
        this.getColor(),

      opacity:
        this.opacity,

      emissive:
        this.getEmissive(),

      emissiveIntensity:
        this.emissiveIntensity,

      metallic:
        this.metallic,

      roughness:
        this.roughness,

      texture:
        this.texture,

      normalMap:
        this.normalMap,

      roughnessMap:
        this.roughnessMap,

      emissiveMap:
        this.emissiveMap,

      shader:
        this.shader,

      uniforms:
        this.getUniforms(),

      renderState:
        this.getRenderState()
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Clone                                                                    */
  /* ------------------------------------------------------------------------ */

  clone(
    options:
      Partial<MaterialOptions> = {}
  ): Material {
    return new Material({
      id:
        options.id,

      name:
        options.name ??
        this.name,

      color:
        options.color ??
        this.getColor(),

      opacity:
        options.opacity ??
        this.opacity,

      emissive:
        options.emissive ??
        this.getEmissive(),

      emissiveIntensity:
        options.emissiveIntensity ??
        this.emissiveIntensity,

      metallic:
        options.metallic ??
        this.metallic,

      roughness:
        options.roughness ??
        this.roughness,

      texture:
        options.texture ??
        this.texture,

      normalMap:
        options.normalMap ??
        this.normalMap,

      roughnessMap:
        options.roughnessMap ??
        this.roughnessMap,

      emissiveMap:
        options.emissiveMap ??
        this.emissiveMap,

      shader:
        options.shader ??
        this.shader,

      uniforms:
        options.uniforms ??
        this.getUniforms(),

      ...this.renderState,

      ...options
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    this.texture?.dispose?.();

    this.normalMap?.dispose?.();

    this.roughnessMap?.dispose?.();

    this.emissiveMap?.dispose?.();

    this.texture =
      null;

    this.normalMap =
      null;

    this.roughnessMap =
      null;

    this.emissiveMap =
      null;

    this.shader =
      null;

    this.uniforms = {};
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private clamp(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }

  private cloneColor(
    color: Color
  ): Color {
    return {
      r:
        color.r,

      g:
        color.g,

      b:
        color.b,

      a:
        color.a ??
        1
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Presets                                                                    */
/* -------------------------------------------------------------------------- */

export function createBasicMaterial(
  options:
    MaterialOptions = {}
): Material {
  return new Material({
    roughness:
      0.8,

    metallic:
      0,

    ...options
  });
}

export function createEmissiveMaterial(
  options:
    MaterialOptions = {}
): Material {
  return new Material({
    emissive:
      options.color ??
      DEFAULT_COLOR,

    emissiveIntensity:
      options.emissiveIntensity ??
      1,

    ...options
  });
}

export function createTransparentMaterial(
  options:
    MaterialOptions = {}
): Material {
  return new Material({
    transparent:
      true,

    depthWrite:
      false,

    opacity:
      options.opacity ??
      0.5,

    ...options
  });
}

export function createWireframeMaterial(
  options:
    MaterialOptions = {}
): Material {
  return new Material({
    wireframe:
      true,

    ...options
  });
}

export default Material;
