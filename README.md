# 3D Browser Game Engine

A comprehensive, TypeScript-based 3D game engine for browser games built with modern web technologies.

## Features

### Core Systems
- **Engine Architecture**: Modular, component-based design with clean separation of concerns
- **Entity-Component-System (ECS)**: Flexible and performant architecture for game logic
- **Time Management**: Frame-independent updates with fixed timestep support
- **Logging System**: Comprehensive debugging and monitoring utilities

### Rendering
- **Three.js Integration**: WebGL-based 3D rendering with shadows and advanced materials
- **Scene Management**: Hierarchical scene graph with entity management
- **Lighting System**: Ambient, directional, and point lights with shadow mapping
- **Material System**: PBR materials with customizable properties

### Physics
- **Cannon.js Integration**: Realistic physics simulation with collisions
- **Physics Bodies**: Box, sphere, cylinder, plane, and terrain colliders
- **Raycasting**: Line-of-sight and picking functionality
- **Contact Materials**: Customizable friction and restitution

### Input System
- **Multi-Platform Support**: Keyboard, mouse, gamepad, and touch input
- **Input Actions**: Configurable input mapping and callbacks
- **Cursor Management**: Pointer lock and cursor visibility controls
- **Raw Input Access**: Direct access to input states for advanced control

### Audio System
- **3D Positional Audio**: Web Audio API with spatial audio support
- **Sound Management**: Loading, caching, and playback control
- **Audio Effects**: Volume, looping, and spatial positioning
- **Master Controls**: Global volume and mute functionality

### Networking
- **WebSocket Support**: Real-time multiplayer networking
- **WebRTC Integration**: Peer-to-peer connections
- **Message Queuing**: Reliable message delivery with reconnection
- **Network Events**: Connection management and error handling

### Asset Management
- **Multi-Format Support**: Textures, models, audio, JSON, and text files
- **Caching System**: Memory-efficient asset caching with LRU eviction
- **Progress Tracking**: Loading progress with callbacks
- **Error Handling**: Retry logic and timeout management

## Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Basic Usage

```typescript
import { Engine } from './core/Engine';

async function main() {
  // Create engine instance
  const engine = new Engine({
    canvas: document.getElementById('gameCanvas') as HTMLCanvasElement,
    enablePhysics: true,
    enableAudio: true,
    enableNetworking: false,
  });

  // Initialize engine
  await engine.initialize();

  // Start game loop
  engine.start();
}

main();
```

## Architecture Overview

### Engine Systems
The engine is composed of interconnected systems that work together to provide a complete game development experience:

- **Core**: Engine, Time, Logger, Scene
- **Rendering**: Three.js wrapper, lighting, materials
- **Physics**: Cannon.js integration, collision detection
- **Input**: Keyboard, mouse, gamepad, touch handling
- **Audio**: 3D positional audio system
- **Networking**: WebSocket and WebRTC support
- **Assets**: Loading, caching, and management
- **ECS**: Entity-Component-System framework

### Entity-Component-System

The ECS architecture provides flexibility and performance:

```typescript
// Create entity
const entity = ecsWorld.createEntity('player');

// Add components
ecsWorld.addComponent(entity.id, new TransformComponent(position));
ecsWorld.addComponent(entity.id, new RenderComponent(mesh));
ecsWorld.addComponent(entity.id, new PhysicsComponent(body));

// Systems handle logic
class MovementSystem extends System {
  update(deltaTime: number) {
    const entities = this.world.getEntitiesWithComponent(TransformComponent);
    // Process entities...
  }
}
```

### Scene Management

```typescript
// Create entities
const cube = createSceneEntity('cube', 'Spinning Cube', 'prop', mesh);

// Add to scene
scene.addEntity(cube);

// Lighting
scene.addAmbientLight(0x404040, 0.4);
scene.addDirectionalLight(0xffffff, 1, new THREE.Vector3(10, 10, 5));
```

## Input System

```typescript
// Register input actions
input.registerAction({
  name: 'jump',
  type: 'keyboard',
  inputs: ['Space'],
  callback: () => player.jump()
});

// Check input state
if (input.isKeyPressed('KeyW')) {
  player.moveForward();
}
```

## Physics Integration

```typescript
// Create physics body
const body = physics.createBoxBody(
  new THREE.Vector3(1, 1, 1),
  position,
  mass,
  mesh
);

physics.addBody('player', new PhysicsBody(body, mesh));

// Raycasting
const result = physics.raycast(from, to);
if (result.hit) {
  // Handle hit
}
```

## Asset Loading

```typescript
// Load textures
const texture = await assets.loadTexture('diffuse', 'textures/diffuse.png');

// Load models
const model = await assets.loadGLTF('character', 'models/character.gltf');

// Load audio
const audio = await assets.loadAudio('music', 'audio/background.mp3');
```

## Configuration

The engine is highly configurable through the initialization options:

```typescript
const engine = new Engine({
  canvas: canvas,
  enablePhysics: true,
  enableAudio: true,
  enableNetworking: false,
  targetFPS: 60,
  enableDebug: false,
});
```

## Examples

The engine includes several examples demonstrating different features:

- **BasicExample**: Core engine functionality with physics and input
- **FPSCamera**: First-person camera controls
- **RTSCamera**: Real-time strategy camera system
- **TerrainExample**: Procedural terrain generation
- **MultiplayerExample**: Networked multiplayer gameplay

## Development Tools

### Debugging
- Console logging with different levels
- Performance statistics
- Memory usage monitoring
- Network connection status

### Profiling
- FPS monitoring
- Asset loading times
- Physics simulation stats
- Network message tracking

## Browser Support

The engine supports all modern browsers that support:
- WebGL 2.0 (WebGL 1.0 fallback)
- Web Audio API
- WebSocket API
- ES2020+ JavaScript features

## Dependencies

- **Three.js**: 3D graphics and rendering
- **Cannon.js**: Physics simulation
- **TypeScript**: Type-safe development
- **Vite**: Build tool and development server

## License

ISC License - feel free to use this engine for any purpose!

## Contributing

This is a comprehensive game engine framework designed for rapid prototyping and development of 3D browser games. The modular architecture allows you to use only the components you need while providing a complete solution for complex games.

### Next Steps

To extend the engine:
1. Add custom components and systems to the ECS
2. Create specialized materials and shaders
3. Implement advanced networking features
4. Add procedural generation tools
5. Create game-specific utilities and helpers

The engine is designed to be a solid foundation that you can build upon for any type of 3D browser game!