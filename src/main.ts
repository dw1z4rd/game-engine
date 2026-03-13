import { Engine } from './core/Engine';
import { BasicExample } from './examples/BasicExample';

/**
 * Main entry point for the game engine
 */
async function main(): Promise<void> {
  try {
    // Create the engine instance
    const engine = new Engine({
      canvas: document.getElementById('gameCanvas') as HTMLCanvasElement,
      enablePhysics: true,
      enableAudio: true,
      enableNetworking: false, // Disable for basic example
    });

    // Initialize the engine
    await engine.initialize();

    // Create and run a basic example
    const example = new BasicExample(engine);
    await example.initialize();

    // Hide loading screen
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }

    // Start the game loop
    engine.start();

    // Handle cleanup on page unload
    window.addEventListener('beforeunload', () => {
      engine.dispose();
    });

  } catch (error) {
    console.error('Failed to initialize game engine:', error);
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.textContent = 'Failed to load game engine. Check console for details.';
      loadingElement.style.color = '#ff4444';
    }
  }
}

// Start the engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}