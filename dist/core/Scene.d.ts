import * as THREE from 'three';
import { Renderer } from '../rendering/Renderer';
import { Logger } from './Logger';
/**
 * Scene management system for organizing 3D scenes
 */
export declare class Scene {
    private readonly renderer;
    private readonly logger;
    private readonly scene;
    private entities;
    private activeCamera;
    constructor(renderer: Renderer, logger: Logger);
    /**
     * Get the Three.js scene object
     */
    get threeScene(): THREE.Scene;
    /**
     * Get the active camera
     */
    get camera(): THREE.Camera | null;
    /**
     * Set the active camera
     */
    setCamera(camera: THREE.Camera): void;
    /**
     * Add an entity to the scene
     */
    addEntity(entity: SceneEntity): void;
    /**
     * Remove an entity from the scene
     */
    removeEntity(entityId: string): void;
    /**
     * Get an entity by ID
     */
    getEntity(entityId: string): SceneEntity | undefined;
    /**
     * Get all entities in the scene
     */
    getAllEntities(): SceneEntity[];
    /**
     * Find entities by name
     */
    findEntitiesByName(name: string): SceneEntity[];
    /**
     * Find entities by type
     */
    findEntitiesByType(type: string): SceneEntity[];
    /**
     * Clear all entities from the scene
     */
    clearEntities(): void;
    /**
     * Set scene background color
     */
    setBackground(color: string | number): void;
    /**
     * Set scene fog
     */
    setFog(color: string | number, near: number, far: number): void;
    /**
     * Add ambient lighting to the scene
     */
    addAmbientLight(color: string | number, intensity?: number): THREE.AmbientLight;
    /**
     * Add directional lighting to the scene
     */
    addDirectionalLight(color: string | number, intensity?: number, position?: THREE.Vector3): THREE.DirectionalLight;
    /**
     * Add point lighting to the scene
     */
    addPointLight(color: string | number, intensity?: number, position?: THREE.Vector3, distance?: number): THREE.PointLight;
    /**
     * Update scene (called each frame)
     */
    update(): void;
    /**
     * Dispose of scene resources
     */
    dispose(): void;
}
/**
 * Interface for scene entities
 */
export interface SceneEntity {
    /** Unique identifier */
    id: string;
    /** Human-readable name */
    name: string;
    /** Entity type for categorization */
    type: string;
    /** Three.js object 3D */
    object3D: THREE.Object3D;
    /** Optional update function called each frame */
    update?(): void;
    /** Optional dispose function for cleanup */
    dispose?(): void;
}
/**
 * Create a basic scene entity
 */
export declare function createSceneEntity(id: string, name: string, type: string, object3D: THREE.Object3D): SceneEntity;
//# sourceMappingURL=Scene.d.ts.map