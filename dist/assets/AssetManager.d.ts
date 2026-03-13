import * as THREE from 'three';
import { Logger } from '../core/Logger';
/**
 * Asset types
 */
export declare enum AssetType {
    TEXTURE = "texture",
    MODEL = "model",
    AUDIO = "audio",
    FONT = "font",
    JSON = "json",
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video"
}
/**
 * Asset interface
 */
export interface Asset {
    id: string;
    type: AssetType;
    url: string;
    data: any;
    loaded: boolean;
    error?: string;
    loadTime?: number;
    size?: number;
}
/**
 * Loading progress information
 */
export interface LoadProgress {
    total: number;
    loaded: number;
    failed: number;
    percentage: number;
    currentAsset?: string;
}
/**
 * Asset loading configuration
 */
export interface AssetConfig {
    maxCacheSize?: number;
    enableCompression?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
    timeout?: number;
    crossOrigin?: string;
}
/**
 * Texture loader options
 */
export interface TextureOptions {
    flipY?: boolean;
    generateMipmaps?: boolean;
    minFilter?: THREE.TextureFilter;
    magFilter?: THREE.TextureFilter;
    wrapS?: THREE.Wrapping;
    wrapT?: THREE.Wrapping;
    format?: THREE.PixelFormat;
    type?: THREE.TextureDataType;
    anisotropy?: number;
}
/**
 * Model loader options
 */
export interface ModelOptions {
    enableDraco?: boolean;
    enableMeshopt?: boolean;
    dracoDecoderPath?: string;
    meshoptDecoderPath?: string;
}
/**
 * Comprehensive asset management system
 */
export declare class AssetManager {
    private readonly logger;
    private readonly config;
    private assets;
    private cache;
    private loaders;
    private loadingPromises;
    private loadProgress;
    private progressCallbacks;
    constructor(logger: Logger, config?: AssetConfig);
    /**
     * Get current loading progress
     */
    get progress(): LoadProgress;
    /**
     * Add progress callback
     */
    onProgress(callback: (progress: LoadProgress) => void): void;
    /**
     * Remove progress callback
     */
    offProgress(callback: (progress: LoadProgress) => void): void;
    /**
     * Load a texture
     */
    loadTexture(id: string, url: string, options?: TextureOptions): Promise<THREE.Texture>;
    /**
     * Load a GLTF model
     */
    loadGLTF(id: string, url: string, options?: ModelOptions): Promise<any>;
    /**
     * Load an audio file
     */
    loadAudio(id: string, url: string): Promise<AudioBuffer>;
    /**
     * Load JSON data
     */
    loadJSON(id: string, url: string): Promise<any>;
    /**
     * Load text data
     */
    loadText(id: string, url: string): Promise<string>;
    /**
     * Load image data
     */
    loadImage(id: string, url: string): Promise<HTMLImageElement>;
    /**
     * Load multiple assets in parallel
     */
    loadAssets(assets: Array<{
        id: string;
        url: string;
        type: AssetType;
        options?: any;
    }>): Promise<void>;
    /**
     * Get an asset by ID
     */
    getAsset<T = any>(id: string): T | undefined;
    /**
     * Get texture asset
     */
    getTexture(id: string): THREE.Texture | undefined;
    /**
     * Get model asset
     */
    getModel(id: string): any;
    /**
     * Get audio buffer asset
     */
    getAudio(id: string): AudioBuffer | undefined;
    /**
     * Check if an asset is loaded
     */
    isLoaded(id: string): boolean;
    /**
     * Remove an asset from cache
     */
    removeAsset(id: string): void;
    /**
     * Clear all assets
     */
    clearAssets(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): any;
    /**
     * Preload essential assets
     */
    preloadEssentials(): Promise<void>;
    private loadAsset;
    private cacheAsset;
    private cleanupCache;
    private getCacheSize;
    private disposeAssetData;
    private estimateAssetSize;
    private fetchWithRetry;
    private resetProgress;
    private updateProgress;
    private updateProgressPercentage;
    private notifyProgress;
    /**
     * Dispose of asset manager
     */
    dispose(): void;
}
//# sourceMappingURL=AssetManager.d.ts.map