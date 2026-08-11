/**
 * Space
 * Scene
 *
 * High-level scene container.
 *
 * Responsibilities:
 * - Manage scene nodes
 * - Manage scene entities
 * - Maintain root hierarchy
 * - Track active camera
 * - Track scene visibility
 * - Provide traversal
 * - Provide lifecycle management
 *
 * Rendering is intentionally kept outside this class.
 */

import type {
  Vector3,
  Camera
} from "../types/core";

import type {
  SceneNode,
  SceneNodeId
} from "./node";

import type {
  SceneEntity,
  SceneEntityId
} from "./entity";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SceneId =
  string;

export interface SceneOptions {
  id?:
    SceneId;

  name?:
    string;

  enabled?:
    boolean;
}

export interface SceneTraversalOptions {
  includeDisabled?:
    boolean;

  includeInvisible?:
    boolean;
}

export interface SceneStats {
  nodes:
    number;

  entities:
    number;

  roots:
    number;

  enabledNodes:
    number;

  visibleNodes:
    number;
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

export class Scene {

  readonly id:
    SceneId;

  private name:
    string;

  private enabled:
    boolean;

  private nodes:
    Map<
      SceneNodeId,
      SceneNode
    >;

  private entities:
    Map<
      SceneEntityId,
      SceneEntity
    >;

  private roots:
    Set<
      SceneNodeId
    >;

  private activeCamera:
    Camera |
    null;

  private disposed:
    boolean;

  constructor(
    options:
      SceneOptions = {}
  ) {
    this.id =
      options.id ??
      createSceneId();

    this.name =
      options.name ??
      "Scene";

    this.enabled =
      options.enabled ??
      true;

    this.nodes =
      new Map();

    this.entities =
      new Map();

    this.roots =
      new Set();

    this.activeCamera =
      null;

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
        "Scene name cannot be empty."
      );
    }

    this.name =
      name;
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  setEnabled(
    enabled:
      boolean
  ):
    void {
    this.assertActive();

    this.enabled =
      enabled;
  }

  isEnabled():
    boolean {
    return (
      this.enabled &&
      !this.disposed
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Nodes                                                                    */
  /* ------------------------------------------------------------------------ */

  addNode(
    node:
      SceneNode,
    parent?:
      SceneNodeId
  ):
    void {
    this.assertActive();

    if (
      this.nodes.has(
        node.id
      )
    ) {
      throw new Error(
        `Scene node "${node.id}" already exists.`
      );
    }

    if (
      parent !==
      undefined
    ) {
      if (
        !this.nodes.has(
          parent
        )
      ) {
        throw new Error(
          `Parent scene node "${parent}" does not exist.`
        );
      }

      node.setParent(
        parent
      );
    } else {
      this.roots.add(
        node.id
      );
    }

    this.nodes.set(
      node.id,
      node
    );
  }

  removeNode(
    id:
      SceneNodeId,
    recursive:
      boolean =
        true
  ):
    boolean {
    this.assertActive();

    const node =
      this.nodes.get(
        id
      );

    if (
      !node
    ) {
      return false;
    }

    const children =
      this.getChildNodes(
        id
      );

    if (
      recursive
    ) {
      for (
        const child of
        children
      ) {
        this.removeNode(
          child.id,
          true
        );
      }
    } else if (
      children.length >
      0
    ) {
      throw new Error(
        `Cannot remove scene node "${id}" while it has children.`
      );
    }

    this.nodes.delete(
      id
    );

    this.roots.delete(
      id
    );

    for (
      const candidate of
      this.nodes.values()
    ) {
      if (
        candidate.parentId ===
        id
      ) {
        candidate.setParent(
          undefined
        );

        this.roots.add(
          candidate.id
        );
      }
    }

    return true;
  }

  getNode(
    id:
      SceneNodeId
  ):
    SceneNode |
    undefined {
    return this.nodes.get(
      id
    );
  }

  hasNode(
    id:
      SceneNodeId
  ):
    boolean {
    return this.nodes.has(
      id
    );
  }

  getNodes():
    SceneNode[] {
    return Array.from(
      this.nodes.values()
    );
  }

  getRootNodes():
    SceneNode[] {
    const result:
      SceneNode[] =
      [];

    for (
      const id of
      this.roots
    ) {
      const node =
        this.nodes.get(
          id
        );

      if (
        node
      ) {
        result.push(
          node
        );
      }
    }

    return result;
  }

  getChildNodes(
    parentId:
      SceneNodeId
  ):
    SceneNode[] {
    const result:
      SceneNode[] =
      [];

    for (
      const node of
      this.nodes.values()
    ) {
      if (
        node.parentId ===
        parentId
      ) {
        result.push(
          node
        );
      }
    }

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Entities                                                                 */
  /* ------------------------------------------------------------------------ */

  addEntity(
    entity:
      SceneEntity
  ):
    void {
    this.assertActive();

    if (
      this.entities.has(
        entity.id
      )
    ) {
      throw new Error(
        `Scene entity "${entity.id}" already exists.`
      );
    }

    this.entities.set(
      entity.id,
      entity
    );
  }

  removeEntity(
    id:
      SceneEntityId
  ):
    boolean {
    this.assertActive();

    return this.entities.delete(
      id
    );
  }

  getEntity(
    id:
      SceneEntityId
  ):
    SceneEntity |
    undefined {
    return this.entities.get(
      id
    );
  }

  hasEntity(
    id:
      SceneEntityId
  ):
    boolean {
    return this.entities.has(
      id
    );
  }

  getEntities():
    SceneEntity[] {
    return Array.from(
      this.entities.values()
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Camera                                                                   */
  /* ------------------------------------------------------------------------ */

  setActiveCamera(
    camera:
      Camera |
      null
  ):
    void {
    this.assertActive();

    this.activeCamera =
      camera;
  }

  getActiveCamera():
    Camera |
    null {
    return this.activeCamera;
  }

  /* ------------------------------------------------------------------------ */
  /* Traversal                                                                */
  /* ------------------------------------------------------------------------ */

  traverse(
    callback:
      (
        node:
          SceneNode
      ) => void,
    options:
      SceneTraversalOptions = {}
  ):
    void {
    this.assertActive();

    const includeDisabled =
      options.includeDisabled ??
      false;

    const includeInvisible =
      options.includeInvisible ??
      false;

    const visit =
      (
        node:
          SceneNode
      ): void => {
        if (
          !includeDisabled &&
          !node.enabled
        ) {
          return;
        }

        if (
          !includeInvisible &&
          !node.visible
        ) {
          return;
        }

        callback(
          node
        );

        for (
          const child of
          this.getChildNodes(
            node.id
          )
        ) {
          visit(
            child
          );
        }
      };

    for (
      const root of
      this.getRootNodes()
    ) {
      visit(
        root
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Queries                                                                  */
  /* ------------------------------------------------------------------------ */

  findNode(
    predicate:
      (
        node:
          SceneNode
      ) => boolean
  ):
    SceneNode |
    undefined {
    for (
      const node of
      this.nodes.values()
    ) {
      if (
        predicate(
          node
        )
      ) {
        return node;
      }
    }

    return undefined;
  }

  findNodes(
    predicate:
      (
        node:
          SceneNode
      ) => boolean
  ):
    SceneNode[] {
    const result:
      SceneNode[] =
      [];

    for (
      const node of
      this.nodes.values()
    ) {
      if (
        predicate(
          node
        )
      ) {
        result.push(
          node
        );
      }
    }

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  getStats():
    SceneStats {
    let enabledNodes =
      0;

    let visibleNodes =
      0;

    for (
      const node of
      this.nodes.values()
    ) {
      if (
        node.enabled
      ) {
        enabledNodes++;
      }

      if (
        node.visible
      ) {
        visibleNodes++;
      }
    }

    return {
      nodes:
        this.nodes.size,

      entities:
        this.entities.size,

      roots:
        this.roots.size,

      enabledNodes,

      visibleNodes
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Clear                                                                    */
  /* ------------------------------------------------------------------------ */

  clear():
    void {
    this.assertActive();

    this.nodes.clear();
    this.entities.clear();
    this.roots.clear();

    this.activeCamera =
      null;
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose():
    void {
    if (
      this.disposed
    ) {
      return;
    }

    this.clear();

    this.enabled =
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
        `Scene "${this.id}" has been disposed.`
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createScene(
  options:
    SceneOptions = {}
):
  Scene {
  return new Scene(
    options
  );
}

/* -------------------------------------------------------------------------- */
/* ID                                                                         */
/* -------------------------------------------------------------------------- */

function createSceneId():
  SceneId {
  return `scene-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export default Scene;
