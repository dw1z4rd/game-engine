# Game Engine Usage Guide

## 🚀 Getting Started

Your game engine is now running and ready to use! Here's how to interact with it:

### Accessing the Engine
- Open your web browser and navigate to: `http://localhost:3001`
- The engine will automatically load and display a 3D scene

## 🎮 Controls

### Camera Movement
- **W** - Move camera forward
- **A** - Move camera left  
- **S** - Move camera backward
- **D** - Move camera right

### Object Interaction
- **SPACE** - Make the green cube jump

### Camera Control
- **Mouse Click** - Lock camera for first-person view
- **ESC** - Release camera lock

### UI Controls
- **H** - Toggle help panel on/off

## 🌟 What You'll See

### 3D Scene
- **Green spinning cube** - Main interactive object (press SPACE to make it jump)
- **Gray ground plane** - Physics-enabled surface
- **Colored floating cubes** - Decorative physics objects
- **Dynamic lighting** - Ambient, directional, and point lights

### User Interface
- **Help Panel** (top-left) - Shows all controls and engine status
- **FPS Counter** (top-left) - Shows current frame rate
- **Health Bar** (top-left) - Visual indicator
- **Crosshair** (center) - Aiming reference
- **Welcome Notification** - Appears when engine loads

## 🔧 Engine Features

### Core Systems
- **3D Rendering** - Three.js powered graphics
- **Physics** - Cannon.js physics simulation
- **Input Management** - Keyboard and mouse handling
- **Entity Component System** - Modular game logic
- **UI System** - In-game interface elements
- **Audio Engine** - Sound system (ready to use)
- **Networking** - Multiplayer support (disabled in basic example)

### Development
- **TypeScript** - Type-safe development
- **Hot Reload** - Changes update automatically
- **Dev Server** - Runs on http://localhost:3001
- **Bundling** - Optimized browser builds

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Strict build with TypeScript checking
npm run build:strict
```

## 🎯 Next Steps

1. **Explore the scene** - Use WASD to move around and see the 3D environment
2. **Try the physics** - Press SPACE to make the cube jump and watch it fall
3. **Experiment with mouse** - Click to lock camera and use mouse to look around
4. **Modify the code** - Edit `src/examples/BasicExample.ts` to create your own scenes
5. **Add new features** - Use the engine's systems to build your game

## 📁 Project Structure

```
src/
├── core/           # Engine core systems
├── examples/       # Example scenes and demos
├── ecs/           # Entity Component System
├── physics/       # Physics integration
├── rendering/     # 3D graphics
├── audio/         # Sound system
├── input/         # Input handling
├── ui/            # User interface
├── networking/    # Multiplayer features
└── terrain/       # Terrain generation
```

## 🎨 Creating Your Own Scene

To create a custom scene:

1. Create a new file in `src/examples/`
2. Extend the example pattern from `BasicExample.ts`
3. Update `src/main.ts` to use your new example
4. The engine will automatically load your scene

## 🐛 Troubleshooting

**Engine not loading?**
- Check that the dev server is running (should see "🎮 Game Engine dev server running")
- Refresh the browser page
- Check browser console for errors

**Controls not working?**
- Make sure you've clicked on the game canvas to focus it
- Try pressing H to toggle the help panel
- Check that the help panel shows "✅ Engine Running"

**Performance issues?**
- Check the FPS counter in the top-left
- Try closing other browser tabs
- The engine runs best in modern browsers

Enjoy exploring your game engine! 🎮