/**
 * Space
 * Rendering Pipeline
 *
 * Coordinates the complete rendering process.
 *
 * Pipeline:
 *
 *   prepare
 *      ↓
 *   update
 *      ↓
 *   culling
 *      ↓
 *   opaque
 *      ↓
 *   transparent
 *      ↓
 *   overlays
 *      ↓
 *   effects
 *      ↓
 *   post-process
 *      ↓
 *   present
 *
 * The pipeline is intentionally modular so additional
 * rendering stages can be added without changing the
 * renderer itself.
 */

import type {
  RenderFrame,
  RenderContext,
  RenderPass,
  RenderPassContext,
  RenderPipelineStats
} from "../types/rendering";

import type {
  RenderScene
} from "./scene";

import type {
  RenderCamera
} from "./camera";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PipelineStage =
  | "prepare"
  | "update"
  | "culling"
  | "opaque"
  | "transparent"
  | "overlays"
  | "effects"
  | "post-process"
  | "present";

export interface PipelineOptions {
  autoPrepare?: boolean;

  enableCulling?: boolean;

  enableEffects?: boolean;

  enablePostProcess?: boolean;

  stopOnError?: boolean;
}

export interface PipelineStageResult {
  stage:
    PipelineStage;

  duration:
    number;

  drawCalls:
    number;

  triangles:
    number;

  objects:
    number;
}

export interface PipelineExecutionContext
  extends RenderPassContext {
  frame:
    RenderFrame;

  scene:
    RenderScene;

  camera:
    RenderCamera;

  pipeline:
    RenderPipeline;
}

/* -------------------------------------------------------------------------- */
/* Render Pipeline                                                            */
/* -------------------------------------------------------------------------- */

export class RenderPipeline {
  private readonly passes:
    RenderPass[] = [];

  private readonly options:
    Required<PipelineOptions>;

  private readonly stageResults:
    PipelineStageResult[] = [];

  private running =
    false;

  private disposed =
    false;

  private currentStage:
    PipelineStage | null =
      null;

  private stats:
    RenderPipelineStats = {
      passes: 0,

      stages: 0,

      duration: 0,

      drawCalls: 0,

      triangles: 0,

      objects: 0
    };

  constructor(
    options: PipelineOptions = {}
  ) {
    this.options = {
      autoPrepare:
        options.autoPrepare ??
        true,

      enableCulling:
        options.enableCulling ??
        true,

      enableEffects:
        options.enableEffects ??
        true,

      enablePostProcess:
        options.enablePostProcess ??
        true,

      stopOnError:
        options.stopOnError ??
        true
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Pass management                                                          */
  /* ------------------------------------------------------------------------ */

  addPass(
    pass: RenderPass
  ): this {
    this.assertActive();

    if (
      this.passes.some(
        existing =>
          existing.id ===
          pass.id
      )
    ) {
      throw new Error(
        `Render pass "${pass.id}" already exists.`
      );
    }

    this.passes.push(
      pass
    );

    this.sortPasses();

    return this;
  }

  removePass(
    id: string
  ): boolean {
    this.assertActive();

    const index =
      this.passes.findIndex(
        pass =>
          pass.id === id
      );

    if (
      index === -1
    ) {
      return false;
    }

    const [
      pass
    ] =
      this.passes.splice(
        index,
        1
      );

    pass.dispose?.();

    return true;
  }

  getPass(
    id: string
  ):
    RenderPass | undefined {
    return this.passes.find(
      pass =>
        pass.id === id
    );
  }

  getPasses():
    RenderPass[] {
    return [
      ...this.passes
    ];
  }

  clearPasses(): void {
    this.assertActive();

    for (
      const pass of
      this.passes
    ) {
      pass.dispose?.();
    }

    this.passes.length =
      0;
  }

  /* ------------------------------------------------------------------------ */
  /* Ordering                                                                 */
  /* ------------------------------------------------------------------------ */

  private sortPasses(): void {
    this.passes.sort(
      (
        a,
        b
      ) =>
        (
          a.order ?? 0
        ) -
        (
          b.order ?? 0
        )
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  prepare(
    context: RenderContext
  ): void {
    this.assertActive();

    if (
      !this.options.autoPrepare
    ) {
      return;
    }

    for (
      const pass of
      this.passes
    ) {
      pass.prepare?.(
        context
      );
    }
  }

  resize(
    width: number,
    height: number
  ): void {
    this.assertActive();

    for (
      const pass of
      this.passes
    ) {
      pass.resize?.(
        width,
        height
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Execute                                                                  */
  /* ------------------------------------------------------------------------ */

  execute(
    frame: RenderFrame,
    context: RenderContext,
    scene: RenderScene,
    camera: RenderCamera
  ): RenderPipelineStats {
    this.assertActive();

    if (
      this.running
    ) {
      return this.getStats();
    }

    this.running =
      true;

    this.stageResults.length =
      0;

    const start =
      performance.now();

    const pipelineContext:
      PipelineExecutionContext =
      {
        ...context,

        frame,

        scene,

        camera,

        pipeline:
          this
      };

    try {
      this.executeStage(
        "prepare",
        pipelineContext
      );

      this.executeStage(
        "update",
        pipelineContext
      );

      if (
        this.options
          .enableCulling
      ) {
        this.executeStage(
          "culling",
          pipelineContext
        );
      }

      this.executePasses(
        pipelineContext
      );

      if (
        this.options
          .enableEffects
      ) {
        this.executeStage(
          "effects",
          pipelineContext
        );
      }

      if (
        this.options
          .enablePostProcess
      ) {
        this.executeStage(
          "post-process",
          pipelineContext
        );
      }

      this.executeStage(
        "present",
        pipelineContext
      );
    } finally {
      this.running =
        false;
    }

    const duration =
      performance.now() -
      start;

    this.stats = {
      passes:
        this.passes.length,

      stages:
        this.stageResults.length,

      duration,

      drawCalls:
        this.stageResults.reduce(
          (
            total,
            result
          ) =>
            total +
            result.drawCalls,
          0
        ),

      triangles:
        this.stageResults.reduce(
          (
            total,
            result
          ) =>
            total +
            result.triangles,
          0
        ),

      objects:
        this.stageResults.reduce(
          (
            total,
            result
          ) =>
            total +
            result.objects,
          0
        )
    };

    return this.getStats();
  }

  /* ------------------------------------------------------------------------ */
  /* Stage execution                                                          */
  /* ------------------------------------------------------------------------ */

  private executeStage(
    stage: PipelineStage,
    context:
      PipelineExecutionContext
  ): void {
    this.currentStage =
      stage;

    const start =
      performance.now();

    let drawCalls = 0;
    let triangles = 0;
    let objects = 0;

    try {
      switch (
        stage
      ) {
        case "prepare":
          this.runPrepare(
            context
          );
          break;

        case "update":
          this.runUpdate(
            context
          );
          break;

        case "culling":
          this.runCulling(
            context
          );
          break;

        case "effects":
          this.runEffects(
            context
          );
          break;

        case "post-process":
          this.runPostProcess(
            context
          );
          break;

        case "present":
          this.runPresent(
            context
          );
          break;
      }
    } catch (
      error
    ) {
      if (
        this.options.stopOnError
      ) {
        throw error;
      }
    }

    const sceneStats =
      context.scene.getStats();

    drawCalls =
      sceneStats.drawCalls;

    triangles =
      sceneStats.triangles;

    objects =
      sceneStats.visibleObjects;

    this.stageResults.push({
      stage,

      duration:
        performance.now() -
        start,

      drawCalls,

      triangles,

      objects
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Prepare                                                                  */
  /* ------------------------------------------------------------------------ */

  private runPrepare(
    context:
      PipelineExecutionContext
  ): void {
    for (
      const pass of
      this.passes
    ) {
      pass.prepare?.(
        context
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  private runUpdate(
    context:
      PipelineExecutionContext
  ): void {
    context.camera.update();

    context.scene.update(
      context.frame
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Culling                                                                  */
  /* ------------------------------------------------------------------------ */

  private runCulling(
    context:
      PipelineExecutionContext
  ): void {
    for (
      const pass of
      this.passes
    ) {
      pass.cull?.(
        context
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Passes                                                                    */
  /* ------------------------------------------------------------------------ */

  private executePasses(
    context:
      PipelineExecutionContext
  ): void {
    for (
      const pass of
      this.passes
    ) {
      if (
        pass.enabled === false
      ) {
        continue;
      }

      const stage =
        pass.stage ??
        "opaque";

      if (
        stage ===
          "effects" &&
        !this.options
          .enableEffects
      ) {
        continue;
      }

      if (
        stage ===
          "post-process" &&
        !this.options
          .enablePostProcess
      ) {
        continue;
      }

      const start =
        performance.now();

      try {
        pass.render(
          context
        );
      } catch (
        error
      ) {
        if (
          this.options
            .stopOnError
        ) {
          throw error;
        }
      }

      const sceneStats =
        context.scene.getStats();

      this.stageResults.push({
        stage,

        duration:
          performance.now() -
          start,

        drawCalls:
          sceneStats.drawCalls,

        triangles:
          sceneStats.triangles,

        objects:
          sceneStats.visibleObjects
      });
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Effects                                                                  */
  /* ------------------------------------------------------------------------ */

  private runEffects(
    context:
      PipelineExecutionContext
  ): void {
    for (
      const pass of
      this.passes
    ) {
      if (
        pass.stage !==
        "effects"
      ) {
        continue;
      }

      if (
        pass.enabled === false
      ) {
        continue;
      }

      pass.render(
        context
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Post processing                                                          */
  /* ------------------------------------------------------------------------ */

  private runPostProcess(
    context:
      PipelineExecutionContext
  ): void {
    for (
      const pass of
      this.passes
    ) {
      if (
        pass.stage !==
        "post-process"
      ) {
        continue;
      }

      if (
        pass.enabled === false
      ) {
        continue;
      }

      pass.render(
        context
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Present                                                                  */
  /* ------------------------------------------------------------------------ */

  private runPresent(
    context:
      PipelineExecutionContext
  ): void {
    context.adapter.present?.();
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  isRunning(): boolean {
    return this.running;
  }

  getCurrentStage():
    PipelineStage | null {
    return this.currentStage;
  }

  getStats():
    RenderPipelineStats {
    return {
      ...this.stats
    };
  }

  getStageResults():
    PipelineStageResult[] {
    return this.stageResults.map(
      result => ({
        ...result
      })
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Enable / disable                                                          */
  /* ------------------------------------------------------------------------ */

  setEffectsEnabled(
    enabled: boolean
  ): void {
    this.options
      .enableEffects =
      enabled;
  }

  setPostProcessEnabled(
    enabled: boolean
  ): void {
    this.options
      .enablePostProcess =
      enabled;
  }

  setCullingEnabled(
    enabled: boolean
  ): void {
    this.options
      .enableCulling =
      enabled;
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                   */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    if (
      this.disposed
    ) {
      return;
    }

    for (
      const pass of
      this.passes
    ) {
      pass.dispose?.();
    }

    this.passes.length =
      0;

    this.stageResults.length =
      0;

    this.disposed =
      true;
  }

  private assertActive(): void {
    if (
      this.disposed
    ) {
      throw new Error(
        "RenderPipeline has been disposed."
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createRenderPipeline(
  options?: PipelineOptions
): RenderPipeline {
  return new RenderPipeline(
    options
  );
}

export default RenderPipeline;
