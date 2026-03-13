import * as THREE from 'three';
import { Logger } from '../core/Logger';
/**
 * Terrain generation configuration
 */
export interface TerrainConfig {
    width?: number;
    height?: number;
    widthSegments?: number;
    heightSegments?: number;
    maxHeight?: number;
    seed?: number;
    noiseScale?: number;
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
}
/**
 * Procedural terrain generator using Perlin noise
 */
export declare class TerrainGenerator {
    private readonly logger;
    private readonly config;
    constructor(logger: Logger, config?: TerrainConfig);
    /**
     * Generate terrain mesh
     */
    generateTerrain(): THREE.Mesh;
    /**
     * Generate terrain with textures based on height
     */
    generateTexturedTerrain(): THREE.Mesh;
    /**
     * Get height data for physics
     */
    getHeightData(): number[];
    /**
     * Get height at specific world coordinates
     */
    getHeightAtPosition(x: number, z: number): number;
    private createTerrainGeometry;
    private createTerrainMaterial;
    private generateHeight;
    private perlinNoise;
    private fade;
    private lerp;
    private grad;
    private hash;
    private createSplatmap;
    private createGrassTexture;
    private createRockTexture;
    private createDirtTexture;
}
//# sourceMappingURL=TerrainGenerator.d.ts.map