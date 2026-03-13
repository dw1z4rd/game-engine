import { Logger } from '../core/Logger';

/**
 * Entity-Component-System World
 * Manages all entities, components, and systems
 */
export class ECSWorld {
  private readonly logger: Logger;
  private readonly entities = new Map<number, Entity>();
  private readonly systems: System[] = [];
  private readonly componentManager = new ComponentManager();
  private nextEntityId = 0;
  private entitiesToDestroy = new Set<number>();

  constructor(logger: Logger) {
    this.logger = logger;
    this.logger.debug('ECS World created');
  }

  /**
   * Create a new entity
   */
  createEntity(name?: string): Entity {
    const entity = new Entity(this.nextEntityId++, name);
    this.entities.set(entity.id, entity);
    this.logger.debug(`Entity created: ${entity.id} (${name || 'unnamed'})`);
    return entity;
  }

  /**
   * Destroy an entity
   */
  destroyEntity(entityId: number): void {
    this.entitiesToDestroy.add(entityId);
  }

  /**
   * Get an entity by ID
   */
  getEntity(entityId: number): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Add a component to an entity
   */
  addComponent<T extends Component>(
    entityId: number,
    component: T
  ): void {
    this.componentManager.addComponent(entityId, component);
    this.logger.debug(`Component added to entity ${entityId}: ${component.constructor.name}`);
  }

  /**
   * Remove a component from an entity
   */
  removeComponent<T extends Component>(
    entityId: number,
    componentType: ComponentConstructor<T>
  ): void {
    this.componentManager.removeComponent(entityId, componentType);
    this.logger.debug(`Component removed from entity ${entityId}: ${componentType.name}`);
  }

  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(
    entityId: number,
    componentType: ComponentConstructor<T>
  ): T | undefined {
    return this.componentManager.getComponent(entityId, componentType);
  }

  /**
   * Check if an entity has a component
   */
  hasComponent<T extends Component>(
    entityId: number,
    componentType: ComponentConstructor<T>
  ): boolean {
    return this.componentManager.hasComponent(entityId, componentType);
  }

  /**
   * Get all components of an entity
   */
  getEntityComponents(entityId: number): Component[] {
    return this.componentManager.getEntityComponents(entityId);
  }

  /**
   * Add a system to the world
   */
  addSystem(system: System): void {
    this.systems.push(system);
    system.world = this;
    system.initialize?.();
    this.logger.debug(`System added: ${system.constructor.name}`);
  }

  /**
   * Remove a system from the world
   */
  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
      system.dispose?.();
      this.logger.debug(`System removed: ${system.constructor.name}`);
    }
  }

  /**
   * Get all systems
   */
  getSystems(): System[] {
    return [...this.systems];
  }

  /**
   * Update all systems
   */
  update(deltaTime: number): void {
    // Process entity destruction
    for (const entityId of this.entitiesToDestroy) {
      this.destroyEntityImmediate(entityId);
    }
    this.entitiesToDestroy.clear();

    // Update all systems
    for (const system of this.systems) {
      if (system.enabled) {
        system.update(deltaTime);
      }
    }
  }

  /**
   * Find entities with specific components
   */
  findEntities<T extends Component>(
    ...componentTypes: ComponentConstructor<T>[]
  ): Entity[] {
    return Array.from(this.entities.values()).filter(entity =>
      componentTypes.every(type => this.hasComponent(entity.id, type))
    );
  }

  /**
   * Get entities with a specific component
   */
  getEntitiesWithComponent<T extends Component>(
    componentType: ComponentConstructor<T>
  ): Entity[] {
    return this.componentManager.getEntitiesWithComponent(componentType)
      .map(entityId => this.entities.get(entityId))
      .filter((entity): entity is Entity => entity !== undefined);
  }

  private destroyEntityImmediate(entityId: number): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Remove all components
    this.componentManager.removeAllComponents(entityId);

    // Remove from entities map
    this.entities.delete(entityId);

    this.logger.debug(`Entity destroyed: ${entityId}`);
  }

  /**
   * Dispose of the world
   */
  dispose(): void {
    // Destroy all entities
    for (const entity of this.entities.values()) {
      this.destroyEntityImmediate(entity.id);
    }

    // Dispose all systems
    for (const system of this.systems) {
      system.dispose?.();
    }
    this.systems.length = 0;

    this.logger.debug('ECS World disposed');
  }
}

/**
 * Entity class
 */
export class Entity {
  public readonly id: number;
  public readonly name: string;
  public active = true;

  constructor(id: number, name?: string) {
    this.id = id;
    this.name = name || `Entity_${id}`;
  }
}

/**
 * Base component class
 */
export abstract class Component {
  public active = true;
}

/**
 * Component constructor type
 */
export type ComponentConstructor<T extends Component> = new (...args: any[]) => T;

/**
 * Base system class
 */
export abstract class System {
  public world: ECSWorld | null = null;
  public enabled = true;

  /**
   * Called when system is added to the world
   */
  initialize?(): void;

  /**
   * Called each frame
   */
  abstract update(deltaTime: number): void;

  /**
   * Called when system is removed from the world
   */
  dispose?(): void;
}

/**
 * Component manager for efficient component storage
 */
class ComponentManager {
  private readonly components = new Map<number, Map<string, Component>>();
  private readonly componentEntities = new Map<string, Set<number>>();

  addComponent<T extends Component>(entityId: number, component: T): void {
    const componentType = component.constructor.name;
    
    // Store component for entity
    if (!this.components.has(entityId)) {
      this.components.set(entityId, new Map());
    }
    this.components.get(entityId)!.set(componentType, component);

    // Track entities with this component type
    if (!this.componentEntities.has(componentType)) {
      this.componentEntities.set(componentType, new Set());
    }
    this.componentEntities.get(componentType)!.add(entityId);
  }

  removeComponent<T extends Component>(
    entityId: number,
    componentType: ComponentConstructor<T>
  ): void {
    const componentTypeName = componentType.name;
    
    // Remove component from entity
    const entityComponents = this.components.get(entityId);
    if (entityComponents) {
      entityComponents.delete(componentTypeName);
      
      // Remove entity from component type tracking
      const entities = this.componentEntities.get(componentTypeName);
      if (entities) {
        entities.delete(entityId);
        if (entities.size === 0) {
          this.componentEntities.delete(componentTypeName);
        }
      }
    }
  }

  getComponent<T extends Component>(
    entityId: number,
    componentType: ComponentConstructor<T>
  ): T | undefined {
    const entityComponents = this.components.get(entityId);
    return entityComponents?.get(componentType.name) as T | undefined;
  }

  hasComponent<T extends Component>(
    entityId: number,
    componentType: ComponentConstructor<T>
  ): boolean {
    const entityComponents = this.components.get(entityId);
    return entityComponents?.has(componentType.name) || false;
  }

  getEntityComponents(entityId: number): Component[] {
    const entityComponents = this.components.get(entityId);
    return entityComponents ? Array.from(entityComponents.values()) : [];
  }

  getEntitiesWithComponent<T extends Component>(
    componentType: ComponentConstructor<T>
  ): number[] {
    const entities = this.componentEntities.get(componentType.name);
    return entities ? Array.from(entities) : [];
  }

  removeAllComponents(entityId: number): void {
    const entityComponents = this.components.get(entityId);
    if (entityComponents) {
      for (const componentType of entityComponents.keys()) {
        const entities = this.componentEntities.get(componentType);
        if (entities) {
          entities.delete(entityId);
          if (entities.size === 0) {
            this.componentEntities.delete(componentType);
          }
        }
      }
      this.components.delete(entityId);
    }
  }
}