/**
 * Space
 * Scene Entity
 *
 * Logical object that exists inside a Scene.
 *
 * Responsibilities:
 * - Stable entity identity
 * - Entity metadata
 * - Node association
 * - Component storage
 * - Enable / disable state
 * - Tag management
 * - Lifecycle management
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SceneEntityId =
  string;

export type EntityComponentType =
  string;

export interface SceneEntityOptions {
  id?:
    SceneEntityId;

  name?:
    string;

  enabled?:
    boolean;

  tags?:
    string[];
}

export interface EntityComponent {
  type:
    EntityComponentType;
}

export interface EntityStats {
  components:
    number;

  tags:
    number;

  enabled:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Scene Entity                                                               */
/* -------------------------------------------------------------------------- */

export class SceneEntity {

  readonly id:
    SceneEntityId;

  private name:
    string;

  private enabledState:
    boolean;

  private components:
    Map<
      EntityComponentType,
      EntityComponent
    >;

  private tags:
    Set<string>;

  private nodeId:
    string |
    undefined;

  private disposed:
    boolean;

  constructor(
    options:
      SceneEntityOptions = {}
  ) {
    this.id =
      options.id ??
      createSceneEntityId();

    this.name =
      options.name ??
      this.id;

    this.enabledState =
      options.enabled ??
      true;

    this.components =
      new Map();

    this.tags =
      new Set(
        options.tags ??
        []
      );

    this.nodeId =
      undefined;

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

    const normalized =
      name.trim();

    if (
      normalized.length ===
      0
    ) {
      throw new Error(
        "Scene entity name cannot be empty."
      );
    }

    this.name =
      normalized;
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

  isEnabled():
    boolean {
    return (
      this.enabledState &&
      !this.disposed
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Node Association                                                         */
  /* ------------------------------------------------------------------------ */

  getNodeId():
    string |
    undefined {
    return this.nodeId;
  }

  attachToNode(
    nodeId:
      string
  ):
    void {
    this.assertActive();

    if (
      nodeId.trim().length ===
      0
    ) {
      throw new Error(
        "Node ID cannot be empty."
      );
    }

    this.nodeId =
      nodeId;
  }

  detachFromNode():
    void {
    this.assertActive();

    this.nodeId =
      undefined;
  }

  /* ------------------------------------------------------------------------ */
  /* Components                                                               */
  /* ------------------------------------------------------------------------ */

  addComponent<T extends EntityComponent>(
    component:
      T
  ):
    T {
    this.assertActive();

    if (
      !component ||
      typeof component.type !==
        "string" ||
      component.type.trim()
        .length === 0
    ) {
      throw new Error(
        "A component must provide a non-empty type."
      );
    }

    if (
      this.components.has(
        component.type
      )
    ) {
      throw new Error(
        `Entity "${this.id}" already has component "${component.type}".`
      );
    }

    this.components.set(
      component.type,
      component
    );

    return component;
  }

  setComponent<T extends EntityComponent>(
    component:
      T
  ):
    T {
    this.assertActive();

    if (
      !component ||
      typeof component.type !==
        "string" ||
      component.type.trim()
        .length === 0
    ) {
      throw new Error(
        "A component must provide a non-empty type."
      );
    }

    this.components.set(
      component.type,
      component
    );

    return component;
  }

  getComponent<T extends EntityComponent>(
    type:
      EntityComponentType
  ):
    T |
    undefined {
    return this.components.get(
      type
    ) as T |
      undefined;
  }

  hasComponent(
    type:
      EntityComponentType
  ):
    boolean {
    return this.components.has(
      type
    );
  }

  removeComponent(
    type:
      EntityComponentType
  ):
    boolean {
    this.assertActive();

    return this.components.delete(
      type
    );
  }

  getComponents():
    EntityComponent[] {
    return Array.from(
      this.components.values()
    );
  }

  getComponentTypes():
    EntityComponentType[] {
    return Array.from(
      this.components.keys()
    );
  }

  clearComponents():
    void {
    this.assertActive();

    this.components.clear();
  }

  /* ------------------------------------------------------------------------ */
  /* Tags                                                                     */
  /* ------------------------------------------------------------------------ */

  addTag(
    tag:
      string
  ):
    void {
    this.assertActive();

    const normalized =
      normalizeTag(
        tag
      );

    if (
      normalized.length ===
      0
    ) {
      throw new Error(
        "Entity tag cannot be empty."
      );
    }

    this.tags.add(
      normalized
    );
  }

  removeTag(
    tag:
      string
  ):
    boolean {
    this.assertActive();

    return this.tags.delete(
      normalizeTag(
        tag
      )
    );
  }

  hasTag(
    tag:
      string
  ):
    boolean {
    return this.tags.has(
      normalizeTag(
        tag
      )
    );
  }

  getTags():
    string[] {
    return Array.from(
      this.tags
    );
  }

  clearTags():
    void {
    this.assertActive();

    this.tags.clear();
  }

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  getStats():
    EntityStats {
    return {
      components:
        this.components.size,

      tags:
        this.tags.size,

      enabled:
        this.enabledState
    };
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

    this.components.clear();
    this.tags.clear();

    this.nodeId =
      undefined;

    this.enabledState =
      false;

    this.disposed =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Internal                                                                 */
  /* ------------------------------------------------------------------------ */

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `Scene entity "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Component Factory                                                          */
/* -------------------------------------------------------------------------- */

export function createComponent<T extends EntityComponent>(
  type:
    EntityComponentType,
  data:
    Omit<T, "type">
):
  T {
  return {
    ...data,
    type
  } as T;
}

/* -------------------------------------------------------------------------- */
/* Entity Factory                                                             */
/* -------------------------------------------------------------------------- */

export function createSceneEntity(
  options:
    SceneEntityOptions = {}
):
  SceneEntity {
  return new SceneEntity(
    options
  );
}

/* -------------------------------------------------------------------------- */
/* ID                                                                         */
/* -------------------------------------------------------------------------- */

function createSceneEntityId():
  SceneEntityId {
  return `entity-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeTag(
  tag:
    string
):
  string {
  return tag.trim().toLowerCase();
}

export default SceneEntity;
