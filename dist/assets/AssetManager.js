import * as THREE from 'three';
/**
 * Asset types
 */
export var AssetType;
(function (AssetType) {
    AssetType["TEXTURE"] = "texture";
    AssetType["MODEL"] = "model";
    AssetType["AUDIO"] = "audio";
    AssetType["FONT"] = "font";
    AssetType["JSON"] = "json";
    AssetType["TEXT"] = "text";
    AssetType["IMAGE"] = "image";
    AssetType["VIDEO"] = "video";
})(AssetType || (AssetType = {}));
/**
 * Comprehensive asset management system
 */
export class AssetManager {
    constructor(logger, config = {}) {
        this.assets = new Map();
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.loadProgress = {
            total: 0,
            loaded: 0,
            failed: 0,
            percentage: 0,
        };
        this.progressCallbacks = [];
        this.logger = logger;
        this.config = {
            maxCacheSize: 100 * 1024 * 1024, // 100MB
            enableCompression: true,
            retryAttempts: 3,
            retryDelay: 1000,
            timeout: 30000,
            crossOrigin: 'anonymous',
            ...config,
        };
        // Initialize loaders
        this.loaders = {
            texture: new THREE.TextureLoader(),
            audioLoader: new THREE.AudioLoader(),
        };
        // Set cross origin for texture loader
        if (this.config.crossOrigin) {
            this.loaders.texture.crossOrigin = this.config.crossOrigin;
        }
    }
    /**
     * Get current loading progress
     */
    get progress() {
        return { ...this.loadProgress };
    }
    /**
     * Add progress callback
     */
    onProgress(callback) {
        this.progressCallbacks.push(callback);
    }
    /**
     * Remove progress callback
     */
    offProgress(callback) {
        const index = this.progressCallbacks.indexOf(callback);
        if (index !== -1) {
            this.progressCallbacks.splice(index, 1);
        }
    }
    /**
     * Load a texture
     */
    async loadTexture(id, url, options = {}) {
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }
        const promise = this.loadAsset(id, url, AssetType.TEXTURE, async () => {
            return new Promise((resolve, reject) => {
                const loader = this.loaders.texture;
                loader.load(url, (texture) => {
                    // Apply texture options
                    if (options.flipY !== undefined)
                        texture.flipY = options.flipY;
                    if (options.generateMipmaps !== undefined)
                        texture.generateMipmaps = options.generateMipmaps;
                    if (options.minFilter !== undefined)
                        texture.minFilter = options.minFilter;
                    if (options.magFilter !== undefined)
                        texture.magFilter = options.magFilter;
                    if (options.wrapS !== undefined)
                        texture.wrapS = options.wrapS;
                    if (options.wrapT !== undefined)
                        texture.wrapT = options.wrapT;
                    if (options.format !== undefined)
                        texture.format = options.format;
                    if (options.type !== undefined)
                        texture.type = options.type;
                    if (options.anisotropy !== undefined)
                        texture.anisotropy = options.anisotropy;
                    resolve(texture);
                }, (progress) => {
                    this.updateProgress(id, progress.loaded / progress.total);
                }, (error) => {
                    reject(error);
                });
            });
        });
        this.loadingPromises.set(id, promise);
        return promise;
    }
    /**
     * Load a GLTF model
     */
    async loadGLTF(id, url, options = {}) {
        // Note: This would require GLTFLoader from three/examples/jsm/loaders/GLTFLoader
        // For now, we'll use a placeholder implementation
        return this.loadAsset(id, url, AssetType.MODEL, async () => {
            // Placeholder - would use GLTFLoader in real implementation
            this.logger.warn('GLTF loader not implemented - using placeholder');
            return { scene: new THREE.Group() };
        });
    }
    /**
     * Load an audio file
     */
    async loadAudio(id, url) {
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }
        const promise = this.loadAsset(id, url, AssetType.AUDIO, async () => {
            return new Promise((resolve, reject) => {
                this.loaders.audioLoader.load(url, (buffer) => resolve(buffer), (progress) => {
                    this.updateProgress(id, progress.loaded / progress.total);
                }, (error) => reject(error));
            });
        });
        this.loadingPromises.set(id, promise);
        return promise;
    }
    /**
     * Load JSON data
     */
    async loadJSON(id, url) {
        return this.loadAsset(id, url, AssetType.JSON, async () => {
            const response = await this.fetchWithRetry(url);
            return response.json();
        });
    }
    /**
     * Load text data
     */
    async loadText(id, url) {
        return this.loadAsset(id, url, AssetType.TEXT, async () => {
            const response = await this.fetchWithRetry(url);
            return response.text();
        });
    }
    /**
     * Load image data
     */
    async loadImage(id, url) {
        return this.loadAsset(id, url, AssetType.IMAGE, async () => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                if (this.config.crossOrigin) {
                    img.crossOrigin = this.config.crossOrigin;
                }
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
        });
    }
    /**
     * Load multiple assets in parallel
     */
    async loadAssets(assets) {
        this.resetProgress();
        this.loadProgress.total = assets.length;
        const promises = assets.map(async (asset) => {
            try {
                switch (asset.type) {
                    case AssetType.TEXTURE:
                        await this.loadTexture(asset.id, asset.url, asset.options);
                        break;
                    case AssetType.MODEL:
                        await this.loadGLTF(asset.id, asset.url, asset.options);
                        break;
                    case AssetType.AUDIO:
                        await this.loadAudio(asset.id, asset.url);
                        break;
                    case AssetType.JSON:
                        await this.loadJSON(asset.id, asset.url);
                        break;
                    case AssetType.TEXT:
                        await this.loadText(asset.id, asset.url);
                        break;
                    case AssetType.IMAGE:
                        await this.loadImage(asset.id, asset.url);
                        break;
                    default:
                        throw new Error(`Unsupported asset type: ${asset.type}`);
                }
                this.loadProgress.loaded++;
            }
            catch (error) {
                this.loadProgress.failed++;
                this.logger.error(`Failed to load asset ${asset.id}:`, error);
            }
            finally {
                this.updateProgressPercentage();
                this.notifyProgress();
            }
        });
        await Promise.all(promises);
    }
    /**
     * Get an asset by ID
     */
    getAsset(id) {
        const asset = this.assets.get(id);
        return asset?.data;
    }
    /**
     * Get texture asset
     */
    getTexture(id) {
        return this.getAsset(id);
    }
    /**
     * Get model asset
     */
    getModel(id) {
        return this.getAsset(id);
    }
    /**
     * Get audio buffer asset
     */
    getAudio(id) {
        return this.getAsset(id);
    }
    /**
     * Check if an asset is loaded
     */
    isLoaded(id) {
        const asset = this.assets.get(id);
        return asset?.loaded || false;
    }
    /**
     * Remove an asset from cache
     */
    removeAsset(id) {
        const asset = this.assets.get(id);
        if (asset) {
            // Dispose of asset data if possible
            this.disposeAssetData(asset);
            this.assets.delete(id);
            this.cache.delete(id);
            this.loadingPromises.delete(id);
            this.logger.debug(`Asset removed: ${id}`);
        }
    }
    /**
     * Clear all assets
     */
    clearAssets() {
        for (const asset of this.assets.values()) {
            this.disposeAssetData(asset);
        }
        this.assets.clear();
        this.cache.clear();
        this.loadingPromises.clear();
        this.logger.debug('All assets cleared');
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        let totalSize = 0;
        let loadedCount = 0;
        let failedCount = 0;
        for (const asset of this.assets.values()) {
            if (asset.loaded) {
                loadedCount++;
                totalSize += asset.size || 0;
            }
            else if (asset.error) {
                failedCount++;
            }
        }
        return {
            totalAssets: this.assets.size,
            loadedAssets: loadedCount,
            failedAssets: failedCount,
            totalSize,
            cacheSize: totalSize,
            maxCacheSize: this.config.maxCacheSize,
            cacheUsage: (totalSize / this.config.maxCacheSize) * 100,
        };
    }
    /**
     * Preload essential assets
     */
    async preloadEssentials() {
        // Load default textures, materials, etc.
        this.logger.info('Preloading essential assets');
        // Example: Create default textures
        const defaultTexture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
        defaultTexture.needsUpdate = true;
        this.cacheAsset('default_white', AssetType.TEXTURE, defaultTexture);
        this.logger.info('Essential assets preloaded');
    }
    async loadAsset(id, url, type, loadFunction) {
        // Check if already loaded
        const existingAsset = this.assets.get(id);
        if (existingAsset?.loaded) {
            return existingAsset.data;
        }
        // Create asset record
        const asset = {
            id,
            type,
            url,
            data: null,
            loaded: false,
        };
        this.assets.set(id, asset);
        const startTime = performance.now();
        try {
            const data = await loadFunction();
            const loadTime = performance.now() - startTime;
            // Update asset record
            asset.data = data;
            asset.loaded = true;
            asset.loadTime = loadTime;
            asset.size = this.estimateAssetSize(data);
            // Cache the data
            this.cacheAsset(id, type, data);
            this.logger.debug(`Asset loaded: ${id} (${loadTime.toFixed(2)}ms)`);
            return data;
        }
        catch (error) {
            asset.error = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to load asset ${id}:`, error);
            throw error;
        }
        finally {
            this.loadingPromises.delete(id);
        }
    }
    cacheAsset(id, type, data) {
        // Check cache size limit
        if (this.getCacheSize() > this.config.maxCacheSize) {
            this.cleanupCache();
        }
        this.cache.set(id, data);
    }
    cleanupCache() {
        // Remove least recently used assets until under limit
        const assets = Array.from(this.assets.values())
            .filter(asset => asset.loaded)
            .sort((a, b) => (a.loadTime || 0) - (b.loadTime || 0));
        let removedSize = 0;
        for (const asset of assets) {
            if (this.getCacheSize() - removedSize <= this.config.maxCacheSize * 0.8) {
                break;
            }
            removedSize += asset.size || 0;
            this.removeAsset(asset.id);
        }
        this.logger.debug(`Cache cleanup completed, removed ${removedSize} bytes`);
    }
    getCacheSize() {
        let totalSize = 0;
        for (const asset of this.assets.values()) {
            totalSize += asset.size || 0;
        }
        return totalSize;
    }
    disposeAssetData(asset) {
        if (!asset.data)
            return;
        try {
            // Dispose of Three.js objects
            if (asset.data instanceof THREE.Texture) {
                asset.data.dispose();
            }
            else if (asset.data instanceof THREE.Material) {
                asset.data.dispose();
            }
            else if (asset.data instanceof THREE.BufferGeometry) {
                asset.data.dispose();
            }
        }
        catch (error) {
            this.logger.warn(`Failed to dispose asset ${asset.id}:`, error);
        }
    }
    estimateAssetSize(data) {
        // Rough estimation of asset size in bytes
        if (data instanceof THREE.Texture) {
            const image = data.image;
            if (image instanceof HTMLImageElement) {
                return image.width * image.height * 4; // RGBA
            }
        }
        else if (data instanceof ArrayBuffer) {
            return data.byteLength;
        }
        else if (typeof data === 'string') {
            return data.length * 2; // UTF-16
        }
        return 1024; // Default 1KB
    }
    async fetchWithRetry(url) {
        let lastError = null;
        for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(this.config.timeout),
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < this.config.retryAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        throw lastError;
    }
    resetProgress() {
        this.loadProgress = {
            total: 0,
            loaded: 0,
            failed: 0,
            percentage: 0,
        };
    }
    updateProgress(assetId, progress) {
        this.loadProgress.currentAsset = assetId;
        // Individual asset progress could be tracked here if needed
    }
    updateProgressPercentage() {
        this.loadProgress.percentage = (this.loadProgress.loaded / this.loadProgress.total) * 100;
    }
    notifyProgress() {
        for (const callback of this.progressCallbacks) {
            callback(this.loadProgress);
        }
    }
    /**
     * Dispose of asset manager
     */
    dispose() {
        this.clearAssets();
        this.progressCallbacks.length = 0;
        this.logger.debug('Asset manager disposed');
    }
}
//# sourceMappingURL=AssetManager.js.map