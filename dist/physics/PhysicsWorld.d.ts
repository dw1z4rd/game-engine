import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Logger } from '../core/Logger';
/**
 * Physics body wrapper
 */
export declare class PhysicsBody {
    readonly body: CANNON.Body;
    readonly mesh?: THREE.Object3D;
    active: boolean;
    constructor(body: CANNON.Body, mesh?: THREE.Object3D);
    /**
     * Sync physics body with visual mesh
     */
    syncVisual(): void;
}
/**
 * Raycast result
 */
export interface RaycastResult {
    hit: boolean;
    body?: CANNON.Body;
    distance?: number;
    point?: THREE.Vector3;
    normal?: THREE.Vector3;
}
/**
 * Physics world configuration
 */
export interface PhysicsWorldConfig {
    gravity?: THREE.Vector3;
    broadphase?: 'naive' | 'sap' | 'grid';
    solver?: 'gs' | 'split';
    allowSleep?: boolean;
}
/**
 * Cannon.js physics world wrapper
 */
export declare class PhysicsWorld {
    private readonly logger;
    private readonly config;
    private world;
    private bodies;
    private isInitialized;
    constructor(logger: Logger, config?: PhysicsWorldConfig);
    /**
     * Get the Cannon.js world
     */
    get cannonWorld(): CANNON.World | null;
    /**
     * Initialize physics world
     */
    initialize(): Promise<void>;
    /**
     * Update physics simulation
     */
    update(deltaTime: number): void;
    /**
     * Add a physics body to the world
     */
    addBody(id: string, body: PhysicsBody): void;
    /**
     * Remove a physics body from the world
     */
    removeBody(id: string): void;
    /**
     * Get a physics body by ID
     */
    getBody(id: string): PhysicsBody | undefined;
    /**
     * Get all physics bodies
     */
    getAllBodies(): PhysicsBody[];
    /**
     * Create a box physics body
     */
    createBoxBody(size: THREE.Vector3, position?: THREE.Vector3, mass?: number, mesh?: THREE.Object3D): CANNON.Body;
    /**
     * Create a sphere physics body
     */
    createSphereBody(radius: number, position?: THREE.Vector3, mass?: number, mesh?: THREE.Object3D): CANNON.Body;
    /**
     * Create a cylinder physics body
     */
    createCylinderBody(radiusTop: number, radiusBottom: number, height: number, position?: THREE.Vector3, mass?: number, mesh?: THREE.Object3D): CANNON.Body;
    /**
     * Create a plane physics body
     */
    createPlaneBody(normal?: THREE.Vector3, position?: THREE.Vector3, mesh?: THREE.Object3D): CANNON.Body;
    /**
     * Create a terrain physics body from height data
     */
    createTerrainBody(heightData: number[][], width: number, height: number, position?: THREE.Vector3, scale?: THREE.Vector3): CANNON.Body;
    /**
     * Perform a raycast
     */
    raycast(from: THREE.Vector3, to: THREE.Vector3, options?: {
        collisionFilterMask?: number;
        collisionFilterGroup?: number;
    }): RaycastResult;
    /**
     * Set world gravity
     */
    setGravity(gravity: THREE.Vector3): void;
    /**
     * Enable/disable contact materials
     */
    setContactMaterial(materialA: CANNON.Material, materialB: CANNON.Material, options: CANNON.ContactMaterialOptions): void;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): any;
    private createBody;
    /**
     * Dispose of physics world
     */
    dispose(): void;
}
//# sourceMappingURL=PhysicsWorld.d.ts.map