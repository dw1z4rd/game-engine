import { Logger } from '../core/Logger';
/**
 * Event data interface
 */
export interface GameEvent {
    type: string;
    data?: any;
    timestamp: number;
    source?: string;
}
/**
 * Event listener interface
 */
export interface EventListener {
    type: string;
    callback: (event: GameEvent) => void;
    once?: boolean;
    priority?: number;
}
/**
 * Script context for executing game logic
 */
export interface ScriptContext {
    entityId: number;
    deltaTime: number;
    time: number;
    events: GameEvent[];
    variables: Map<string, any>;
}
/**
 * Base script class
 */
export declare abstract class GameScript {
    readonly name: string;
    enabled: boolean;
    context: ScriptContext | null;
    protected logger?: Logger;
    constructor(name: string, logger?: Logger);
    /**
     * Called when script is initialized
     */
    abstract initialize(context: ScriptContext): void;
    /**
     * Called each frame
     */
    abstract update(context: ScriptContext): void;
    /**
     * Called when script receives an event
     */
    onEvent?(event: GameEvent): void;
    /**
     * Called when script is destroyed
     */
    destroy?(): void;
}
/**
 * Event-driven scripting system
 */
export declare class ScriptingSystem {
    private readonly logger;
    private listeners;
    private scripts;
    private globalVariables;
    private eventQueue;
    private maxQueueSize;
    constructor(logger: Logger);
    /**
     * Register an event listener
     */
    addListener(type: string, callback: (event: GameEvent) => void, options?: {
        once?: boolean;
        priority?: number;
    }): void;
    /**
     * Remove an event listener
     */
    removeListener(type: string, callback: (event: GameEvent) => void): void;
    /**
     * Emit an event
     */
    emit(type: string, data?: any, source?: string): void;
    /**
     * Emit an event immediately (synchronous)
     */
    emitImmediate(type: string, data?: any, source?: string): void;
    /**
     * Register a script
     */
    registerScript(script: GameScript): void;
    /**
     * Get a script by name
     */
    getScript(name: string): GameScript | undefined;
    /**
     * Remove a script
     */
    removeScript(name: string): void;
    /**
     * Create and initialize a script
     */
    createScript<T extends GameScript>(ScriptClass: new (name: string) => T, name: string, context: ScriptContext): T;
    /**
     * Set a global variable
     */
    setGlobalVariable(key: string, value: any): void;
    /**
     * Get a global variable
     */
    getGlobalVariable(key: string): any;
    /**
     * Process all queued events
     */
    processEvents(): void;
    /**
     * Update all scripts
     */
    update(deltaTime: number): void;
    private processEvent;
    /**
     * Clear all events and scripts
     */
    clear(): void;
    /**
     * Get system statistics
     */
    getStats(): any;
    /**
     * Dispose of scripting system
     */
    dispose(): void;
}
/**
 * Common game event types
 */
export declare const GameEvents: {
    readonly ENTITY_CREATED: "entity_created";
    readonly ENTITY_DESTROYED: "entity_destroyed";
    readonly ENTITY_DAMAGED: "entity_damaged";
    readonly ENTITY_HEALED: "entity_healed";
    readonly ENTITY_MOVED: "entity_moved";
    readonly ENTITY_DIED: "entity_died";
    readonly PLAYER_SPAWN: "player_spawn";
    readonly PLAYER_DIED: "player_died";
    readonly PLAYER_RESPAWN: "player_respawn";
    readonly PLAYER_SCORE_CHANGED: "player_score_changed";
    readonly INPUT_PRESSED: "input_pressed";
    readonly INPUT_RELEASED: "input_released";
    readonly MOUSE_CLICKED: "mouse_clicked";
    readonly MOUSE_MOVED: "mouse_moved";
    readonly COLLISION_ENTER: "collision_enter";
    readonly COLLISION_EXIT: "collision_exit";
    readonly COLLISION_STAY: "collision_stay";
    readonly GAME_STARTED: "game_started";
    readonly GAME_PAUSED: "game_paused";
    readonly GAME_RESUMED: "game_resumed";
    readonly GAME_ENDED: "game_ended";
    readonly LEVEL_COMPLETED: "level_completed";
    readonly LEVEL_FAILED: "level_failed";
    readonly SOUND_PLAYED: "sound_played";
    readonly SOUND_STOPPED: "sound_stopped";
    readonly PLAYER_CONNECTED: "player_connected";
    readonly PLAYER_DISCONNECTED: "player_disconnected";
    readonly DATA_RECEIVED: "data_received";
    readonly DATA_SENT: "data_sent";
    readonly CUSTOM: "custom";
};
/**
 * Example script implementations
 */
/**
 * Simple movement script
 */
export declare class MovementScript extends GameScript {
    private speed;
    private direction;
    constructor(name?: string, logger?: Logger);
    initialize(context: ScriptContext): void;
    update(context: ScriptContext): void;
    setSpeed(speed: number): void;
    setDirection(x: number, y: number, z: number): void;
}
/**
 * Health management script
 */
export declare class HealthScript extends GameScript {
    private maxHealth;
    private currentHealth;
    constructor(name?: string, maxHealth?: number);
    initialize(context: ScriptContext): void;
    update(context: ScriptContext): void;
    onEvent(event: GameEvent): void;
    takeDamage(amount: number): void;
    heal(amount: number): void;
    getHealth(): number;
    getMaxHealth(): number;
}
/**
 * Animation controller script
 */
export declare class AnimationScript extends GameScript {
    private animations;
    private currentAnimation;
    constructor(name?: string);
    initialize(context: ScriptContext): void;
    update(context: ScriptContext): void;
    playAnimation(name: string): void;
    stopAnimation(): void;
}
//# sourceMappingURL=ScriptingSystem.d.ts.map