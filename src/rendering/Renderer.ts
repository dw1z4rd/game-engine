import * as THREE from 'three';
import { Logger } from '../core/Logger';

/**
 * Renderer configuration options
 */
export interface RendererConfig {
  antialias?: boolean;
  alpha?: boolean;
  shadows?: boolean;
  shadowMapType?: THREE.ShadowMapType;
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
}

/**
 * Three.js renderer wrapper with engine integration
 */
export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly logger: Logger;
  private readonly config: Required<RendererConfig>;
  
  private renderer: THREE.WebGLRenderer | null = null;
  private isInitialized = false;

  constructor(canvas: HTMLCanvasElement, logger: Logger, config: RendererConfig = {}) {
    this.canvas = canvas;
    this.logger = logger;
    this.config = {
      antialias: true,
      alpha: false,
      shadows: true,
      shadowMapType: THREE.PCFSoftShadowMap,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1,
      ...config,
    };
  }

  /**
   * Get the canvas element
   */
  get domElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the Three.js renderer
   */
  get threeRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  /**
   * Get renderer information
   */
  get info(): any {
    return this.renderer?.info || null;
  }

  /**
   * Initialize the renderer
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Renderer already initialized');
      return;
    }

    try {
      // Create WebGL renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: this.config.antialias,
        alpha: this.config.alpha,
      });

      // Configure renderer
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Enable shadows
      if (this.config.shadows) {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.config.shadowMapType;
      }

      // Configure tone mapping
      this.renderer.toneMapping = this.config.toneMapping;
      this.renderer.toneMappingExposure = this.config.toneMappingExposure;

      // Set default clear color
      this.renderer.setClearColor(0x87CEEB);

      // Handle canvas resizing
      this.setupResizeHandler();

      this.isInitialized = true;
      this.logger.info('Renderer initialized successfully');
      this.logger.debug(`WebGL context: ${this.renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1'}`);
      this.logger.debug(`Max textures: ${this.renderer.capabilities.maxTextures}`);

    } catch (error) {
      this.logger.error('Failed to initialize renderer:', error);
      throw error;
    }
  }

  /**
   * Render a scene with a camera
   */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (!this.isInitialized || !this.renderer) {
      this.logger.error('Renderer not initialized');
      return;
    }

    this.renderer.render(scene, camera);
  }

  /**
   * Set the size of the renderer
   */
  setSize(width: number, height: number): void {
    if (!this.renderer) return;

    this.renderer.setSize(width, height);
  }

  /**
   * Set the pixel ratio
   */
  setPixelRatio(ratio: number): void {
    if (!this.renderer) return;

    this.renderer.setPixelRatio(ratio);
  }

  /**
   * Set the clear color
   */
  setClearColor(color: string | number | THREE.Color, alpha = 1): void {
    if (!this.renderer) return;

    this.renderer.setClearColor(color, alpha);
  }

  /**
   * Enable/disable shadow mapping
   */
  setShadowMapping(enabled: boolean, type?: THREE.ShadowMapType): void {
    if (!this.renderer) return;

    this.renderer.shadowMap.enabled = enabled;
    if (type) {
      this.renderer.shadowMap.type = type;
    }
  }

  /**
   * Set tone mapping
   */
  setToneMapping(toneMapping: THREE.ToneMapping, exposure = 1): void {
    if (!this.renderer) return;

    this.renderer.toneMapping = toneMapping;
    this.renderer.toneMappingExposure = exposure;
  }

  /**
   * Take a screenshot
   */
  screenshot(): string | null {
    if (!this.renderer) return null;

    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Get renderer capabilities
   */
  getCapabilities(): THREE.WebGLCapabilities | null {
    return this.renderer?.capabilities || null;
  }

  /**
   * Check if a specific extension is supported
   */
  supportsExtension(extension: string): boolean {
    const capabilities = this.getCapabilities();
    if (!capabilities) return false;

    // In newer Three.js versions, getExtension may not be available on capabilities
    // Try to get the extension directly from the WebGL context
    const context = this.renderer?.getContext();
    if (!context) return false;

    return context.getExtension(extension) !== null;
  }

  /**
   * Force a context loss (for testing)
   */
  forceContextLoss(): void {
    if (this.renderer) {
      const context = this.renderer.getContext();
      // loseContext may not be available on WebGL1 contexts
      const extension = context.getExtension('WEBGL_lose_context');
      if (extension) {
        extension.loseContext();
      }
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): PerformanceStats {
    const info = this.info;
    if (!info) {
      return {
        geometries: 0,
        textures: 0,
        programs: 0,
        drawCalls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
      };
    }

    return {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs ? info.programs.length : 0,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
    };
  }

  /**
   * Handle window resize
   */
  private setupResizeHandler(): void {
    const handleResize = () => {
      if (!this.renderer) return;

      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      this.renderer.setSize(width, height);
      this.logger.debug(`Renderer resized to ${width}x${height}`);
    };

    // Use ResizeObserver for better performance
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(this.canvas);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize);
    }
  }

  /**
   * Dispose of renderer resources
   */
  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.isInitialized = false;
    this.logger.debug('Renderer disposed');
  }
}

/**
 * Performance statistics interface
 */
interface PerformanceStats {
  geometries: number;
  textures: number;
  programs: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
}