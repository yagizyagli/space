/**
 * Space
 * Scene Node
 *
 * Hierarchical object inside a Space scene.
 *
 * Responsibilities:
 * - Parent / child relationship
 * - Local transform
 * - Visibility
 * - Enable state
 * - Layer membership
 * - Entity attachment
 */

import type {
  Vector3,
  Quaternion
} from "../types/core";

import type {
  Transform
} from "./transform";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SceneNodeId =
  string;

export interface SceneNodeOptions {
  id?:
    SceneNodeId;

  name?:
    string;

  position?:
    Vector3;

  rotation?:
    Quaternion;

  scale?:
    Vector3;

  enabled?:
    boolean;

  visible?:
    boolean;

  layer?:
    number;
}

/* -------------------------------------------------------------------------- */
/* Scene Node                                                                 */
/* -------------------------------------------------------------------------- */

export class SceneNode {

  readonly id:
    SceneNodeId;

  private name:
    string;

  private transform:
    Transform;

  private parent:
    SceneNodeId |
    undefined;

  private enabledState:
    boolean;

  private visibleState:
    boolean;

  private layerMask:
    number;

  private entityIds:
    Set<string>;

  private disposed:
    boolean;

  constructor(
    options:
      SceneNodeOptions = {}
  ) {
    this.id =
      options.id ??
      createSceneNodeId();

    this.name =
      options.name ??
      this.id;

    this.transform =
      this.createTransform(
        options
      );

    this.parent =
      undefined;

    this.enabledState =
      options.enabled ??
      true;

    this.visibleState =
      options.visible ??
      true;

    this.layerMask =
      options.layer ??
      1;

    this.entityIds =
      new Set();

    this.disposed =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Identity                                                                 */
  /* ------------------------------------------------------------------------ */

  getName():
    string {
    return this.name;
  }

  setName(
    name:
      string
  ):
    void {
    this.assertActive();

    if (
      name.trim().length ===
      0
    ) {
      throw new Error(
        "Scene node name cannot be empty."
      );
    }

    this.name =
      name;
  }

  /* ------------------------------------------------------------------------ */
  /* Transform                                                                 */
  /* ------------------------------------------------------------------------ */

  getTransform():
    Transform {
    this.assertActive();

    return this.transform;
  }

  setPosition(
    position:
      Vector3
  ):
    void {
    this.assertActive();

    this.transform.setPosition(
      position
    );
  }

  getPosition():
    Vector3 {
    this.assertActive();

    return this.transform.getPosition();
  }

  setRotation(
    rotation:
      Quaternion
  ):
    void {
    this.assertActive();

    this.transform.setRotation(
      rotation
    );
  }

  getRotation():
    Quaternion {
    this.assertActive();

    return this.transform.getRotation();
  }

  setScale(
    scale:
      Vector3
  ):
    void {
    this.assertActive();

    this.transform.setScale(
      scale
    );
  }

  getScale():
    Vector3 {
    this.assertActive();

    return this.transform.getScale();
  }

  /* ------------------------------------------------------------------------ */
  /* Hierarchy                                                                */
  /* ------------------------------------------------------------------------ */

  get parentId():
    SceneNodeId |
    undefined {
    return this.parent;
  }

  setParent(
    parent:
      SceneNodeId |
      undefined
  ):
    void {
    this.assertActive();

    if (
      parent ===
      this.id
    ) {
      throw new Error(
        "A scene node cannot be its own parent."
      );
    }

    this.parent =
      parent;
  }

  isRoot():
    boolean {
    return (
      this.parent ===
      undefined
    );
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  get enabled():
    boolean {
    return this.enabledState;
  }

  setEnabled(
    enabled:
      boolean
  ):
    void {
    this.assertActive();

    this.enabledState =
      enabled;
  }

  get visible():
    boolean {
    return this.visibleState;
  }

  setVisible(
    visible:
      boolean
  ):
    void {
    this.assertActive();

    this.visibleState =
      visible;
  }

  /* ------------------------------------------------------------------------ */
  /* Layers                                                                   */
  /* ------------------------------------------------------------------------ */

  get layer():
    number {
    return this.layerMask;
  }

  setLayer(
    layer:
      number
  ):
    void {
    this.assertActive();

    if (
      !Number.isInteger(
        layer
      ) ||
      layer < 0
    ) {
      throw new Error(
        "Scene node layer must be a non-negative integer."
      );
    }

    this.layerMask =
      layer;
  }

  setLayerMask(
    mask:
      number
  ):
    void {
    this.assertActive();

    if (
      !Number.isInteger(
        mask
      ) ||
      mask < 0
    ) {
      throw new Error(
        "Scene node layer mask must be a non-negative integer."
      );
    }

    this.layerMask =
      mask;
  }

  getLayerMask():
    number {
    return this.layerMask;
  }

  hasLayer(
    layer:
      number
  ):
    boolean {
    if (
      layer < 0 ||
      !Number.isInteger(
        layer
      )
    ) {
      return false;
    }

    return (
      (
        this.layerMask &
        (
          1 << layer
        )
      ) !==
      0
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Entities                                                                 */
  /* ------------------------------------------------------------------------ */

  attachEntity(
    entityId:
      string
  ):
    void {
    this.assertActive();

    this.entityIds.add(
      entityId
    );
  }

  detachEntity(
    entityId:
      string
  ):
    boolean {
    this.assertActive();

    return this.entityIds.delete(
      entityId
    );
  }

  hasEntity(
    entityId:
      string
  ):
    boolean {
    return this.entityIds.has(
      entityId
    );
  }

  getEntityIds():
    string[] {
    return Array.from(
      this.entityIds
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  dispose():
    void {
    if (
      this.disposed
    ) {
      return;
    }

    this.entityIds.clear();

    this.parent =
      undefined;

    this.enabledState =
      false;

    this.visibleState =
      false;

    this.disposed =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Internal                                                                 */
  /* ------------------------------------------------------------------------ */

  private createTransform(
    options:
      SceneNodeOptions
  ):
    Transform {
    /*
     * Transform is intentionally constructed through the
     * transform module so SceneNode does not duplicate
     * transform logic.
     */
    return new (
      requireTransform()
    )({
      position:
        options.position,

      rotation:
        options.rotation,

      scale:
        options.scale
    });
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `Scene node "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Transform Loader                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Kept isolated so the node API does not need to know how
 * Transform is internally constructed.
 *
 * The implementation is replaced by a direct import once
 * transform.ts is available.
 */
function requireTransform():
  new (
    options?: {
      position?:
        Vector3;

      rotation?:
        Quaternion;

      scale?:
        Vector3;
    }
  ) => Transform {
  throw new Error(
    "Transform implementation is not initialized. " +
    "Complete src/scene/transform.ts before creating SceneNode instances."
  );
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createSceneNode(
  options:
    SceneNodeOptions = {}
):
  SceneNode {
  return new SceneNode(
    options
  );
}

/* -------------------------------------------------------------------------- */
/* ID                                                                         */
/* -------------------------------------------------------------------------- */

function createSceneNodeId():
  SceneNodeId {
  return `node-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export default SceneNode;
