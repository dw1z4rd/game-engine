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
export declare class Renderer {
    private readonly canvas;
    private readonly logger;
    private readonly config;
    private renderer;
    private isInitialized;
    constructor(canvas: HTMLCanvasElement, logger: Logger, config?: RendererConfig);
    /**
     * Get the canvas element
     */
    get domElement(): HTMLCanvasElement;
    /**
     * Get the Three.js renderer
     */
    get threeRenderer(): THREE.WebGLRenderer | null;
    /**
     * Get renderer information
     */
    get info(): any;
    /**
     * Initialize the renderer
     */
    initialize(): Promise<void>;
    /**
     * Render a scene with a camera
     */
    render(scene: THREE.Scene, camera: THREE.Camera): void;
    /**
     * Set the size of the renderer
     */
    setSize(width: number, height: number): void;
    /**
     * Set the pixel ratio
     */
    setPixelRatio(ratio: number): void;
    /**
     * Set the clear color
     */
    setClearColor(color: string | number | THREE.Color, alpha?: number): void;
    /**
     * Enable/disable shadow mapping
     */
    setShadowMapping(enabled: boolean, type?: THREE.ShadowMapType): void;
    /**
     * Set tone mapping
     */
    setToneMapping(toneMapping: THREE.ToneMapping, exposure?: number): void;
    /**
     * Take a screenshot
     */
    screenshot(): string | null;
    /**
     * Get renderer capabilities
     */
    getCapabilities(): THREE.WebGLCapabilities | null;
    /**
     * Check if a specific extension is supported
     */
    supportsExtension(extension: string): boolean;
    /**
     * Force a context loss (for testing)
     */
    forceContextLoss(): void;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): PerformanceStats;
    /**
     * Handle window resize
     */
    private setupResizeHandler;
    /**
     * Dispose of renderer resources
     */
    dispose(): void;
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
export {};
//# sourceMappingURL=Renderer.d.ts.map