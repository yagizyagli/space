/**
 * Space
 * Rendering Post Processing
 *
 * Backend-agnostic post-processing framework.
 *
 * Supports:
 * - Effect chains
 * - Fullscreen passes
 * - Exposure
 * - Tone mapping
 * - Bloom metadata
 * - FXAA / TAA configuration
 * - Color grading
 * - Vignette
 * - Chromatic aberration
 * - Custom effects
 */

import type {
  RenderContext,
  TextureFormat
} from "../types/rendering";

import {
  RenderTarget,
  createRenderTarget
} from "./render-targets";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PostProcessEffectType =
  | "copy"
  | "exposure"
  | "tone-mapping"
  | "bloom"
  | "fxaa"
  | "taa"
  | "ssao"
  | "color-grading"
  | "vignette"
  | "chromatic-aberration"
  | "film-grain"
  | "sharpen"
  | "blur"
  | "custom";

export type ToneMappingOperator =
  | "none"
  | "reinhard"
  | "reinhard-jodie"
  | "aces"
  | "agx"
  | "filmic"
  | "uncharted2";

export interface PostProcessInput {
  texture:
    RenderTarget;

  width:
    number;

  height:
    number;
}

export interface PostProcessOutput {
  target:
    RenderTarget;

  width:
    number;

  height:
    number;
}

export interface PostProcessEffectOptions {
  id?: string;

  name?: string;

  enabled?:
    boolean;

  type:
    PostProcessEffectType;

  intensity?:
    number;

  threshold?:
    number;

  radius?:
    number;

  exposure?:
    number;

  operator?:
    ToneMappingOperator;

  quality?:
    "low" |
    "medium" |
    "high" |
    "ultra";

  parameters?:
    Record<
      string,
      number |
      boolean |
      string |
      number[]
    >;
}

export interface PostProcessEffectState {
  id:
    string;

  name:
    string;

  type:
    PostProcessEffectType;

  enabled:
    boolean;

  intensity:
    number;

  parameters:
    Record<
      string,
      number |
      boolean |
      string |
      number[]
    >;
}

export interface PostProcessOptions {
  width:
    number;

  height:
    number;

  format?:
    TextureFormat;

  hdr?:
    boolean;

  effects?:
    PostProcessEffectOptions[];
}

/* -------------------------------------------------------------------------- */
/* Effect                                                                     */
/* -------------------------------------------------------------------------- */

export class PostProcessEffect {

  readonly id:
    string;

  readonly type:
    PostProcessEffectType;

  private name:
    string;

  private enabled:
    boolean;

  private intensity:
    number;

  private threshold:
    number;

  private radius:
    number;

  private exposure:
    number;

  private operator:
    ToneMappingOperator;

  private quality:
    "low" |
    "medium" |
    "high" |
    "ultra";

  private parameters:
    Record<
      string,
      number |
      boolean |
      string |
      number[]
    >;

  private disposed =
    false;

  constructor(
    options:
      PostProcessEffectOptions
  ) {
    this.id =
      options.id ??
      `effect-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.type =
      options.type;

    this.name =
      options.name ??
      this.type;

    this.enabled =
      options.enabled ??
      true;

    this.intensity =
      options.intensity ??
      1;

    this.threshold =
      options.threshold ??
      1;

    this.radius =
      options.radius ??
      1;

    this.exposure =
      options.exposure ??
      0;

    this.operator =
      options.operator ??
      "aces";

    this.quality =
      options.quality ??
      "medium";

    this.parameters = {
      ...(options.parameters ??
        {})
    };
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  isEnabled():
    boolean {
    return this.enabled;
  }

  setEnabled(
    enabled:
      boolean
  ): void {
    this.enabled =
      enabled;
  }

  getIntensity():
    number {
    return this.intensity;
  }

  setIntensity(
    value:
      number
  ): void {
    this.intensity =
      value;
  }

  getParameter(
    name:
      string
  ):
    number |
    boolean |
    string |
    number[] |
    undefined {
    return this.parameters[
      name
    ];
  }

  setParameter(
    name:
      string,
    value:
      number |
      boolean |
      string |
      number[]
  ): void {
    this.parameters[
      name
    ] = value;
  }

  removeParameter(
    name:
      string
  ): boolean {
    if (
      !(name in
        this.parameters)
    ) {
      return false;
    }

    delete this.parameters[
      name
    ];

    return true;
  }

  getThreshold():
    number {
    return this.threshold;
  }

  setThreshold(
    value:
      number
  ): void {
    this.threshold =
      Math.max(
        0,
        value
      );
  }

  getRadius():
    number {
    return this.radius;
  }

  setRadius(
    value:
      number
  ): void {
    this.radius =
      Math.max(
        0,
        value
      );
  }

  getExposure():
    number {
    return this.exposure;
  }

  setExposure(
    value:
      number
  ): void {
    this.exposure =
      value;
  }

  getOperator():
    ToneMappingOperator {
    return this.operator;
  }

  setOperator(
    operator:
      ToneMappingOperator
  ): void {
    this.operator =
      operator;
  }

  getQuality():
    string {
    return this.quality;
  }

  setQuality(
    quality:
      "low" |
      "medium" |
      "high" |
      "ultra"
  ): void {
    this.quality =
      quality;
  }

  /* ------------------------------------------------------------------------ */
  /* Processing                                                               */
  /* ------------------------------------------------------------------------ */

  process(
    context:
      RenderContext,
    input:
      PostProcessInput,
    output:
      PostProcessOutput
  ): void {
    if (
      this.disposed ||
      !this.enabled
    ) {
      return;
    }

    output.target.bind(
      context
    );

    context.adapter
      .executePostProcessEffect({
        type:
          this.type,

        input:
          input.texture
            .getColorTexture(),

        output:
          output.target
            .getColorTexture(),

        intensity:
          this.intensity,

        threshold:
          this.threshold,

        radius:
          this.radius,

        exposure:
          this.exposure,

        operator:
          this.operator,

        quality:
          this.quality,

        parameters:
          this.parameters
      });
  }

  /* ------------------------------------------------------------------------ */
  /* Serialization                                                            */
  /* ------------------------------------------------------------------------ */

  getState():
    PostProcessEffectState {
    return {
      id:
        this.id,

      name:
        this.name,

      type:
        this.type,

      enabled:
        this.enabled,

      intensity:
        this.intensity,

      parameters: {
        ...this.parameters
      }
    };
  }

  dispose():
    void {
    this.parameters =
      {};

    this.disposed =
      true;
  }
}

/* -------------------------------------------------------------------------- */
/* Post Process Pipeline                                                      */
/* -------------------------------------------------------------------------- */

export class PostProcessPipeline {

  private effects:
    PostProcessEffect[] =
      [];

  private width:
    number;

  private height:
    number;

  private hdr:
    boolean;

  private format:
    TextureFormat;

  private ping:
    RenderTarget;

  private pong:
    RenderTarget;

  private disposed =
    false;

  constructor(
    options:
      PostProcessOptions
  ) {
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

    this.hdr =
      options.hdr ??
      false;

    this.format =
      options.format ??
      (
        this.hdr
          ? "rgba16f"
          : "rgba8"
      );

    this.ping =
      this.createInternalTarget(
        "ping"
      );

    this.pong =
      this.createInternalTarget(
        "pong"
      );

    for (
      const effect of
      options.effects ??
      []
    ) {
      this.addEffect(
        effect
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Effects                                                                  */
  /* ------------------------------------------------------------------------ */

  addEffect(
    effect:
      PostProcessEffect |
      PostProcessEffectOptions
  ):
    PostProcessEffect {
    const instance =
      effect instanceof
      PostProcessEffect
        ? effect
        : new PostProcessEffect(
            effect
          );

    this.effects.push(
      instance
    );

    return instance;
  }

  removeEffect(
    id:
      string
  ): boolean {
    const index =
      this.effects.findIndex(
        effect =>
          effect.id === id
      );

    if (
      index === -1
    ) {
      return false;
    }

    const [
      effect
    ] =
      this.effects.splice(
        index,
        1
      );

    effect?.dispose();

    return true;
  }

  getEffect(
    id:
      string
  ):
    PostProcessEffect |
    undefined {
    return this.effects.find(
      effect =>
        effect.id === id
    );
  }

  getEffects():
    PostProcessEffect[] {
    return [
      ...this.effects
    ];
  }

  clearEffects():
    void {
    for (
      const effect of
      this.effects
    ) {
      effect.dispose();
    }

    this.effects =
      [];
  }

  /* ------------------------------------------------------------------------ */
  /* Processing                                                               */
  /* ------------------------------------------------------------------------ */

  process(
    context:
      RenderContext,
    input:
      RenderTarget,
    output:
      RenderTarget
  ): void {
    this.assertActive();

    const enabledEffects =
      this.effects.filter(
        effect =>
          effect.isEnabled()
      );

    if (
      enabledEffects.length ===
      0
    ) {
      this.copy(
        context,
        input,
        output
      );

      return;
    }

    let current =
      input;

    let target =
      this.ping;

    for (
      let i = 0;
      i <
      enabledEffects.length;
      i++
    ) {
      const effect =
        enabledEffects[i];

      if (
        !effect
      ) {
        continue;
      }

      const isLast =
        i ===
        enabledEffects.length - 1;

      const destination =
        isLast
          ? output
          : target;

      effect.process(
        context,
        {
          texture:
            current,

          width:
            this.width,

          height:
            this.height
        },
        {
          target:
            destination,

          width:
            this.width,

          height:
            this.height
        }
      );

      if (
        !isLast
      ) {
        current =
          destination;

        target =
          target ===
          this.ping
            ? this.pong
            : this.ping;
      }
    }
  }

  private copy(
    context:
      RenderContext,
    input:
      RenderTarget,
    output:
      RenderTarget
  ): void {
    output.bind(
      context
    );

    context.adapter
      .copyTexture(
        input.getColorTexture(),
        output.getColorTexture()
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Resize                                                                   */
  /* ------------------------------------------------------------------------ */

  resize(
    width:
      number,
    height:
      number
  ): void {
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

    this.ping.resize(
      this.width,
      this.height
    );

    this.pong.resize(
      this.width,
      this.height
    );
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
  /* Presets                                                                  */
  /* ------------------------------------------------------------------------ */

  enableBloom(
    options:
      Partial<
        PostProcessEffectOptions
      > = {}
  ):
    PostProcessEffect {
    return this.addEffect({
      ...options,

      type:
        "bloom"
    });
  }

  enableToneMapping(
    operator:
      ToneMappingOperator =
        "aces"
  ):
    PostProcessEffect {
    return this.addEffect({
      type:
        "tone-mapping",

      operator
    });
  }

  enableFXAA():
    PostProcessEffect {
    return this.addEffect({
      type:
        "fxaa"
    });
  }

  enableTAA():
    PostProcessEffect {
    return this.addEffect({
      type:
        "taa"
    });
  }

  enableVignette(
    intensity =
      0.5
  ):
    PostProcessEffect {
    return this.addEffect({
      type:
        "vignette",

      intensity
    });
  }

  enableChromaticAberration(
    intensity =
      0.1
  ):
    PostProcessEffect {
    return this.addEffect({
      type:
        "chromatic-aberration",

      intensity
    });
  }

  enableFilmGrain(
    intensity =
      0.05
  ):
    PostProcessEffect {
    return this.addEffect({
      type:
        "film-grain",

      intensity
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Internal Targets                                                         */
  /* ------------------------------------------------------------------------ */

  private createInternalTarget(
    suffix:
      string
  ):
    RenderTarget {
    return createRenderTarget({
      id:
        `post-process-${suffix}`,

      name:
        `Post Process ${suffix}`,

      width:
        this.width,

      height:
        this.height,

      colorFormat:
        this.format,

      hdr:
        this.hdr,

      depth:
        false,

      stencil:
        false,

      samples:
        1
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose(
    context?:
      RenderContext
  ):
    void {
    if (
      this.disposed
    ) {
      return;
    }

    this.clearEffects();

    this.ping.dispose(
      context
    );

    this.pong.dispose(
      context
    );

    this.disposed =
      true;
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        "PostProcessPipeline has been disposed."
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Effect Factories                                                           */
/* -------------------------------------------------------------------------- */

export function createPostProcessEffect(
  options:
    PostProcessEffectOptions
):
  PostProcessEffect {
  return new PostProcessEffect(
    options
  );
}

export function createPostProcessPipeline(
  options:
    PostProcessOptions
):
  PostProcessPipeline {
  return new PostProcessPipeline(
    options
  );
}

/* -------------------------------------------------------------------------- */
/* Standard Preset                                                            */
/* -------------------------------------------------------------------------- */

export function createStandardPostProcessPipeline(
  width:
    number,
  height:
    number
):
  PostProcessPipeline {
  return new PostProcessPipeline({
    width,

    height,

    hdr:
      true,

    effects: [
      {
        type:
          "exposure",

        exposure:
          0
      },

      {
        type:
          "tone-mapping",

        operator:
          "aces"
      },

      {
        type:
          "bloom",

        threshold:
          1,

        radius:
          4,

        intensity:
          0.35
      },

      {
        type:
          "fxaa",

        enabled:
          true
      }
    ]
  });
}

export default PostProcessPipeline;
