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
 * Main engine class that orchestrates all engine systems
 */
export class Engine {
    constructor(config) {
        this.renderer = null;
        this.scene = null;
        this.inputManager = null;
        this.physicsWorld = null;
        this.audioEngine = null;
        this.networkManager = null;
        this.ecsWorld = null;
        this.uiManager = null;
        this.scriptingSystem = null;
        this.isInitialized = false;
        this.isRunning = false;
        this.animationId = null;
        /**
         * Main game loop
         */
        this.gameLoop = () => {
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
    async initialize() {
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
        }
        catch (error) {
            this.logger.error('Failed to initialize engine:', error);
            throw error;
        }
    }
    /**
     * Start the main game loop
     */
    start() {
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
    stop() {
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
    dispose() {
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
    async initializeRenderer() {
        this.renderer = new Renderer(this.config.canvas, this.logger);
        await this.renderer.initialize();
        this.logger.debug('Renderer initialized');
    }
    initializeScene() {
        if (!this.renderer) {
            throw new Error('Renderer must be initialized before scene');
        }
        this.scene = new Scene(this.renderer, this.logger);
        this.logger.debug('Scene initialized');
    }
    initializeInput() {
        if (!this.renderer) {
            throw new Error('Renderer must be initialized before input');
        }
        this.inputManager = new InputManager(this.renderer.domElement, this.logger);
        this.logger.debug('Input manager initialized');
    }
    async initializePhysics() {
        this.physicsWorld = new PhysicsWorld(this.logger);
        await this.physicsWorld.initialize();
        this.logger.debug('Physics world initialized');
    }
    async initializeAudio() {
        this.audioEngine = new AudioEngine(this.logger);
        await this.audioEngine.initialize();
        this.logger.debug('Audio engine initialized');
    }
    async initializeNetworking() {
        this.networkManager = new NetworkManager(this.logger);
        await this.networkManager.initialize();
        this.logger.debug('Network manager initialized');
    }
    initializeECS() {
        this.ecsWorld = new ECSWorld(this.logger);
        this.logger.debug('ECS world initialized');
    }
    initializeUI() {
        this.uiManager = new UIManager(this.logger);
        this.logger.debug('UI manager initialized');
    }
    initializeScripting() {
        this.scriptingSystem = new ScriptingSystem(this.logger);
        this.logger.debug('Scripting system initialized');
    }
    /**
     * Update all engine systems
     */
    update(deltaTime) {
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
    render() {
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
//# sourceMappingURL=Engine.js.map