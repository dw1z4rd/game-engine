import * as THREE from 'three';
/**
 * Base script class
 */
export class GameScript {
    constructor(name, logger) {
        this.enabled = true;
        this.context = null;
        this.name = name;
        this.logger = logger;
    }
}
/**
 * Event-driven scripting system
 */
export class ScriptingSystem {
    constructor(logger) {
        this.listeners = new Map();
        this.scripts = new Map();
        this.globalVariables = new Map();
        this.eventQueue = [];
        this.maxQueueSize = 1000;
        this.logger = logger;
    }
    /**
     * Register an event listener
     */
    addListener(type, callback, options = {}) {
        const listener = {
            type,
            callback,
            once: options.once,
            priority: options.priority || 0,
        };
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        const listeners = this.listeners.get(type);
        listeners.push(listener);
        // Sort by priority (higher priority first)
        listeners.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.logger.debug(`Event listener added: ${type}`);
    }
    /**
     * Remove an event listener
     */
    removeListener(type, callback) {
        const listeners = this.listeners.get(type);
        if (listeners) {
            const index = listeners.findIndex(l => l.callback === callback);
            if (index !== -1) {
                listeners.splice(index, 1);
                this.logger.debug(`Event listener removed: ${type}`);
            }
        }
    }
    /**
     * Emit an event
     */
    emit(type, data, source) {
        const event = {
            type,
            data,
            timestamp: performance.now(),
            source,
        };
        this.eventQueue.push(event);
        // Limit queue size
        if (this.eventQueue.length > this.maxQueueSize) {
            this.eventQueue.shift();
        }
        this.logger.debug(`Event emitted: ${type}`);
    }
    /**
     * Emit an event immediately (synchronous)
     */
    emitImmediate(type, data, source) {
        const event = {
            type,
            data,
            timestamp: performance.now(),
            source,
        };
        this.processEvent(event);
    }
    /**
     * Register a script
     */
    registerScript(script) {
        this.scripts.set(script.name, script);
        this.logger.debug(`Script registered: ${script.name}`);
    }
    /**
     * Get a script by name
     */
    getScript(name) {
        return this.scripts.get(name);
    }
    /**
     * Remove a script
     */
    removeScript(name) {
        const script = this.scripts.get(name);
        if (script) {
            script.destroy?.();
            this.scripts.delete(name);
            this.logger.debug(`Script removed: ${name}`);
        }
    }
    /**
     * Create and initialize a script
     */
    createScript(ScriptClass, name, context) {
        const script = new ScriptClass(name);
        script.context = context;
        script.initialize(context);
        this.registerScript(script);
        return script;
    }
    /**
     * Set a global variable
     */
    setGlobalVariable(key, value) {
        this.globalVariables.set(key, value);
    }
    /**
     * Get a global variable
     */
    getGlobalVariable(key) {
        return this.globalVariables.get(key);
    }
    /**
     * Process all queued events
     */
    processEvents() {
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.processEvent(event);
        }
    }
    /**
     * Update all scripts
     */
    update(deltaTime) {
        // Process events first
        this.processEvents();
        // Update all scripts
        for (const script of this.scripts.values()) {
            if (script.enabled && script.context) {
                script.context.deltaTime = deltaTime;
                script.update(script.context);
            }
        }
    }
    processEvent(event) {
        const listeners = this.listeners.get(event.type);
        if (!listeners)
            return;
        // Create a copy to avoid issues with listeners being removed during iteration
        const listenersCopy = [...listeners];
        for (let i = 0; i < listenersCopy.length; i++) {
            const listener = listenersCopy[i];
            try {
                listener.callback(event);
                // Remove one-time listeners
                if (listener.once) {
                    const index = listeners.indexOf(listener);
                    if (index !== -1) {
                        listeners.splice(index, 1);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error in event listener for ${event.type}:`, error);
            }
        }
        // Notify scripts
        for (const script of this.scripts.values()) {
            if (script.enabled && script.onEvent) {
                script.onEvent(event);
            }
        }
    }
    /**
     * Clear all events and scripts
     */
    clear() {
        this.eventQueue.length = 0;
        for (const script of this.scripts.values()) {
            script.destroy?.();
        }
        this.scripts.clear();
        this.listeners.clear();
        this.globalVariables.clear();
        this.logger.debug('Scripting system cleared');
    }
    /**
     * Get system statistics
     */
    getStats() {
        return {
            scriptsCount: this.scripts.size,
            listenersCount: Array.from(this.listeners.values())
                .reduce((total, listeners) => total + listeners.length, 0),
            queuedEvents: this.eventQueue.length,
            globalVariables: this.globalVariables.size,
        };
    }
    /**
     * Dispose of scripting system
     */
    dispose() {
        this.clear();
        this.logger.debug('Scripting system disposed');
    }
}
/**
 * Common game event types
 */
export const GameEvents = {
    // Entity events
    ENTITY_CREATED: 'entity_created',
    ENTITY_DESTROYED: 'entity_destroyed',
    ENTITY_DAMAGED: 'entity_damaged',
    ENTITY_HEALED: 'entity_healed',
    ENTITY_MOVED: 'entity_moved',
    ENTITY_DIED: 'entity_died',
    // Player events
    PLAYER_SPAWN: 'player_spawn',
    PLAYER_DIED: 'player_died',
    PLAYER_RESPAWN: 'player_respawn',
    PLAYER_SCORE_CHANGED: 'player_score_changed',
    // Input events
    INPUT_PRESSED: 'input_pressed',
    INPUT_RELEASED: 'input_released',
    MOUSE_CLICKED: 'mouse_clicked',
    MOUSE_MOVED: 'mouse_moved',
    // Collision events
    COLLISION_ENTER: 'collision_enter',
    COLLISION_EXIT: 'collision_exit',
    COLLISION_STAY: 'collision_stay',
    // Game state events
    GAME_STARTED: 'game_started',
    GAME_PAUSED: 'game_paused',
    GAME_RESUMED: 'game_resumed',
    GAME_ENDED: 'game_ended',
    LEVEL_COMPLETED: 'level_completed',
    LEVEL_FAILED: 'level_failed',
    // Audio events
    SOUND_PLAYED: 'sound_played',
    SOUND_STOPPED: 'sound_stopped',
    // Network events
    PLAYER_CONNECTED: 'player_connected',
    PLAYER_DISCONNECTED: 'player_disconnected',
    DATA_RECEIVED: 'data_received',
    DATA_SENT: 'data_sent',
    // Custom
    CUSTOM: 'custom',
};
/**
 * Example script implementations
 */
/**
 * Simple movement script
 */
export class MovementScript extends GameScript {
    constructor(name = 'movement', logger) {
        super(name, logger);
        this.speed = 5;
        this.direction = new THREE.Vector3();
    }
    initialize(context) {
        this.logger?.debug('Movement script initialized');
    }
    update(context) {
        // Movement logic would go here
        // This is just an example structure
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    setDirection(x, y, z) {
        this.direction.set(x, y, z);
    }
}
/**
 * Health management script
 */
export class HealthScript extends GameScript {
    constructor(name = 'health', maxHealth = 100) {
        super(name);
        this.maxHealth = 100;
        this.currentHealth = 100;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }
    initialize(context) {
        // Set up event listeners for damage/healing
    }
    update(context) {
        // Check health status
        if (this.currentHealth <= 0) {
            // Emit death event
            context.events.push({
                type: GameEvents.ENTITY_DIED,
                data: { entityId: context.entityId },
                timestamp: performance.now(),
            });
        }
    }
    onEvent(event) {
        switch (event.type) {
            case GameEvents.ENTITY_DAMAGED:
                this.takeDamage(event.data?.amount || 10);
                break;
            case GameEvents.ENTITY_HEALED:
                this.heal(event.data?.amount || 10);
                break;
        }
    }
    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
    }
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }
    getHealth() {
        return this.currentHealth;
    }
    getMaxHealth() {
        return this.maxHealth;
    }
}
/**
 * Animation controller script
 */
export class AnimationScript extends GameScript {
    constructor(name = 'animation') {
        super(name);
        this.animations = new Map();
        this.currentAnimation = null;
    }
    initialize(context) {
        // Initialize animation system
    }
    update(context) {
        // Update current animation
    }
    playAnimation(name) {
        this.currentAnimation = name;
    }
    stopAnimation() {
        this.currentAnimation = null;
    }
}
//# sourceMappingURL=ScriptingSystem.js.map