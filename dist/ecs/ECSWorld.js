/**
 * Entity-Component-System World
 * Manages all entities, components, and systems
 */
export class ECSWorld {
    constructor(logger) {
        this.entities = new Map();
        this.systems = [];
        this.componentManager = new ComponentManager();
        this.nextEntityId = 0;
        this.entitiesToDestroy = new Set();
        this.logger = logger;
        this.logger.debug('ECS World created');
    }
    /**
     * Create a new entity
     */
    createEntity(name) {
        const entity = new Entity(this.nextEntityId++, name);
        this.entities.set(entity.id, entity);
        this.logger.debug(`Entity created: ${entity.id} (${name || 'unnamed'})`);
        return entity;
    }
    /**
     * Destroy an entity
     */
    destroyEntity(entityId) {
        this.entitiesToDestroy.add(entityId);
    }
    /**
     * Get an entity by ID
     */
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
    /**
     * Get all entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    /**
     * Add a component to an entity
     */
    addComponent(entityId, component) {
        this.componentManager.addComponent(entityId, component);
        this.logger.debug(`Component added to entity ${entityId}: ${component.constructor.name}`);
    }
    /**
     * Remove a component from an entity
     */
    removeComponent(entityId, componentType) {
        this.componentManager.removeComponent(entityId, componentType);
        this.logger.debug(`Component removed from entity ${entityId}: ${componentType.name}`);
    }
    /**
     * Get a component from an entity
     */
    getComponent(entityId, componentType) {
        return this.componentManager.getComponent(entityId, componentType);
    }
    /**
     * Check if an entity has a component
     */
    hasComponent(entityId, componentType) {
        return this.componentManager.hasComponent(entityId, componentType);
    }
    /**
     * Get all components of an entity
     */
    getEntityComponents(entityId) {
        return this.componentManager.getEntityComponents(entityId);
    }
    /**
     * Add a system to the world
     */
    addSystem(system) {
        this.systems.push(system);
        system.world = this;
        system.initialize?.();
        this.logger.debug(`System added: ${system.constructor.name}`);
    }
    /**
     * Remove a system from the world
     */
    removeSystem(system) {
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
    getSystems() {
        return [...this.systems];
    }
    /**
     * Update all systems
     */
    update(deltaTime) {
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
    findEntities(...componentTypes) {
        return Array.from(this.entities.values()).filter(entity => componentTypes.every(type => this.hasComponent(entity.id, type)));
    }
    /**
     * Get entities with a specific component
     */
    getEntitiesWithComponent(componentType) {
        return this.componentManager.getEntitiesWithComponent(componentType)
            .map(entityId => this.entities.get(entityId))
            .filter((entity) => entity !== undefined);
    }
    destroyEntityImmediate(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity)
            return;
        // Remove all components
        this.componentManager.removeAllComponents(entityId);
        // Remove from entities map
        this.entities.delete(entityId);
        this.logger.debug(`Entity destroyed: ${entityId}`);
    }
    /**
     * Dispose of the world
     */
    dispose() {
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
    constructor(id, name) {
        this.active = true;
        this.id = id;
        this.name = name || `Entity_${id}`;
    }
}
/**
 * Base component class
 */
export class Component {
    constructor() {
        this.active = true;
    }
}
/**
 * Base system class
 */
export class System {
    constructor() {
        this.world = null;
        this.enabled = true;
    }
}
/**
 * Component manager for efficient component storage
 */
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.componentEntities = new Map();
    }
    addComponent(entityId, component) {
        const componentType = component.constructor.name;
        // Store component for entity
        if (!this.components.has(entityId)) {
            this.components.set(entityId, new Map());
        }
        this.components.get(entityId).set(componentType, component);
        // Track entities with this component type
        if (!this.componentEntities.has(componentType)) {
            this.componentEntities.set(componentType, new Set());
        }
        this.componentEntities.get(componentType).add(entityId);
    }
    removeComponent(entityId, componentType) {
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
    getComponent(entityId, componentType) {
        const entityComponents = this.components.get(entityId);
        return entityComponents?.get(componentType.name);
    }
    hasComponent(entityId, componentType) {
        const entityComponents = this.components.get(entityId);
        return entityComponents?.has(componentType.name) || false;
    }
    getEntityComponents(entityId) {
        const entityComponents = this.components.get(entityId);
        return entityComponents ? Array.from(entityComponents.values()) : [];
    }
    getEntitiesWithComponent(componentType) {
        const entities = this.componentEntities.get(componentType.name);
        return entities ? Array.from(entities) : [];
    }
    removeAllComponents(entityId) {
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
//# sourceMappingURL=ECSWorld.js.map