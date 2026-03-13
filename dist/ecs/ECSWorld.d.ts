import { Logger } from '../core/Logger';
/**
 * Entity-Component-System World
 * Manages all entities, components, and systems
 */
export declare class ECSWorld {
    private readonly logger;
    private readonly entities;
    private readonly systems;
    private readonly componentManager;
    private nextEntityId;
    private entitiesToDestroy;
    constructor(logger: Logger);
    /**
     * Create a new entity
     */
    createEntity(name?: string): Entity;
    /**
     * Destroy an entity
     */
    destroyEntity(entityId: number): void;
    /**
     * Get an entity by ID
     */
    getEntity(entityId: number): Entity | undefined;
    /**
     * Get all entities
     */
    getAllEntities(): Entity[];
    /**
     * Add a component to an entity
     */
    addComponent<T extends Component>(entityId: number, component: T): void;
    /**
     * Remove a component from an entity
     */
    removeComponent<T extends Component>(entityId: number, componentType: ComponentConstructor<T>): void;
    /**
     * Get a component from an entity
     */
    getComponent<T extends Component>(entityId: number, componentType: ComponentConstructor<T>): T | undefined;
    /**
     * Check if an entity has a component
     */
    hasComponent<T extends Component>(entityId: number, componentType: ComponentConstructor<T>): boolean;
    /**
     * Get all components of an entity
     */
    getEntityComponents(entityId: number): Component[];
    /**
     * Add a system to the world
     */
    addSystem(system: System): void;
    /**
     * Remove a system from the world
     */
    removeSystem(system: System): void;
    /**
     * Get all systems
     */
    getSystems(): System[];
    /**
     * Update all systems
     */
    update(deltaTime: number): void;
    /**
     * Find entities with specific components
     */
    findEntities<T extends Component>(...componentTypes: ComponentConstructor<T>[]): Entity[];
    /**
     * Get entities with a specific component
     */
    getEntitiesWithComponent<T extends Component>(componentType: ComponentConstructor<T>): Entity[];
    private destroyEntityImmediate;
    /**
     * Dispose of the world
     */
    dispose(): void;
}
/**
 * Entity class
 */
export declare class Entity {
    readonly id: number;
    readonly name: string;
    active: boolean;
    constructor(id: number, name?: string);
}
/**
 * Base component class
 */
export declare abstract class Component {
    active: boolean;
}
/**
 * Component constructor type
 */
export type ComponentConstructor<T extends Component> = new (...args: any[]) => T;
/**
 * Base system class
 */
export declare abstract class System {
    world: ECSWorld | null;
    enabled: boolean;
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
//# sourceMappingURL=ECSWorld.d.ts.map