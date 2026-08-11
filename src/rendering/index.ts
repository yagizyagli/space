/**
 * Space
 * Rendering Public API
 *
 * Central export surface for the rendering subsystem.
 *
 * Keeps internal rendering modules private while exposing
 * the stable public API to the rest of the engine.
 */

/* -------------------------------------------------------------------------- */
/* Core Rendering                                                             */
/* -------------------------------------------------------------------------- */

export {
  Renderer,
  createRenderer
} from "./renderer";

export {
  RenderTarget,
  RenderTargetManager,
  createRenderTarget,
  createRenderTargetManager
} from "./render-targets";

export {
  RenderBuffer,
  VertexBuffer,
  IndexBuffer,
  UniformBuffer,
  createVertexBuffer,
  createIndexBuffer,
  createUniformBuffer
} from "./buffers";

export {
  RenderGeometry,
  GeometryManager,
  createGeometry,
  createGeometryManager
} from "./geometry";

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                   */
/* -------------------------------------------------------------------------- */

export {
  MaterialPipeline,
  createMaterialPipeline
} from "./material-pipeline";

export {
  PostProcessEffect,
  PostProcessPipeline,
  createPostProcessEffect,
  createPostProcessPipeline,
  createStandardPostProcessPipeline
} from "./post-processing";

/* -------------------------------------------------------------------------- */
/* Instancing                                                                 */
/* -------------------------------------------------------------------------- */

export {
  InstanceBuffer,
  InstancedBatch,
  InstanceManager,
  createInstanceBuffer,
  createInstancedBatch,
  createInstanceManager,
  createTransformAttribute,
  createPositionAttribute,
  createColorAttribute,
  createScaleAttribute
} from "./instancing";

/* -------------------------------------------------------------------------- */
/* Visibility                                                                 */
/* -------------------------------------------------------------------------- */

export {
  CullingSystem,
  DistanceCuller,
  LayerCuller,
  createCullingSystem,
  createDistanceCuller,
  createLayerCuller,
  sphereInFrustum,
  boxInFrustum,
  boundsInFrustum
} from "./culling";

/* -------------------------------------------------------------------------- */
/* Level Of Detail                                                            */
/* -------------------------------------------------------------------------- */

export {
  LODGroup,
  LODManager,
  createDistanceLOD,
  createScreenSizeLOD,
  createLODManager,
  createSpaceObjectLOD
} from "./lod";

/* -------------------------------------------------------------------------- */
/* Debug                                                                      */
/* -------------------------------------------------------------------------- */

export {
  RenderingDebug,
  createRenderingDebug,
  DEBUG_COLORS
} from "./debug";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type {
  PostProcessEffectType,
  ToneMappingOperator,
  PostProcessInput,
  PostProcessOutput,
  PostProcessEffectOptions,
  PostProcessEffectState,
  PostProcessOptions
} from "./post-processing";

export type {
  InstanceAttribute,
  InstanceData,
  InstancedBatchOptions,
  InstanceBufferState,
  InstancedBatchState
} from "./instancing";

export type {
  CullingObject,
  CullingOptions,
  CullingResult,
  CullingReason
} from "./culling";

export type {
  LODLevel,
  LODOptions,
  LODStrategy,
  LODSelection,
  LODObject
} from "./lod";

export type {
  DebugColor,
  DebugLine,
  DebugPoint,
  DebugBox,
  DebugSphere,
  RenderingDebugStats,
  DebugOptions,
  DebugRenderer
} from "./debug";
