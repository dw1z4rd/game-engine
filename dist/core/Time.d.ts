/**
 * Time management system for the engine
 */
export declare class Time {
    private lastTime;
    private startTime;
    private isRunning;
    private frameCount;
    private totalTime;
    /** Time in seconds since the last frame */
    deltaTime: number;
    /** Time in seconds since engine start */
    time: number;
    /** Frames per second */
    fps: number;
    /** Fixed timestep for physics updates (60 FPS) */
    readonly fixedDeltaTime: number;
    /** Time accumulated for fixed updates */
    fixedTime: number;
    /**
     * Start the time system
     */
    start(): void;
    /**
     * Stop the time system
     */
    stop(): void;
    /**
     * Update time calculations - call once per frame
     */
    update(): void;
    /**
     * Check if enough time has passed for a fixed update
     */
    shouldDoFixedUpdate(): boolean;
    /**
     * Get time scaled by a factor
     */
    get_scaled_time(scale: number): number;
    /**
     * Get delta time scaled by a factor
     */
    get_scaled_delta_time(scale: number): number;
    /**
     * Reset the time system
     */
    reset(): void;
    /**
     * Get total frames rendered
     */
    get frameCountRendered(): number;
    /**
     * Get uptime in seconds
     */
    get uptime(): number;
}
//# sourceMappingURL=Time.d.ts.map