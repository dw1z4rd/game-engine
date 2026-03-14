import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Logger } from '../core/Logger';

/**
 * Physics body wrapper
 */
export class PhysicsBody {
  public readonly body: CANNON.Body;
  public readonly mesh?: THREE.Object3D;
  public active = true;

  constructor(body: CANNON.Body, mesh?: THREE.Object3D) {
    this.body = body;
    this.mesh = mesh;
  }

  /**
   * Sync physics body with visual mesh
   */
  syncVisual(): void {
    if (!this.mesh) return;

    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
  }
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
export class PhysicsWorld {
  private readonly logger: Logger;
  private readonly config: Required<PhysicsWorldConfig>;
  
  private world: CANNON.World | null = null;
  private bodies = new Map<string, PhysicsBody>();
  private isInitialized = false;

  constructor(logger: Logger, config: PhysicsWorldConfig = {}) {
    this.logger = logger;
    this.config = {
      gravity: new THREE.Vector3(0, -9.81, 0),
      broadphase: 'sap',
      solver: 'gs',
      allowSleep: true,
      ...config,
    };
  }

  /**
   * Get the Cannon.js world
   */
  get cannonWorld(): CANNON.World | null {
    return this.world;
  }

  /**
   * Initialize physics world
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Physics world already initialized');
      return;
    }

    try {
      // Create Cannon.js world
      this.world = new CANNON.World();

      // Configure world
      this.world.gravity.set(
        this.config.gravity.x,
        this.config.gravity.y,
        this.config.gravity.z
      );

      // Set broadphase
      switch (this.config.broadphase) {
        case 'naive':
          this.world.broadphase = new CANNON.NaiveBroadphase();
          break;
        case 'sap':
          this.world.broadphase = new CANNON.SAPBroadphase(this.world);
          break;
        case 'grid':
          this.world.broadphase = new CANNON.GridBroadphase();
          break;
      }

      // Set solver
      this.world.solver = this.config.solver === 'split' 
        ? new CANNON.SplitSolver(new CANNON.GSSolver())
        : new CANNON.GSSolver();

      // Enable sleeping
      this.world.allowSleep = this.config.allowSleep;

      this.isInitialized = true;
      this.logger.info('Physics world initialized');
      this.logger.debug(`Gravity: ${this.config.gravity.x}, ${this.config.gravity.y}, ${this.config.gravity.z}`);

    } catch (error) {
      this.logger.error('Failed to initialize physics world:', error);
      throw error;
    }
  }

  /**
   * Update physics simulation
   */
  update(deltaTime: number): void {
    if (!this.isInitialized || !this.world) return;

    // Step physics simulation
    this.world.step(deltaTime);

    // Sync visual meshes with physics bodies
    for (const body of this.bodies.values()) {
      if (body.active) {
        body.syncVisual();
      }
    }
  }

  /**
   * Add a physics body to the world
   */
  addBody(id: string, body: PhysicsBody): void {
    if (!this.world) {
      this.logger.error('Physics world not initialized');
      return;
    }

    if (this.bodies.has(id)) {
      this.logger.warn(`Physics body with id ${id} already exists`);
      return;
    }

    this.world.addBody(body.body);
    this.bodies.set(id, body);
    this.logger.debug(`Physics body added: ${id}`);
  }

  /**
   * Remove a physics body from the world
   */
  removeBody(id: string): void {
    if (!this.world) return;

    const body = this.bodies.get(id);
    if (!body) {
      this.logger.warn(`Physics body with id ${id} not found`);
      return;
    }

    this.world.removeBody(body.body);
    this.bodies.delete(id);
    this.logger.debug(`Physics body removed: ${id}`);
  }

  /**
   * Get a physics body by ID
   */
  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  /**
   * Get all physics bodies
   */
  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  /**
   * Create a box physics body
   */
  createBoxBody(
    size: THREE.Vector3,
    position = new THREE.Vector3(),
    mass = 0,
    mesh?: THREE.Object3D
  ): CANNON.Body {
    const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    return this.createBody(shape, position, mass, mesh);
  }

  /**
   * Create a sphere physics body
   */
  createSphereBody(
    radius: number,
    position = new THREE.Vector3(),
    mass = 0,
    mesh?: THREE.Object3D
  ): CANNON.Body {
    const shape = new CANNON.Sphere(radius);
    return this.createBody(shape, position, mass, mesh);
  }

  /**
   * Create a cylinder physics body
   */
  createCylinderBody(
    radiusTop: number,
    radiusBottom: number,
    height: number,
    position = new THREE.Vector3(),
    mass = 0,
    mesh?: THREE.Object3D
  ): CANNON.Body {
    const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 8);
    return this.createBody(shape, position, mass, mesh);
  }

  /**
   * Create a plane physics body
   */
  createPlaneBody(
    normal = new THREE.Vector3(0, 1, 0),
    position = new THREE.Vector3(),
    mesh?: THREE.Object3D
  ): CANNON.Body {
    const shape = new CANNON.Plane();
    const body = this.createBody(shape, position, 0, mesh);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    return body;
  }

  /**
   * Create a terrain physics body from height data
   */
  createTerrainBody(
    heightData: number[][],
    width: number,
    height: number,
    position = new THREE.Vector3(),
    scale = new THREE.Vector3(1, 1, 1)
  ): CANNON.Body {
    const shape = new CANNON.Heightfield(heightData, {
      elementSize: width / heightData.length,
    });
    
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    
    // Position and rotate the heightfield
    body.position.set(position.x, position.y, position.z);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    
    // Apply scale using transform (Mat4 is not available in cannon-es)
    // For cannon-es, we need to handle scaling differently
    // The heightfield will be scaled by adjusting the elementSize
    const adjustedElementSize = (width / heightData.length) * Math.max(scale.x, scale.z);
    (shape as any).elementSize = adjustedElementSize;
    
    return body;
  }

  /**
   * Perform a raycast
   */
  raycast(
    from: THREE.Vector3,
    to: THREE.Vector3,
    options: { collisionFilterMask?: number; collisionFilterGroup?: number } = {}
  ): RaycastResult {
    if (!this.world) {
      return { hit: false };
    }

    const fromVec = new CANNON.Vec3(from.x, from.y, from.z);
    const toVec = new CANNON.Vec3(to.x, to.y, to.z);
    
    const result = new CANNON.RaycastResult();
    this.world.raycastClosest(fromVec, toVec, options, result);
    
    if (result.hasHit) {
      return {
        hit: true,
        body: result.body,
        distance: result.distance,
        point: new THREE.Vector3(result.hitPointWorld!.x, result.hitPointWorld!.y, result.hitPointWorld!.z),
        normal: new THREE.Vector3(result.hitNormalWorld!.x, result.hitNormalWorld!.y, result.hitNormalWorld!.z),
      };
    }
    
    return { hit: false };
  }

  /**
   * Set world gravity
   */
  setGravity(gravity: THREE.Vector3): void {
    if (!this.world) return;

    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
    this.logger.debug(`Gravity set to: ${gravity.x}, ${gravity.y}, ${gravity.z}`);
  }

  /**
   * Enable/disable contact materials
   */
  setContactMaterial(materialA: CANNON.Material, materialB: CANNON.Material, options: CANNON.ContactMaterialOptions): void {
    if (!this.world) return;

    const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, options);
    this.world.addContactMaterial(contactMaterial);
    this.logger.debug('Contact material added');
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): any {
    if (!this.world) return null;

    return {
      bodies: this.world.bodies.length,
      constraints: this.world.constraints.length,
      contactMaterials: this.world.contactmaterials.length,
      substeps: (this.world as any).substeps || 0,
      defaultContactMaterial: this.world.defaultContactMaterial,
    };
  }

  private createBody(
    shape: CANNON.Shape,
    position: THREE.Vector3,
    mass: number,
    mesh?: THREE.Object3D
  ): CANNON.Body {
    const body = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape,
    });

    // Store mesh reference for visual syncing
    if (mesh) {
      const physicsBody = new PhysicsBody(body, mesh);
      (body as any).userData = { physicsBody };
    }

    return body;
  }

  /**
   * Dispose of physics world
   */
  dispose(): void {
    // Remove all bodies
    for (const [id, body] of this.bodies) {
      if (this.world) {
        this.world.removeBody(body.body);
      }
    }
    this.bodies.clear();

    // Dispose world
    if (this.world) {
      // Clear all constraints
      for (const constraint of this.world.constraints) {
        if (constraint.bodyA) this.world.removeBody(constraint.bodyA);
        if (constraint.bodyB) this.world.removeBody(constraint.bodyB);
      }
      
      // Clear all contact materials
      for (const contactMaterial of this.world.contactmaterials) {
        this.world.removeContactMaterial(contactMaterial);
      }
      
      // Clear arrays and references
      this.world.bodies.length = 0;
      this.world.constraints.length = 0;
      this.world.contactmaterials.length = 0;
      this.world.defaultContactMaterial = null as any;
      this.world.solver = null as any;
      this.world.broadphase = null as any;
      this.world = null;
    }

    this.isInitialized = false;
    this.logger.debug('Physics world disposed');
  }
}