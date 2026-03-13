import * as THREE from 'three';
/**
 * Scene management system for organizing 3D scenes
 */
export class Scene {
    constructor(renderer, logger) {
        this.entities = new Map();
        this.activeCamera = null;
        this.renderer = renderer;
        this.logger = logger;
        this.scene = new THREE.Scene();
        // Set up basic scene properties
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
        this.logger.debug('Scene created');
    }
    /**
     * Get the Three.js scene object
     */
    get threeScene() {
        return this.scene;
    }
    /**
     * Get the active camera
     */
    get camera() {
        return this.activeCamera;
    }
    /**
     * Set the active camera
     */
    setCamera(camera) {
        this.activeCamera = camera;
        this.logger.debug('Camera set as active');
    }
    /**
     * Add an entity to the scene
     */
    addEntity(entity) {
        if (this.entities.has(entity.id)) {
            this.logger.warn(`Entity with id ${entity.id} already exists`);
            return;
        }
        this.entities.set(entity.id, entity);
        this.scene.add(entity.object3D);
        this.logger.debug(`Entity ${entity.id} added to scene`);
    }
    /**
     * Remove an entity from the scene
     */
    removeEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) {
            this.logger.warn(`Entity with id ${entityId} not found`);
            return;
        }
        this.scene.remove(entity.object3D);
        this.entities.delete(entityId);
        this.logger.debug(`Entity ${entityId} removed from scene`);
    }
    /**
     * Get an entity by ID
     */
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
    /**
     * Get all entities in the scene
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    /**
     * Find entities by name
     */
    findEntitiesByName(name) {
        return Array.from(this.entities.values()).filter(entity => entity.name === name);
    }
    /**
     * Find entities by type
     */
    findEntitiesByType(type) {
        return Array.from(this.entities.values()).filter(entity => entity.type === type);
    }
    /**
     * Clear all entities from the scene
     */
    clearEntities() {
        for (const entity of this.entities.values()) {
            this.scene.remove(entity.object3D);
        }
        this.entities.clear();
        this.logger.debug('All entities cleared from scene');
    }
    /**
     * Set scene background color
     */
    setBackground(color) {
        this.scene.background = new THREE.Color(color);
    }
    /**
     * Set scene fog
     */
    setFog(color, near, far) {
        this.scene.fog = new THREE.Fog(color, near, far);
    }
    /**
     * Add ambient lighting to the scene
     */
    addAmbientLight(color, intensity = 0.5) {
        const light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);
        this.logger.debug('Ambient light added to scene');
        return light;
    }
    /**
     * Add directional lighting to the scene
     */
    addDirectionalLight(color, intensity = 1, position = new THREE.Vector3(5, 10, 5)) {
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.copy(position);
        light.castShadow = true;
        // Configure shadow properties
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 50;
        light.shadow.camera.left = -20;
        light.shadow.camera.right = 20;
        light.shadow.camera.top = 20;
        light.shadow.camera.bottom = -20;
        this.scene.add(light);
        this.logger.debug('Directional light added to scene');
        return light;
    }
    /**
     * Add point lighting to the scene
     */
    addPointLight(color, intensity = 1, position = new THREE.Vector3(0, 5, 0), distance = 100) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.copy(position);
        light.castShadow = true;
        this.scene.add(light);
        this.logger.debug('Point light added to scene');
        return light;
    }
    /**
     * Update scene (called each frame)
     */
    update() {
        // Update all entities that need per-frame updates
        for (const entity of this.entities.values()) {
            if (entity.update) {
                entity.update();
            }
        }
    }
    /**
     * Dispose of scene resources
     */
    dispose() {
        this.clearEntities();
        // Dispose of all objects in the scene
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry?.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                }
                else {
                    object.material?.dispose();
                }
            }
        });
        this.logger.debug('Scene disposed');
    }
}
/**
 * Create a basic scene entity
 */
export function createSceneEntity(id, name, type, object3D) {
    return {
        id,
        name,
        type,
        object3D,
    };
}
//# sourceMappingURL=Scene.js.map