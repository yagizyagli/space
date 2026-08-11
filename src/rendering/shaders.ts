/**
 * Space
 * Rendering Shaders
 *
 * Backend-agnostic shader abstraction.
 *
 * Responsible for:
 * - Vertex / fragment shader sources
 * - Shader programs
 * - Uniform definitions
 * - Shader compilation lifecycle
 * - Program caching metadata
 * - Runtime uniform values
 *
 * Actual GPU compilation is delegated to the rendering adapter.
 */

import type {
  RenderContext,
  Shader,
  ShaderStage,
  UniformType,
  UniformValue,
  GPUShaderHandle
} from "../types/rendering";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ShaderSource {
  vertex:
    string;

  fragment:
    string;

  compute?:
    string;
}

export interface ShaderUniform {
  name:
    string;

  type:
    UniformType;

  value?:
    UniformValue;

  location?:
    number | string | null;
}

export interface ShaderAttribute {
  name:
    string;

  location?:
    number | string | null;

  type?:
    string;
}

export interface ShaderOptions {
  id?: string;

  name?: string;

  source:
    ShaderSource;

  uniforms?:
    ShaderUniform[];

  attributes?:
    ShaderAttribute[];

  defines?:
    Record<
      string,
      string | number | boolean
    >;

  label?:
    string;
}

export interface ShaderState {
  id:
    string;

  name:
    string;

  compiled:
    boolean;

  linked:
    boolean;

  dirty:
    boolean;

  uniformCount:
    number;

  attributeCount:
    number;
}

/* -------------------------------------------------------------------------- */
/* Shader                                                                     */
/* -------------------------------------------------------------------------- */

export class RenderShader
  implements Shader {

  readonly id:
    string;

  private name:
    string;

  private source:
    ShaderSource;

  private uniforms =
    new Map<
      string,
      ShaderUniform
    >();

  private attributes =
    new Map<
      string,
      ShaderAttribute
    >();

  private defines:
    Record<
      string,
      string | number | boolean
    >;

  private label:
    string;

  private handle:
    GPUShaderHandle | null =
      null;

  private compiled =
    false;

  private linked =
    false;

  private dirty =
    true;

  private disposed =
    false;

  constructor(
    options:
      ShaderOptions
  ) {
    this.id =
      options.id ??
      `shader-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.source = {
      vertex:
        options.source.vertex,

      fragment:
        options.source.fragment,

      compute:
        options.source.compute
    };

    this.defines = {
      ...(options.defines ??
        {})
    };

    this.label =
      options.label ??
      this.id;

    for (
      const uniform of
      options.uniforms ??
      []
    ) {
      this.uniforms.set(
        uniform.name,
        {
          ...uniform
        }
      );
    }

    for (
      const attribute of
      options.attributes ??
      []
    ) {
      this.attributes.set(
        attribute.name,
        {
          ...attribute
        }
      );
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
      this.compiled &&
      this.linked &&
      !this.dirty
    ) {
      return;
    }

    this.handle =
      context.adapter.createShader({
        vertex:
          this.getProcessedSource(
            "vertex"
          ),

        fragment:
          this.getProcessedSource(
            "fragment"
          ),

        compute:
          this.getProcessedSource(
            "compute"
          ),

        label:
          this.label
      });

    this.compiled =
      true;

    this.linked =
      true;

    this.dirty =
      false;

    this.resolveLocations(
      context
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Source                                                                   */
  /* ------------------------------------------------------------------------ */

  setSource(
    stage:
      ShaderStage,
    source:
      string
  ): void {
    this.assertActive();

    if (
      stage ===
      "vertex"
    ) {
      this.source.vertex =
        source;
    }

    if (
      stage ===
      "fragment"
    ) {
      this.source.fragment =
        source;
    }

    if (
      stage ===
      "compute"
    ) {
      this.source.compute =
        source;
    }

    this.markDirty();
  }

  getSource(
    stage:
      ShaderStage
  ):
    string | undefined {
    if (
      stage ===
      "vertex"
    ) {
      return this.source
        .vertex;
    }

    if (
      stage ===
      "fragment"
    ) {
      return this.source
        .fragment;
    }

    return this.source
      .compute;
  }

  getSources():
    ShaderSource {
    return {
      ...this.source
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Defines                                                                  */
  /* ------------------------------------------------------------------------ */

  setDefine(
    name:
      string,
    value:
      string | number | boolean
  ): void {
    this.assertActive();

    this.defines[
      name
    ] = value;

    this.markDirty();
  }

  removeDefine(
    name:
      string
  ): boolean {
    if (
      !(name in this.defines)
    ) {
      return false;
    }

    delete this.defines[
      name
    ];

    this.markDirty();

    return true;
  }

  hasDefine(
    name:
      string
  ): boolean {
    return (
      name in
      this.defines
    );
  }

  getDefines():
    Record<
      string,
      string | number | boolean
    > {
    return {
      ...this.defines
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Uniforms                                                                 */
  /* ------------------------------------------------------------------------ */

  addUniform(
    uniform:
      ShaderUniform
  ): void {
    this.assertActive();

    if (
      this.uniforms.has(
        uniform.name
      )
    ) {
      throw new Error(
        `Shader uniform "${uniform.name}" already exists.`
      );
    }

    this.uniforms.set(
      uniform.name,
      {
        ...uniform
      }
    );
  }

  removeUniform(
    name:
      string
  ): boolean {
    return this.uniforms.delete(
      name
    );
  }

  hasUniform(
    name:
      string
  ): boolean {
    return this.uniforms.has(
      name
    );
  }

  getUniform(
    name:
      string
  ):
    ShaderUniform | undefined {
    return this.uniforms.get(
      name
    );
  }

  getUniforms():
    ShaderUniform[] {
    return Array.from(
      this.uniforms.values()
    ).map(
      uniform => ({
        ...uniform
      })
    );
  }

  setUniform(
    name:
      string,
    value:
      UniformValue
  ): void {
    this.assertActive();

    const uniform =
      this.uniforms.get(
        name
      );

    if (
      uniform
    ) {
      uniform.value =
        value;

      return;
    }

    this.uniforms.set(
      name,
      {
        name,

        type:
          this.inferUniformType(
            value
          ),

        value
      }
    );
  }

  getUniformValue(
    name:
      string
  ):
    UniformValue |
    undefined {
    return this.uniforms
      .get(name)
      ?.value;
  }

  applyUniforms(
    context:
      RenderContext
  ): void {
    this.assertActive();

    if (
      !this.handle
    ) {
      return;
    }

    for (
      const uniform of
      this.uniforms.values()
    ) {
      if (
        uniform.value ===
        undefined
      ) {
        continue;
      }

      context.adapter.setShaderUniform(
        this.handle,
        uniform.name,
        uniform.value
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Attributes                                                               */
  /* ------------------------------------------------------------------------ */

  addAttribute(
    attribute:
      ShaderAttribute
  ): void {
    this.assertActive();

    this.attributes.set(
      attribute.name,
      {
        ...attribute
      }
    );
  }

  getAttribute(
    name:
      string
  ):
    ShaderAttribute |
    undefined {
    return this.attributes.get(
      name
    );
  }

  getAttributes():
    ShaderAttribute[] {
    return Array.from(
      this.attributes.values()
    ).map(
      attribute => ({
        ...attribute
      })
    );
  }

  /* ------------------------------------------------------------------------ */
  /* GPU Handle                                                               */
  /* ------------------------------------------------------------------------ */

  getHandle():
    GPUShaderHandle | null {
    return this.handle;
  }

  isCompiled():
    boolean {
    return this.compiled;
  }

  isLinked():
    boolean {
    return this.linked;
  }

  isDirty():
    boolean {
    return this.dirty;
  }

  markDirty():
    void {
    this.dirty =
      true;

    this.compiled =
      false;

    this.linked =
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
      !this.handle ||
      this.dirty
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

    context.adapter.bindShader(
      this.handle
    );

    this.applyUniforms(
      context
    );
  }

  unbind(
    context:
      RenderContext
  ): void {
    context.adapter
      .unbindShader?.();
  }

  /* ------------------------------------------------------------------------ */
  /* Location resolution                                                      */
  /* ------------------------------------------------------------------------ */

  private resolveLocations(
    context:
      RenderContext
  ): void {
    if (
      !this.handle
    ) {
      return;
    }

    for (
      const uniform of
      this.uniforms.values()
    ) {
      uniform.location =
        context.adapter
          .getShaderUniformLocation(
            this.handle,
            uniform.name
          );
    }

    for (
      const attribute of
      this.attributes.values()
    ) {
      attribute.location =
        context.adapter
          .getShaderAttributeLocation(
            this.handle,
            attribute.name
          );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Processed source                                                         */
  /* ------------------------------------------------------------------------ */

  private getProcessedSource(
    stage:
      ShaderStage
  ):
    string | undefined {
    const source =
      this.getSource(
        stage
      );

    if (
      !source
    ) {
      return undefined;
    }

    const defineSource =
      Object.entries(
        this.defines
      )
        .map(
          (
            [
              name,
              value
            ]
          ) =>
            `#define ${name} ${this.formatDefineValue(value)}`
        )
        .join(
          "\n"
        );

    if (
      !defineSource
    ) {
      return source;
    }

    return (
      `${defineSource}\n` +
      source
    );
  }

  private formatDefineValue(
    value:
      string | number | boolean
  ): string {
    if (
      typeof value ===
      "boolean"
    ) {
      return value
        ? "1"
        : "0";
    }

    return String(
      value
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Type inference                                                           */
  /* ------------------------------------------------------------------------ */

  private inferUniformType(
    value:
      UniformValue
  ):
    UniformType {
    if (
      typeof value ===
      "number"
    ) {
      return "float";
    }

    if (
      typeof value ===
      "boolean"
    ) {
      return "bool";
    }

    if (
      Array.isArray(
        value
      )
    ) {
      switch (
        value.length
      ) {
        case 2:
          return "vec2";

        case 3:
          return "vec3";

        case 4:
          return "vec4";

        case 9:
          return "mat3";

        case 16:
          return "mat4";

        default:
          return "float";
      }
    }

    return "float";
  }

  /* ------------------------------------------------------------------------ */
  /* Serialization                                                             */
  /* ------------------------------------------------------------------------ */

  toJSON():
    ShaderState {
    return {
      id:
        this.id,

      name:
        this.name,

      compiled:
        this.compiled,

      linked:
        this.linked,

      dirty:
        this.dirty,

      uniformCount:
        this.uniforms.size,

      attributeCount:
        this.attributes.size
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
        .destroyShader(
          this.handle
        );
    }

    this.handle =
      null;

    this.uniforms.clear();

    this.attributes.clear();

    this.compiled =
      false;

    this.linked =
      false;

    this.disposed =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `RenderShader "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Shader Library                                                             */
/* -------------------------------------------------------------------------- */

export class ShaderLibrary {
  private readonly shaders =
    new Map<
      string,
      RenderShader
    >();

  register(
    shader:
      RenderShader
  ): void {
    if (
      this.shaders.has(
        shader.id
      )
    ) {
      throw new Error(
        `Shader "${shader.id}" already exists.`
      );
    }

    this.shaders.set(
      shader.id,
      shader
    );
  }

  set(
    shader:
      RenderShader
  ): void {
    this.shaders.set(
      shader.id,
      shader
    );
  }

  get(
    id:
      string
  ):
    RenderShader | undefined {
    return this.shaders.get(
      id
    );
  }

  has(
    id:
      string
  ): boolean {
    return this.shaders.has(
      id
    );
  }

  remove(
    id:
      string,
    context?:
      RenderContext
  ): boolean {
    const shader =
      this.shaders.get(
        id
      );

    if (!shader) {
      return false;
    }

    shader.dispose(
      context
    );

    return this.shaders.delete(
      id
    );
  }

  getAll():
    RenderShader[] {
    return Array.from(
      this.shaders.values()
    );
  }

  clear(
    context?:
      RenderContext
  ): void {
    for (
      const shader of
      this.shaders.values()
    ) {
      shader.dispose(
        context
      );
    }

    this.shaders.clear();
  }

  get size():
    number {
    return this.shaders.size;
  }
}

/* -------------------------------------------------------------------------- */
/* Factories                                                                  */
/* -------------------------------------------------------------------------- */

export function createShader(
  options:
    ShaderOptions
): RenderShader {
  return new RenderShader(
    options
  );
}

export function createShaderLibrary():
  ShaderLibrary {
  return new ShaderLibrary();
}

export default RenderShader;
