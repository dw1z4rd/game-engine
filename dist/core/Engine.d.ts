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
export declare class Engine {
    private readonly config;
    private readonly time;
    private readonly logger;
    private readonly assetManager;
    private renderer;
    private scene;
    private inputManager;
    private physicsWorld;
    private audioEngine;
    private networkManager;
    private ecsWorld;
    private uiManager;
    private scriptingSystem;
    private isInitialized;
    private isRunning;
    private animationId;
    constructor(config: EngineConfig);
    /**
     * Initialize all engine systems
     */
    initialize(): Promise<void>;
    /**
     * Start the main game loop
     */
    start(): void;
    /**
     * Stop the engine
     */
    stop(): void;
    /**
     * Dispose of all engine resources
     */
    dispose(): void;
    /**
     * Get engine subsystems
     */
    get systems(): {
        time: Time;
        logger: Logger;
        renderer: Renderer;
        scene: Scene;
        input: InputManager;
        physics: PhysicsWorld;
        audio: AudioEngine;
        networking: NetworkManager;
        assets: AssetManager;
        ecs: ECSWorld;
        ui: UIManager;
        scripting: ScriptingSystem;
    };
    private initializeRenderer;
    private initializeScene;
    private initializeInput;
    private initializePhysics;
    private initializeAudio;
    private initializeNetworking;
    private initializeECS;
    private initializeUI;
    private initializeScripting;
    /**
     * Main game loop
     */
    private gameLoop;
    /**
     * Update all engine systems
     */
    private update;
    /**
     * Render the current frame
     */
    private render;
}
//# sourceMappingURL=Engine.d.ts.map