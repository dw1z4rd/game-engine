import { Time } from './Time';
import { Logger } from './Logger';
import { Renderer } from '../rendering/Renderer';
import { Scene } from './Scene';
import { InputManager } from '../input/InputManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { AudioEngine } from '../audio/AudioEngine';
import { NetworkManager } from '../networking/NetworkManager';
import { AssetManager } from '../assets/AssetManager';
import { ECSWorld } from '../ecs/ECSWorld';
import { UIManager } from '../ui/UIManager';
import { ScriptingSystem } from '../scripting/ScriptingSystem';

/**
 * Configuration options for the engine
 */
export interface EngineConfig {
  canvas: HTMLCanvasElement;
  enablePhysics?: boolean;
  enableAudio?: boolean;
  enableNetworking?: boolean;
  targetFPS?: number;
  enableDebug?: boolean;
}

/**
 * Main engine class that orchestrates all engine systems
 */
export class Engine {
  private readonly config: Required<EngineConfig>;
  private readonly time: Time;
  private readonly logger: Logger;
  private readonly assetManager: AssetManager;
  private renderer: Renderer | null = null;
  private scene: Scene | null = null;
  private inputManager: InputManager | null = null;
  private physicsWorld: PhysicsWorld | null = null;
  private audioEngine: AudioEngine | null = null;
  private networkManager: NetworkManager | null = null;
  private ecsWorld: ECSWorld | null = null;
  private uiManager: UIManager | null = null;
  private scriptingSystem: ScriptingSystem | null = null;
  
  private isInitialized = false;
  private isRunning = false;
  private animationId: number | null = null;

  constructor(config: EngineConfig) {
    this.config = {
      enablePhysics: true,
      enableAudio: true,
      enableNetworking: false,
      targetFPS: 60,
      enableDebug: false,
      ...config,
    };

    this.time = new Time();
    this.logger = new Logger(this.config.enableDebug);
    this.assetManager = new AssetManager(this.logger);
  }

  /**
   * Initialize all engine systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Engine already initialized');
      return;
    }

    try {
      this.logger.info('Initializing engine...');

      // Initialize core systems
      await this.initializeRenderer();
      this.initializeScene();
      this.initializeInput();
      this.initializeECS();

      // Initialize optional systems
      if (this.config.enablePhysics) {
        await this.initializePhysics();
      }

      if (this.config.enableAudio) {
        await this.initializeAudio();
      }

      if (this.config.enableNetworking) {
        await this.initializeNetworking();
      }

      // Initialize UI and scripting systems
      this.initializeUI();
      this.initializeScripting();

      this.isInitialized = true;
      this.logger.info('Engine initialization complete');

    } catch (error) {
      this.logger.error('Failed to initialize engine:', error);
      throw error;
    }
  }

  /**
   * Start the main game loop
   */
  start(): void {
    if (!this.isInitialized) {
      throw new Error('Engine must be initialized before starting');
    }

    if (this.isRunning) {
      this.logger.warn('Engine already running');
      return;
    }

    this.isRunning = true;
    this.time.start();
    this.logger.info('Starting engine...');

    this.gameLoop();
  }

  /**
   * Stop the engine
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.time.stop();

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.logger.info('Engine stopped');
  }

  /**
   * Dispose of all engine resources
   */
  dispose(): void {
    this.stop();

    // Dispose all systems
    this.physicsWorld?.dispose();
    this.audioEngine?.dispose();
    this.networkManager?.dispose();
    this.renderer?.dispose();
    this.inputManager?.dispose();
    this.assetManager.dispose();
    this.uiManager?.dispose();
    this.scriptingSystem?.dispose();

    this.logger.info('Engine disposed');
  }

  /**
   * Get engine subsystems
   */
  get systems() {
    return {
      time: this.time,
      logger: this.logger,
      renderer: this.renderer,
      scene: this.scene,
      input: this.inputManager,
      physics: this.physicsWorld,
      audio: this.audioEngine,
      networking: this.networkManager,
      assets: this.assetManager,
      ecs: this.ecsWorld,
      ui: this.uiManager,
      scripting: this.scriptingSystem,
    };
  }

  private async initializeRenderer(): Promise<void> {
    this.renderer = new Renderer(this.config.canvas, this.logger);
    await this.renderer.initialize();
    this.logger.debug('Renderer initialized');
  }

  private initializeScene(): void {
    if (!this.renderer) {
      throw new Error('Renderer must be initialized before scene');
    }
    this.scene = new Scene(this.renderer, this.logger);
    this.logger.debug('Scene initialized');
  }

  private initializeInput(): void {
    if (!this.renderer) {
      throw new Error('Renderer must be initialized before input');
    }
    this.inputManager = new InputManager(this.renderer.domElement, this.logger);
    this.inputManager.initialize();
    this.logger.debug('Input manager initialized');
  }

  private async initializePhysics(): Promise<void> {
    this.physicsWorld = new PhysicsWorld(this.logger);
    await this.physicsWorld.initialize();
    this.logger.debug('Physics world initialized');
  }

  private async initializeAudio(): Promise<void> {
    this.audioEngine = new AudioEngine(this.logger);
    await this.audioEngine.initialize();
    this.logger.debug('Audio engine initialized');
  }

  private async initializeNetworking(): Promise<void> {
    this.networkManager = new NetworkManager(this.logger);
    await this.networkManager.initialize();
    this.logger.debug('Network manager initialized');
  }

  private initializeECS(): void {
    this.ecsWorld = new ECSWorld(this.logger);
    this.logger.debug('ECS world initialized');
  }

  private initializeUI(): void {
    this.uiManager = new UIManager(this.logger);
    this.logger.debug('UI manager initialized');
  }

  private initializeScripting(): void {
    this.scriptingSystem = new ScriptingSystem(this.logger);
    this.logger.debug('Scripting system initialized');
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.isRunning) {
      return;
    }

    // Update time
    this.time.update();

    // Update all systems
    this.update(this.time.deltaTime);

    // Render frame
    this.render();

    // Schedule next frame
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update all engine systems
   */
  private update(deltaTime: number): void {
    // Update input first
    this.inputManager?.update();

    // Update physics
    this.physicsWorld?.update(deltaTime);

    // Update ECS systems
    this.ecsWorld?.update(deltaTime);

    // Update audio
    this.audioEngine?.update();

    // Update networking
    this.networkManager?.update();

    // Update UI
    this.uiManager?.update(deltaTime);

    // Update scripting system
    this.scriptingSystem?.update(deltaTime);
  }

  /**
   * Render the current frame
   */
  private render(): void {
    if (!this.renderer || !this.scene) {
      return;
    }

    const camera = this.scene.camera;
    if (!camera) {
      this.logger.warn('No camera set in scene, skipping render');
      return;
    }

    this.renderer.render(this.scene.threeScene, camera);
  }
}