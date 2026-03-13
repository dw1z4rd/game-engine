import * as THREE from 'three';
/**
 * Procedural terrain generator using Perlin noise
 */
export class TerrainGenerator {
    constructor(logger, config = {}) {
        this.logger = logger;
        this.config = {
            width: 100,
            height: 100,
            widthSegments: 128,
            heightSegments: 128,
            maxHeight: 10,
            seed: Math.random() * 10000,
            noiseScale: 0.02,
            octaves: 4,
            persistence: 0.5,
            lacunarity: 2.0,
            ...config,
        };
    }
    /**
     * Generate terrain mesh
     */
    generateTerrain() {
        const geometry = this.createTerrainGeometry();
        const material = new THREE.MeshLambertMaterial({
            color: 0x3a5f3a,
            wireframe: false,
        });
        const terrain = new THREE.Mesh(geometry, material);
        terrain.receiveShadow = true;
        terrain.castShadow = true;
        this.logger.debug('Terrain generated successfully');
        return terrain;
    }
    /**
     * Generate terrain with textures based on height
     */
    generateTexturedTerrain() {
        const geometry = this.createTerrainGeometry();
        const material = this.createTerrainMaterial();
        const terrain = new THREE.Mesh(geometry, material);
        terrain.receiveShadow = true;
        terrain.castShadow = true;
        this.logger.debug('Textured terrain generated successfully');
        return terrain;
    }
    /**
     * Get height data for physics
     */
    getHeightData() {
        const { widthSegments, heightSegments } = this.config;
        const heights = [];
        for (let z = 0; z <= heightSegments; z++) {
            for (let x = 0; x <= widthSegments; x++) {
                const height = this.generateHeight(x / widthSegments, z / heightSegments);
                heights.push(height);
            }
        }
        return heights;
    }
    /**
     * Get height at specific world coordinates
     */
    getHeightAtPosition(x, z) {
        const { width, height } = this.config;
        const normalizedX = (x / width) + 0.5;
        const normalizedZ = (z / height) + 0.5;
        return this.generateHeight(normalizedX, normalizedZ) * this.config.maxHeight;
    }
    createTerrainGeometry() {
        const { width, height, widthSegments, heightSegments } = this.config;
        const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        const vertices = geometry.attributes.position.array;
        // Apply height map
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];
            // Convert to normalized coordinates (0-1)
            const normalizedX = (x / width) + 0.5;
            const normalizedZ = (z / height) + 0.5;
            vertices[i + 2] = this.generateHeight(normalizedX, normalizedZ) * this.config.maxHeight;
        }
        // Compute normals for proper lighting
        geometry.computeVertexNormals();
        return geometry;
    }
    createTerrainMaterial() {
        // Create texture splatmap for different terrain types
        const splatmap = this.createSplatmap();
        // Create terrain textures
        const grassTexture = this.createGrassTexture();
        const rockTexture = this.createRockTexture();
        const dirtTexture = this.createDirtTexture();
        // Use custom shader or blend textures
        return new THREE.MeshStandardMaterial({
            map: splatmap,
            roughness: 0.8,
            metalness: 0.1,
        });
    }
    generateHeight(x, y) {
        let amplitude = 1;
        let frequency = this.config.noiseScale;
        let noiseHeight = 0;
        let maxValue = 0;
        for (let i = 0; i < this.config.octaves; i++) {
            const sampleX = x * frequency + this.config.seed;
            const sampleY = y * frequency + this.config.seed;
            const perlinValue = this.perlinNoise(sampleX, sampleY);
            noiseHeight += perlinValue * amplitude;
            maxValue += amplitude;
            amplitude *= this.config.persistence;
            frequency *= this.config.lacunarity;
        }
        return noiseHeight / maxValue;
    }
    perlinNoise(x, y) {
        // Simple Perlin-like noise implementation
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = this.fade(xf);
        const v = this.fade(yf);
        const aa = this.hash(xi, yi);
        const ab = this.hash(xi, yi + 1);
        const ba = this.hash(xi + 1, yi);
        const bb = this.hash(xi + 1, yi + 1);
        const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
        const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u);
        return this.lerp(x1, x2, v);
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    hash(x, y) {
        // Simple hash function
        let n = x + y * 57;
        n = (n << 13) ^ n;
        return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
    }
    createSplatmap() {
        const size = 256;
        const data = new Uint8Array(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const height = this.generateHeight(x / size, y / size);
                const index = (y * size + x) * 4;
                if (height < 0.3) {
                    // Rock/mountain
                    data[index] = 128; // R
                    data[index + 1] = 128; // G
                    data[index + 2] = 128; // B
                }
                else if (height < 0.7) {
                    // Grass
                    data[index] = 34; // R
                    data[index + 1] = 139; // G
                    data[index + 2] = 34; // B
                }
                else {
                    // Snow
                    data[index] = 255; // R
                    data[index + 1] = 255; // G
                    data[index + 2] = 255; // B
                }
                data[index + 3] = 255; // A
            }
        }
        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        texture.needsUpdate = true;
        return texture;
    }
    createGrassTexture() {
        const size = 256;
        const data = new Uint8Array(size * size * 3);
        for (let i = 0; i < data.length; i += 3) {
            const variation = Math.random() * 20 - 10;
            data[i] = Math.min(255, Math.max(0, 34 + variation)); // R
            data[i + 1] = Math.min(255, Math.max(0, 139 + variation)); // G
            data[i + 2] = Math.min(255, Math.max(0, 34 + variation)); // B
        }
        const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }
    createRockTexture() {
        const size = 256;
        const data = new Uint8Array(size * size * 3);
        for (let i = 0; i < data.length; i += 3) {
            const gray = Math.floor(Math.random() * 50 + 80);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
        texture.needsUpdate = true;
        return texture;
    }
    createDirtTexture() {
        const size = 256;
        const data = new Uint8Array(size * size * 3);
        for (let i = 0; i < data.length; i += 3) {
            data[i] = Math.floor(Math.random() * 30 + 100); // R
            data[i + 1] = Math.floor(Math.random() * 20 + 70); // G
            data[i + 2] = Math.floor(Math.random() * 10 + 40); // B
        }
        const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        return texture;
    }
}
//# sourceMappingURL=TerrainGenerator.js.map