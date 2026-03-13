import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { SceneEntity, createSceneEntity } from '../core/Scene';
import { PhysicsBody } from '../physics/PhysicsWorld';

/**
 * Basic example demonstrating the game engine capabilities
 */
export class BasicExample {
  private readonly engine: Engine;
  private cube: SceneEntity | null = null;
  private scene: any;
  private renderer: any;
  private input: any;
  private physics: any;
  private ecs: any;
  private ui: any;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  /**
   * Initialize the example
   */
  async initialize(): Promise<void> {
    console.log('🎮 Initializing BasicExample...');
    
    // Assign systems to class properties
    const { scene, renderer, input, physics, ecs, ui } = this.engine.systems;
    this.scene = scene;
    this.renderer = renderer;
    this.input = input;
    this.physics = physics;
    this.ecs = ecs;
    this.ui = ui;

    // Create HUD
    console.log('📊 Creating HUD...');
    ui.createHUD();

    // Create help overlay
    console.log('📖 Creating help overlay...');
    this.createHelpOverlay();

    // Set up camera
    console.log('📷 Setting up camera...');
    this.setupCamera();

    // Add lighting
    console.log('💡 Setting up lighting...');
    this.setupLighting();

    // Create basic scene objects
    console.log('🎯 Creating scene objects...');
    await this.createSceneObjects();

    // Set up input handling
    console.log('⌨️ Setting up input handling...');
    this.setupInput();

    // Create ECS entities
    console.log('🧩 Creating ECS entities...');
    this.createECSEntities();

    // Show welcome message
    setTimeout(() => {
      this.showWelcomeMessage();
    }, 1000);

    console.log('✅ Basic example initialized');
    console.log('📝 Note: HUD and scene updates will be handled by the main engine game loop');
  }

  private setupCamera(): void {
    const { scene } = this.engine.systems;

    // Create perspective camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    scene.setCamera(camera);
  }

  private setupLighting(): void {
    const { scene } = this.engine.systems;

    // Add ambient light
    scene.addAmbientLight(0x404040, 0.4);

    // Add directional light
    const directionalLight = scene.addDirectionalLight(
      0xffffff,
      1,
      new THREE.Vector3(10, 10, 5)
    );

    // Add point light for some dynamic lighting
    scene.addPointLight(0xff6b6b, 0.5, new THREE.Vector3(-3, 2, 0), 20);
  }

  private async createSceneObjects(): Promise<void> {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x808080,
      side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    const groundEntity = createSceneEntity(
      'ground',
      'Ground',
      'environment',
      ground
    );
    this.scene.addEntity(groundEntity);

    // Add physics to ground
    if (this.physics) {
      const groundBody = this.physics.createPlaneBody(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        0,
        ground
      );
      this.physics.addBody('ground', new PhysicsBody(groundBody, ground));
    }

    // Create spinning cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      shininess: 100 
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0.5, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;

    this.cube = createSceneEntity(
      'cube',
      'Spinning Cube',
      'prop',
      cube
    );
    this.scene.addEntity(this.cube);

    // Add physics to cube
    if (this.physics) {
      const cubeBody = this.physics.createBoxBody(
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(0, 0.5, 0),
        1,
        cube
      );
      this.physics.addBody('cube', new PhysicsBody(cubeBody, cube));
    }

    // Create some additional cubes for visual interest
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5) 
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 8
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const entity = createSceneEntity(
        `cube_${i}`,
        `Decor Cube ${i}`,
        'prop',
        mesh
      );
      this.scene.addEntity(entity);

      // Add physics
      if (this.physics) {
        const body = this.physics.createBoxBody(
          new THREE.Vector3(0.5, 0.5, 0.5),
          mesh.position.clone(),
          0.5,
          mesh
        );
        this.physics.addBody(`cube_${i}`, new PhysicsBody(body, mesh));
      }
    }
  }

  private setupInput(): void {
    // Register basic input actions
    this.input.registerAction({
      name: 'move_forward',
      type: 'keyboard',
      inputs: ['KeyW'],
      callback: () => {
        this.moveCamera(0, 0, -0.1);
      }
    });

    this.input.registerAction({
      name: 'move_backward',
      type: 'keyboard',
      inputs: ['KeyS'],
      callback: () => {
        this.moveCamera(0, 0, 0.1);
      }
    });

    this.input.registerAction({
      name: 'move_left',
      type: 'keyboard',
      inputs: ['KeyA'],
      callback: () => {
        this.moveCamera(-0.1, 0, 0);
      }
    });

    this.input.registerAction({
      name: 'move_right',
      type: 'keyboard',
      inputs: ['KeyD'],
      callback: () => {
        this.moveCamera(0.1, 0, 0);
      }
    });

    this.input.registerAction({
      name: 'jump',
      type: 'keyboard',
      inputs: ['Space'],
      callback: () => {
        this.jumpCube();
      }
    });

    // Mouse controls
    this.input.registerAction({
      name: 'orbit_camera',
      type: 'mouse',
      inputs: ['button0'],
      callback: (event) => {
        if (event.type === 'mousedown') {
          this.input.setCursorLock(true);
        }
      }
    });

    this.input.registerAction({
      name: 'release_camera',
      type: 'keyboard',
      inputs: ['Escape'],
      callback: () => {
        this.input.setCursorLock(false);
      }
    });
  }

  private createECSEntities(): void {
    // Import ECS components and systems
    import('../ecs/ECSWorld').then(({ Component, System }) => {
      // Create a simple rotating component
      class RotateComponent extends Component {
        public speed: number;
        public axis: THREE.Vector3;

        constructor(speed = 1, axis = new THREE.Vector3(0, 1, 0)) {
          super();
          this.speed = speed;
          this.axis = axis;
        }
      }

      // Create a simple rotation system
      class RotationSystem extends System {
        update(deltaTime: number): void {
          if (!this.world) return;

          const entities = this.world.getEntitiesWithComponent(RotateComponent);
          
          for (const entity of entities) {
            const rotateComp = this.world.getComponent(entity.id, RotateComponent);
            if (rotateComp && entity.active) {
              // Find the visual component and rotate it
              const visualComp = this.world.getComponent(entity.id, VisualComponent);
              if (visualComp && visualComp.mesh) {
                visualComp.mesh.rotateOnAxis(rotateComp.axis, rotateComp.speed * deltaTime);
              }
            }
          }
        }
      }

      // Create a visual component for ECS
      class VisualComponent extends Component {
        public mesh: THREE.Object3D;

        constructor(mesh: THREE.Object3D) {
          super();
          this.mesh = mesh;
        }
      }

      // Add rotation system to world
      this.ecs.addSystem(new RotationSystem());

      // Create ECS entity for the spinning cube
      const entity = this.ecs.createEntity('spinning_cube');
      this.ecs.addComponent(entity.id, new RotateComponent(2, new THREE.Vector3(0, 1, 0)));
      
      if (this.cube) {
        this.ecs.addComponent(entity.id, new VisualComponent(this.cube.object3D));
      }
    }).catch(error => {
      console.warn('⚠️ Failed to load ECS components:', error);
    });
  }

  private moveCamera(x: number, y: number, z: number): void {
    if (this.scene.camera) {
      const moveVector = new THREE.Vector3(x, y, z);
      moveVector.applyQuaternion(this.scene.camera.quaternion);
      this.scene.camera.position.add(moveVector);
    }
  }

  private jumpCube(): void {
    if (this.physics && this.cube) {
      const body = this.physics.getBody('cube');
      if (body) {
        body.body.velocity.y = 10;
      }
    }
  }

  private createHelpOverlay(): void {
    // Create help panel
    const helpPanel = this.ui.createElement({
      id: 'help-panel',
      type: 'panel',
      x: 10,
      y: 10,
      width: 250,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #00ff00',
        borderRadius: '10px',
        padding: '15px',
        color: 'white',
        fontSize: '14px',
        fontFamily: 'monospace',
        pointerEvents: 'auto',
      },
    });

    // Title
    this.ui.createElement({
      id: 'help-title',
      type: 'text',
      x: 20,
      y: 20,
      text: '🎮 GAME ENGINE CONTROLS',
      style: {
        color: '#00ff00',
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      },
    });

    // Controls list
    const controls = [
      'W/A/S/D - Move camera',
      'SPACE - Make cube jump',
      'Mouse Click - Lock camera',
      'ESC - Release camera',
      'H - Toggle this help',
    ];

    controls.forEach((control, index) => {
      this.ui.createElement({
        id: `help-control-${index}`,
        type: 'text',
        x: 20,
        y: 50 + index * 20,
        text: control,
        style: {
          color: '#ffffff',
          fontSize: '12px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
        },
      });
    });

    // Status indicator
    this.ui.createElement({
      id: 'status-indicator',
      type: 'text',
      x: 20,
      y: 170,
      text: '✅ Engine Running',
      style: {
        color: '#00ff00',
        fontSize: '12px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      },
    });

    // Add toggle help action
    this.input.registerAction({
      name: 'toggle_help',
      type: 'keyboard',
      inputs: ['KeyH'],
      callback: () => {
        const panel = this.ui.getElement('help-panel');
        if (panel) {
          if (panel.visible) {
            panel.hide();
          } else {
            panel.show();
          }
        }
      }
    });
  }

  private showWelcomeMessage(): void {
    this.ui.showNotification(
      '🎮 Welcome to the Game Engine! Press H to toggle help',
      5000
    );
  }
}