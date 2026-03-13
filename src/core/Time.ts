/**
 * Time management system for the engine
 */
export class Time {
  private lastTime = 0;
  private startTime = 0;
  private isRunning = false;
  private frameCount = 0;
  private totalTime = 0;

  /** Time in seconds since the last frame */
  public deltaTime = 0;

  /** Time in seconds since engine start */
  public time = 0;

  /** Frames per second */
  public fps = 0;

  /** Fixed timestep for physics updates (60 FPS) */
  public readonly fixedDeltaTime = 1 / 60;

  /** Time accumulated for fixed updates */
  public fixedTime = 0;

  /**
   * Start the time system
   */
  start(): void {
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
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Update time calculations - call once per frame
   */
  update(): void {
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
  shouldDoFixedUpdate(): boolean {
    if (this.fixedTime >= this.fixedDeltaTime) {
      this.fixedTime -= this.fixedDeltaTime;
      return true;
    }
    return false;
  }

  /**
   * Get time scaled by a factor
   */
  get_scaled_time(scale: number): number {
    return this.time * scale;
  }

  /**
   * Get delta time scaled by a factor
   */
  get_scaled_delta_time(scale: number): number {
    return this.deltaTime * scale;
  }

  /**
   * Reset the time system
   */
  reset(): void {
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
  get frameCountRendered(): number {
    return this.frameCount;
  }

  /**
   * Get uptime in seconds
   */
  get uptime(): number {
    return this.isRunning ? (performance.now() - this.startTime) / 1000 : 0;
  }
}