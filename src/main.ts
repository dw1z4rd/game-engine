import { Engine } from './core/Engine';
import { BasicExample } from './examples/BasicExample';

/**
 * Main entry point for the game engine
 */
async function main(): Promise<void> {
  console.log('🚀 Starting game engine initialization...');
  updateLoadingMessage('Initializing Engine...');
  
  try {
    // Verify canvas element exists
    const canvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvasElement) {
      throw new Error('Canvas element not found. Make sure there is an element with id="gameCanvas"');
    }
    console.log('✅ Canvas element found');

    // Create the engine instance
    console.log('🔧 Creating engine instance...');
    updateLoadingMessage('Creating Engine...');
    const engine = new Engine({
      canvas: canvasElement,
      enablePhysics: true,
      enableAudio: true,
      enableNetworking: false, // Disable for basic example
    });
    console.log('✅ Engine instance created');

    // Initialize the engine with timeout
    console.log('⚙️ Initializing engine systems...');
    updateLoadingMessage('Initializing Systems...');
    const initTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Engine initialization timeout after 10 seconds')), 10000);
    });
    
    await Promise.race([engine.initialize(), initTimeout]);
    console.log('✅ Engine initialized successfully');

    // Create and run a basic example
    console.log('🎮 Creating basic example...');
    updateLoadingMessage('Loading Example...');
    const example = new BasicExample(engine);
    
    console.log('🔧 Initializing example...');
    updateLoadingMessage('Initializing Example...');
    const exampleInitTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Example initialization timeout after 5 seconds')), 5000);
    });
    
    await Promise.race([example.initialize(), exampleInitTimeout]);
    console.log('✅ Example initialized successfully');

    // Hide loading screen
    console.log('🎯 Hiding loading screen...');
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
      console.log('✅ Loading screen hidden');
    }

    // Start the game loop
    console.log('🎬 Starting game loop...');
    engine.start();
    console.log('🎉 Game engine started successfully!');

    // Handle cleanup on page unload
    window.addEventListener('beforeunload', () => {
      console.log('🧹 Cleaning up engine...');
      engine.dispose();
    });

  } catch (error) {
    console.error('❌ Failed to initialize game engine:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.textContent = `Failed to load: ${error.message}. Check console for details.`;
      loadingElement.style.color = '#ff4444';
      loadingElement.style.fontSize = '18px';
      loadingElement.style.textAlign = 'center';
      loadingElement.style.maxWidth = '80%';
    }
  }
}

/**
 * Update the loading message with better visibility
 */
function updateLoadingMessage(message: string): void {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.textContent = message;
    loadingElement.style.fontSize = '20px';
    loadingElement.style.textAlign = 'center';
  }
  console.log(`📋 Loading: ${message}`);
}

// Start the engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}