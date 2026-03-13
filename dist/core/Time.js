/**
 * Time management system for the engine
 */
export class Time {
    constructor() {
        this.lastTime = 0;
        this.startTime = 0;
        this.isRunning = false;
        this.frameCount = 0;
        this.totalTime = 0;
        /** Time in seconds since the last frame */
        this.deltaTime = 0;
        /** Time in seconds since engine start */
        this.time = 0;
        /** Frames per second */
        this.fps = 0;
        /** Fixed timestep for physics updates (60 FPS) */
        this.fixedDeltaTime = 1 / 60;
        /** Time accumulated for fixed updates */
        this.fixedTime = 0;
    }
    /**
     * Start the time system
     */
    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.frameCount = 0;
        this.totalTime = 0;
    }
    /**
     * Stop the time system
     */
    stop() {
        this.isRunning = false;
    }
    /**
     * Update time calculations - call once per frame
     */
    update() {
        if (!this.isRunning) {
            return;
        }
        const currentTime = performance.now();
        const elapsed = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.deltaTime = Math.min(elapsed, 0.1); // Cap delta time to prevent spiral of death
        this.lastTime = currentTime;
        this.totalTime += this.deltaTime;
        this.time = this.totalTime;
        this.fixedTime += this.deltaTime;
        this.frameCount++;
        // Calculate FPS
        if (this.frameCount % 30 === 0) {
            this.fps = Math.round(1 / this.deltaTime);
        }
    }
    /**
     * Check if enough time has passed for a fixed update
     */
    shouldDoFixedUpdate() {
        if (this.fixedTime >= this.fixedDeltaTime) {
            this.fixedTime -= this.fixedDeltaTime;
            return true;
        }
        return false;
    }
    /**
     * Get time scaled by a factor
     */
    get_scaled_time(scale) {
        return this.time * scale;
    }
    /**
     * Get delta time scaled by a factor
     */
    get_scaled_delta_time(scale) {
        return this.deltaTime * scale;
    }
    /**
     * Reset the time system
     */
    reset() {
        this.lastTime = performance.now();
        this.startTime = this.lastTime;
        this.frameCount = 0;
        this.totalTime = 0;
        this.fixedTime = 0;
        this.deltaTime = 0;
        this.time = 0;
        this.fps = 0;
    }
    /**
     * Get total frames rendered
     */
    get frameCountRendered() {
        return this.frameCount;
    }
    /**
     * Get uptime in seconds
     */
    get uptime() {
        return this.isRunning ? (performance.now() - this.startTime) / 1000 : 0;
    }
}
//# sourceMappingURL=Time.js.map